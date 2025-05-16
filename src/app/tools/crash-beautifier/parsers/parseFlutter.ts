import { ParsedCrashLine } from '../crashConfig';

export function parseFlutter(log: string): ParsedCrashLine[] {
  const lines = log.split('\n');
  const parsedLines: ParsedCrashLine[] = [];
  let isFirstLine = true;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Error message (usually the first line)
    if (isFirstLine && !trimmedLine.startsWith('#')) {
      parsedLines.push({
        type: 'error',
        content: trimmedLine
      });
      isFirstLine = false;
      continue;
    }

    // Stack trace line with package info
    const packageMatch = trimmedLine.match(/#\d+\s+([^(]+)\s+\(package:([^:]+):(\d+):(\d+)\)/);
    if (packageMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        functionName: packageMatch[1].trim(),
        file: `package:${packageMatch[2]}`,
        line: parseInt(packageMatch[3]),
        column: parseInt(packageMatch[4])
      });
      continue;
    }

    // Stack trace line with file path
    const fileMatch = trimmedLine.match(/#\d+\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/);
    if (fileMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        functionName: fileMatch[1].trim(),
        file: fileMatch[2],
        line: parseInt(fileMatch[3]),
        column: parseInt(fileMatch[4])
      });
      continue;
    }

    // Asynchronous suspension point
    if (trimmedLine.includes('<asynchronous suspension>')) {
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
      continue;
    }

    // Any other line
    parsedLines.push({
      type: 'info',
      content: trimmedLine
    });
  }

  return parsedLines;
} 