import React from 'react';
import 'react-native-reanimated';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../store';
import ErrorBoundary from '../components/ErrorBoundary';
import AppContent from '../components/AppContent';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AppContent />
      </ReduxProvider>
    </ErrorBoundary>
  );
}
