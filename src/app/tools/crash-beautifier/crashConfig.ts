export type CrashType = 'react-native' | 'android-logcat' | 'ios-crash' | 'flutter';

export interface ParsedCrashLine {
  type: 'error' | 'stack' | 'info';
  content: string;
  file?: string;
  line?: number;
  column?: number;
  functionName?: string;
}

export interface CrashConfig {
  id: CrashType;
  label: string;
  description: string;
  fileExtension: string;
  example: string;
}

export const CRASH_TYPES: CrashConfig[] = [
  {
    id: 'react-native',
    label: 'React Native',
    description: 'React Native JavaScript stack traces from the red box error screen',
    fileExtension: '.txt',
    example: `TypeError: Cannot read property 'state' of undefined
    at MyComponent (/path/to/MyComponent.js:42:21)
    at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:14803:18)`
  },
  {
    id: 'android-logcat',
    label: 'Android Logcat',
    description: 'Android crash logs from logcat output',
    fileExtension: '.txt',
    example: `2024-03-15 10:30:45.789 E/AndroidRuntime: FATAL EXCEPTION: main
    Process: com.myapp, PID: 1234
    java.lang.NullPointerException: Attempt to invoke virtual method
        at com.myapp.MainActivity.onCreate(MainActivity.java:24)
        at android.app.Activity.performCreate(Activity.java:8000)`
  },
  {
    id: 'ios-crash',
    label: 'iOS Crash',
    description: 'iOS crash reports (.crash files)',
    fileExtension: '.crash',
    example: `Exception Type: EXC_CRASH (SIGABRT)
    Exception Codes: 0x0000000000000000, 0x0000000000000000
    Triggered by Thread: 0
    
    Thread 0 name: Dispatch queue: com.apple.main-thread
    Thread 0 Crashed:
    0   libsystem_kernel.dylib          0x00000001a04c1e30
    1   MyApp                           0x0000000100123456 -[MyViewController viewDidLoad] + 123`
  },
  {
    id: 'flutter',
    label: 'Flutter',
    description: 'Flutter/Dart stack traces',
    fileExtension: '.txt',
    example: `#0      MyWidget.build (package:myapp/widgets/my_widget.dart:42:7)
    #1      StatelessElement.build (package:flutter/src/widgets/framework.dart:4701:28)
    #2      ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:4587:15)`
  }
]; 