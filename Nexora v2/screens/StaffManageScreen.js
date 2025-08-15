// StaffManageScreen — manage staff and skills
import { Screen, Card, H1, P, Input, Button, ListItem, Row, SectionTitle, EmptyState } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { useApp } from '@v2/core/index.js';

export default function StaffManageScreen() {
  const { staff, addStaff, removeStaff, attachSkill, hasRole, currentBusinessId } = useApp();
  const [name,setName] = useState('');
  const [skill,setSkill] = useState('');
  const create = () => { if(!name) return; addStaff({ name }); setName(''); };
  const addSkill = (id) => { if(!skill) return; attachSkill(id, skill); setSkill(''); };
  if(!hasRole('business')) return (
    <Screen gradient scroll>
      <H1>Staff</H1>
      <Card><P muted>Access restricted (business role required).</P></Card>
    </Screen>
  );
  const filtered = staff.filter(s => !currentBusinessId || s.businessId===currentBusinessId || s.businessId==null);
  return (
    <Screen gradient scroll>
      <H1>Staff</H1>
      <Card>
        <SectionTitle>New Staff</SectionTitle>
        <Row gap={2}>
          <Input placeholder='Name' value={name} onChangeText={setName} />
          <Button title='Add' onPress={create} />
        </Row>
      </Card>
      <Card>
        <SectionTitle>Skills</SectionTitle>
        <Row gap={2}>
          <Input placeholder='Skill' value={skill} onChangeText={setSkill} />
        </Row>
      </Card>
      <Card>
  <SectionTitle>List</SectionTitle>
  {!filtered.length && <EmptyState title='No staff yet' />}
  {filtered.map(s => (
          <ListItem key={s.id}
            title={s.name}
            subtitle={(s.skills||[]).join(', ')||'—'}
            right={
              <Row gap={1}>
                <Button size='sm' variant='outline' title='Add skill' onPress={()=> addSkill(s.id)} />
                <Button size='sm' variant='danger' title='X' onPress={()=> removeStaff(s.id)} />
              </Row>
            }
          />
        ))}
      </Card>
    </Screen>
  );
}
