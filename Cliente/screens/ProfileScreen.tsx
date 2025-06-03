import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then(json => {
      if (json) {
        const user = JSON.parse(json);
        setUserId(user.id);
      }
    });
  }, []);

  const saveProfileToDB = async () => {
    if (!userId || !firstName || !lastName || !age || !gender) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }
    try {
      const { data: existingProfiles, error: selectError } = await supabase
        .from('userprofiles')
        .select('id')
        .eq('user_id', userId);

      if (selectError) {
        console.error('Error buscando perfil:', selectError);
        throw selectError;
      }

      let error;
      if (existingProfiles && existingProfiles.length > 0) {
        const profileId = existingProfiles[0].id;
        ({ error } = await supabase
          .from('userprofiles')
          .update({
            nombres: firstName,
            apellidos: lastName,
            edad: parseInt(age, 10),
            genero: gender,
          })
          .eq('id', profileId));
      } else {
        ({ error } = await supabase
          .from('userprofiles')
          .insert([{
            user_id: userId,
            nombres: firstName,
            apellidos: lastName,
            edad: parseInt(age, 10),
            genero: gender,
          }]));
      }

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      setSuccessMessage('✅ Perfil guardado correctamente.');
      setFirstName('');
      setLastName('');
      setAge('');
      setGender('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil en la base de datos.');
    }
  };

  const deleteProfileFromDB = async () => {
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
      setSuccessMessage('🗑️ Perfil eliminado correctamente.');
      setFirstName('');
      setLastName('');
      setAge('');
      setGender('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el perfil en la base de datos.');
    }
  };

  const loadProfileFromDB = async () => {
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

      const profile = data && data.length > 0
        ? data.find((p) => p.user_id === userId)
        : null;

      if (!profile) {
        setSuccessMessage('ℹ️ No hay perfil para este usuario. Puedes crearlo.');
        setFirstName('');
        setLastName('');
        setAge('');
        setGender('');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      setFirstName(profile.nombres || '');
      setLastName(profile.apellidos || '');
      setAge(profile.edad ? profile.edad.toString() : '');
      setGender(profile.genero || '');
      setSuccessMessage('✏️ Perfil cargado para edición.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.headerIcon}>🧑‍💼</Text>
            <Text style={styles.headerTitle}>Perfil del Usuario</Text>
          </View>
          <View style={styles.cardBody}>
            {successMessage !== '' && (
              <View style={styles.flash}>
                <Text style={styles.flashText}>{successMessage}</Text>
              </View>
            )}
            <Text style={styles.formLabel}>Nombres</Text>
            <TextInput
              placeholder="Nombres"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
            <Text style={styles.formLabel}>Apellidos</Text>
            <TextInput
              placeholder="Apellidos"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
            <Text style={styles.formLabel}>Edad</Text>
            <TextInput
              placeholder="Edad"
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Género</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona género..." value="" />
                <Picker.Item label="Masculino" value="masculino" />
                <Picker.Item label="Femenino" value="femenino" />
                <Picker.Item label="Otro" value="otro" />
              </Picker>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={saveProfileToDB}>
                <Text style={styles.btnText}>Guardar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={deleteProfileFromDB}>
                <Text style={styles.btnText}>Eliminar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnEdit} onPress={loadProfileFromDB}>
                <Text style={styles.btnText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  profileCard: {
    maxWidth: 500,
    width: '96%',
    alignSelf: 'center',
    marginTop: 38,
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#3a0ca3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e3e7ef',
    overflow: 'hidden',
  },
  profileHeader: {
    backgroundColor: '#4361ee',
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e7ef',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerIcon: {
    fontSize: 40,
    marginRight: 14,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  cardBody: {
    paddingVertical: 38,
    paddingHorizontal: 30,
    backgroundColor: '#f7f9fd',
  },
  formLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#3a0ca3',
    marginBottom: 7,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#f1f3fa',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1.3,
    borderColor: '#bfc7d1',
    fontSize: 16,
    color: '#263159',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    backgroundColor: '#f1f3fa',
    borderRadius: 10,
    borderWidth: 1.3,
    borderColor: '#bfc7d1',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 48,
    color: '#263159',
  },
  flash: {
    backgroundColor: '#e3f0ff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderColor: '#b3d1fa',
    borderWidth: 1,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  flashText: {
    color: '#4361ee',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#198754',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 13,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    shadowColor: '#198754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  btnSecondary: {
    backgroundColor: '#e63946',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 13,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 1,
  },
  btnEdit: {
    backgroundColor: '#3a0ca3',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 13,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3a0ca3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});