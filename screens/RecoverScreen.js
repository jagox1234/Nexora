import React, { useState } from 'react';
import { View, Text } from '@ui/index.js';
import { Input, Button } from '@ui/components.js';
import { recoverPassword } from '@core/users.js';

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleRecover = () => {
    const ok = recoverPassword(email);
    setStatus(ok ? 'Email enviado' : 'No existe usuario');
  };

  return (
    <View>
      <Text>Recuperar contraseña</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Button title="Recuperar" onPress={handleRecover} />
      {status && <Text>{status}</Text>}
    </View>
  );
}
