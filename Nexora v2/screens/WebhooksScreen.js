// WebhooksScreen — external integrations placeholder
import { Screen, Card, H1, P, SectionTitle, Button, ListItem } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';

export default function WebhooksScreen(){
  const [hooks,setHooks] = useState([
    { id:'wh1', url:'https://example.com/hook', event:'booking_created' },
    { id:'wh2', url:'https://erp.com/hook', event:'invoice_paid' },
  ]);
  return (
    <Screen gradient scroll>
      <H1>{t('webhooks')}</H1>
      <Card>
        <SectionTitle>Configured webhooks</SectionTitle>
        {hooks.map(h => (
          <ListItem key={h.id} title={h.event} subtitle={h.url} right={<Button size='xs' variant='danger' title='Del' onPress={()=> setHooks(hs=> hs.filter(x=>x.id!==h.id))} />} />
        ))}
        <Button title='Add webhook' onPress={()=> setHooks(hs=> [...hs,{ id:'wh'+Date.now(), url:'https://new.com/hook', event:'custom_event' }])} />
        <P muted size='sm'>Later: event selection, secret, retry policy, logs.</P>
      </Card>
    </Screen>
  );
}
