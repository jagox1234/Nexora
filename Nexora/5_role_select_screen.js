// Nexora/5_role_select_screen.js — pick role (client or business)
import { React, View } from "./2_dependencies.js";
import { useApp } from "./3_core_index.js";
import { useTheme } from "./4_ui_theme.js";
import { Screen, Card, H1, H2, P, Row, Button, Spacer } from "./4_ui_components.js";

export default function RoleSelectScreen() {
  const { pickRole } = useApp();
  const t = useTheme();

  return (
    <Screen>
      <H1>Welcome to Nexora</H1>
      <P muted>Choose how you want to use the app.</P>
      <Spacer h={2} />

      <Card>
        <H2>Client</H2>
        <P muted>Find businesses, join a waitlist or request a time.</P>
        <Spacer h={1} />
        <Button title="Continue as Client" onPress={() => pickRole("client")} />
      </Card>

      <Card>
        <H2>Business</H2>
        <P muted>Manage services, agenda, clients and inbox.</P>
        <Spacer h={1} />
        <Button title="Continue as Business" onPress={() => pickRole("business")} />
      </Card>
    </Screen>
  );
}
