import React, { useState, useEffect } from "react";
import { INITIAL_TRACKS } from "./data/albumData";
import { GeneratedTrackAudio, LyriaModel, TrackData } from "./types";
import { AlbumHeader } from "./components/AlbumHeader";
import { CassetteDeckPlayer } from "./components/CassetteDeckPlayer";
import { TrackCard } from "./components/TrackCard";
import { EvaluationScorecard } from "./components/EvaluationScorecard";
import { PromptStudioModal } from "./components/PromptStudioModal";
import { GlobalReportModal } from "./components/GlobalReportModal";
import { synthEngine } from "./audio/lofiSynthEngine";
import {
  Sparkles,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Info,
  Sliders,
  Disc3,
  Flame,
} from "lucide-react";

export default function App() {
  const [tracks, setTracks] = useState<TrackData[]>(() => {
    const saved = localStorage.getItem("subterranean_lofi_tracks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to load cached tracks:", e);
      }
    }
    return INITIAL_TRACKS;
  });

  const [currentTrackId, setCurrentTrackId] = useState<string>("track-1");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<"synth" | "lyria">("synth");
  const [selectedModel, setSelectedModel] = useState<LyriaModel>("lyria-3-clip-preview");
  const [activeTakeId, setActiveTakeId] = useState<string | undefined>(undefined);

  // Modals
  const [evaluatingTrack, setEvaluatingTrack] = useState<TrackData | null>(null);
  const [studioTrack, setStudioTrack] = useState<TrackData | null>(null);
  const [showGlobalReport, setShowGlobalReport] = useState<boolean>(false);

  // Generation state
  const [generatingTrackId, setGeneratingTrackId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check backend health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.warn("Health check failed:", err);
      });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("subterranean_lofi_tracks", JSON.stringify(tracks));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [tracks]);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  const activeTake = currentTrack.generatedAudioList.find((t) => t.id === activeTakeId);

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (audioSource === "synth") {
      const active = synthEngine.toggle(currentTrack.id, currentTrack.bpm);
      setIsPlaying(active);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    synthEngine.stop();
    setIsPlaying(false);
  };

  const handleSelectTrack = (track: TrackData) => {
    const isDifferent = track.id !== currentTrackId;
    setCurrentTrackId(track.id);

    if (isDifferent && isPlaying) {
      if (audioSource === "synth") {
        synthEngine.start(track.id, track.bpm);
      } else {
        // If track has takes, select the first take
        if (track.generatedAudioList.length > 0) {
          setActiveTakeId(track.generatedAudioList[0].id);
        } else {
          // Switch to synth
          setAudioSource("synth");
          synthEngine.start(track.id, track.bpm);
        }
      }
    }
  };

  const handlePlayLiveSynth = (track: TrackData) => {
    setCurrentTrackId(track.id);
    setAudioSource("synth");
    const active = synthEngine.toggle(track.id, track.bpm);
    setIsPlaying(active);
  };

  const handlePlayGeneratedTake = (track: TrackData, take: GeneratedTrackAudio) => {
    synthEngine.stop();
    setCurrentTrackId(track.id);
    setActiveTakeId(take.id);
    setAudioSource("lyria");
    setIsPlaying(true);
  };

  // Music Generation Handler with Lyria API
  const handleGenerateTrack = async (
    trackId: string,
    prompt: string,
    model: LyriaModel
  ) => {
    setGeneratingTrackId(trackId);
    setStatusNotification({
      type: "info",
      message: `Requesting Lyria AI generation (${model.includes("clip") ? "30s Clip" : "Full Track"})...`,
    });

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          trackId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Generation request failed.");
      }

      // Convert base64 audio to Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);

      const newTake: GeneratedTrackAudio = {
        id: `take-${Date.now()}`,
        timestamp: Date.now(),
        model: data.model,
        audioUrl,
        audioBlob: blob,
        mimeType: data.mimeType || "audio/wav",
        lyrics: data.lyrics,
        promptUsed: prompt,
      };

      setTracks((prev) =>
        prev.map((t) => {
          if (t.id === trackId) {
            return {
              ...t,
              generatedAudioList: [newTake, ...t.generatedAudioList],
            };
          }
          return t;
        })
      );

      // Auto-select and play the new take!
      setCurrentTrackId(trackId);
      setActiveTakeId(newTake.id);
      setAudioSource("lyria");
      setIsPlaying(true);
      synthEngine.stop();

      setStatusNotification({
        type: "success",
        message: `Lyria ${data.model.includes("clip") ? "clip" : "track"} generated successfully! Loaded into Cassette Deck.`,
      });

      setTimeout(() => setStatusNotification(null), 6000);
    } catch (err: any) {
      console.error("Music generation error:", err);
      setStatusNotification({
        type: "error",
        message: err.message || "Failed to generate track. Ensure GEMINI_API_KEY is configured in AI Studio Secrets.",
      });
    } finally {
      setGeneratingTrackId(null);
    }
  };

  const handleQuickGenerate = (track: TrackData) => {
    handleGenerateTrack(track.id, track.sunoPrompt, selectedModel);
  };

  // Evaluation updates
  const handleUpdateQuestionRating = (
    questionId: string,
    rating: "pass" | "needs-polish" | "fail"
  ) => {
    if (!evaluatingTrack) return;
    const updated = {
      ...evaluatingTrack,
      evaluationQuestions: evaluatingTrack.evaluationQuestions.map((q) =>
        q.id === questionId ? { ...q, rating } : q
      ),
    };
    setEvaluatingTrack(updated);
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleUpdateQuestionNotes = (questionId: string, notes: string) => {
    if (!evaluatingTrack) return;
    const updated = {
      ...evaluatingTrack,
      evaluationQuestions: evaluatingTrack.evaluationQuestions.map((q) =>
        q.id === questionId ? { ...q, notes } : q
      ),
    };
    setEvaluatingTrack(updated);
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAddPermanentRule = (rule: string) => {
    if (!evaluatingTrack) return;
    const updated = {
      ...evaluatingTrack,
      permanentRules: [...evaluatingTrack.permanentRules, rule],
    };
    setEvaluatingTrack(updated);
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleRemovePermanentRule = (index: number) => {
    if (!evaluatingTrack) return;
    const updated = {
      ...evaluatingTrack,
      permanentRules: evaluatingTrack.permanentRules.filter((_, i) => i !== index),
    };
    setEvaluatingTrack(updated);
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTake = (trackId: string, takeId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            generatedAudioList: t.generatedAudioList.filter((take) => take.id !== takeId),
          };
        }
        return t;
      })
    );
    if (activeTakeId === takeId) {
      setActiveTakeId(undefined);
      setIsPlaying(false);
    }
  };

  const handleUpdateTrackPrompt = (trackId: string, newPrompt: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, sunoPrompt: newPrompt } : t))
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Top Header */}
      <AlbumHeader
        tracks={tracks}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onOpenGlobalReport={() => setShowGlobalReport(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Status / Alert Banner if notification exists */}
        {statusNotification && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              statusNotification.type === "error"
                ? "bg-red-950/70 border-red-800 text-red-200"
                : statusNotification.type === "success"
                ? "bg-emerald-950/70 border-emerald-800 text-emerald-200"
                : "bg-amber-950/70 border-amber-800 text-amber-200"
            }`}
          >
            {statusNotification.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            ) : statusNotification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="flex-1 text-xs sm:text-sm leading-relaxed">
              <p className="font-semibold">
                {statusNotification.type === "error"
                  ? "Music Generation Notice"
                  : statusNotification.type === "success"
                  ? "Take Rendered"
                  : "Lyria AI In Progress"}
              </p>
              <p className="text-stone-300 mt-0.5">{statusNotification.message}</p>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tactical Cassette Master Deck */}
        <section aria-label="Cassette Deck Player">
          <CassetteDeckPlayer
            currentTrack={currentTrack}
            allTracks={tracks}
            onSelectTrack={handleSelectTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStop={handleStop}
            audioSource={audioSource}
            onToggleSource={setAudioSource}
            activeGeneratedAudio={activeTake}
            onOpenPromptStudio={(t) => setStudioTrack(t)}
          />
        </section>

        {/* 4 Album Tracks Grid */}
        <section aria-label="Album Tracks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-amber-400" />
                Album Tracklist & Sound Profiles
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                4 distinct modes: 72 BPM Ninja Meditation, 85 BPM Sewer Beats, 90 BPM Night Patrol, and 100 BPM Pizza Party
              </p>
            </div>

            <span className="hidden sm:inline-block text-xs font-mono text-stone-500">
              Active: Track 0{currentTrack.trackNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isSelected={track.id === currentTrackId}
                isPlaying={isPlaying}
                isEngineActive={audioSource === "synth"}
                onSelectTrack={handleSelectTrack}
                onPlayLiveSynth={handlePlayLiveSynth}
                onOpenPromptStudio={(t) => setStudioTrack(t)}
                onOpenEvaluation={(t) => setEvaluatingTrack(t)}
                onPlayGeneratedTake={handlePlayGeneratedTake}
                activeGeneratedTakeId={audioSource === "lyria" ? activeTakeId : undefined}
                selectedModel={selectedModel}
                onQuickGenerate={handleQuickGenerate}
                isGeneratingThisTrack={generatingTrackId === track.id}
              />
            ))}
          </div>
        </section>

        {/* Production Lore & Universe Sound Guidelines Section */}
        <section className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-stone-200">
              Underground Production Blueprint & Aesthetic Discipline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-stone-400 leading-relaxed">
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono uppercase tracking-wider block">
                01. Ninja Meditation (72 BPM)
              </span>
              <p>
                Subtle organic human groove, soft boom-bap, warm Rhodes minor 9ths, and sparse plucked koto accents. Subway rumble and rain stay deep in the background.
              </p>
            </div>

            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <span className="font-bold text-amber-400 font-mono uppercase tracking-wider block">
                02. Sewer Beats (85 BPM)
              </span>
              <p>
                Lived-in underground headquarters warmth. Maxell tape saturation, Dilla pocket swing, jazz chord voicings, CRT monitor buzz, and cassette transport clicks.
              </p>
            </div>

            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <span className="font-bold text-indigo-400 font-mono uppercase tracking-wider block">
                03. Night Patrol (90 BPM)
              </span>
              <p>
                Cinematic midnight momentum over brick fire escapes. Driving boom-bap drums, moody Juno pad synths, wet street reflections, and martial-arts tension.
              </p>
            </div>

            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <span className="font-bold text-orange-400 font-mono uppercase tracking-wider block">
                04. Pizza Party (100 BPM)
              </span>
              <p>
                Upbeat celebration with youthful 90s street funk. Punchier SP-1200 drums, walking bassline, rhythmic vocal chops, and playful vinyl scratch stabs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 px-4 py-4 text-xs text-stone-500 text-center">
        <p>
          Subterranean Lo-Fi Studio • Built with Google Lyria AI (
          <code className="text-amber-400">lyria-3-clip-preview</code> &amp;{" "}
          <code className="text-amber-400">lyria-3-pro-preview</code>) &amp; Web Audio Analog Synthesizer
        </p>
      </footer>

      {/* Modals */}
      {evaluatingTrack && (
        <EvaluationScorecard
          track={evaluatingTrack}
          onClose={() => setEvaluatingTrack(null)}
          onUpdateQuestionRating={handleUpdateQuestionRating}
          onUpdateQuestionNotes={handleUpdateQuestionNotes}
          onAddPermanentRule={handleAddPermanentRule}
          onRemovePermanentRule={handleRemovePermanentRule}
        />
      )}

      {studioTrack && (
        <PromptStudioModal
          track={studioTrack}
          onClose={() => setStudioTrack(null)}
          onGenerateTrack={handleGenerateTrack}
          isGenerating={generatingTrackId === studioTrack.id}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onPlayTake={(take) => handlePlayGeneratedTake(studioTrack, take)}
          activeTakeId={activeTakeId}
          isPlaying={isPlaying && audioSource === "lyria"}
          onDeleteTake={handleDeleteTake}
          onUpdateTrackPrompt={handleUpdateTrackPrompt}
        />
      )}

      {showGlobalReport && (
        <GlobalReportModal tracks={tracks} onClose={() => setShowGlobalReport(false)} />
      )}
    </div>
  );
}
