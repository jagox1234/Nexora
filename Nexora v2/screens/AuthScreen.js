// AuthScreen — simple local auth scaffold (Phase 1)
import { Screen, Card, H1, P, Input, Button, Row, SectionTitle, EmptyState } from '@ui/index.js';
import { React, useState } from '@v2/app/baseDependencies.js';
import { t } from '@v2/core/i18n.js';
import { useApp } from '@v2/core/index.js';

export default function AuthScreen() {
  const { auth, register, login, logout } = useApp();
  const [mode,setMode] = useState('login');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [error,setError] = useState(null);
  const submit = async () => {
    setError(null);
    const action = mode==='login' ? login : register;
    const res = await action({ email, password, name });
    if(!res.ok) setError(res.error);
  };
  return (
    <Screen gradient scroll>
      <H1>Auth</H1>
      <Card>
        <SectionTitle>{mode==='login'?'Login':'Register'}</SectionTitle>
        {error && <P style={{ color:'red' }}>{error}</P>}
        {mode==='register' && <Input placeholder='Name' value={name} onChangeText={setName} />}
        <Input placeholder='Email' autoCapitalize='none' value={email} keyboardType='email-address' onChangeText={setEmail} />
        <Input placeholder='Password' secureTextEntry value={password} onChangeText={setPassword} />
        <Row gap={2}>
          <Button title={mode==='login'?'Login':'Create'} onPress={submit} />
          <Button variant='outline' title={mode==='login'?'Need account?':'Have account?'} onPress={()=> setMode(m=> m==='login'?'register':'login')} />
        </Row>
      </Card>
      <Card>
        <SectionTitle>Current User</SectionTitle>
        {!auth.currentUser ? <EmptyState title='No user logged in' /> : (
          <>
            <P>{auth.currentUser.email}</P>
            <P muted>Roles: {(auth.currentUser.roles||[]).join(', ')||'—'}</P>
            <Button variant='outline' title='Logout' onPress={()=> logout()} />
          </>
        )}
      </Card>
    </Screen>
  );
}
