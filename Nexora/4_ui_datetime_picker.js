// Nexora/4_ui_datetime_picker.js — simple date/time picker modal (web/android/ios friendly)
import { React, useState, View, Text, Modal, Pressable, ScrollView } from "./2_dependencies.js";
import { useTheme } from "./4_ui_theme.js";
import { Button, Spacer } from "./4_ui_components.js";

// Helpers
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0,0,0,0); return x; };
const fmtDay = (d) => d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" });
const makeRangeTimes = (start="09:00", end="20:00", stepMin=30) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const out = [];
  let t = new Date(); t.setHours(sh, sm, 0, 0);
  const endT = new Date(); endT.setHours(eh, em, 0, 0);
  while (t <= endT) {
    out.push(t.toTimeString().slice(0,5)); // "HH:MM"
    t = new Date(t.getTime() + stepMin * 60 * 1000);
  }
  return out;
};

export default function DateTimePickerModal({
  visible,
  onClose,
  onConfirm,                // (isoString)=>void
  daysCount = 14,          // días hacia adelante
  dayStartHour = "09:00",
  dayEndHour = "20:00",
  stepMinutes = 30,
  initialDate = null,      // opcional Date
  title = "Pick date & time",
  subtitle = "Choose a day and a time slot",
}) {
  const t = useTheme();
  const today = new Date(); today.setHours(0,0,0,0);

  const [day, setDay] = useState(initialDate ? new Date(initialDate) : today);
  const [time, setTime] = useState(null);

  const days = [...Array(daysCount)].map((_, i) => addDays(today, i));
  const times = makeRangeTimes(dayStartHour, dayEndHour, stepMinutes);

  const confirm = () => {
    if (!day || !time) return;
    const [hh, mm] = time.split(":").map(Number);
    const x = new Date(day);
    x.setHours(hh, mm, 0, 0);
    onConfirm?.(x.toISOString());
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex:1, backgroundColor:"rgba(0,0,0,0.45)", alignItems:"center", justifyContent:"center", padding:16
      }}>
        <View style={{
          width:"100%", maxWidth:480, borderRadius:16, overflow:"hidden",
          backgroundColor: t.color?.card || "#0f1419", borderWidth:1, borderColor: t.color?.border || "#1f2933"
        }}>
          <View style={{ padding:16, borderBottomWidth:1, borderBottomColor: t.color?.border || "#1f2933" }}>
            <Text style={{ color:t.color?.text || "white", fontSize:18, fontWeight:"700" }}>{title}</Text>
            <Text style={{ color:t.color?.muted || "#93a3af", marginTop:4 }}>{subtitle}</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding:16 }}>
            {/* Days */}
            <Text style={{ color:t.color?.muted, marginBottom:8 }}>Day</Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
              {days.map((d) => {
                const sel = d.toDateString() === day.toDateString();
                return (
                  <Pressable key={d.toISOString()} onPress={()=>{ setDay(d); setTime(null); }}>
                    <View style={{
                      paddingVertical:10, paddingHorizontal:12, borderRadius:10,
                      borderWidth:1, borderColor: sel ? (t.color?.primary || "#7dd3fc") : (t.color?.border || "#1f2933"),
                      backgroundColor: sel ? (t.color?.primary_alt || "#38bdf8") + "20" : "transparent"
                    }}>
                      <Text style={{ color: t.color?.text }}>{fmtDay(d)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Spacer h={1} />
            {/* Times */}
            <Text style={{ color:t.color?.muted, marginBottom:8 }}>Time</Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
              {times.map((tt) => {
                const sel = tt === time;
                return (
                  <Pressable key={tt} onPress={()=>setTime(tt)}>
                    <View style={{
                      paddingVertical:10, paddingHorizontal:12, borderRadius:10,
                      borderWidth:1, borderColor: sel ? (t.color?.primary || "#7dd3fc") : (t.color?.border || "#1f2933"),
                      backgroundColor: sel ? (t.color?.primary_alt || "#38bdf8") + "20" : "transparent"
                    }}>
                      <Text style={{ color: t.color?.text }}>{tt}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ padding:16, borderTopWidth:1, borderTopColor: t.color?.border || "#1f2933", flexDirection:"row", gap:12 }}>
            <View style={{ flex:1 }}>
              <Button title="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex:1 }}>
              <Button title="Confirm" onPress={confirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
