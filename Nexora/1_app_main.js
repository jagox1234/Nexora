// Nexora/1_app_main.js — app root with providers + error boundary
import ErrorBoundary from "./0_error_boundary";
import { AppProvider } from "./3_core_index";
import AppNavigation from "./1_app_navigation";
import { ToastProvider } from "./4_ui_toast";
import { ModalProvider } from "./4_ui_modal";
import { ThemeProvider } from "./4_ui_theme";

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
