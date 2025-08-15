// AvailabilityScreen — manage availability blocks per staff
import { Screen, Card, H1, P, Input, Button, ListItem, Row, SectionTitle, EmptyState, Select } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { useApp } from '@v2/core/index.js';

export default function AvailabilityScreen() {
  const { staff, availability, addAvailability, removeAvailability, hasRole, currentBusinessId } = useApp();
  const [staffId,setStaffId] = useState(staff[0]?.id||'');
  const [date,setDate] = useState(new Date());
  const [ranges,setRanges] = useState('09:00-13:00,15:00-18:00');
  if(!hasRole('business')) return (
    <Screen gradient scroll>
      <H1>Availability</H1>
      <Card><P muted>Access restricted (business role required).</P></Card>
    </Screen>
  );
  const staffFiltered = staff.filter(s => !currentBusinessId || s.businessId===currentBusinessId || s.businessId==null);
  const create = () => { if(!staffId || !ranges) return; const list = ranges.split(',').map(r=>r.trim()).filter(Boolean); addAvailability({ staffId, date:date.toISOString(), ranges:list }); };
  return (
    <Screen gradient scroll>
      <H1>Availability</H1>
      <Card>
        <SectionTitle>New Block</SectionTitle>
        <Row gap={2}>
          <Select value={staffId} onChange={setStaffId} options={staffFiltered.map(s=>({ label:s.name, value:s.id }))} />
          <Input placeholder='Ranges (comma separated)' value={ranges} onChangeText={setRanges} />
          <Button title='Add' onPress={create} />
        </Row>
        <P muted>Date: {date.toDateString()}</P>
      </Card>
      <Card>
        <SectionTitle>List</SectionTitle>
  {!(availability.filter(a => !currentBusinessId || a.businessId===currentBusinessId || a.businessId==null).length) && <EmptyState title='No availability set' />}
  {availability.filter(a => !currentBusinessId || a.businessId===currentBusinessId || a.businessId==null).map(a => (
          <ListItem key={a.id}
            title={`${a.ranges.join(' · ')}`}
            subtitle={new Date(a.date).toDateString()}
            right={<Button size='sm' variant='danger' title='Delete' onPress={()=> removeAvailability(a.id)} />}
          />
        ))}
      </Card>
    </Screen>
  );
}
