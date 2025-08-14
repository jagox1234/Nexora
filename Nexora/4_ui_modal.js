// Nexora/4_ui_modal.js — simple modal system (confirm / alert) with safe theme usage
import { React, useState, createContext, useContext, View, Text, Modal, Pressable } from "./2_dependencies";
import { useTheme } from "./4_ui_theme";

const ModalCtx = createContext(null);
export const useModal = () => useContext(ModalCtx);

export function ModalProvider({ children }) {
  const t = useTheme();
  // fallback seguros (por si el theme cambia)
  const bgCard   = t?.color?.card   || "#0f1419";
  const textCol  = t?.color?.text   || "#e5eef5";
  const mutedCol = t?.color?.muted  || "#93a3af";
  const border   = t?.color?.border || "#1f2933";
  const primary  = t?.color?.primary || "#7dd3fc";

  const [state, setState] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const hide = () => setState((s) => ({ ...s, visible: false }));

  const confirm = ({
    title = "Confirm",
    message = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  } = {}) => {
    setState({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: onConfirm || null,
      onCancel: onCancel || null,
    });
  };

  const value = { confirm, hide };

  return (
    <ModalCtx.Provider value={value}>
      {children}

      <Modal
        visible={!!state.visible}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <View
            style={{
              width: "100%",
              maxWidth: 480,
              backgroundColor: bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              overflow: "hidden",
            }}
          >
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: border }}>
              <Text style={{ color: textCol, fontSize: 18, fontWeight: "700" }}>{state.title}</Text>
              {!!state.message && (
                <Text style={{ color: mutedCol, marginTop: 6 }}>{state.message}</Text>
              )}
            </View>

            <View style={{ padding: 16, flexDirection: "row", gap: 12 }}>
              <Pressable style={{ flex: 1 }} onPress={() => { state.onCancel?.(); hide(); }}>
                <View style={{
                  paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: border, borderRadius: 10
                }}>
                  <Text style={{ color: textCol, fontWeight: "600" }}>{state.cancelText}</Text>
                </View>
              </Pressable>

              <Pressable style={{ flex: 1 }} onPress={() => { state.onConfirm?.(); hide(); }}>
                <View style={{
                  paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: primary, backgroundColor: primary + "22", borderRadius: 10
                }}>
                  <Text style={{ color: textCol, fontWeight: "700" }}>{state.confirmText}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ModalCtx.Provider>
  );
}
