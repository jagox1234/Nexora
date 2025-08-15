// BusinessManageScreen — manage multiple businesses scaffold
import { Screen, Card, H1, P, Input, Button, ListItem, Row, SectionTitle, EmptyState } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { useApp } from '@v2/core/index.js';

export default function BusinessManageScreen() {
  const { businessesAdvanced, addBusiness, updateBusiness, removeBusiness, hasRole, currentBusinessId, setCurrentBusinessId } = useApp();
  const [name,setName] = useState('');
  const create = () => { if(!name) return; addBusiness({ name }); setName(''); };
  if(!hasRole('business')) return (
    <Screen gradient scroll>
      <H1>Businesses</H1>
      <Card><P muted>Access restricted (business role required).</P></Card>
    </Screen>
  );
  return (
    <Screen gradient scroll>
      <H1>Businesses</H1>
      <Card>
        <SectionTitle>New Business</SectionTitle>
        <Row gap={2}>
          <Input placeholder='Name' value={name} onChangeText={setName} />
          <Button title='Add' onPress={create} />
        </Row>
      </Card>
      <Card>
        <SectionTitle>List</SectionTitle>
        {!businessesAdvanced.length && <EmptyState title='No businesses yet' />}
        {businessesAdvanced.map(b => (
          <ListItem key={b.id}
            title={b.name}
            subtitle={b.timezone || '—'}
            right={<Row gap={4}>
              <Button size='xs' variant={currentBusinessId===b.id?'primary':'outline'} title={currentBusinessId===b.id?'Active':'Select'} onPress={()=> setCurrentBusinessId(b.id)} />
              <Button size='xs' variant='danger' title='Del' onPress={()=> removeBusiness(b.id)} />
            </Row>}
          />
        ))}
      </Card>
    </Screen>
  );
}
