import { ParsedCrashLine } from '../crashConfig';

export function parseReactNative(log: string): ParsedCrashLine[] {
  const lines = log.split('\n');
  const parsedLines: ParsedCrashLine[] = [];
  let isFirstLine = true;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Error message line
    if (isFirstLine) {
      parsedLines.push({
        type: 'error',
        content: trimmedLine
      });
      isFirstLine = false;
      continue;
    }

    // Stack trace line
    const stackMatch = trimmedLine.match(/at\s+([^(]+)\s*\(([^:]+):(\d+):(\d+)\)/);
    if (stackMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        functionName: stackMatch[1].trim(),
        file: stackMatch[2],
        line: parseInt(stackMatch[3]),
        column: parseInt(stackMatch[4])
      });
      continue;
    }

    // Alternative stack trace format (anonymous functions)
    const anonymousMatch = trimmedLine.match(/at\s+([^:]+):(\d+):(\d+)/);
    if (anonymousMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        file: anonymousMatch[1],
        line: parseInt(anonymousMatch[2]),
        column: parseInt(anonymousMatch[3])
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