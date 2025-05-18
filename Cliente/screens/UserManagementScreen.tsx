import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';

//  Tipado de usuario
type Usuario = {
  id: number;
  identificacion: string;
  username: string;
  role: 'ADMIN' | 'ADMINISTRATIVO' | 'CANDIDATO' | 'VOTANTE';
};

export default function UserManagementScreen() {
  const [identificacion, setIdentificacion] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Usuario['role']>('ADMINISTRATIVO');
  const [adminValid, setAdminValid] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const verificarRol = async () => {
      const usuario = await AsyncStorage.getItem('usuario');
      if (usuario) {
        const parsed = JSON.parse(usuario);
        setAdminValid(parsed.role === 'ADMIN');
      }
    };
    verificarRol();
  }, []);

  const cargarUsuarios = async () => {
    const { data, error } = await supabase.from('users').select('id, identificacion, username, role');
    if (!error && data) {
      setUsuarios(data as Usuario[]);
    }
  };

  useEffect(() => {
    if (adminValid) {
      cargarUsuarios();
    }
  }, [adminValid]);

  const handleCreateUser = async () => {
    if (!identificacion || !username || !password || !role) {
      Alert.alert('⚠️ Todos los campos son obligatorios');
      return;
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      const { error } = await supabase.from('users').insert([{
        identificacion,
        username,
        password_hash: hashed,
        role,
      }]);

      if (error) {
        Alert.alert('❌ Error creando usuario', error.message);
      } else {
        Alert.alert('✅ Usuario creado exitosamente');
        setIdentificacion('');
        setUsername('');
        setPassword('');
        setRole('ADMINISTRATIVO');
        cargarUsuarios();
      }
    } catch (e) {
      Alert.alert('❌ Error general', 'No se pudo crear el usuario');
      console.error(e);
    }
  };

  if (!adminValid) return <Text style={styles.block}>⛔ Acceso denegado</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Gestión de Usuarios</Text>

      {Platform.OS === 'web' && (
        <>
          <TextInput placeholder="Identificación" style={styles.input} value={identificacion} onChangeText={setIdentificacion} />
          <TextInput placeholder="Nombre de usuario" style={styles.input} value={username} onChangeText={setUsername} />
          <TextInput placeholder="Contraseña" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Rol del usuario:</Text>
          <View style={styles.pickerRow}>
            {['ADMINISTRATIVO', 'CANDIDATO', 'VOTANTE'].map(r => (
              <Button key={r} title={r} color={role === r ? '#007bff' : '#aaa'} onPress={() => setRole(r as Usuario['role'])} />
            ))}
          </View>

          <Button title="Crear usuario" onPress={handleCreateUser} />
        </>
      )}

      <Text style={styles.subtitle}>📋 Usuarios registrados:</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Text>🆔 {item.identificacion}</Text>
            <Text>👤 {item.username}</Text>
            <Text>🎓 {item.role}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 18, marginVertical: 10, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  userRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  block: { padding: 20, textAlign: 'center', fontSize: 18, color: 'red' },
});
