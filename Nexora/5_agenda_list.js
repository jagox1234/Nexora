// Nexora/5_agenda_list.js — agenda with day/filters
import { React, useState, View, Text } from "./2_dependencies.js"; // <-- añade Text
import { useApp } from "./3_core_index.js";
import { Screen, Card, H1, H2, P, Row, Button, Input, Divider, Spacer } from "./4_ui_components.js";

const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" });
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function AgendaList({ navigation }) {
  const { getBookingsByDate, services, getClient, getService, confirmBooking, cancelBooking } = useApp();
  const [base, setBase] = useState(new Date());
  const [serviceFilter, setServiceFilter] = useState("");
  const [clientQuery, setClientQuery] = useState("");

  const dayList = [...Array(7)].map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const matchesClient = (b) => {
    if (!clientQuery) return true;
    const c = getClient(b.clientId);
    const q = clientQuery.toLowerCase();
    return c?.name?.toLowerCase().includes(q) || c?.phone?.includes(q);
  };

  const matchesService = (b) => {
    if (!serviceFilter) return true;
    return b.serviceId === serviceFilter;
  };

  return (
    <Screen>
      <H1>Agenda</H1>

      <Card>
        <H2>Filters</H2>
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Search client…" value={clientQuery} onChangeText={setClientQuery} />
          </View>
        </Row>
        <Row gap={2}>
          {services.map((s) => (
            <View key={s.id} style={{ flex: 1 }}>
              <Button
                title={s.name}
                variant={serviceFilter === s.id ? "primary" : "outline"}
                size="sm"
                onPress={() => setServiceFilter((p) => (p === s.id ? "" : s.id))}
              />
            </View>
          ))}
        </Row>
      </Card>

      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button
            title="Today"
            onPress={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setBase(d);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="+7 days"
            variant="outline"
            onPress={() => {
              const d = new Date(base);
              d.setDate(d.getDate() + 7);
              setBase(d);
            }}
          />
        </View>
      </Row>

      <Spacer h={1} />
      {dayList.map((d) => {
        const list = getBookingsByDate(d).filter((b) => matchesService(b) && matchesClient(b));
        return (
          <Card key={d.toISOString()}>
            <H2>{fmtDate(d)}</H2>
            {!list.length ? (
              <P muted>No bookings.</P>
            ) : (
              list.map((b) => {
                const s = getService(b.serviceId);
                const c = getClient(b.clientId);
                return (
                  <View key={b.id} style={{ marginBottom: 8 }}>
                    <Row justify="space-between" align="center">
                      <View style={{ flex: 1 }}>
                        <P>
                          <Text style={{ fontWeight: "700" }}>{s?.name || "Service"}</Text> · {fmtTime(b.startsAt)}
                        </P>
                        <P muted>
                          {c?.name || "Client"} · {c?.phone || "—"}
                        </P>
                        <P muted>Status: {b.status}</P>
                      </View>
                      <View style={{ width: 160 }}>
                        <Button title="Confirm" onPress={() => confirmBooking(b.id)} />
                        <Button title="Cancel" variant="danger" onPress={() => cancelBooking(b.id)} />
                      </View>
                    </Row>
                    <Divider />
                  </View>
                );
              })
            )}
          </Card>
        );
      })}

      <Button title="New bookinaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag" onPress={() => navigation.navigate("booking_create")} />
    </Screen>
  );
}
