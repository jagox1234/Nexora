// Nexora/5_services_screen.js — clean services list
import { useState, Text, View } from "./2_dependencies";
import { useApp } from "./3_core_index";
import { Screen, Card, H1, H2, P, Input, Button, Row, Divider, EmptyState, Spacer } from "./4_ui_components";
import UIHeader from "./4_ui_header";

export default function ServicesScreen() {
  const { services, addService, removeService } = useApp();
  const [query, setQuery] = useState("");
  const [name, setName] = useState(""), [price, setPrice] = useState(""), [duration, setDuration] = useState("");

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const onSave = () => {
    if (!name || !price || !duration) return alert("Please fill all fields");
    addService({ name, price:Number(price), durationMin:Number(duration), active:true });
    setName(""); setPrice(""); setDuration("");
  };

  return (
    <Screen>
      <UIHeader title="Services" subtitle="Manage offerings" rightActions={[]} />
      <Input placeholder="Search service…" value={query} onChangeText={setQuery} />

      <Card>
        <H2>New service</H2>
        <Row gap={2}>
          <View style={{ flex: 2 }}><Input placeholder="Name" value={name} onChangeText={setName} /></View>
          <View style={{ flex: 1 }}><Input placeholder="Price (€)" keyboardType="numeric" value={price} onChangeText={setPrice} /></View>
          <View style={{ flex: 1 }}><Input placeholder="Duration (min)" keyboardType="numeric" value={duration} onChangeText={setDuration} /></View>
        </Row>
        <Button title="Save service" onPress={onSave} />
      </Card>

      {!filtered.length ? (
        <EmptyState title="No services" subtitle="Try another search or create a new one." />
      ) : (
        filtered.map(s => (
          <Card key={s.id}>
            <Row justify="space-between" align="center">
              <View>
                <H2>{s.name}</H2>
                <P muted>{s.durationMin} min · {s.price} €</P>
              </View>
              <Button title="Delete" variant="danger" onPress={()=>removeService(s.id)} />
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
