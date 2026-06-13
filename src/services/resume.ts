import { PDFParse } from "pdf-parse";

export async function parseResumeText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text || "";
}

export async function processResume(buffer: Buffer) {
  const text = await parseResumeText(buffer);
  const { analyzeResume } = await import("@/services/ai");
  const analysis = await analyzeResume(text);
  return { text, analysis };
}
