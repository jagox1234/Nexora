// Nexora/5_my_bookings_screen.js — client: my requests (queue & requested) with toasts
import { View, Text, Alert } from "./2_dependencies";
import { useApp } from "./3_core_index";
import { useToast } from "./4_ui_toast";
import { Screen, Card, H1, H2, P, Row, Button, Divider } from "./4_ui_components";

export default function MyBookingsScreen() {
  const { clientRequests, removeClientRequest } = useApp();
  const toast = useToast?.();

  const queued = clientRequests.filter((r) => r.status === "queued");
  const requested = clientRequests.filter((r) => r.status === "requested");

  const confirmRemove = (id) => {
    Alert.alert("Cancel", "Do you want to remove this request?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: () => {
          removeClientRequest(id);
          toast?.info?.("Request removed");
        },
      },
    ]);
  };

  return (
    <Screen>
      <H1>My bookings</H1>

      <Card>
        <H2>Requested time</H2>
        {!requested.length ? (
          <P muted>None.</P>
        ) : (
          requested.map((r) => (
            <View key={r.id} style={{ marginBottom: 10 }}>
              <P>
                <Text style={{ fontWeight: "700" }}>{r.businessName}</Text> — {r.serviceName}
              </P>
              <P muted>{r.whenISO ? new Date(r.whenISO).toLocaleString() : "—"}</P>
              <Row gap={2}>
                <View style={{ width: 120 }}>
                  <Button title="Cancel" variant="danger" onPress={() => confirmRemove(r.id)} />
                </View>
              </Row>
              <Divider />
            </View>
          ))
        )}
      </Card>

      <Card>
        <H2>Queue</H2>
        {!queued.length ? (
          <P muted>None.</P>
        ) : (
          queued.map((r) => (
            <View key={r.id} style={{ marginBottom: 10 }}>
              <P>
                <Text style={{ fontWeight: "700" }}>{r.businessName}</Text> — {r.serviceName}
              </P>
              <P muted>Status: in queue</P>
              <Row gap={2}>
                <View style={{ width: 120 }}>
                  <Button title="Remove" variant="danger" onPress={() => confirmRemove(r.id)} />
                </View>
              </Row>
              <Divider />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
