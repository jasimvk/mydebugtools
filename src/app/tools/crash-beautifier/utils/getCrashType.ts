import { CrashType } from '../crashConfig';

export function getCrashType(log: string): CrashType | null {
  const trimmedLog = log.trim();
  
  // React Native detection
  if (
    trimmedLog.includes('TypeError:') ||
    trimmedLog.includes('ReferenceError:') ||
    (trimmedLog.includes('at ') && trimmedLog.includes('node_modules/react'))
  ) {
    return 'react-native';
  }

  // Android Logcat detection
  if (
    trimmedLog.includes('FATAL EXCEPTION:') ||
    trimmedLog.includes('AndroidRuntime:') ||
    (trimmedLog.includes('java.') && trimmedLog.includes('Exception'))
  ) {
    return 'android-logcat';
  }

  // iOS crash detection
  if (
    trimmedLog.includes('Exception Type:') ||
    trimmedLog.includes('Thread') && trimmedLog.includes('Crashed:') ||
    trimmedLog.includes('Binary Images:')
  ) {
    return 'ios-crash';
  }

  // Flutter detection
  if (
    trimmedLog.includes('package:flutter/') ||
    trimmedLog.match(/#\d+\s+.*\(package:.*\)/) ||
    trimmedLog.includes('<asynchronous suspension>')
  ) {
    return 'flutter';
  }

  return null;
} 