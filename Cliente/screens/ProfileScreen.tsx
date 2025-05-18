import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedData, setSavedData] = useState<{ name: string; email: string; bio: string } | null>(null);
  const [mensajeExito, setMensajeExito] = useState('');

  const PERFIL_KEY = 'perfil_usuario';

  const guardarPerfil = async (data: { name: string; email: string; bio: string }) => {
    try {
      await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando perfil:', error);
    }
  };

  const cargarPerfil = async () => {
    try {
      const json = await AsyncStorage.getItem(PERFIL_KEY);
      if (json) {
        const datos = JSON.parse(json);
        setSavedData(datos);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const eliminarPerfil = async () => {
    try {
      await AsyncStorage.removeItem(PERFIL_KEY);
      setSaved(false);
      setSavedData(null);
      setName(savedData?.name || '');
      setEmail(savedData?.email || '');
      setBio(savedData?.bio || '');

      setMensajeExito('🗑️ Perfil eliminado correctamente.');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      console.error('Error eliminando perfil:', error);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !bio) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    const data = { name, email, bio };
    guardarPerfil(data);
    setSavedData(data);
    setSaved(true);

    setName('');
    setEmail('');
    setBio('');

    setMensajeExito('✅ Perfil guardado correctamente.');
    setTimeout(() => setMensajeExito(''), 3000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Perfil del Usuario</Text>

      {mensajeExito !== '' && (
        <View style={styles.flash}>
          <Text style={styles.flashText}>{mensajeExito}</Text>
        </View>
      )}

      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Biografía"
        style={[styles.input, { height: 100 }]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Button title="Guardar perfil" onPress={handleSave} />

      {saved && savedData && (
        <>
          <View style={styles.result}>
            <Text style={styles.resultText}>✅ Perfil guardado:</Text>
            <Text>👤 Nombre: {savedData.name}</Text>
            <Text>📧 Correo: {savedData.email}</Text>
            <Text>📝 Bio: {savedData.bio}</Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Button title="Eliminar perfil" onPress={eliminarPerfil} color="#cc0000" />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f0f0' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
  },
  resultText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  flash: {
    backgroundColor: '#d1ecf1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  flashText: {
    color: '#0c5460',
    textAlign: 'center',
    fontWeight: '500',
  },
});
