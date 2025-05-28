import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
    Alert,
    FlatList,
    ImageBackground,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';

export default function AgregarCandidatoScreen() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [elecciones, setElecciones] = useState<any[]>([]);
    const [candidaturas, setCandidaturas] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedEleccion, setSelectedEleccion] = useState<string>('');
    const [propuesta, setPropuesta] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estados para edición
    const [editandoId, setEditandoId] = useState<number | null>(null);

    const cargarDatos = async () => {
        setLoading(true);
        const { data: users } = await supabase
            .from('users')
            .select('id, username, role')
            .eq('role', 'CANDIDATO');
        const { data: eleccions } = await supabase
            .from('eleccions')
            .select('id, nombre');
        const { data: candidaturasData } = await supabase
            .from('candidaturas')
            .select('id, propuesta, userid, eleccionid');
        setUsuarios(users || []);
        setElecciones(eleccions || []);
        setCandidaturas(candidaturasData || []);
        setLoading(false);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Agregar o actualizar candidatura
    const handleAgregarOActualizar = async () => {
        if (!selectedUser || !selectedEleccion || !propuesta.trim()) {
            Alert.alert('Todos los campos son obligatorios');
            return;
        }

        const userId = Number(selectedUser);
        const eleccionId = Number(selectedEleccion);

        if (isNaN(userId) || isNaN(eleccionId) || userId <= 0 || eleccionId <= 0) {
            Alert.alert('Selecciona un candidato y una elección válidos');
            return;
        }

        setSubmitting(true);

        if (editandoId) {
            // Actualizar candidatura existente
            const { error } = await supabase
                .from('candidaturas')
                .update({ propuesta })
                .eq('id', editandoId);

            setSubmitting(false);

            if (error) {
                Alert.alert('Error', 'No se pudo actualizar la candidatura.');
            } else {
                Alert.alert('Éxito', 'Candidatura actualizada');
                limpiarFormulario();
                cargarDatos();
            }
        } else {
            // Verifica si ya existe la candidatura
            const { data: existente } = await supabase
                .from('candidaturas')
                .select('id')
                .eq('userid', userId)
                .eq('eleccionid', eleccionId)
                .maybeSingle();

            if (existente) {
                setSubmitting(false);
                Alert.alert('Este candidato ya está asignado a esta elección');
                return;
            }

            // Insertar nueva candidatura
            const dataToInsert = {
                propuesta,
                userid: userId,
                eleccionid: eleccionId,
            };

            const { error } = await supabase.from('candidaturas').insert([dataToInsert]);

            setSubmitting(false);

            if (error) {
                Alert.alert('Error', 'No se pudo registrar la candidatura. Intenta nuevamente.');
            } else {
                Alert.alert('Éxito', 'Candidato asignado a la elección');
                limpiarFormulario();
                cargarDatos();
            }
        }
    };

    // Cargar datos de la candidatura al editar
    const iniciarEdicion = (item: any) => {
        setEditandoId(item.id);
        setSelectedUser(item.userid.toString());
        setSelectedEleccion(item.eleccionid.toString());
        setPropuesta(item.propuesta);
    };

    // Cancelar edición o limpiar formulario
    const limpiarFormulario = () => {
        setEditandoId(null);
        setPropuesta('');
        setSelectedUser('');
        setSelectedEleccion('');
    };

    // Eliminar candidatura
    const handleEliminar = async (id: number) => {
        if (Platform.OS === 'web') {
            if (window.confirm('¿Estás seguro de que deseas eliminar esta candidatura?')) {
                const { error } = await supabase.from('candidaturas').delete().eq('id', id);
                if (error) {
                    Alert.alert('Error', 'No se pudo eliminar la candidatura.');
                } else {
                    Alert.alert('Eliminado', 'Candidatura eliminada correctamente.');
                    cargarDatos();
                }
            }
        } else {
            Alert.alert(
                'Eliminar candidatura',
                '¿Estás seguro de que deseas eliminar esta candidatura?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                            const { error } = await supabase.from('candidaturas').delete().eq('id', id);
                            if (error) {
                                Alert.alert('Error', 'No se pudo eliminar la candidatura.');
                            } else {
                                Alert.alert('Eliminado', 'Candidatura eliminada correctamente.');
                                cargarDatos();
                            }
                        },
                    },
                ]
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0d6efd" />
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/fondo.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <Text style={styles.title}>
                        {editandoId ? 'Editar Candidatura' : 'Asignar Candidato a Elección'}
                    </Text>
                    <View style={styles.formCard}>
                        <Text style={styles.label}>Selecciona un candidato:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedUser}
                                onValueChange={setSelectedUser}
                                style={styles.picker}
                                enabled={!editandoId}
                            >
                                <Picker.Item label="Selecciona un candidato" value="" />
                                {usuarios.map((user: any) => (
                                    <Picker.Item key={user.id} label={user.username} value={user.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Selecciona una elección:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedEleccion}
                                onValueChange={setSelectedEleccion}
                                style={styles.picker}
                                enabled={!editandoId}
                            >
                                <Picker.Item label="Selecciona una elección" value="" />
                                {elecciones.map((eleccion: any) => (
                                    <Picker.Item key={eleccion.id} label={eleccion.nombre} value={eleccion.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Propuesta del candidato:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe la propuesta"
                            value={propuesta}
                            onChangeText={setPropuesta}
                            multiline
                        />
                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            <TouchableOpacity
                                style={[
                                    styles.btnAgregar,
                                    { backgroundColor: editandoId ? '#198754' : '#0d6efd' },
                                ]}
                                onPress={handleAgregarOActualizar}
                                disabled={submitting}
                            >
                                {editandoId ? (
                                    <MaterialIcons name="check" size={20} color="#fff" />
                                ) : (
                                    <Ionicons name="person-add-outline" size={20} color="#fff" />
                                )}
                                <Text style={styles.btnAgregarText}>
                                    {submitting
                                        ? editandoId
                                            ? 'Actualizando...'
                                            : 'Agregando...'
                                        : editandoId
                                        ? 'Actualizar'
                                        : 'Asignar candidato'}
                                </Text>
                            </TouchableOpacity>
                            {editandoId && (
                                <TouchableOpacity
                                    style={[
                                        styles.btnAgregar,
                                        { backgroundColor: '#dc3545', marginLeft: 8 },
                                    ]}
                                    onPress={limpiarFormulario}
                                >
                                    <MaterialIcons name="close" size={20} color="#fff" />
                                    <Text style={styles.btnAgregarText}>Cancelar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <Text style={[styles.title, { fontSize: 20, marginTop: 24 }]}>
                        Candidaturas registradas
                    </Text>
                    {candidaturas.length === 0 ? (
                        <Text
                            style={{
                                textAlign: 'center',
                                marginTop: 12,
                                color: '#888',
                            }}
                        >
                            No hay candidaturas registradas.
                        </Text>
                    ) : (
                        candidaturas.map((item) => {
                            const usuario = usuarios.find(u => u.id === item.userid);
                            const eleccion = elecciones.find(e => e.id === item.eleccionid);

                            return (
                                <View style={styles.candidaturaCard} key={item.id}>
                                    <Text style={{ color: '#495057', fontSize: 13, marginBottom: 4 }}>
                                        Candidato:{' '}
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {usuario ? usuario.username : 'Desconocido'}
                                        </Text>{' '}
                                        | Elección:{' '}
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {eleccion ? eleccion.nombre : 'Desconocida'}
                                        </Text>
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                                        Propuesta:
                                    </Text>
                                    <Text>{item.propuesta}</Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            marginTop: 8,
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.actionBtn,
                                                { backgroundColor: '#0d6efd' },
                                            ]}
                                            onPress={() => iniciarEdicion(item)}
                                        >
                                            <MaterialIcons name="edit" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.actionBtn,
                                                { backgroundColor: '#dc3545', marginLeft: 8 },
                                            ]}
                                            onPress={() => handleEliminar(item.id)}
                                        >
                                            <MaterialIcons name="delete" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
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
        padding: 18,
        backgroundColor: 'transparent',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0d6efd',
        marginBottom: 18,
        textAlign: 'center',
    },
    label: {
        fontWeight: '700',
        fontSize: 15,
        color: '#2c3e50',
        marginBottom: 6,
        marginTop: 8,
    },
    pickerContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1.2,
        borderColor: '#ced4da',
        marginBottom: 12,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 48,
        color: '#2c3e50',
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1.2,
        borderColor: '#ced4da',
        fontSize: 15,
        color: '#2c3e50',
        marginBottom: 16,
        marginTop: 4,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    btnAgregar: {
        backgroundColor: '#0d6efd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
        marginTop: 10,
    },
    btnAgregarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
    },
    candidaturaCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 6,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});