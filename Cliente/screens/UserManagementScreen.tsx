import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

// Tipado de usuario
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
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    const verificarRol = async () => {
      const usuario = await AsyncStorage.getItem('usuario');
      if (usuario) {
        const parsed = JSON.parse(usuario);
        console.log('Usuario cargado:', parsed); // <-- Agrega esto
        setAdminValid(parsed.role === 'ADMIN');
      } else {
        console.log('No hay usuario en AsyncStorage');
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

  const limpiarFormulario = () => {
    setEditId(null);
    setIdentificacion('');
    setUsername('');
    setPassword('');
    setRole('ADMINISTRATIVO');
  };

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
        limpiarFormulario();
        cargarUsuarios();
      }
    } catch (e) {
      Alert.alert('❌ Error general', 'No se pudo crear el usuario');
      console.error(e);
    }
  };

  const handleEditUser = (usuario: Usuario) => {
    setEditId(usuario.id);
    setIdentificacion(usuario.identificacion);
    setUsername(usuario.username);
    setRole(usuario.role);
    setPassword('');
  };

  const handleUpdateUser = async () => {
    if (!editId || !identificacion || !username || !role) {
      Alert.alert('⚠️ Todos los campos son obligatorios');
      return;
    }
    try {
      let updateObj: any = {
        identificacion,
        username,
        role,
      };
      if (password) {
        updateObj.password_hash = await bcrypt.hash(password, 10);
      }
      const { error } = await supabase
        .from('users')
        .update(updateObj)
        .eq('id', editId);

      if (error) {
        Alert.alert('❌ Error actualizando usuario', error.message);
      } else {
        Alert.alert('✅ Usuario actualizado');
        limpiarFormulario();
        cargarUsuarios();
      }
    } catch (e) {
      Alert.alert('❌ Error general', 'No se pudo actualizar el usuario');
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        // Elimina primero los perfiles relacionados
        await supabase.from('userprofiles').delete().eq('user_id', id);
        // Si tienes más tablas relacionadas, elimina aquí también

        // Ahora elimina el usuario
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) {
          Alert.alert('❌ Error eliminando usuario', error.message);
        } else {
          if (editId === id) limpiarFormulario();
          cargarUsuarios();
        }
      }
    } else {
      Alert.alert(
        'Eliminar usuario',
        '¿Estás seguro de que deseas eliminar este usuario?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                // Elimina primero los perfiles relacionados
                await supabase.from('userprofiles').delete().eq('user_id', id);
                // Si tienes más tablas relacionadas, elimina aquí también

                // Ahora elimina el usuario
                const { error } = await supabase.from('users').delete().eq('id', id);
                if (error) {
                  Alert.alert('❌ Error eliminando usuario', error.message);
                } else {
                  if (editId === id) limpiarFormulario();
                  cargarUsuarios();
                }
              } catch (e: any) {
                Alert.alert('❌ Error eliminando usuario', e.message || 'Error desconocido');
              }
            },
          },
        ]
      );
    }
  };

  if (!adminValid) return <Text style={styles.block}>⛔ Acceso denegado</Text>;

  return (
    <LinearGradient colors={['#f0f4ff', '#e6ecff']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.headerIcon}>🧑‍💼</Text>
            <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
          </View>
          <View style={styles.cardBody}>
            {/* Formulario */}
            <Text style={styles.formLabel}>Identificación</Text>
            <TextInput
              placeholder="Identificación"
              style={styles.input}
              value={identificacion}
              onChangeText={setIdentificacion}
            />
            <Text style={styles.formLabel}>Nombre de usuario</Text>
            <TextInput
              placeholder="Nombre de usuario"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
            <Text style={styles.formLabel}>
              Contraseña {editId ? '(dejar vacío para no cambiar)' : ''}
            </Text>
            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.formLabel}>Rol del usuario:</Text>
            <View style={{ marginBottom: 18 }}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue as Usuario['role'])}
                style={{ backgroundColor: '#f4f6fb', borderRadius: 10 }}
                dropdownIconColor="#4361ee"
              >
                <Picker.Item label="ADMINISTRATIVO" value="ADMINISTRATIVO" />
                <Picker.Item label="CANDIDATO" value="CANDIDATO" />
                <Picker.Item label="VOTANTE" value="VOTANTE" />
              </Picker>
            </View>
            {editId ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.btnPrimary} onPress={handleUpdateUser}>
                  <Text style={styles.btnText}>Actualizar usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary} onPress={limpiarFormulario}>
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateUser}>
                <Text style={styles.btnText}>Crear usuario</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>📋 Usuarios registrados:</Text>

            {/* Lista de usuarios */}
            {usuarios.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#888', marginTop: 10 }}>
                No hay usuarios registrados.
              </Text>
            ) : (
              usuarios.map((item) => (
                <View key={item.id} style={styles.userRow}>
                  <View>
                    <Text style={styles.userText}>🆔 {item.identificacion}</Text>
                    <Text style={styles.userText}>🧑‍💼 {item.username}</Text>
                    <Text style={styles.userText}>🎓 {item.role}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditUser(item)}>
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteUser(item.id)}>
                      <Text style={styles.actionText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ...tus estilos previos...
  profileCard: {
    maxWidth: 850,
    width: '98%',
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e0e6f1',
    overflow: 'hidden',
    marginBottom: 40,
  },
  profileHeader: {
    backgroundColor: '#3434e6',
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 10,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  cardBody: {
    paddingVertical: 36,
    paddingHorizontal: 36,
  },
  formLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#3a3a3a',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f4f6fb',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    fontSize: 16,
    color: '#212529',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },
  roleBtn: {
    backgroundColor: '#e6ecff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    marginRight: 8,
  },
  roleBtnActive: {
    backgroundColor: '#4361ee',
    borderColor: '#4361ee',
  },
  roleBtnText: {
    color: '#263159',
    fontWeight: '600',
    fontSize: 15,
  },
  roleBtnTextActive: {
    color: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#4361ee',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  btnSecondary: {
    backgroundColor: '#6c757d',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    marginLeft: 0,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b1b1b',
    borderLeftWidth: 5,
    borderLeftColor: '#4895ef',
    paddingLeft: 12,
    marginBottom: 18,
    marginTop: 10,
    userSelect: 'none',
  },
  userRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e6f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#4895ef',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 6,
  },
  deleteBtn: {
    backgroundColor: '#ef476f',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  userText: {
    fontSize: 15,
    color: '#263159',
    fontWeight: '500',
  },
  block: {
    padding: 20,
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
  },
});