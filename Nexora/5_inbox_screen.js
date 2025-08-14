// Nexora/5_inbox_screen.js — unified inbox for Client & Business (with toasts)
import { React, View, Text, Alert } from "./2_dependencies.js";
import { useApp } from "./3_core_index.js";
import { useToast } from "./4_ui_toast.js";
import { Screen, Card, H1, H2, P, Row, Button, Spacer, Divider } from "./4_ui_components.js";

const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function InboxScreen() {
  const {
    role,
    clinic,
    services,
    clientRequests = [],
    removeClientRequest,
    createBooking,
    generateSlots,
    isOverlapping,
  } = useApp();

  const toast = useToast?.();

  const matchServiceId = (serviceName) => {
    const byName = services.find((s) => s.name.toLowerCase() === (serviceName || "").toLowerCase());
    return (byName || services[0])?.id || null;
  };

  const bookAtRequested = (req) => {
    const serviceId = matchServiceId(req.serviceName);
    if (!serviceId) return Alert.alert("No services", "Add a local service first in Services.");
    if (!req.whenISO) return Alert.alert("No time", "This request has no preferred time.");
    if (isOverlapping(req.whenISO, serviceId)) return Alert.alert("Overlap", "There is another booking in that window.");

    const res = createBooking({
      serviceId,
      clientName: req.clientName || "Client",
      clientPhone: req.clientPhone || "",
      whenISO: req.whenISO,
    });
    if (res.ok) {
      removeClientRequest(req.id);
      toast?.success?.("Booking created");
    } else {
      toast?.error?.(res.error || "Could not create booking");
    }
  };

  const bookNextSlotToday = (req) => {
    const serviceId = matchServiceId(req.serviceName);
    if (!serviceId) return Alert.alert("No services", "Add a local service first in Services.");

    const today = new Date();
    const slots = generateSlots(today, serviceId)
      .map((iso) => new Date(iso))
      .filter((d) => d.getTime() > Date.now());

    let chosen = null;
    for (const d of slots) {
      const iso = d.toISOString();
      if (!isOverlapping(iso, serviceId)) { chosen = iso; break; }
    }
    if (!chosen) {
      const d = new Date(); d.setDate(d.getDate()+1); d.setHours(10,0,0,0);
      const iso = d.toISOString();
      if (isOverlapping(iso, serviceId)) return Alert.alert("No slot", "No free slot found today or tomorrow 10:00.");
      chosen = iso;
    }

    const res = createBooking({
      serviceId,
      clientName: req.clientName || "Client",
      clientPhone: req.clientPhone || "",
      whenISO: chosen,
    });
    if (res.ok) {
      removeClientRequest(req.id);
      toast?.success?.(`Booked for ${fmt(chosen)}`);
    } else {
      toast?.error?.(res.error || "Could not create booking");
    }
  };

  if (role === "business") {
    return (
      <Screen>
        <H1>Inbox (Business)</H1>
        <Card>
          <H2>Incoming requests</H2>
          <P muted>Convert client requests into bookings of <Text style={{ fontWeight: "700" }}>{clinic?.name || "your clinic"}</Text>.</P>
        </Card>

        {!clientRequests.length ? (
          <Card><P muted>No requests yet.</P></Card>
        ) : clientRequests.map((r) => (
          <Card key={r.id}>
            <Row justify="space-between" align="center">
              <View style={{ flex: 1, paddingRight: 12 }}>
                <P><Text style={{ fontWeight: "700" }}>{r.clientName || "Client"}</Text> · {r.clientPhone || "—"}</P>
                <P>Service: <Text style={{ fontWeight: "700" }}>{r.serviceName || "—"}</Text></P>
                <P muted>Business: {r.businessName || "—"} · Status: {r.status}</P>
                {r.whenISO ? <P muted>Requested: {fmt(r.whenISO)}</P> : null}
              </View>
              <View style={{ width: 180 }}>
                {r.whenISO ? (
                  <Button title="Book at requested" onPress={() => bookAtRequested(r)} />
                ) : (
                  <Button title="Book next slot" onPress={() => bookNextSlotToday(r)} />
                )}
                <Button title="Remove" variant="danger" onPress={() => { removeClientRequest(r.id); toast?.info?.("Request removed"); }} />
              </View>
            </Row>
          </Card>
        ))}
      </Screen>
    );
  }

  // client view
  const queued = clientRequests.filter((r) => r.status === "queued");
  const requested = clientRequests.filter((r) => r.status === "requested");

  return (
    <Screen>
      <H1>Inbox (Client)</H1>

      <Card>
        <H2>Requested time</H2>
        {!requested.length ? (
          <P muted>None.</P>
        ) : requested.map((r) => (
          <View key={r.id} style={{ marginBottom: 10 }}>
            <P><Text style={{ fontWeight: "700" }}>{r.businessName}</Text> — {r.serviceName}</P>
            <P muted>{r.whenISO ? fmt(r.whenISO) : "—"}</P>
            <Row gap={2}>
              <View style={{ width: 120 }}>
                <Button title="Cancel" variant="danger" onPress={() => { removeClientRequest(r.id); toast?.info?.("Request cancelled"); }} />
              </View>
            </Row>
            <Divider />
          </View>
        ))}
      </Card>

      <Card>
        <H2>Queue</H2>
        {!queued.length ? (
          <P muted>None.</P>
        ) : queued.map((r) => (
          <View key={r.id} style={{ marginBottom: 10 }}>
            <P><Text style={{ fontWeight: "700" }}>{r.businessName}</Text> — {r.serviceName}</P>
            <P muted>Status: in queue</P>
            <Row gap={2}>
              <View style={{ width: 120 }}>
                <Button title="Remove" variant="danger" onPress={() => { removeClientRequest(r.id); toast?.info?.("Removed from queue"); }} />
              </View>
            </Row>
            <Divider />
          </View>
        ))}
      </Card>
      <Spacer h={2} />
    </Screen>
  );
}
