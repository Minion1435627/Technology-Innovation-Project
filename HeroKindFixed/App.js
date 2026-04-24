import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

enableScreens();

const EXGL_PIXEL_STORE_WARNING = "EXGL: gl.pixelStorei() doesn't support this parameter yet!";

LogBox.ignoreLogs([
  EXGL_PIXEL_STORE_WARNING,
]);

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

function shouldIgnoreExglNoise(args) {
  return args.some(
    (arg) => typeof arg === 'string' && arg.includes(EXGL_PIXEL_STORE_WARNING)
  );
}

console.log = (...args) => {
  if (shouldIgnoreExglNoise(args)) return;
  originalConsoleLog(...args);
};

console.warn = (...args) => {
  if (shouldIgnoreExglNoise(args)) return;
  originalConsoleWarn(...args);
};

console.error = (...args) => {
  if (shouldIgnoreExglNoise(args)) return;
  originalConsoleError(...args);
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
