import React from "react";
import { Disc3, Music2, Sparkles, Sliders, FileText, CheckCircle2 } from "lucide-react";
import { LyriaModel, TrackData } from "../types";

interface AlbumHeaderProps {
  tracks: TrackData[];
  selectedModel: LyriaModel;
  onSelectModel: (model: LyriaModel) => void;
  onOpenGlobalReport: () => void;
  hasApiKey: boolean | null;
}

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  tracks,
  selectedModel,
  onSelectModel,
  onOpenGlobalReport,
  hasApiKey,
}) => {
  const totalQuestions = tracks.reduce((acc, t) => acc + t.evaluationQuestions.length, 0);
  const answeredQuestions = tracks.reduce(
    (acc, t) => acc + t.evaluationQuestions.filter((q) => q.rating !== null).length,
    0
  );
  const totalGenerated = tracks.reduce((acc, t) => acc + t.generatedAudioList.length, 0);

  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Album Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-amber-700/30 border border-stone-700 shadow-inner">
            <Disc3 className="w-7 h-7 text-emerald-400 animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-2 h-2 rounded-full bg-stone-950 border border-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60">
                Lo-Fi Hip-Hop Album
              </span>
              <span className="text-xs text-stone-300">4-Track Concept LP</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
              Subterranean Lo-Fi
              <span className="text-sm font-normal text-stone-400">/ Ninja Sanctuary Chronicles</span>
            </h1>
          </div>
        </div>

        {/* Action controls & Model selection */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Lyria Model Selector */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-1 text-xs">
            <span className="text-stone-300 font-medium px-2 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Lyria Model:
            </span>
            <button
              id="model-clip-btn"
              onClick={() => onSelectModel("lyria-3-clip-preview")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedModel === "lyria-3-clip-preview"
                  ? "bg-amber-600/90 text-stone-950 font-semibold shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Fast short clips up to 30s"
            >
              Clip (30s)
            </button>
            <button
              id="model-pro-btn"
              onClick={() => onSelectModel("lyria-3-pro-preview")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedModel === "lyria-3-pro-preview"
                  ? "bg-amber-600/90 text-stone-950 font-semibold shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Full-length production track"
            >
              Pro Track
            </button>
          </div>

          {/* Evaluation Progress badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-800 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400">Evaluations:</span>
            <span className="font-semibold text-stone-200">
              {answeredQuestions}/{totalQuestions}
            </span>
          </div>

          {/* Export Album Spec Button */}
          <button
            id="export-album-spec-btn"
            onClick={onOpenGlobalReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Album Spec & Reviews</span>
          </button>
        </div>
      </div>
    </header>
  );
};
