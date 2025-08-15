// NotificationsCenterScreen — internal notifications hub placeholder
import { Screen, Card, H1, P, SectionTitle, ListItem, Badge } from '@ui/index.js';
import { React, useState, useEffect } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';

export default function NotificationsCenterScreen(){
  const [items,setItems] = useState([]);
  useEffect(()=>{
    // seed sample
    setItems([
      { id:'n1', type:'booking', title:'New booking created', ts: Date.now()-60000 },
      { id:'n2', type:'request', title:'Pending request aging 2h', ts: Date.now()-120000 },
    ]);
  },[]);
  const typeColor = (tpe) => tpe==='booking'? 'success': tpe==='request'? 'warning':'info';
  return (
    <Screen gradient scroll>
      <H1>{t('notifications_center')}</H1>
      <Card>
        <SectionTitle>Inbox</SectionTitle>
        {items.map(n => (
          <ListItem key={n.id}
            title={n.title}
            subtitle={new Date(n.ts).toLocaleTimeString()}
            right={<Badge label={n.type} variant={typeColor(n.type)} />}
          />
        ))}
        {!items.length && <P muted>No notifications</P>}
      </Card>
    </Screen>
  );
}
