// BillingInvoicesScreen — billing & invoices placeholder
import { Screen, Card, H1, P, SectionTitle, ListItem, Button, Row } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';

export default function BillingInvoicesScreen(){
  const [plan,setPlan] = useState('free');
  const invoices = [];
  return (
    <Screen gradient scroll>
      <H1>{t('billing_invoices')}</H1>
      <Card>
        <SectionTitle>Plan</SectionTitle>
        <P>Current: {plan}</P>
        <Row gap={1}>
          <Button title='Upgrade' onPress={()=> setPlan('pro')} />
          {plan!=='free' && <Button variant='outline' title='Downgrade' onPress={()=> setPlan('free')} />}
        </Row>
        <P muted size='sm'>Later: usage metrics, proration, Stripe portal.</P>
      </Card>
      <Card>
        <SectionTitle>Invoices</SectionTitle>
        {!invoices.length && <P muted>No invoices</P>}
      </Card>
    </Screen>
  );
}
