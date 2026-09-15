import React, { useState } from "react";
import {
  Play,
  Pause,
  Sparkles,
  ClipboardCheck,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Radio,
  BookOpen,
  Volume2,
} from "lucide-react";
import { GeneratedTrackAudio, LyriaModel, TrackData } from "../types";

interface TrackCardProps {
  track: TrackData;
  isSelected: boolean;
  isPlaying: boolean;
  isEngineActive: boolean;
  onSelectTrack: (track: TrackData) => void;
  onPlayLiveSynth: (track: TrackData) => void;
  onOpenPromptStudio: (track: TrackData) => void;
  onOpenEvaluation: (track: TrackData) => void;
  onPlayGeneratedTake: (track: TrackData, take: GeneratedTrackAudio) => void;
  activeGeneratedTakeId?: string;
  selectedModel: LyriaModel;
  onQuickGenerate: (track: TrackData) => void;
  isGeneratingThisTrack: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isSelected,
  isPlaying,
  isEngineActive,
  onSelectTrack,
  onPlayLiveSynth,
  onOpenPromptStudio,
  onOpenEvaluation,
  onPlayGeneratedTake,
  activeGeneratedTakeId,
  selectedModel,
  onQuickGenerate,
  isGeneratingThisTrack,
}) => {
  const [showPromptDetails, setShowPromptDetails] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const themeBorder = {
    emerald: "border-emerald-800/60 hover:border-emerald-600/80",
    amber: "border-amber-800/60 hover:border-amber-600/80",
    indigo: "border-indigo-800/60 hover:border-indigo-600/80",
    orange: "border-orange-800/60 hover:border-orange-600/80",
  }[track.themeColor];

  const themeBadge = {
    emerald: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
    amber: "bg-amber-950/80 text-amber-300 border-amber-800",
    indigo: "bg-indigo-950/80 text-indigo-300 border-indigo-800",
    orange: "bg-orange-950/80 text-orange-300 border-orange-800",
  }[track.themeColor];

  const themeAccent = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    indigo: "text-indigo-400",
    orange: "text-orange-400",
  }[track.themeColor];

  const answeredQuestionsCount = track.evaluationQuestions.filter((q) => q.rating !== null).length;
  const totalQuestions = track.evaluationQuestions.length;

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(track.sunoPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div
      id={`track-card-${track.id}`}
      onClick={() => onSelectTrack(track)}
      className={`rounded-xl border p-4 sm:p-5 transition-all cursor-pointer bg-stone-900/90 relative ${
        isSelected
          ? `ring-2 ring-amber-500/70 shadow-lg ${themeBorder}`
          : `border-stone-800 ${themeBorder}`
      }`}
    >
      {/* Track Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center font-mono font-bold text-stone-200 text-sm">
            0{track.trackNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${themeBadge}`}>
                {track.mode}
              </span>
              <span className="text-[11px] font-mono text-stone-300">{track.bpm} BPM</span>
            </div>
            <h3 className="text-lg font-bold text-stone-100 tracking-tight mt-0.5">{track.title}</h3>
          </div>
        </div>

        {/* Evaluation Status Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenEvaluation(track);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            answeredQuestionsCount === totalQuestions
              ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
              : answeredQuestionsCount > 0
              ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
              : "bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200"
          }`}
          title="Open track evaluation questions"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>
            {answeredQuestionsCount}/{totalQuestions} Eval
          </span>
        </button>
      </div>

      {/* Target Description */}
      <p className="text-xs text-stone-300 leading-relaxed mb-4">{track.target}</p>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
        {/* Play Live Synth Beat */}
        <button
          id={`play-synth-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlayLiveSynth(track);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
            isSelected && isPlaying && isEngineActive
              ? "bg-emerald-600 text-stone-950 font-bold border-emerald-500 shadow-sm"
              : "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700"
          }`}
        >
          {isSelected && isPlaying && isEngineActive ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Live Groove ({track.bpm} BPM)</span>
        </button>

        {/* Generate with Lyria Button */}
        <button
          id={`generate-lyria-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onQuickGenerate(track);
          }}
          disabled={isGeneratingThisTrack}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            isGeneratingThisTrack
              ? "bg-amber-800/50 border-amber-700 text-amber-200 animate-pulse cursor-wait"
              : "bg-amber-600/90 hover:bg-amber-500 text-stone-950 border-amber-500 shadow-sm"
          }`}
          title={`Generate audio using ${selectedModel}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGeneratingThisTrack ? "Generating..." : `Generate (${selectedModel === "lyria-3-clip-preview" ? "30s Clip" : "Full Track"})`}</span>
        </button>

        {/* Studio & Customize */}
        <button
          id={`studio-${track.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenPromptStudio(track);
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-colors ml-auto flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Studio & Takes</span>
        </button>
      </div>

      {/* Generated Audio Takes List (if any) */}
      {track.generatedAudioList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-1.5">
          <div className="text-[11px] font-mono text-stone-400 flex items-center justify-between">
            <span>LYRIA TAKES ({track.generatedAudioList.length})</span>
            <span className="text-amber-400 text-[10px]">Ready to play</span>
          </div>

          <div className="space-y-1">
            {track.generatedAudioList.map((take, idx) => (
              <div
                key={take.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayGeneratedTake(track, take);
                }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-colors ${
                  activeGeneratedTakeId === take.id && isPlaying
                    ? "bg-amber-950/60 border-amber-600 text-amber-200"
                    : "bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <button className="p-1 rounded bg-stone-800 hover:bg-stone-700">
                    {activeGeneratedTakeId === take.id && isPlaying ? (
                      <Pause className="w-3 h-3 fill-current text-amber-400" />
                    ) : (
                      <Play className="w-3 h-3 fill-current text-stone-300" />
                    )}
                  </button>
                  <span className="font-mono text-[11px] text-stone-400">Take #{idx + 1}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 uppercase">
                    {take.model.includes("clip") ? "30s Clip" : "Full Track"}
                  </span>
                </div>

                <a
                  href={take.audioUrl}
                  download={`Subterranean_${track.title.replace(/\s+/g, "_")}_Take${idx + 1}.wav`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
                  title="Download WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Prompt Preview */}
      <div className="mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPromptDetails(!showPromptDetails);
          }}
          className="w-full flex items-center justify-between text-[11px] font-mono text-stone-400 hover:text-stone-300 py-1"
        >
          <span>LYRIA / SUNO PROMPT DIRECTIVE</span>
          {showPromptDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showPromptDetails && (
          <div className="mt-2 p-3 bg-stone-950 rounded-lg border border-stone-800 text-xs text-stone-300 leading-relaxed relative">
            <p className="font-mono text-[11px] select-all pr-8 text-stone-300">{track.sunoPrompt}</p>
            <button
              onClick={handleCopyPrompt}
              className="absolute top-2 right-2 p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Copy prompt"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
