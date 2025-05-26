import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('⚠️ Campos requeridos', 'Por favor ingresa usuario y contraseña.');
      return;
    }
    setLoading(true);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      setLoading(false);
      Alert.alert('❌ Usuario no encontrado', 'Verifica tus datos.');
      return;
    }

    const esValido = await bcrypt.compare(password, user.password_hash);
    setLoading(false);
    if (!esValido) {
      Alert.alert('❌ Contraseña incorrecta');
      return;
    }

    await AsyncStorage.setItem('usuario', JSON.stringify(user));
    Alert.alert('Bienvenido');
    navigation.replace();
  };

  return (
    <View style={styles.bg}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.loginContainer}>
          <Text style={styles.title}>🔐 Iniciar Sesión</Text>
          <TextInput
            placeholder="Usuario"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: '6%',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    borderWidth: 0,
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#f7f7fa',
    fontSize: 16,
    color: '#22223b',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  button: {
    width: '100%',
    backgroundColor: '#22223b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
});