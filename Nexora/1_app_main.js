// Nexora/1_app_main.js — app root with providers + error boundary
import ErrorBoundary from "./0_error_boundary.js";
import { AppProvider } from "./3_core_index.js";
import AppNavigation from "./1_app_navigation.js";
import { ToastProvider } from "./4_ui_toast.js";
import { ModalProvider } from "./4_ui_modal.js";
import { ThemeProvider } from "./4_ui_theme.js";

export default function App() {
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
