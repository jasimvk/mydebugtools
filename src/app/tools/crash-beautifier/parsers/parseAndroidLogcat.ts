import { ParsedCrashLine } from '../crashConfig';

export function parseAndroidLogcat(log: string): ParsedCrashLine[] {
  const lines = log.split('\n');
  const parsedLines: ParsedCrashLine[] = [];
  let isInException = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Fatal exception line
    if (trimmedLine.includes('FATAL EXCEPTION')) {
      isInException = true;
      parsedLines.push({
        type: 'error',
        content: trimmedLine
      });
      continue;
    }

    // Process info line
    if (trimmedLine.startsWith('Process:') || trimmedLine.startsWith('PID:')) {
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
      continue;
    }

    // Exception class line
    if (trimmedLine.startsWith('java.') || trimmedLine.startsWith('kotlin.')) {
      parsedLines.push({
        type: 'error',
        content: trimmedLine
      });
      continue;
    }

    // Stack trace line
    const stackMatch = trimmedLine.match(/at\s+([^(]+)\(([^:]+):(\d+)\)/);
    if (stackMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        functionName: stackMatch[1].trim(),
        file: stackMatch[2],
        line: parseInt(stackMatch[3])
      });
      continue;
    }

    // Alternative stack trace format (no line number)
    const altStackMatch = trimmedLine.match(/at\s+([^(]+)\(([^)]+)\)/);
    if (altStackMatch) {
      parsedLines.push({
        type: 'stack',
        content: trimmedLine,
        functionName: altStackMatch[1].trim(),
        file: altStackMatch[2]
      });
      continue;
    }

    // Any other line within the exception block
    if (isInException) {
      parsedLines.push({
        type: 'info',
        content: trimmedLine
      });
    }
  }

  return parsedLines;
} 