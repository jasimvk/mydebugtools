import { ParsedCrashLine } from '../crashConfig';

export function parseIOSCrash(log: string): ParsedCrashLine[] {
  const lines = log.split('\n');
  const parsedLines: ParsedCrashLine[] = [];
  let isInStackTrace = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Exception type line
    if (trimmedLine.startsWith('Exception Type:')) {
      parsedLines.push({
        type: 'error',
        content: trimmedLine
      });
      continue;
    }

    // Thread crash indicator
    if (trimmedLine.includes('Crashed:')) {
      isInStackTrace = true;
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
      continue;
    }

    // Stack frame with memory address
    const frameMatch = trimmedLine.match(/^\d+\s+(\S+)\s+(0x[0-9a-f]+)\s+(.+)$/i);
    if (frameMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        file: frameMatch[1],
        functionName: frameMatch[3]
      });
      continue;
    }

    // Binary images
    if (trimmedLine.startsWith('Binary Images:')) {
      isInStackTrace = false;
    }

    // Thread state or register info
    if (trimmedLine.match(/^Thread \d+/)) {
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
      continue;
    }

    // Any other line in stack trace
    if (isInStackTrace) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine
      });
    } else {
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
    }
  }

  return parsedLines;
} 