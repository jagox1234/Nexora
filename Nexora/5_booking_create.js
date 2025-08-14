// Nexora/5_booking_create.js — create booking with overlap validation
import { React, useState, View, Alert } from "./2_dependencies";
import { useApp } from "./3_core_index";
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer } from "./4_ui_components";

const fmtTime = (iso)=> new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

export default function BookingCreate({ navigation }) {
  const { services, createBooking, generateSlots, isOverlapping } = useApp();

  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [dateBase, setDateBase] = useState(new Date());
  const [when, setWhen] = useState("");
  const [slots, setSlots] = useState([]);

  const refresh = React.useCallback(()=> {
    setSlots(serviceId ? generateSlots(dateBase, serviceId) : []);
  }, [serviceId, dateBase, generateSlots]);

  React.useEffect(()=>{ refresh(); }, [refresh]);

  const pickDay = (days) => { const d=new Date(); d.setDate(d.getDate()+days); d.setHours(0,0,0,0); setDateBase(d); };

  const onCreate = () => {
    if (!serviceId || !clientPhone || !when) return Alert.alert("Missing", "Select service, time and phone.");
    if (isOverlapping(when, serviceId)) return Alert.alert("Overlap", "There is another booking in that time window.");
    const res = createBooking({ serviceId, clientName, clientPhone, whenISO: when });
    if (!res.ok) return Alert.alert("Error", res.error || "Could not create booking");
    Alert.alert("Created", "Booking created successfully.");
    navigation.goBack();
  };

  return (
    <Screen>
      <H1>New booking</H1>

      <Card>
        <H2>Service</H2>
        {services.map(s=>(
          <Button key={s.id} title={`${s.name} · ${s.durationMin}m`} variant={serviceId===s.id?"primary":"outline"} onPress={()=>setServiceId(s.id)} />
        ))}
      </Card>

      <Card>
        <H2>Day</H2>
        <Row gap={2}>
          <View style={{ flex:1 }}><Button title="Today" onPress={()=>pickDay(0)} /></View>
          <View style={{ flex:1 }}><Button title="Tomorrow" variant="outline" onPress={()=>pickDay(1)} /></View>
          <View style={{ flex:1 }}><Button title="+7d" variant="outline" onPress={()=>pickDay(7)} /></View>
        </Row>
        <P muted style={{ marginTop: 8 }}>Selected: {dateBase.toDateString()}</P>
      </Card>

      <Card>
        <H2>Available slots</H2>
        <Row gap={1} justify="flex-start" align="center">
          {slots.slice(0, 60).map(iso=>(
            <Button key={iso} size="sm" variant={when===iso?"primary":"outline"} title={fmtTime(iso)} onPress={()=>setWhen(iso)} />
          ))}
        </Row>
        <P muted style={{ marginTop: 8 }}>Selected time: {when? new Date(when).toLocaleString() : "—"}</P>
      </Card>

      <Card>
        <H2>Client</H2>
        <Input placeholder="Name (optional)" value={clientName} onChangeText={setClientName} />
        <Input placeholder="Phone" keyboardType="phone-pad" value={clientPhone} onChangeText={setClientPhone} />
      </Card>

      <Button title="Create booking" onPress={onCreate} />
      <Spacer h={2} />
    </Screen>
  );
}
