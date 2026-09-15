import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  FileDown,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { EvaluationQuestion, TrackData } from "../types";

interface EvaluationScorecardProps {
  track: TrackData;
  onClose: () => void;
  onUpdateQuestionRating: (questionId: string, rating: "pass" | "needs-polish" | "fail") => void;
  onUpdateQuestionNotes: (questionId: string, notes: string) => void;
  onAddPermanentRule: (rule: string) => void;
  onRemovePermanentRule: (index: number) => void;
}

export const EvaluationScorecard: React.FC<EvaluationScorecardProps> = ({
  track,
  onClose,
  onUpdateQuestionRating,
  onUpdateQuestionNotes,
  onAddPermanentRule,
  onRemovePermanentRule,
}) => {
  const [newRuleInput, setNewRuleInput] = useState<string>("");
  const [copiedReview, setCopiedReview] = useState<boolean>(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    onAddPermanentRule(newRuleInput.trim());
    setNewRuleInput("");
  };

  const handleCopyTrackReview = () => {
    const text = `### Track ${track.trackNumber}: ${track.title} [${track.mode}]
**Target**: ${track.target}
**BPM**: ${track.bpm}

#### Evaluation Criteria:
${track.evaluationQuestions
  .map(
    (q) =>
      `- **Q: ${q.question}**\n  - Status: ${
        q.rating ? q.rating.toUpperCase() : "UNGRADED"
      }\n  - Observations: ${q.notes || "No notes logged."}`
  )
  .join("\n")}

#### Permanent Musical Universe Rules:
${track.permanentRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2000);
  };

  const answeredCount = track.evaluationQuestions.filter((q) => q.rating !== null).length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Track 0{track.trackNumber} • {track.mode}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {answeredCount}/{track.evaluationQuestions.length} Answered
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-100 mt-1">{track.title} — Evaluation Scorecard</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTrackReview}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors border border-stone-700"
              title="Copy review to clipboard"
            >
              {copiedReview ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">Copy Review</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Evaluation Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Track Evaluation Questions
              </h3>
              <span className="text-[11px] text-stone-300">Grade generated takes against the concept target</span>
            </div>

            <div className="space-y-3.5">
              {track.evaluationQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/90 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="font-medium text-stone-200 text-xs sm:text-sm">
                      <span className="text-amber-400 font-mono mr-1.5">Q{idx + 1}.</span>
                      {q.question}
                    </p>

                    {/* Rating buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onUpdateQuestionRating(q.id, "pass")}
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                          q.rating === "pass"
                            ? "bg-emerald-600 text-stone-950"
                            : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-emerald-300"
                        }`}
                        title="Criteria passed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>

                      <button
                        onClick={() => onUpdateQuestionRating(q.id, "needs-polish")}
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                          q.rating === "needs-polish"
                            ? "bg-amber-500 text-stone-950"
                            : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300"
                        }`}
                        title="Needs prompt or mix adjustment"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Polish</span>
                      </button>

                      <button
                        onClick={() => onUpdateQuestionRating(q.id, "fail")}
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                          q.rating === "fail"
                            ? "bg-red-600 text-white"
                            : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-300"
                        }`}
                        title="Does not match concept criteria"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Fail</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div>
                    <input
                      type="text"
                      value={q.notes || ""}
                      onChange={(e) => onUpdateQuestionNotes(q.id, e.target.value)}
                      placeholder="Add observation or mix recommendation..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-300 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permanent Musical Universe Rules */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Permanent Rules for {track.mode}
                </h3>
                <p className="text-[11px] text-stone-300">
                  Established production rules to keep the album cohesive
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {track.permanentRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 group"
                >
                  <span className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">{idx + 1}.</span>
                    <span>{rule}</span>
                  </span>
                  <button
                    onClick={() => onRemovePermanentRule(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-400 transition-opacity"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new rule */}
            <form onSubmit={handleAddRule} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                placeholder="Define a new permanent production rule (e.g., 'Rhodes chorus rate <= 0.8Hz')..."
                className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
