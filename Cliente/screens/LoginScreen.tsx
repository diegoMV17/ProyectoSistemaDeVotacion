import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs'; 

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('⚠️ Campos requeridos', 'Por favor ingresa usuario y contraseña.');
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      Alert.alert('❌ Usuario no encontrado', 'Verifica tus datos.');
      return;
    }

    const esValido = await bcrypt.compare(password, user.password_hash);
    if (!esValido) {
      Alert.alert('❌ Contraseña incorrecta');
      return;
    }

    await AsyncStorage.setItem('usuario', JSON.stringify(user));
    Alert.alert(' Bienvenido');
    navigation.replace(); // reemplaza la pantalla actual y entra a la app
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
});