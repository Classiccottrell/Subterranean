import React, { useState } from "react";
import { X, Download, Copy, Check, Disc, FileText, CheckCircle2 } from "lucide-react";
import { TrackData } from "../types";

interface GlobalReportModalProps {
  tracks: TrackData[];
  onClose: () => void;
}

export const GlobalReportModal: React.FC<GlobalReportModalProps> = ({ tracks, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const generateMarkdownReport = (): string => {
    let md = `# SUBTERRANEAN LO-FI: THE 4-TRACK UNDERGROUND CONCEPT ALBUM\n`;
    md += `**Generated**: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
    md += `## Album Overview\n`;
    md += `A nocturnal lo-fi hip-hop concept project capturing the warmth, discipline, and camaraderie of late-night ninja refuge life.\n\n`;

    tracks.forEach((t) => {
      md += `### Track ${t.trackNumber}: ${t.title} [Mode: ${t.mode}]\n`;
      md += `- **Tempo**: ${t.bpm} BPM\n`;
      md += `- **Production Target**: ${t.target}\n`;
      md += `- **Key & Mood**: ${t.keyMood}\n`;
      md += `- **Lyria/Suno Style Prompt**:\n> ${t.sunoPrompt}\n\n`;

      md += `#### Evaluation Criteria & Review:\n`;
      t.evaluationQuestions.forEach((q, idx) => {
        md += `${idx + 1}. **${q.question}**\n`;
        md += `   - Status: ${q.rating ? q.rating.toUpperCase() : "UNGRADED"}\n`;
        md += `   - Observations: ${q.notes || "None recorded."}\n`;
      });
      md += `\n`;

      md += `#### Permanent Production Rules for ${t.mode}:\n`;
      if (t.permanentRules.length === 0) {
        md += `- None defined.\n`;
      } else {
        t.permanentRules.forEach((r, idx) => {
          md += `${idx + 1}. ${r}\n`;
        });
      }
      md += `\n---\n\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([generateMarkdownReport()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Subterranean_LoFi_Album_Production_Spec.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(tracks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subterranean_album_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">Full Album Production Specification</h2>
              <p className="text-xs text-stone-400">Complete prompts, evaluations, and permanent universe rules</p>
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-xs text-stone-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto select-all">
            {generateMarkdownReport()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Markdown" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
