import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    ScrollView
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ListaCandidaturasScreen() {
    const [elecciones, setElecciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [eleccionSeleccionada, setEleccionSeleccionada] = useState<any>(null);
    const [candidaturas, setCandidaturas] = useState<any[]>([]);

    useEffect(() => {
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
            .select('id, propuesta, users(username)')
            .eq('eleccionid', eleccionId);
        if (!error) setCandidaturas(data || []);
        else setCandidaturas([]);
    };

    const handleSeleccion = async (eleccion: any) => {
        setEleccionSeleccionada(eleccion);
        await cargarCandidaturas(eleccion.id);
        setModalVisible(true);
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
            <Text style={styles.title}>Candidaturas por Elección</Text>
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

            {/* Modal para ver candidaturas */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
                            Candidaturas de: {eleccionSeleccionada?.nombre}
                        </Text>
                        <ScrollView style={{ maxHeight: 250, width: '100%', marginTop: 10 }}>
                            {candidaturas.length === 0 && (
                                <Text style={{ color: '#888', textAlign: 'center' }}>No hay candidaturas registradas.</Text>
                            )}
                            {candidaturas.map((cand: any) => (
                                <View
                                    key={cand.id}
                                    style={styles.candidaturaItem}
                                >
                                    <Text style={{
                                        color: '#333',
                                        fontWeight: 'bold'
                                    }}>
                                        {cand.userprofiles?.nombres
                                            ? `${cand.userprofiles.nombres} ${cand.userprofiles.apellidos}`
                                            : cand.users?.username
                                                ? cand.users.username
                                                : 'Candidato desconocido'}
                                    </Text>
                                    <Text style={{
                                        color: '#333',
                                        fontSize: 13,
                                        marginTop: 2
                                    }}>
                                        {cand.propuesta}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={{ marginTop: 16 }}>
                            <Pressable onPress={() => setModalVisible(false)} style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 8 }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar</Text>
                            </Pressable>
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
});