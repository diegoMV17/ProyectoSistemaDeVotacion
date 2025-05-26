import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  Platform,
  ImageBackground,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function CrearEleccionScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoRepresentacion, setTipoRepresentacion] = useState('facultad');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [estado, setEstado] = useState('programada');
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const errorAnim = useState(new Animated.Value(0))[0];

  const mostrarMensaje = (msg: string) => {
    setSuccessMsg(msg);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setSuccessMsg(''));
      }, 2500);
    });
  };

  const mostrarError = (msg: string) => {
    setErrorMsg(msg);
    Animated.timing(errorAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(errorAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setErrorMsg(''));
      }, 2500);
    });
  };

  const handleCrear = async () => {
    if (!nombre || !tipoRepresentacion || !fechaInicio || !fechaFin || !estado) {
      mostrarError('Completa todos los campos obligatorios');
      return;
    }

    try {
      const { error } = await supabase.from('eleccions').insert([{
        nombre,
        descripcion,
        tipo_representacion: tipoRepresentacion,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        estado,
      }]);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        mostrarMensaje('✅ ¡Elección registrada exitosamente!');
        setNombre('');
        setDescripcion('');
        setTipoRepresentacion('facultad');
        setFechaInicio(null);
        setFechaFin(null);
        setEstado('programada');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear la elección');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>🗳️ Crear Elección</Text>

          {errorMsg ? (
            <Animated.View style={[styles.errorMsg, { opacity: errorAnim }]}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          {successMsg ? (
            <Animated.View style={[styles.successMsg, { opacity: fadeAnim }]}>
              <Text style={styles.successText}>{successMsg}</Text>
            </Animated.View>
          ) : null}

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre de la elección"
            placeholderTextColor="#b0b6c1"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción"
            placeholderTextColor="#b0b6c1"
            multiline
          />

          <Text style={styles.label}>Tipo de Representación *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoRepresentacion}
              onValueChange={setTipoRepresentacion}
              style={styles.picker}
              dropdownIconColor="#4361ee"
            >
              <Picker.Item label="Facultad" value="facultad" />
              <Picker.Item label="Semestre" value="semestre" />
              <Picker.Item label="Comité" value="comite" />
            </Picker>
          </View>

          <Text style={styles.label}>Fecha de Inicio *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              style={{ ...styles.input, padding: 10, fontSize: 15 }}
              value={fechaInicio ? fechaInicio.toISOString().slice(0, 16) : ''}
              onChange={e => setFechaInicio(e.target.value ? new Date(e.target.value) : null)}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowInicio(true)}
              >
                <Text style={{ color: fechaInicio ? '#263159' : '#888' }}>
                  {fechaInicio
                    ? fechaInicio.toLocaleString()
                    : 'Selecciona fecha y hora de inicio'}
                </Text>
              </TouchableOpacity>
              {showInicio && (
                <DateTimePicker
                  value={fechaInicio || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(_, date) => {
                    setShowInicio(false);
                    if (date) setFechaInicio(date);
                  }}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Fecha de Fin *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              style={{ ...styles.input, padding: 10, fontSize: 15 }}
              value={fechaFin ? fechaFin.toISOString().slice(0, 16) : ''}
              onChange={e => setFechaFin(e.target.value ? new Date(e.target.value) : null)}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowFin(true)}
              >
                <Text style={{ color: fechaFin ? '#263159' : '#888' }}>
                  {fechaFin
                    ? fechaFin.toLocaleString()
                    : 'Selecciona fecha y hora de fin'}
                </Text>
              </TouchableOpacity>
              {showFin && (
                <DateTimePicker
                  value={fechaFin || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(_, date) => {
                    setShowFin(false);
                    if (date) setFechaFin(date);
                  }}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Estado *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={estado}
              onValueChange={setEstado}
              style={styles.picker}
              dropdownIconColor="#4361ee"
            >
              <Picker.Item label="Activa" value="activa" />
              <Picker.Item label="Finalizada" value="finalizada" />
              <Picker.Item label="Programada" value="programada" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleCrear}>
            <Text style={styles.btnText}>Registrar Elección</Text>
          </TouchableOpacity>
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
  },
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 22,
    padding: 32,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginTop: 40,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e0e6f1',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3434e6',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(52,52,230,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#343a40',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#f4f6fb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    fontSize: 16,
    color: '#212529',
    shadowColor: '#eaf1fb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  pickerContainer: {
    backgroundColor: '#f4f6fb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 48,
    color: '#263159',
  },
  btnPrimary: {
    backgroundColor: '#4361ee',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  successMsg: {
    backgroundColor: '#d1f7c4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b6e6a7',
  },
  successText: {
    color: '#218838',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  errorMsg: {
    backgroundColor: '#ffe0e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffb3b3',
  },
  errorText: {
    color: '#d90429',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});