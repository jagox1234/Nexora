// CalendarSyncScreen — external calendar integration placeholder
import { Screen, Card, H1, P, Button, SectionTitle, Row } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';

export default function CalendarSyncScreen(){
  const [connected,setConnected] = useState(false);
  return (
    <Screen gradient scroll>
      <H1>{t('calendar_sync')}</H1>
      <Card>
        <SectionTitle>Google Calendar</SectionTitle>
        <Row gap={1}>
          <Button title={connected? 'Disconnect':'Connect'} onPress={()=> setConnected(c=> !c)} />
          {connected && <Button variant='outline' title='Sync now' onPress={()=> console.log('sync start')} />}
        </Row>
        <P muted size='sm'>Later: OAuth flow, selective service mapping, incremental sync.</P>
      </Card>
    </Screen>
  );
}
