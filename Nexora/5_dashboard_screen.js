// Nexora/5_dashboard_screen.js — full dashboard with KPIs, quick actions, upcoming, toasts & modal
import { React, Alert } from "./2_dependencies";
import { Screen, Card, H1, H2, P, Row, Button, Spacer, Divider } from "./4_ui_components";
import { useTheme } from "./4_ui_theme";
import { useToast } from "./4_ui_toast";
import { useModal } from "./4_ui_modal";
import { useApp } from "./3_core_index";

export default function DashboardScreen({ navigation }) {
  const t = useTheme();
  const toast = useToast?.();
  const modal = useModal?.();

  const {
    role,
    clinic,
    services = [],
    bookings = [],
    clientRequests = [],
    addService,
    createBooking,
    confirmBooking,
    cancelBooking,
  } = useApp();

  // ---- Derivatives (safe) ----
  const now = new Date();
  const todayStr = new Date().toDateString();

  const todays = safeArray(bookings).filter((b) => {
    try { return new Date(b?.startsAt).toDateString() === todayStr; } catch { return false; }
  });

  const counts = {
    today: todays.length,
    confirmedToday: todays.filter((b) => b?.status === "confirmed").length,
    pendingToday: todays.filter((b) => b?.status === "pending").length,
    cancelledToday: todays.filter((b) => b?.status === "cancelled").length,
    services: safeArray(services).filter((s) => s?.active !== false).length,
    requests: safeArray(clientRequests).length,
  };

  const nextUp = safeArray(bookings)
    .filter((b) => {
      try { return new Date(b?.startsAt).getTime() >= now.getTime(); } catch { return false; }
    })
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 5);

  // ---- Navigation helper ----
  const go = (name) => {
    try { navigation?.navigate?.(name); } catch {}
  };

  // ---- Quick actions (safe, demo) ----
  const quickAddService = async () => {
    const id = Date.now() % 1000;
    await addService?.({
      name: `Service #${id}`,
      price: 50 + (id % 50),
      durationMin: 30 + (id % 30),
      active: true,
    });
    toast?.success?.("Sample service added");
  };

  const quickCreateBooking = () => {
    if (!services?.length) {
      toast?.error?.("Add a service first");
      return;
    }
    const serviceId = services[0]?.id || "srv_demo";
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const res = createBooking?.({
      serviceId,
      clientName: "Walk-in",
      clientPhone: "000",
      whenISO: d.toISOString(),
    });
    if (res?.ok) {
      toast?.success?.("Demo booking +60min created");
    } else {
      toast?.error?.(res?.error || "Could not create booking");
    }
  };

  const confirmFirstPending = () => {
    const pending = safeArray(bookings).find((b) => b?.status === "pending");
    if (!pending) { toast?.info?.("No pending bookings"); return; }
    confirmBooking?.(pending.id);
    toast?.success?.("First pending confirmed");
  };

  const cancelFirstToday = () => {
    const anyToday = todays[0];
    if (!anyToday) { toast?.info?.("No bookings today"); return; }
    if (modal?.confirm) {
      modal.confirm({
        title: "Cancel booking",
        message: `Cancel ${findServiceName(services, anyToday?.serviceId)} at ${fmtTime(anyToday?.startsAt)}?`,
        confirmText: "Cancel",
        onConfirm: () => { cancelBooking?.(anyToday.id); toast?.info?.("Booking cancelled"); },
      });
    } else {
      const ok = true;
      if (ok) { cancelBooking?.(anyToday.id); toast?.info?.("Booking cancelled"); }
    }
  };

  return (
    <Screen>
      <H1>Dashboard</H1>

      {/* Header / Role context */}
      <Card>
        <H2>{role === "business" ? "Overview" : "Welcome"}</H2>
        {role === "business" ? (
          <>
            <P>
              {clinic?.name || "Your business"} ·{" "}
              <P muted style={{ fontWeight: "700" }}>{clinic?.timezone || "Timezone not set"}</P>
            </P>
            <Spacer h={1} />
            <Row gap={2}>
              <Button title="Agenda" variant="outline" onPress={() => go("agenda")} />
              <Button title="Services" variant="outline" onPress={() => go("services")} />
              <Button title="Clients" variant="outline" onPress={() => go("clients")} />
              <Button title="Inbox" variant="outline" onPress={() => go("inbox")} />
            </Row>
          </>
        ) : (
          <>
            <P muted>Explore businesses, join a waitlist or request a time.</P>
            <Spacer h={1} />
            <Row gap={2}>
              <Button title="Explore" onPress={() => go("explore")} />
              <Button title="My bookings" variant="outline" onPress={() => go("my")} />
              <Button title="Settings" variant="outline" onPress={() => go("settings")} />
            </Row>
          </>
        )}
      </Card>

      {/* KPIs */}
      <Card>
        <H2>Today</H2>
        <Row gap={2}>
          <StatBox label="Bookings" value={counts.today} />
          <StatBox label="Confirmed" value={counts.confirmedToday} />
          <StatBox label="Pending" value={counts.pendingToday} />
          <StatBox label="Cancelled" value={counts.cancelledToday} />
        </Row>
        <Spacer h={1} />
        <Row gap={2}>
          <StatBox label="Active services" value={counts.services} />
          <StatBox label="Requests (inbox)" value={counts.requests} />
        </Row>
      </Card>

      {/* Quick actions (business only) */}
      {role === "business" ? (
        <Card>
          <H2>Quick actions</H2>
          <Row gap={2}>
            <Button title="Add sample service" variant="outline" onPress={quickAddService} />
            <Button title="Create booking +60min" onPress={quickCreateBooking} />
          </Row>
          <Spacer h={1} />
          <Row gap={2}>
            <Button title="Confirm first pending" variant="outline" onPress={confirmFirstPending} />
            <Button title="Cancel first today" variant="danger" onPress={cancelFirstToday} />
          </Row>
        </Card>
      ) : null}

      {/* Upcoming */}
      <Card>
        <H2>Upcoming</H2>
        {!nextUp.length ? (
          <P muted>No upcoming bookings.</P>
        ) : (
          nextUp.map((b) => (
            <P key={b.id}>
              • {fmtTime(b?.startsAt)} — {findServiceName(services, b?.serviceId)} {b?.status ? `(${b.status})` : ""}
            </P>
          ))
        )}
      </Card>

      {/* Tips */}
      <Card>
        <H2>Tips</H2>
        <P muted>
          {role === "business"
            ? "Use Inbox to convert client requests into bookings, and keep Services updated."
            : "Use Pick time for a specific slot or join waitlist to be called sooner."}
        </P>
      </Card>
    </Screen>
  );
}

/* ---------- helpers ---------- */
function safeArray(x) { return Array.isArray(x) ? x : []; }
function fmtTime(iso) {
  try { return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); }
  catch { return "—"; }
}
function findServiceName(services, id) {
  const arr = safeArray(services);
  const found = arr.find((s) => s?.id === id);
  return found?.name || "Service";
}

/* ---------- tiny stat box ---------- */
function StatBox({ label, value }) {
  return (
    <Card
      style={{
        flex: 1,
        paddingTop: 14,
        paddingBottom: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <H2 style={{ marginBottom: 4 }}>{String(value ?? "—")}</H2>
      <P muted>{label}</P>
    </Card>
  );
}
