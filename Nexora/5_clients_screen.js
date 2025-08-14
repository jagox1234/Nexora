// Nexora/5_clients_screen.js — clients CRUD (offline)
import { React, useState, View } from "./2_dependencies.js";
import { useApp } from "./3_core_index.js";
import { Screen, Card, H1, H2, P, Row, Button, Input, Divider, Spacer } from "./4_ui_components.js";

export default function ClientsScreen() {
  const { clients, addClient, removeClient, bookings } = useApp();
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const filtered = clients.filter(c => {
    const s = q.toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || c.phone.includes(q);
  });

  const create = () => {
    if (!phone) return alert("Phone required");
    addClient({ name, phone });
    setName(""); setPhone("");
  };

  return (
    <Screen>
      <H1>Clients</H1>

      <Card>
        <H2>Search</H2>
        <Input placeholder="Name or phone…" value={q} onChangeText={setQ} />
      </Card>

      <Card>
        <H2>New client</H2>
        <Row gap={2}>
          <View style={{ flex: 1 }}><Input placeholder="Name" value={name} onChangeText={setName} /></View>
          <View style={{ flex: 1 }}><Input placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} /></View>
        </Row>
        <Button title="Save client" onPress={create} />
      </Card>

      {!filtered.length ? (
        <Card><P muted>No clients.</P></Card>
      ) : filtered.map(c=>{
        const count = bookings.filter(b=> b.clientId===c.id && b.status!=="cancelled").length;
        return (
          <Card key={c.id}>
            <Row justify="space-between" align="center">
              <View>
                <H2>{c.name}</H2>
                <P muted>{c.phone || "—"} · Bookings: {count}</P>
              </View>
              <View style={{ width: 120 }}>
                <Button title="Delete" variant="danger" onPress={()=>removeClient(c.id)} />
              </View>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
