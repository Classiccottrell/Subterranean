export type LyriaModel = "lyria-3-clip-preview" | "lyria-3-pro-preview";

export interface EvaluationQuestion {
  id: string;
  question: string;
  rating?: "pass" | "needs-polish" | "fail" | null;
  notes?: string;
}

export interface GeneratedTrackAudio {
  id: string;
  timestamp: number;
  model: LyriaModel;
  audioUrl: string;
  audioBlob?: Blob;
  mimeType: string;
  lyrics?: string;
  promptUsed: string;
  duration?: number;
}

export interface TrackData {
  id: string;
  trackNumber: number;
  title: string;
  mode: string;
  target: string;
  bpm: number;
  keyMood: string;
  themeColor: "emerald" | "amber" | "indigo" | "orange";
  sunoPrompt: string;
  evaluationQuestions: EvaluationQuestion[];
  permanentRules: string[];
  generatedAudioList: GeneratedTrackAudio[];
  activeAudioId?: string; // which generated audio is selected
  notes?: string;
}

export interface LoFiEffectControls {
  vinylCrackle: number; // 0 to 1
  subwayRumble: number; // 0 to 1
  rainAtmosphere: number; // 0 to 1
  tapeFlutter: number; // 0 to 1
  filterCutoff: number; // 500 to 12000 Hz
  playbackSpeed: number; // 0.85 to 1.15
}
