// RequestsScreen — advanced client requests management
import { Screen, Card, H1, P, Button, ListItem, Row, SectionTitle, EmptyState, Input } from '@ui/index.js';
import { React } from '@v2/app/baseDependencies.js';
import { useApp } from '@v2/core/index.js';

export default function RequestsScreen() {
  const { requestsAdvanced, updateRequestStatus, removeAdvancedRequest, createBooking, services } = useApp();
  return (
    <Screen gradient scroll>
      <H1>Requests</H1>
      <Card>
        <SectionTitle>Incoming</SectionTitle>
        {!requestsAdvanced.length && <EmptyState title='No requests yet' />}
        {requestsAdvanced.map(r => {
          const srv = services.find(s=> s.id===r.serviceId || s.name===r.serviceName);
          return (
            <ListItem key={r.id}
              title={`${r.clientName || 'Client'} · ${(srv?.name)|| r.serviceName || 'Service'}`}
              subtitle={`${r.status} · ${r.whenISO ? new Date(r.whenISO).toLocaleString(): '—'}`}
              right={<Row gap={1}>
                {r.status!=='confirmed' && <Button size='sm' variant='outline' title='Confirm' onPress={()=> updateRequestStatus(r.id,'confirmed')} />}
                {srv && r.whenISO && <Button size='sm' variant='primary' title='Book' onPress={()=> {
                  const res = createBooking({ serviceId: srv.id, clientName: r.clientName||'Client', clientPhone: r.clientPhone||'', whenISO: r.whenISO });
                  if(res.ok) updateRequestStatus(r.id,'converted');
                }} />}
                <Button size='sm' variant='danger' title='Del' onPress={()=> removeAdvancedRequest(r.id)} />
              </Row>}
            />
          );
        })}
      </Card>
    </Screen>
  );
}
