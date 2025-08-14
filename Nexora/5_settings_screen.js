// Nexora/5_settings_screen.js — settings + role switch + theme toggle
import { React, View, Alert } from "./2_dependencies";
import { useApp } from "./3_core_index";
import { useTheme } from "./4_ui_theme";
import { Screen, Card, H1, H2, P, Row, Button, Input, Spacer } from "./4_ui_components";

export default function SettingsScreen() {
  const { role, pickRole, clearRole, clinic, setClinic } = useApp();
  const theme = useTheme();

  // local inputs for business info
  const [name, setName] = React.useState(clinic?.name || "");
  const [timezone, setTimezone] = React.useState(clinic?.timezone || "");
  React.useEffect(() => {
    setName(clinic?.name || "");
    setTimezone(clinic?.timezone || "");
  }, [clinic?.name, clinic?.timezone]);

  const saveClinic = () => {
    setClinic((c) => ({
      ...c,
      name: name?.trim() || c.name,
      timezone: timezone?.trim() || c.timezone,
    }));
    Alert.alert("Saved", "Business info updated.");
  };

  const switchTo = (next) => {
    if (role === next) return;
    pickRole(next);
    Alert.alert("Role changed", `Now you are in ${next === "business" ? "Business" : "Client"} mode.`);
  };

  return (
    <Screen>
      <H1>Settings</H1>

      {/* THEME */}
      <Card>
        <H2>Appearance</H2>
        <P muted>Current: {theme.mode}</P>
        <Spacer h={1} />
        <Button
          title={theme.mode === "dark" ? "Switch to Light" : "Switch to Dark"}
          onPress={theme.toggleMode}
        />
      </Card>

      {/* ROLE SWITCH */}
      <Card>
        <H2>Role</H2>
        <P muted>Current role: {role ? role : "not selected"}</P>
        <Spacer h={1} />
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button
              title={role === "business" ? "Business (active)" : "Switch to Business"}
              variant={role === "business" ? "primary" : "outline"}
              onPress={() => switchTo("business")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={role === "client" ? "Client (active)" : "Switch to Client"}
              variant={role === "client" ? "primary" : "outline"}
              onPress={() => switchTo("client")}
            />
          </View>
        </Row>
        <Spacer h={1} />
        <Button title="Reset role (ask again)" variant="ghost" onPress={clearRole} />
      </Card>

      {/* BUSINESS INFO (only in business mode) */}
      {role === "business" ? (
        <Card>
          <H2>Business info</H2>
          <Input placeholder="Business name" value={name} onChangeText={setName} />
          <Input placeholder="Timezone (e.g. Europe/Madrid)" value={timezone} onChangeText={setTimezone} />
          <Button title="Save" onPress={saveClinic} />
        </Card>
      ) : null}

      {role === "client" ? (
        <Card>
          <H2>Client mode</H2>
          <P muted>Use Explore to find businesses and join waitlists or request times.</P>
        </Card>
      ) : null}
    </Screen>
  );
}
