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
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

export default function EditElectionScreen() {
    const [elections, setElections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({});
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const fadeAnim = useState(new Animated.Value(0))[0];

    const loadElections = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('eleccions').select('*').order('fecha_inicio', { ascending: false });
        if (!error) setElections(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadElections();
    }, []);

    const showMessage = (msg: string) => {
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

    const handleDelete = (id: number) => {
        if (Platform.OS === 'web') {
            if (window.confirm('¿Estás seguro de que deseas eliminar esta elección?')) {
                deleteElection(id);
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
                        onPress: () => deleteElection(id),
                    },
                ]
            );
        }
    };

    const deleteElection = async (id: number) => {
        Alert.alert('Intentando eliminar elección con id:', String(id));
        const { error } = await supabase.from('eleccions').delete().eq('id', id);
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            showMessage('Elección eliminada');
            setEditingId(null);
            setForm({});
            loadElections();
        }
    };

    const handleEdit = (election: any) => {
        setEditingId(election.id);
        setForm({
            ...election,
            fecha_inicio: new Date(election.fecha_inicio),
            fecha_fin: new Date(election.fecha_fin),
        });
    };

    const handleSave = async () => {
        if (!form.nombre || !form.tipo_representacion || !form.fecha_inicio || !form.fecha_fin || !form.estado) {
            Alert.alert('Completa todos los campos obligatorios');
            return;
        }
        const startDateStr =
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

        const endDateStr =
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
            fecha_inicio: startDateStr,
            fecha_fin: endDateStr,
            estado: form.estado,
        }).eq('id', form.id);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setEditingId(null);
            setForm({});
            loadElections();
            showMessage('✅ ¡Elección actualizada!');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        if (editingId === item.id) {
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
                            value={form.fecha_inicio ? new Date(form.fecha_inicio).toISOString().slice(0, 16) : ''}
                            onChange={e => setForm({ ...form, fecha_inicio: e.target.value ? new Date(e.target.value) : null })}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowStart(true)}
                            >
                                <Text style={{ color: form.fecha_inicio ? '#263159' : '#888' }}>
                                    {form.fecha_inicio
                                        ? new Date(form.fecha_inicio).toLocaleString()
                                        : 'Selecciona fecha y hora de inicio'}
                                </Text>
                            </TouchableOpacity>
                            {showStart && (
                                <DateTimePicker
                                    value={form.fecha_inicio || new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowStart(false);
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
                                onPress={() => setShowEnd(true)}
                            >
                                <Text style={{ color: form.fecha_fin ? '#263159' : '#888' }}>
                                    {form.fecha_fin
                                        ? new Date(form.fecha_fin).toLocaleString()
                                        : 'Selecciona fecha y hora de fin'}
                                </Text>
                            </TouchableOpacity>
                            {showEnd && (
                                <DateTimePicker
                                    value={form.fecha_fin || new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={(_, date) => {
                                        setShowEnd(false);
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
                            dropdownIconColor="#4361ee"
                        >
                            <Picker.Item label="Activa" value="activa" />
                            <Picker.Item label="Finalizada" value="finalizada" />
                            <Picker.Item label="Programada" value="programada" />
                        </Picker>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={handleSave}>
                            <Ionicons name="save-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => { setEditingId(null); setForm({}); }}>
                            <Ionicons name="close-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Ionicons name="checkbox-outline" size={28} color="#343a40" style={{ marginRight: 8 }} />
                    <Text style={styles.nombre}>{item.nombre}</Text>
                </View>
                <Text style={styles.descripcion}>{item.descripcion}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#4361ee" />
                    <Text style={styles.info}>Tipo: {item.tipo_representacion}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#4361ee" />
                    <Text style={styles.info}>Inicio: {new Date(item.fecha_inicio).toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#ef476f" />
                    <Text style={styles.info}>Fin: {new Date(item.fecha_fin).toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={18} color="#ffd60a" />
                    <Text style={styles.info}>Estado: {item.estado}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.btnEdit}
                        onPress={() => handleEdit(item)}
                    >
                        <Ionicons name="create-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnDelete}
                        onPress={() => handleDelete(item.id)}
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
                <ActivityIndicator size="large" color="#4361ee" />
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/fondo.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>🗳️ Elecciones Disponibles</Text>
                {successMsg ? (
                    <Animated.View style={[styles.successMsg, { opacity: fadeAnim }]}>
                        <Text style={styles.successText}>{successMsg}</Text>
                    </Animated.View>
                ) : null}
                <FlatList
                    data={elections}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    numColumns={2}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No hay elecciones registradas.
                        </Text>
                    }
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
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
        flex: 1,
        padding: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContent: {
        paddingBottom: 30,
        paddingHorizontal: 4,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#3434e6',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(52,52,230,0.08)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        marginHorizontal: 4,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 18,
        elevation: 7,
        borderLeftWidth: 7,
        borderLeftColor: '#4361ee',
        width: '47%',
        minWidth: 200,
        maxWidth: 340,
    },
    cardEdit: {
        backgroundColor: 'rgba(232,240,254,0.98)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        marginHorizontal: 4,
        borderLeftWidth: 7,
        borderLeftColor: '#ffd60a',
        shadowColor: '#ffd60a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 18,
        elevation: 7,
        width: '47%',
        minWidth: 200,
        maxWidth: 340,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nombre: {
        fontSize: 21,
        fontWeight: '800',
        color: '#343a40',
        flex: 1,
        flexWrap: 'wrap',
    },
    descripcion: {
        color: '#555',
        marginBottom: 10,
        fontStyle: 'italic',
        fontSize: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    info: {
        color: '#4361ee',
        fontSize: 15,
        marginLeft: 7,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 8,
    },
    btnEdit: {
        backgroundColor: '#4361ee',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 22,
        marginRight: 6,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 2,
    },
    btnDelete: {
        backgroundColor: '#ef476f',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#ef476f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 6,
        elevation: 2,
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        shadowColor: '#eaf1fb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
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
    label: {
        fontWeight: '700',
        fontSize: 15,
        color: '#343a40',
        marginBottom: 4,
        marginTop: 10,
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
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
        fontSize: 16,
        fontStyle: 'italic',
    },
});