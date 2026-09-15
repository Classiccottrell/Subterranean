import React, { useState } from "react";
import {
  X,
  Sparkles,
  Play,
  Pause,
  Download,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  HelpCircle,
  Clock,
  Radio,
} from "lucide-react";
import { GeneratedTrackAudio, LyriaModel, TrackData } from "../types";

interface PromptStudioModalProps {
  track: TrackData;
  onClose: () => void;
  onGenerateTrack: (trackId: string, customPrompt: string, model: LyriaModel) => Promise<void>;
  isGenerating: boolean;
  selectedModel: LyriaModel;
  onSelectModel: (model: LyriaModel) => void;
  onPlayTake: (take: GeneratedTrackAudio) => void;
  activeTakeId?: string;
  isPlaying: boolean;
  onDeleteTake: (trackId: string, takeId: string) => void;
  onUpdateTrackPrompt: (trackId: string, newPrompt: string) => void;
}

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  track,
  onClose,
  onGenerateTrack,
  isGenerating,
  selectedModel,
  onSelectModel,
  onPlayTake,
  activeTakeId,
  isPlaying,
  onDeleteTake,
  onUpdateTrackPrompt,
}) => {
  const [promptText, setPromptText] = useState<string>(track.sunoPrompt);
  const [copied, setCopied] = useState<boolean>(false);
  const [quickPreset, setQuickPreset] = useState<string>("");

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetPrompt = () => {
    setPromptText(track.sunoPrompt);
  };

  const handleApplyAddon = (addon: string) => {
    setPromptText((prev) => `${prev.trim()} ${addon}`);
  };

  const handleSubmitGeneration = () => {
    onUpdateTrackPrompt(track.id, promptText);
    onGenerateTrack(track.id, promptText, selectedModel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  Track 0{track.trackNumber}
                </span>
                <span className="text-xs font-bold text-amber-400">{track.mode}</span>
                <span className="text-xs font-mono text-stone-400">• {track.bpm} BPM</span>
              </div>
              <h2 className="text-lg font-bold text-stone-100 mt-0.5">{track.title} — Lyria AI Studio</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Lyria Model Selection & Target info */}
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono text-stone-400 uppercase">Production Target</div>
              <div className="text-stone-200 font-medium text-xs sm:text-sm mt-0.5">{track.target}</div>
            </div>

            {/* Model Toggle Buttons */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onSelectModel("lyria-3-clip-preview")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedModel === "lyria-3-clip-preview"
                    ? "bg-amber-600 text-stone-950 font-bold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Clip (Up to 30s)
              </button>
              <button
                type="button"
                onClick={() => onSelectModel("lyria-3-pro-preview")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedModel === "lyria-3-pro-preview"
                    ? "bg-amber-600 text-stone-950 font-bold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Pro (Full-Length)
              </button>
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 font-mono flex items-center gap-1.5">
                <span>Prompt Specification</span>
                <span className="text-stone-400 font-normal">({promptText.length} chars)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  title="Reset to default prompt"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  title="Copy prompt text"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500 shadow-inner"
              placeholder="Enter detailed lo-fi music generation prompt..."
            />

            {/* Quick Lo-Fi Directives */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-stone-300 mr-1">Quick Injections:</span>
              <button
                type="button"
                onClick={() => handleApplyAddon("Slightly dustier 12-bit SP-1200 drum saturation.")}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors border border-stone-700"
              >
                + 12-bit SP-1200 Crunch
              </button>
              <button
                type="button"
                onClick={() => handleApplyAddon("Damp subterranean room reverb and gentle sewer water drops.")}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors border border-stone-700"
              >
                + Sewer Room Tone
              </button>
              <button
                type="button"
                onClick={() => handleApplyAddon("Slow tape warble and subtle pitch wow on electric piano.")}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors border border-stone-700"
              >
                + Tape Wow & Flutter
              </button>
              <button
                type="button"
                onClick={() => handleApplyAddon("Distant subway rumble below 50Hz.")}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors border border-stone-700"
              >
                + Subway Sub-Bass
              </button>
            </div>
          </div>

          {/* Generated Takes History */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300 font-mono">
                Rendered Audio Takes ({track.generatedAudioList.length})
              </h3>
              <span className="text-[11px] text-stone-300">Saved in browser memory & playable in deck</span>
            </div>

            {track.generatedAudioList.length === 0 ? (
              <div className="p-6 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-2">
                <Radio className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-300">
                  No Lyria takes generated yet for this track.
                </p>
                <p className="text-[11px] text-stone-400 max-w-md mx-auto">
                  Click the button below to stream a music render using Google Lyria AI, or enjoy the real-time procedural Web Audio synth groove right now in the cassette deck!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {track.generatedAudioList.map((take, idx) => (
                  <div
                    key={take.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      activeTakeId === take.id && isPlaying
                        ? "bg-amber-950/60 border-amber-600"
                        : "bg-stone-950 border-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onPlayTake(take)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow transition-transform active:scale-95"
                      >
                        {activeTakeId === take.id && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-200 text-xs">Take #{idx + 1}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
                            {take.model}
                          </span>
                          <span className="text-[10px] text-stone-300 font-mono">
                            {new Date(take.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 truncate max-w-sm sm:max-w-md mt-0.5">
                          {take.promptUsed}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={take.audioUrl}
                        download={`Subterranean_${track.title.replace(/\s+/g, "_")}_Take${idx + 1}.wav`}
                        className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                        title="Download WAV File"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onDeleteTake(track.id, take.id)}
                        className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-500 hover:text-red-400 transition-colors"
                        title="Delete take"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-stone-800 bg-stone-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Generating with <span className="font-mono text-stone-300">{selectedModel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors flex-1 sm:flex-none"
            >
              Close
            </button>

            <button
              id="start-lyria-generation-btn"
              onClick={handleSubmitGeneration}
              disabled={isGenerating}
              className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all flex-1 sm:flex-none ${
                isGenerating
                  ? "bg-amber-800/60 text-amber-200 cursor-wait animate-pulse"
                  : "bg-amber-500 hover:bg-amber-400 text-stone-950"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? "Generating Music Audio..." : "Generate with Lyria"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
