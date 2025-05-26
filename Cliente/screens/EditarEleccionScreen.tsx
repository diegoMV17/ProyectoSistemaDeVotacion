import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    Platform,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function EditarEleccionesScreen() {
    const [elecciones, setElecciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({});
    const [showInicio, setShowInicio] = useState(false);
    const [showFin, setShowFin] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const fadeAnim = useState(new Animated.Value(0))[0];

    const cargarElecciones = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('eleccions').select('*').order('fecha_inicio', { ascending: false });
        if (!error) setElecciones(data || []);
        setLoading(false);
    };

    useEffect(() => {
        cargarElecciones();
    }, []);

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
            }, 2000);
        });
    };

    const handleEliminar = (id: number) => {
        if (Platform.OS === 'web') {
            // En web, elimina directamente o usa window.confirm
            if (window.confirm('¿Estás seguro de que deseas eliminar esta elección?')) {
                eliminarEleccion(id);
            }
        } else {
            Alert.alert(
                'Eliminar elección',
                '¿Estás seguro de que deseas eliminar esta elección?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => eliminarEleccion(id),
                    },
                ]
            );
        }
    };

    const eliminarEleccion = async (id: number) => {
        Alert.alert('Intentando eliminar elección con id:', String(id));
        const { error } = await supabase.from('eleccions').delete().eq('id', id);
        console.log('Eliminar resultado:', error);
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            mostrarMensaje('Elección eliminada');
            setEditandoId(null);
            setForm({});
            cargarElecciones();
        }
    };

    const handleEditar = (eleccion: any) => {
        setEditandoId(eleccion.id);
        setForm({
            ...eleccion,
            fecha_inicio: new Date(eleccion.fecha_inicio),
            fecha_fin: new Date(eleccion.fecha_fin),
        });
    };

    const handleGuardar = async () => {
        if (!form.nombre || !form.tipo_representacion || !form.fecha_inicio || !form.fecha_fin || !form.estado) {
            Alert.alert('Completa todos los campos obligatorios');
            return;
        }
        // Ajuste de fechas para web
        const fechaInicioStr =
            Platform.OS === 'web'
                ? form.fecha_inicio.getFullYear() +
                '-' +
                String(form.fecha_inicio.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(form.fecha_inicio.getDate()).padStart(2, '0') +
                ' ' +
                String(form.fecha_inicio.getHours()).padStart(2, '0') +
                ':' +
                String(form.fecha_inicio.getMinutes()).padStart(2, '0') +
                ':00'
                : form.fecha_inicio.toISOString();

        const fechaFinStr =
            Platform.OS === 'web'
                ? form.fecha_fin.getFullYear() +
                '-' +
                String(form.fecha_fin.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(form.fecha_fin.getDate()).padStart(2, '0') +
                ' ' +
                String(form.fecha_fin.getHours()).padStart(2, '0') +
                ':' +
                String(form.fecha_fin.getMinutes()).padStart(2, '0') +
                ':00'
                : form.fecha_fin.toISOString();

        const { error } = await supabase.from('eleccions').update({
            nombre: form.nombre,
            descripcion: form.descripcion,
            tipo_representacion: form.tipo_representacion,
            fecha_inicio: fechaInicioStr,
            fecha_fin: fechaFinStr,
            estado: form.estado,
        }).eq('id', form.id);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setEditandoId(null);
            setForm({});
            cargarElecciones();
            mostrarMensaje('✅ ¡Elección actualizada!');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        if (editandoId === item.id) {
            return (
                <View style={styles.cardEdit}>
                    <Text style={styles.nombre}>Editar: {item.nombre}</Text>
                    <TextInput
                        style={styles.input}
                        value={form.nombre}
                        onChangeText={v => setForm({ ...form, nombre: v })}
                        placeholder="Nombre"
                    />
                    <TextInput
                        style={[styles.input, { height: 60 }]}
                        value={form.descripcion}
                        onChangeText={v => setForm({ ...form, descripcion: v })}
                        placeholder="Descripción"
                        multiline
                    />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.tipo_representacion}
                            onValueChange={v => setForm({ ...form, tipo_representacion: v })}
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
                            value={form.fecha_inicio ? new Date(form.fecha_inicio).toISOString().slice(0, 16) : ''}
                            onChange={e => setForm({ ...form, fecha_inicio: e.target.value ? new Date(e.target.value) : null })}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowInicio(true)}
                            >
                                <Text style={{ color: form.fecha_inicio ? '#263159' : '#888' }}>
                                    {form.fecha_inicio
                                        ? new Date(form.fecha_inicio).toLocaleString()
                                        : 'Selecciona fecha y hora de inicio'}
                                </Text>
                            </TouchableOpacity>
                            {showInicio && (
                                <DateTimePicker
                                    value={form.fecha_inicio || new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowInicio(false);
                                        if (date) setForm({ ...form, fecha_inicio: date });
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
                            value={form.fecha_fin ? new Date(form.fecha_fin).toISOString().slice(0, 16) : ''}
                            onChange={e => setForm({ ...form, fecha_fin: e.target.value ? new Date(e.target.value) : null })}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowFin(true)}
                            >
                                <Text style={{ color: form.fecha_fin ? '#263159' : '#888' }}>
                                    {form.fecha_fin
                                        ? new Date(form.fecha_fin).toLocaleString()
                                        : 'Selecciona fecha y hora de fin'}
                                </Text>
                            </TouchableOpacity>
                            {showFin && (
                                <DateTimePicker
                                    value={form.fecha_fin || new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowFin(false);
                                        if (date) setForm({ ...form, fecha_fin: date });
                                    }}
                                />
                            )}
                        </>
                    )}
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.estado}
                            onValueChange={v => setForm({ ...form, estado: v })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Activa" value="activa" />
                            <Picker.Item label="Finalizada" value="finalizada" />
                            <Picker.Item label="Programada" value="programada" />
                        </Picker>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={handleGuardar}>
                            <Ionicons name="save-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => { setEditandoId(null); setForm({}); }}>
                            <Ionicons name="close-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        // Tarjeta normal
        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Ionicons name="checkbox-outline" size={28} color="#343a40" style={{ marginRight: 8 }} />
                    <Text style={styles.nombre}>{item.nombre}</Text>
                </View>
                <Text style={styles.descripcion}>{item.descripcion}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#0d6efd" />
                    <Text style={styles.info}>Tipo: {item.tipo_representacion}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#0d6efd" />
                    <Text style={styles.info}>Inicio: {new Date(item.fecha_inicio).toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#ff4d6d" />
                    <Text style={styles.info}>Fin: {new Date(item.fecha_fin).toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={18} color="#ffd60a" />
                    <Text style={styles.info}>Estado: {item.estado}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.btnEdit}
                        onPress={() => handleEditar(item)}
                    >
                        <Ionicons name="create-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnDelete}
                        onPress={() => handleEliminar(item.id)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0d6efd" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🗳️ Elecciones Disponibles</Text>
            {successMsg ? (
                <Animated.View style={[styles.successMsg, { opacity: fadeAnim }]}>
                    <Text style={styles.successText}>{successMsg}</Text>
                </Animated.View>
            ) : null}
            <FlatList
                data={elecciones}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 }}>
                        No hay elecciones registradas.
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 22,
        marginBottom: 18,
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderLeftWidth: 6,
        borderLeftColor: '#0d6efd',
    },
    cardEdit: {
        backgroundColor: '#e9f2ff',
        borderRadius: 12,
        padding: 22,
        marginBottom: 18,
        borderLeftWidth: 6,
        borderLeftColor: '#ffd60a',
        shadowColor: '#ffd60a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    nombre: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2c3e50',
        flex: 1,
        flexWrap: 'wrap',
    },
    descripcion: {
        color: '#555',
        marginBottom: 8,
        fontStyle: 'italic',
        fontSize: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    info: {
        color: '#0d6efd',
        fontSize: 15,
        marginLeft: 7,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 14,
    },
    btnEdit: {
        backgroundColor: '#0d6efd',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 18,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
    btnDelete: {
        backgroundColor: '#ff4d6d',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#ff4d6d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 6,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1.2,
        borderColor: '#ced4da',
        fontSize: 15,
        color: '#2c3e50',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1.2,
        borderColor: '#ced4da',
        marginBottom: 10,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 48,
        color: '#2c3e50',
    },
    label: {
        fontWeight: '700',
        fontSize: 15,
        color: '#2c3e50',
        marginBottom: 4,
        marginTop: 8,
    },
    successMsg: {
        backgroundColor: '#d1f7c4',
        borderRadius: 8,
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
});