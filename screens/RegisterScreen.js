import React, { useState } from 'react';
import { View, Text } from '@ui/index.js';
import { Input, Button } from '@ui/components.js';
import { registerUser } from '@core/users.js';

export default function RegisterScreen({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = () => {
    if (!email || !password) {
      setError('Email y contraseña requeridos');
      return;
    }
    const user = registerUser({ email, password });
    onRegister(user);
  };

  return (
    <View>
      <Text>Registro</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}
