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
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then(json => {
      if (json) {
        const usuario = JSON.parse(json);
        setUserId(usuario.id);
      }
    });
  }, []);

  const guardarPerfilEnBD = async () => {
    if (!userId || !nombres || !apellidos || !edad || !genero) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }
    try {
      // Busca todos los perfiles de ese usuario
      const { data: existentes, error: errorSelect } = await supabase
        .from('userprofiles')
        .select('id')
        .eq('user_id', userId);

      if (errorSelect) {
        console.error('Error buscando perfil:', errorSelect);
        throw errorSelect;
      }

      let error;
      if (existentes && existentes.length > 0) {
        // Si existe al menos uno, actualiza el primero usando el id del perfil
        const idPerfil = existentes[0].id;
        ({ error } = await supabase
          .from('userprofiles')
          .update({
            nombres,
            apellidos,
            edad: parseInt(edad, 10),
            genero,
          })
          .eq('id', idPerfil));
      } else {
        // Si no existe ninguno, inserta
        ({ error } = await supabase
          .from('userprofiles')
          .insert([{
            user_id: userId,
            nombres,
            apellidos,
            edad: parseInt(edad, 10),
            genero,
          }]));
      }

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      setMensajeExito('✅ Perfil guardado correctamente.');
      setNombres('');
      setApellidos('');
      setEdad('');
      setGenero('');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil en la base de datos.');
    }
  };

  const eliminarPerfilEnBD = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se encontró el usuario.');
      return;
    }
    try {
      const { error } = await supabase
        .from('userprofiles')
        .delete()
        .eq('user_id', userId);
      if (error) {
        console.error('Error al eliminar perfil:', error);
        throw error;
      }
      setMensajeExito('🗑️ Perfil eliminado correctamente.');
      setNombres('');
      setApellidos('');
      setEdad('');
      setGenero('');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el perfil en la base de datos.');
    }
  };

  const cargarPerfilEnBD = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se encontró el usuario.');
      return;
    }
    try {
      const { data, error } = await supabase
      .from('userprofiles')
      .select('nombres, apellidos, edad, genero, user_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil.');
      return;
    }

    // Busca el perfil que tenga el user_id correcto
    const perfil = data && data.length > 0
      ? data.find((p) => p.user_id === userId)
      : null;

      if (!perfil) {
      setMensajeExito('ℹ️ No hay perfil para este usuario. Puedes crearlo.');
      setNombres('');
      setApellidos('');
      setEdad('');
      setGenero('');
      setTimeout(() => setMensajeExito(''), 3000);
      return;
    }

    setNombres(perfil.nombres || '');
    setApellidos(perfil.apellidos || '');
    setEdad(perfil.edad ? perfil.edad.toString() : '');
    setGenero(perfil.genero || '');
    setMensajeExito('✏️ Perfil cargado para edición.');
    setTimeout(() => setMensajeExito(''), 3000);
  } catch (error) {
    Alert.alert('Error', 'No se pudo cargar el perfil.');
  }
};

  return (
    <LinearGradient
      colors={['#f0f4ff', '#e6ecff']}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.headerIcon}>🧑‍💼</Text>
            <Text style={styles.headerTitle}>Perfil del Usuario</Text>
          </View>
          <View style={styles.cardBody}>
            {mensajeExito !== '' && (
              <View style={styles.flash}>
                <Text style={styles.flashText}>{mensajeExito}</Text>
              </View>
            )}
            <Text style={styles.formLabel}>Nombres</Text>
            <TextInput
              placeholder="Nombres"
              style={styles.input}
              value={nombres}
              onChangeText={setNombres}
            />
            <Text style={styles.formLabel}>Apellidos</Text>
            <TextInput
              placeholder="Apellidos"
              style={styles.input}
              value={apellidos}
              onChangeText={setApellidos}
            />
            <Text style={styles.formLabel}>Edad</Text>
            <TextInput
              placeholder="Edad"
              style={styles.input}
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Género</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={genero}
                onValueChange={setGenero}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona género..." value="" />
                <Picker.Item label="Masculino" value="masculino" />
                <Picker.Item label="Femenino" value="femenino" />
                <Picker.Item label="Otro" value="otro" />
              </Picker>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={guardarPerfilEnBD}>
                <Text style={styles.btnText}>Guardar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={eliminarPerfilEnBD}>
                <Text style={styles.btnText}>Eliminar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnEdit} onPress={cargarPerfilEnBD}>
                <Text style={styles.btnText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    maxWidth: 500,
    width: '95%',
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e3e7ef',
    overflow: 'hidden',
  },
  profileHeader: {
    backgroundColor: '#1a237e',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 26,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.13)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerIcon: {
    fontSize: 36,
    marginRight: 12,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  cardBody: {
    paddingVertical: 36,
    paddingHorizontal: 28,
    backgroundColor: '#f8fafc',
  },
  formLabel: {
    fontWeight: '700',
    fontSize: 15,
    color: '#263159',
    marginBottom: 7,
    marginTop: 12,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#f4f6fb',
    padding: 13,
    borderRadius: 9,
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: '#bfc7d1',
    fontSize: 15,
    color: '#263159',
  },
  pickerContainer: {
    backgroundColor: '#f4f6fb',
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: '#bfc7d1',
    marginBottom: 18,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 48,
    color: '#263159',
  },
  flash: {
    backgroundColor: '#e3f0ff',
    padding: 13,
    borderRadius: 14,
    marginBottom: 18,
    borderColor: '#b3d1fa',
    borderWidth: 1,
  },
  flashText: {
    color: '#1a237e',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 9,
  },
  btnPrimary: {
    backgroundColor: '#228B22',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  btnSecondary: {
    backgroundColor: '#FF0000',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  btnEdit: {
    backgroundColor: '#1a237e',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
    textAlign: 'center'
  },
});