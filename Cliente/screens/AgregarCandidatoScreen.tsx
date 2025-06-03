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

export default function AddCandidateScreen() {
    const [users, setUsers] = useState<any[]>([]);
    const [elections, setElections] = useState<any[]>([]);
    const [candidacies, setCandidacies] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedElectionId, setSelectedElectionId] = useState<string>('');
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        const { data: usersData } = await supabase
            .from('users')
            .select('id, username, role')
            .eq('role', 'CANDIDATO');
        const { data: electionsData } = await supabase
            .from('eleccions')
            .select('id, nombre');
        const { data: candidaciesData } = await supabase
            .from('candidaturas')
            .select('id, propuesta, userid, eleccionid');

        setUsers(usersData || []);
        setElections(electionsData || []);
        setCandidacies(candidaciesData || []);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedUserId || !selectedElectionId || !proposal.trim()) {
            Alert.alert('Todos los campos son obligatorios');
            return;
        }

        const userId = Number(selectedUserId);
        const electionId = Number(selectedElectionId);

        if (isNaN(userId) || isNaN(electionId) || userId <= 0 || electionId <= 0) {
            Alert.alert('Selecciona un candidato y una elección válidos');
            return;
        }

        setIsSubmitting(true);

        if (editingId) {
            const { error } = await supabase
                .from('candidaturas')
                .update({ propuesta: proposal })
                .eq('id', editingId);

            setIsSubmitting(false);

            if (error) {
                Alert.alert('Error', 'No se pudo actualizar la candidatura.');
            } else {
                Alert.alert('Éxito', 'Candidatura actualizada');
                resetForm();
                loadData();
            }
        } else {
            const { data: existing } = await supabase
                .from('candidaturas')
                .select('id')
                .eq('userid', userId)
                .eq('eleccionid', electionId)
                .maybeSingle();

            if (existing) {
                setIsSubmitting(false);
                Alert.alert('Este candidato ya está asignado a esta elección');
                return;
            }

            const newCandidacy = {
                propuesta: proposal,
                userid: userId,
                eleccionid: electionId,
            };

            const { error } = await supabase.from('candidaturas').insert([newCandidacy]);

            setIsSubmitting(false);

            if (error) {
                Alert.alert('Error', 'No se pudo registrar la candidatura. Intenta nuevamente.');
            } else {
                Alert.alert('Éxito', 'Candidato asignado a la elección');
                resetForm();
                loadData();
            }
        }
    };

    const startEditing = (item: any) => {
        setEditingId(item.id);
        setSelectedUserId(item.userid.toString());
        setSelectedElectionId(item.eleccionid.toString());
        setProposal(item.propuesta);
    };

    const resetForm = () => {
        setEditingId(null);
        setProposal('');
        setSelectedUserId('');
        setSelectedElectionId('');
    };

    const handleDelete = async (id: number) => {
        const deleteCandidacy = async () => {
            const { error } = await supabase.from('candidaturas').delete().eq('id', id);
            if (error) {
                Alert.alert('Error', 'No se pudo eliminar la candidatura.');
            } else {
                Alert.alert('Eliminado', 'Candidatura eliminada correctamente.');
                loadData();
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('¿Estás seguro de que deseas eliminar esta candidatura?')) {
                await deleteCandidacy();
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
                        onPress: deleteCandidacy,
                    },
                ]
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0d6efd" />
            </View>
        );
    }

    return (
        <ImageBackground source={require('../assets/fondo.png')} style={styles.bg} resizeMode="cover">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <Text style={styles.title}>
                        {editingId ? 'Editar Candidatura' : 'Asignar Candidato a Elección'}
                    </Text>
                    <View style={styles.formCard}>
                        <Text style={styles.label}>Selecciona un candidato:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedUserId}
                                onValueChange={setSelectedUserId}
                                style={styles.picker}
                                enabled={!editingId}
                            >
                                <Picker.Item label="Selecciona un candidato" value="" />
                                {users.map((user: any) => (
                                    <Picker.Item key={user.id} label={user.username} value={user.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Selecciona una elección:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedElectionId}
                                onValueChange={setSelectedElectionId}
                                style={styles.picker}
                                enabled={!editingId}
                            >
                                <Picker.Item label="Selecciona una elección" value="" />
                                {elections.map((election: any) => (
                                    <Picker.Item key={election.id} label={election.nombre} value={election.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Propuesta del candidato:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe la propuesta"
                            value={proposal}
                            onChangeText={setProposal}
                            multiline
                        />
                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            <TouchableOpacity
                                style={[
                                    styles.btnAdd,
                                    { backgroundColor: editingId ? '#198754' : '#0d6efd' },
                                ]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {editingId ? (
                                    <MaterialIcons name="check" size={20} color="#fff" />
                                ) : (
                                    <Ionicons name="person-add-outline" size={20} color="#fff" />
                                )}
                                <Text style={styles.btnAddText}>
                                    {isSubmitting
                                        ? editingId
                                            ? 'Actualizando...'
                                            : 'Agregando...'
                                        : editingId
                                        ? 'Actualizar'
                                        : 'Asignar candidato'}
                                </Text>
                            </TouchableOpacity>
                            {editingId && (
                                <TouchableOpacity
                                    style={[styles.btnAdd, { backgroundColor: '#dc3545', marginLeft: 8 }]}
                                    onPress={resetForm}
                                >
                                    <MaterialIcons name="close" size={20} color="#fff" />
                                    <Text style={styles.btnAddText}>Cancelar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <Text style={[styles.title, { fontSize: 20, marginTop: 24 }]}>Candidaturas registradas</Text>
                    {candidacies.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 12, color: '#888' }}>
                            No hay candidaturas registradas.
                        </Text>
                    ) : (
                        candidacies.map((item) => {
                            const user = users.find(u => u.id === item.userid);
                            const election = elections.find(e => e.id === item.eleccionid);

                            return (
                                <View style={styles.candidaturaCard} key={item.id}>
                                    <Text style={{ color: '#495057', fontSize: 13, marginBottom: 4 }}>
                                        Candidato:{' '}
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {user ? user.username : 'Desconocido'}
                                        </Text>{' '}
                                        | Elección:{' '}
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {election ? election.nombre : 'Desconocida'}
                                        </Text>
                                    </Text>
                                    <Text style={{ fontWeight: 'bold', color: '#0d6efd' }}>Propuesta:</Text>
                                    <Text>{item.propuesta}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'flex-end' }}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#0d6efd' }]}
                                            onPress={() => startEditing(item)}
                                        >
                                            <MaterialIcons name="edit" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#dc3545', marginLeft: 8 }]}
                                            onPress={() => handleDelete(item.id)}
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
    btnAdd: {
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
    btnAddText: {
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