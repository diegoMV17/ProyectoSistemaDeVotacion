import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Animated, Platform } from 'react-native';
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
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción"
                    multiline
                />

                <Text style={styles.label}>Tipo de Representación *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tipoRepresentacion}
                        onValueChange={setTipoRepresentacion}
                        style={styles.picker}
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
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#e6ecff',
        flexGrow: 1,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 28,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 18,
        elevation: 7,
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3434e6',
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    label: {
        fontWeight: '600',
        fontSize: 16,
        color: '#3a3a3a',
        marginBottom: 6,
        marginTop: 12,
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
    pickerContainer: {
        backgroundColor: '#f4f6fb',
        borderRadius: 10,
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
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 30,
        alignItems: 'center',
        marginTop: 18,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 4,
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 17,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    successMsg: {
        backgroundColor: '#d1f7c4',
        borderRadius: 10,
        padding: 14,
        marginBottom: 18,
        alignItems: 'center',
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
    },
    errorText: {
        color: '#d90429',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
});