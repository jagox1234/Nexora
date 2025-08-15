// Nexora/1_app_main.js — app root with providers + error boundary
import ErrorBoundary from "@app/0_error_boundary.js";
import AppNavigation from "@v2/app/navigation/AppNavigation.js";
import { ThemeProvider, ToastProvider, ModalProvider, AppProvider } from "@v2/providers/index.js";
import React from 'react';

export default function AppRoot() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ModalProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppNavigation />
            </ErrorBoundary>
          </ToastProvider>
        </ModalProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
