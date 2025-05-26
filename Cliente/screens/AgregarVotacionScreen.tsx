import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    Button,
    Pressable,
    ScrollView
} from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgregarVotacionScreen() {
    const [elecciones, setElecciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [eleccionSeleccionada, setEleccionSeleccionada] = useState<any>(null);
    const [candidaturas, setCandidaturas] = useState<any[]>([]);
    const [candidaturaSeleccionada, setCandidaturaSeleccionada] = useState<any>(null);
    const [votando, setVotando] = useState(false);

    const [userid, setUserId] = useState<number | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('usuario').then((json: string | null) => {
      if (json) {
        const usuario = JSON.parse(json);
        setUserId(usuario.id);
      }});
        cargarElecciones();
    }, []);


    const cargarElecciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('eleccions')
            .select('*')
            .order('fecha_inicio', { ascending: false });
        if (!error) setElecciones(data || []);
        setLoading(false);
    };

    const cargarCandidaturas = async (eleccionId: number) => {
        const { data, error } = await supabase
            .from('candidaturas')
            .select('id, propuesta, userid, users(username)')
            .eq('eleccionid', eleccionId);
        if (!error) setCandidaturas(data || []);
        else setCandidaturas([]);
    };

    const handleSeleccion = async (eleccion: any) => {
        setEleccionSeleccionada(eleccion);
        setCandidaturaSeleccionada(null);
        await cargarCandidaturas(eleccion.id);
        setModalVisible(true);
    };

    const guardarVoto = async () => {
        // Validaciones previas
        if (!userid) {
            Alert.alert('Error', 'No se encontró el usuario en sesión');
            console.log('userId es nulo o indefinido:', userid);
            return;
        }
        if (!eleccionSeleccionada || !eleccionSeleccionada.id) {
            Alert.alert('Error', 'No se seleccionó una elección');
            console.log('eleccionSeleccionada es nulo o sin id:', eleccionSeleccionada);
            return;
        }
        if (!candidaturaSeleccionada || !candidaturaSeleccionada.id) {
            Alert.alert('Error', 'Debes seleccionar una candidatura');
            console.log('candidaturaSeleccionada es nulo o sin id:', candidaturaSeleccionada);
            return;
        }

        // Mostrar los datos antes de guardar
        console.log('Intentando guardar voto con:', {
            userid,
            eleccionid: eleccionSeleccionada.id,
            candidaturaid: candidaturaSeleccionada.id,
        });

        setVotando(true);
        const { error } = await supabase.from('votos').insert([
            {
                userid,
                eleccionid: eleccionSeleccionada.id,
                candidaturaid: candidaturaSeleccionada.id,
            },
        ]);
        setVotando(false);

        if (error) {
            console.log('Error al guardar voto:', error);
            Alert.alert('Error', 'No se pudo guardar el voto');
        } else {
            Alert.alert('Éxito', '¡Voto guardado!');
            setModalVisible(false);
            setCandidaturaSeleccionada(null);
            setEleccionSeleccionada(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando elecciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Candidaturas disponibles</Text>
            <Text style={styles.subtitle}>Total elecciones: {elecciones.length}</Text>
            <FlatList
                data={elecciones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSeleccion(item)} style={styles.touchable}>
                        <View style={styles.card}>
                            <Text style={styles.eleccion}>🗳️ {item.nombre || 'Sin nombre'}</Text>
                            <Text style={styles.descripcion}>{item.descripcion || 'Sin descripción'}</Text>
                            <Text style={styles.descripcion}>Tipo de representante: {item.tipo_representacion}</Text>
                            <Text style={styles.descripcion}>Estado: {item.estado}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay elecciones disponibles.</Text>}
            />

            {/* Modal para votar */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
                            Votar en: {eleccionSeleccionada?.nombre}
                        </Text>
                        <Text style={{ marginBottom: 8 }}>Selecciona una candidatura:</Text>
                        <ScrollView style={{ maxHeight: 200, width: '100%', marginTop: 10 }}>
                            {candidaturas.length === 0 && (
                                <Text style={{ color: '#888', textAlign: 'center' }}>No hay candidaturas disponibles.</Text>
                            )}
                            {candidaturas.map((cand: any) => (
                                <Pressable
                                    key={cand.id}
                                    onPress={() => setCandidaturaSeleccionada(cand)}
                                    style={[
                                        styles.candidaturaItem,
                                        candidaturaSeleccionada?.id === cand.id && styles.candidaturaItemSelected
                                    ]}
                                >
                                    <Text style={{
                                        color: candidaturaSeleccionada?.id === cand.id ? '#fff' : '#333',
                                        fontWeight: 'bold'
                                    }}>
                                        {/* Mostrar nombre completo si existe, si no username, si no "Candidato desconocido" */}
                                        {cand.userprofiles?.nombres
                                            ? `${cand.userprofiles.nombres} ${cand.userprofiles.apellidos}`
                                            : cand.users?.username
                                                ? cand.users.username
                                                : 'Candidato desconocido'}
                                    </Text>
                                    <Text style={{
                                        color: candidaturaSeleccionada?.id === cand.id ? '#fff' : '#333',
                                        fontSize: 13,
                                        marginTop: 2
                                    }}>
                                        {cand.propuesta}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                            <Button title="Cancelar" color="#888" onPress={() => setModalVisible(false)} />
                            <Button
                                title={votando ? "Guardando..." : "Votar"}
                                onPress={guardarVoto}
                                disabled={!candidaturaSeleccionada || votando}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    touchable: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    eleccion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    descripcion: {
        fontSize: 15,
        color: '#333',
        marginTop: 6,
    },
    separator: {
        height: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        width: '85%',
        alignItems: 'center',
    },
    candidaturaItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    candidaturaItemSelected: {
        backgroundColor: '#007AFF',
    },
});