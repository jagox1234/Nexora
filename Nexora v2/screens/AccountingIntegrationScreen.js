// AccountingIntegrationScreen — basic accounting integration placeholder
import { Screen, Card, H1, P, SectionTitle, Button } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';

export default function AccountingIntegrationScreen(){
  const [connected,setConnected] = useState(false);
  return (
    <Screen gradient scroll>
      <H1>{t('accounting_integration')}</H1>
      <Card>
        <SectionTitle>Connect to accounting provider</SectionTitle>
        <Button title={connected? 'Disconnect':'Connect'} onPress={()=> setConnected(c=> !c)} />
        <P muted size='sm'>Later: provider selection, sync invoices, export to CSV/XLS.</P>
      </Card>
    </Screen>
  );
}
