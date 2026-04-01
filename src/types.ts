export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'clean';

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  layer: 'text' | 'visual' | 'metadata';
  analyzer: string;
}

export interface ScanReport {
  verdict: Severity;
  verdictText: string;
  findings: Finding[];
  stats: {
    totalWords: number;
    hiddenWords: number;
    hiddenRatio: number;
    scanDurationMs: number;
  };
  cleanText?: string;
}

export interface ParsedDocument {
  rawText: string;
  runs: TextRun[];
  metadata: Record<string, string>;
  rawXml?: string;
}

export interface TextRun {
  text: string;
  fontSize?: number;    // in pt
  fontColor?: string;   // hex e.g. "FFFFFF"
  bgColor?: string;     // hex
  isVanish?: boolean;
  isWebHidden?: boolean;
  pageIndex?: number;
}
