// Nexora/5_explore_businesses.js — client explore with waitlist, time picker, badges & toasts
import { React, useState, View, Text, Alert } from "./2_dependencies";
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer, Divider } from "./4_ui_components";
import { useTheme } from "./4_ui_theme";
import { useToast } from "./4_ui_toast";
import { useModal } from "./4_ui_modal";
import { useApp } from "./3_core_index";
import DateTimePickerModal from "./4_ui_datetime_picker";

export default function ExploreBusinessesScreen() {
  const t = useTheme();
  const toast = useToast?.();
  const modal = useModal?.();
  const {
    // data
    businesses = [],
    clientRequests = [],
    // actions (may not exist, so guarded)
    addClientRequest,
  } = useApp();

  const [query, setQuery] = useState("");
  const [openBizId, setOpenBizId] = useState(null);

  // date/time picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingBiz, setPendingBiz] = useState(null);
  const [pendingSvc, setPendingSvc] = useState(null);

  // ---------- derived ----------
  const q = query.trim().toLowerCase();
  const filtered = safeArray(businesses).filter((b) => {
    if (!q) return true;
    return (
      (b?.name || "").toLowerCase().includes(q) ||
      (b?.city || "").toLowerCase().includes(q) ||
      (b?.category || "").toLowerCase().includes(q)
    );
  });

  const hasRequestForBusiness = (bizId) =>
    safeArray(clientRequests).some((r) => r?.businessId === bizId);

  // ---------- actions ----------
  const confirmJoinQueue = (biz, svc) => {
    if (!addClientRequest) {
      toast?.error?.("Waitlist is not available in this build");
      return;
    }
    const title = "Join waitlist";
    const message = `Do you want to join the waitlist of ${biz.name} for ${svc.name}?`;
    if (modal?.confirm) {
      modal.confirm({
        title,
        message,
        confirmText: "Join",
        onConfirm: () => doJoinQueue(biz, svc),
      });
    } else {
      Alert.alert(title, message, [
        { text: "Cancel" },
        { text: "Join", onPress: () => doJoinQueue(biz, svc) },
      ]);
    }
  };

  const doJoinQueue = (biz, svc) => {
    // Minimal client info (MVP)
    const clientName = "You";
    const clientPhone = "000";
    try {
      addClientRequest({
        id: `req_${Date.now()}`,
        businessId: biz.id,
        businessName: biz.name,
        serviceName: svc.name,
        clientName,
        clientPhone,
        whenISO: null,
        status: "queued",
      });
      toast?.success?.("Added to waitlist");
    } catch (e) {
      toast?.error?.("Could not join waitlist");
    }
  };

  const openPicker = (biz, svc) => {
    if (!addClientRequest) {
      toast?.error?.("Request time is not available in this build");
      return;
    }
    setPendingBiz(biz);
    setPendingSvc(svc);
    setPickerOpen(true);
  };

  const onConfirmTime = (iso) => {
    if (!pendingBiz || !pendingSvc) return;
    try {
      const clientName = "You";
      const clientPhone = "000";
      addClientRequest({
        id: `req_${Date.now()}`,
        businessId: pendingBiz.id,
        businessName: pendingBiz.name,
        serviceName: pendingSvc.name,
        clientName,
        clientPhone,
        whenISO: iso,
        status: "requested",
      });
      toast?.info?.("Requested time sent");
    } catch (e) {
      toast?.error?.("Could not send request");
    } finally {
      setPickerOpen(false);
      setPendingBiz(null);
      setPendingSvc(null);
    }
  };

  // ---------- render ----------
  return (
    <Screen>
      <H1>Explore</H1>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by name, city or category…"
          value={query}
          onChangeText={setQuery}
        />
      </Card>

      {!filtered.length ? (
        <Card><P muted>No businesses found.</P></Card>
      ) : null}

      {filtered.map((biz) => {
        const open = openBizId === biz.id;
        const requested = hasRequestForBusiness(biz.id);
        return (
          <Card key={biz.id}>
            <Row justify="space-between" align="center">
              <View style={{ flexShrink: 1, paddingRight: 12 }}>
                <H2 style={{ marginBottom: 4 }}>{safeText(biz.name)}</H2>
                <P muted>
                  {safeText(biz.category)} · {safeText(biz.city)}
                </P>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                {requested ? (
                  <Badge text="Requested" color={t?.color?.primary || "#7dd3fc"} />
                ) : null}
                <Spacer h={0.5} />
                <Button
                  title={open ? "Hide" : "View services"}
                  variant="outline"
                  onPress={() => setOpenBizId(open ? null : biz.id)}
                />
              </View>
            </Row>

            {/* Services */}
            {open ? (
              <>
                <Divider />
                {safeArray(biz.services).length ? (
                  safeArray(biz.services).map((svc) => (
                    <Row key={`${biz.id}_${svc.name}`} align="center" justify="space-between" style={{ marginBottom: 8 }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <P>
                          <Text style={{ fontWeight: "700" }}>{safeText(svc.name)}</Text>
                          {" · "}
                          {Number.isFinite(svc.durationMin) ? `${svc.durationMin}m` : "—"}{" · "}
                          {Number.isFinite(svc.price) ? `${svc.price}€` : "—"}
                        </P>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <View style={{ width: 140, marginRight: 8 }}>
                          <Button title="Join waitlist" variant="outline" onPress={() => confirmJoinQueue(biz, svc)} />
                        </View>
                        <View style={{ width: 120 }}>
                          <Button title="Pick time" onPress={() => openPicker(biz, svc)} />
                        </View>
                      </View>
                    </Row>
                  ))
                ) : (
                  <P muted>No services listed.</P>
                )}
              </>
            ) : null}
          </Card>
        );
      })}

      {/* Date/Time picker modal */}
      <DateTimePickerModal
        visible={pickerOpen}
        onClose={() => { setPickerOpen(false); setPendingBiz(null); setPendingSvc(null); }}
        onConfirm={onConfirmTime}
        // Puedes ajustar el rango si quieres
        // daysCount={14}
        // dayStartHour="09:00"
        // dayEndHour="20:00"
        // stepMinutes={30}
        title={`Pick time — ${safeText(pendingSvc?.name)}`}
        subtitle={safeText(pendingBiz?.name)}
      />
    </Screen>
  );
}

/* ---------- tiny helpers ---------- */
function safeArray(x) { return Array.isArray(x) ? x : []; }
function safeText(x) { return typeof x === "string" && x ? x : "—"; }

/* ---------- tiny badge ---------- */
function Badge({ text, color = "#7dd3fc" }) {
  return (
    <View
      style={{
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: `${color}20`,
      }}
    >
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>{text}</Text>
    </View>
  );
}
