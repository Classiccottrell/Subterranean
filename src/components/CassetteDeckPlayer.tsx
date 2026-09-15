import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Sliders,
  Sparkles,
  Radio,
  Download,
  Flame,
  CloudRain,
  Train,
  Disc,
} from "lucide-react";
import { GeneratedTrackAudio, LoFiEffectControls, TrackData } from "../types";
import { synthEngine } from "../audio/lofiSynthEngine";

interface CassetteDeckPlayerProps {
  currentTrack: TrackData;
  allTracks: TrackData[];
  onSelectTrack: (track: TrackData) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  audioSource: "synth" | "lyria";
  onToggleSource: (source: "synth" | "lyria") => void;
  activeGeneratedAudio?: GeneratedTrackAudio;
  onOpenPromptStudio: (track: TrackData) => void;
}

export const CassetteDeckPlayer: React.FC<CassetteDeckPlayerProps> = ({
  currentTrack,
  allTracks,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  onStop,
  audioSource,
  onToggleSource,
  activeGeneratedAudio,
  onOpenPromptStudio,
}) => {
  const [tapeCounter, setTapeCounter] = useState<number>(142);
  const [showEffectsRack, setShowEffectsRack] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);

  // Lo-Fi effect controls
  const [effects, setEffects] = useState<LoFiEffectControls>({
    vinylCrackle: 0.35,
    subwayRumble: 0.3,
    rainAtmosphere: 0.25,
    tapeFlutter: 0.25,
    filterCutoff: 4500,
    playbackSpeed: 1.0,
  });

  // VU Meter state
  const [leftVU, setLeftVU] = useState<number>(15);
  const [rightVU, setRightVU] = useState<number>(18);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Sync Lyria audio element playback
  useEffect(() => {
    if (audioSource === "lyria" && activeGeneratedAudio?.audioUrl) {
      if (!audioElemRef.current) {
        audioElemRef.current = new Audio(activeGeneratedAudio.audioUrl);
      } else {
        if (audioElemRef.current.src !== activeGeneratedAudio.audioUrl) {
          audioElemRef.current.src = activeGeneratedAudio.audioUrl;
        }
      }

      if (isPlaying) {
        audioElemRef.current.play().catch((err) => console.log("Audio play error:", err));
      } else {
        audioElemRef.current.pause();
      }

      audioElemRef.current.onended = () => {
        onStop();
      };
    } else {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
    }
  }, [isPlaying, audioSource, activeGeneratedAudio]);

  // Update volume
  useEffect(() => {
    if (audioElemRef.current) {
      audioElemRef.current.volume = volume;
    }
    const masterGain = synthEngine.getMasterGain();
    const ctx = synthEngine.getAudioContext();
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    }
  }, [volume]);

  // Tape counter & VU meter animation
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setTapeCounter((prev) => (prev >= 999 ? 0 : prev + 1));
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localAnalyser = synthEngine.getAnalyser();

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid line for analog oscilloscope feel
      ctx.strokeStyle = "rgba(45, 55, 45, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isPlaying) {
        localAnalyser = synthEngine.getAnalyser();
        if (localAnalyser) {
          const bufferLength = localAnalyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          localAnalyser.getByteFrequencyData(dataArray);

          // Calculate average for VU needles
          let sumLeft = 0;
          let sumRight = 0;
          const half = Math.floor(bufferLength / 2);
          for (let i = 0; i < half; i++) sumLeft += dataArray[i];
          for (let i = half; i < bufferLength; i++) sumRight += dataArray[i];

          const avgL = Math.min(95, Math.max(12, (sumLeft / half / 255) * 100 + Math.random() * 8));
          const avgR = Math.min(95, Math.max(12, (sumRight / half / 255) * 100 + Math.random() * 8));
          setLeftVU(avgL);
          setRightVU(avgR);

          // Draw frequency bars
          const barWidth = (width / bufferLength) * 2.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (height - 4);
            const hue = 140 + (i / bufferLength) * 45; // emerald-amber glow
            ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.85)`;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          }
        } else {
          // Fallback pulse wave
          setLeftVU(45 + Math.sin(Date.now() / 150) * 20);
          setRightVU(48 + Math.cos(Date.now() / 150) * 18);

          ctx.strokeStyle = "#34d399";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.08 + Date.now() * 0.005) * 12;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        setLeftVU(8);
        setRightVU(8);
        // Idle line
        ctx.strokeStyle = "rgba(52, 211, 153, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleEffectChange = (key: keyof LoFiEffectControls, value: number) => {
    const updated = { ...effects, [key]: value };
    setEffects(updated);
    synthEngine.setEffectLevels({
      vinyl: updated.vinylCrackle,
      rain: updated.rainAtmosphere,
      subway: updated.subwayRumble,
      flutter: updated.tapeFlutter,
      cutoff: updated.filterCutoff,
    });
  };

  const handlePrevTrack = () => {
    const currentIndex = allTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
    onSelectTrack(allTracks[prevIndex]);
  };

  const handleNextTrack = () => {
    const currentIndex = allTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    onSelectTrack(allTracks[nextIndex]);
  };

  const hasLyriaTakes = currentTrack.generatedAudioList.length > 0;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden mb-8">
      {/* Background Texture Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Deck Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-stone-300 font-bold">
            TEAC LO-FI CASSETTE DECK // STEREO MASTER
          </span>
        </div>

        {/* Source Switcher */}
        <div className="flex items-center gap-2 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
          <span className="text-stone-300">Audio Source:</span>
          <button
            id="source-synth-btn"
            onClick={() => onToggleSource("synth")}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              audioSource === "synth"
                ? "bg-emerald-700/80 text-white font-semibold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Radio className="w-3 h-3 text-emerald-400" />
            Live Web Synth
          </button>
          <button
            id="source-lyria-btn"
            onClick={() => onToggleSource("lyria")}
            disabled={!hasLyriaTakes}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              audioSource === "lyria"
                ? "bg-amber-600 text-stone-950 font-bold"
                : hasLyriaTakes
                ? "text-stone-300 hover:text-white"
                : "text-stone-600 cursor-not-allowed"
            }`}
            title={hasLyriaTakes ? "Play Lyria generated audio" : "Generate audio with Lyria first"}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Lyria AI Audio {hasLyriaTakes ? `(${currentTrack.generatedAudioList.length})` : "(0)"}
          </button>
        </div>
      </div>

      {/* Main Player Row: Cassette Visuals + Track Info + Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Cassette Housing (5 cols) */}
        <div className="lg:col-span-5 bg-stone-950 border-2 border-stone-800 rounded-xl p-4 shadow-inner relative">
          {/* Cassette Label */}
          <div className="bg-stone-800/90 border border-stone-700 rounded-lg p-2 mb-3 text-center">
            <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              Side A • Chrome Type II • {currentTrack.bpm} BPM
            </div>
            <div className="text-sm font-bold text-stone-100 truncate">
              {currentTrack.trackNumber}. {currentTrack.title}
            </div>
            <div className="text-[11px] text-stone-400 italic truncate">[{currentTrack.mode}]</div>
          </div>

          {/* Cassette Window & Spinning Reels */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-3 relative flex items-center justify-around h-28 overflow-hidden">
            {/* Magnetic tape band in background */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-10 bg-amber-950/40 border-y border-amber-900/30 -z-0" />

            {/* Left Reel */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-18 h-18 rounded-full border-4 border-stone-700 bg-stone-950 flex items-center justify-center shadow-lg transition-transform ${
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              >
                {/* 3 spokes */}
                <div className="w-14 h-14 rounded-full border border-dashed border-stone-600 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-stone-800 border border-stone-500" />
                </div>
              </div>
            </div>

            {/* Center Window with Tape Counter */}
            <div className="relative z-10 flex flex-col items-center justify-center bg-stone-950/90 px-3 py-1.5 rounded border border-stone-700">
              <span className="text-[9px] font-mono text-stone-300 uppercase">TAPE RUN</span>
              <span className="font-mono text-base font-bold text-emerald-400 tracking-widest">
                {tapeCounter.toString().padStart(3, "0")}
              </span>
            </div>

            {/* Right Reel */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-18 h-18 rounded-full border-4 border-stone-700 bg-stone-950 flex items-center justify-center shadow-lg transition-transform ${
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                }`}
              >
                <div className="w-14 h-14 rounded-full border border-dashed border-stone-600 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-stone-800 border border-stone-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Track Detail & VU Meters (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Track {currentTrack.trackNumber} of {allTracks.length}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{currentTrack.bpm} BPM</span>
            </div>
            <h2 className="text-xl font-bold text-stone-100">{currentTrack.title}</h2>
            <p className="text-xs text-stone-400 mt-1 line-clamp-2">{currentTrack.target}</p>
          </div>

          {/* Real-time Oscilloscope & VU Meters */}
          <div className="space-y-2 bg-stone-950 p-3 rounded-xl border border-stone-800">
            {/* Visualizer Canvas */}
            <div className="h-14 w-full bg-stone-900/80 rounded border border-stone-800 overflow-hidden relative">
              <canvas ref={canvasRef} width={360} height={56} className="w-full h-full block" />
              <div className="absolute top-1 left-2 text-[9px] font-mono text-emerald-400/80 uppercase">
                {audioSource === "synth" ? "LIVE SYNTH HARMONICS" : "LYRIA AUDIO STREAM"}
              </div>
            </div>

            {/* Dual VU Meters */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-300">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>VU L</span>
                  <span className={leftVU > 80 ? "text-amber-400 font-bold" : "text-stone-300"}>
                    {Math.round(leftVU)}%
                  </span>
                </div>
                <div className="h-2 bg-stone-900 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-75 ${
                      leftVU > 80 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${leftVU}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>VU R</span>
                  <span className={rightVU > 80 ? "text-amber-400 font-bold" : "text-stone-300"}>
                    {Math.round(rightVU)}%
                  </span>
                </div>
                <div className="h-2 bg-stone-900 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-75 ${
                      rightVU > 80 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${rightVU}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Master Transport Controls & Rack Button (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
          {/* Main Transport Buttons */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase text-stone-300 tracking-wider text-center">
              TRANSPORT CONTROL
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                id="prev-track-btn"
                onClick={handlePrevTrack}
                className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                id="play-pause-btn"
                onClick={onTogglePlay}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md transition-transform active:scale-95 ${
                  isPlaying
                    ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                    : "bg-emerald-500 text-stone-950 hover:bg-emerald-400"
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>

              <button
                id="stop-btn"
                onClick={onStop}
                className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
                title="Stop Track"
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                id="next-track-btn"
                onClick={handleNextTrack}
                className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              title="Master Volume"
            />
            <span className="text-[10px] font-mono text-stone-400 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="toggle-effects-rack-btn"
              onClick={() => setShowEffectsRack(!showEffectsRack)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                showEffectsRack
                  ? "bg-amber-950/60 border-amber-600/80 text-amber-300"
                  : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Analog Rack</span>
            </button>

            <button
              id="open-prompt-studio-btn"
              onClick={() => onOpenPromptStudio(currentTrack)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-500 text-stone-950 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lyria AI Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Analog Rack (Tape Flutter, Vinyl, Rain, Subway Rumble, Filter) */}
      {showEffectsRack && (
        <div className="mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Vinyl Crackle */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-amber-400" />
                Vinyl Crackle
              </span>
              <span className="font-mono text-stone-300">{Math.round(effects.vinylCrackle * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.vinylCrackle}
              onChange={(e) => handleEffectChange("vinylCrackle", parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded"
            />
          </div>

          {/* Rain Atmosphere */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Rain Ambiance
              </span>
              <span className="font-mono text-stone-300">{Math.round(effects.rainAtmosphere * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.rainAtmosphere}
              onChange={(e) => handleEffectChange("rainAtmosphere", parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded"
            />
          </div>

          {/* Subway Rumble */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-stone-400" />
                Subway Rumble
              </span>
              <span className="font-mono text-stone-300">{Math.round(effects.subwayRumble * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.subwayRumble}
              onChange={(e) => handleEffectChange("subwayRumble", parseFloat(e.target.value))}
              className="w-full accent-stone-400 cursor-pointer h-1.5 bg-stone-800 rounded"
            />
          </div>

          {/* Tape Flutter / Wobble */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Tape Wow & Flutter
              </span>
              <span className="font-mono text-stone-300">{Math.round(effects.tapeFlutter * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effects.tapeFlutter}
              onChange={(e) => handleEffectChange("tapeFlutter", parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-1.5 bg-stone-800 rounded"
            />
          </div>

          {/* 12-Bit Lowpass Filter */}
          <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1.5">
            <div className="flex items-center justify-between text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                12-Bit Roll-off
              </span>
              <span className="font-mono text-stone-300">{Math.round(effects.filterCutoff)}Hz</span>
            </div>
            <input
              type="range"
              min="800"
              max="12000"
              step="200"
              value={effects.filterCutoff}
              onChange={(e) => handleEffectChange("filterCutoff", parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
