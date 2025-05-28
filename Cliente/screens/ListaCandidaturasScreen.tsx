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
    ScrollView,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
                <ActivityIndicator size="large" color="#4f8cff" />
                <Text style={styles.loadingText}>Cargando elecciones...</Text>
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
                <Text style={styles.title}>Candidaturas por Elección</Text>
                <Text style={styles.subtitle}>Total elecciones: {elecciones.length}</Text>
                <FlatList
                    data={elecciones}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSeleccion(item)} style={styles.touchable}>
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="school" size={22} color="#4f8cff" style={{ marginRight: 8 }} />
                                    <Text style={styles.eleccion}>{item.nombre || 'Sin nombre'}</Text>
                                </View>
                                <Text style={styles.descripcion}>
                                    <Ionicons name="document-text-outline" size={16} color="#4f8cff" />{' '}
                                    {item.descripcion || 'Sin descripción'}
                                </Text>
                                <View style={styles.infoRow}>
                                    <Ionicons name="people-outline" size={16} color="#4f8cff" />
                                    <Text style={styles.infoLabel}>Tipo:</Text>
                                    <Text style={styles.infoValue}>{item.tipo_representacion}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="checkmark-circle-outline" size={16} color={item.estado === 'ACTIVA' ? '#27ae60' : '#888'} />
                                    <Text style={styles.infoLabel}>Estado:</Text>
                                    <Text style={[styles.infoValue, { color: item.estado === 'ACTIVA' ? '#27ae60' : '#888' }]}>{item.estado}</Text>
                                </View>
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
                            <Text style={styles.modalTitle}>
                                <Ionicons name="people-circle-outline" size={22} color="#4f8cff" />{' '}
                                Candidaturas de: <Text style={{ color: '#4f8cff' }}>{eleccionSeleccionada?.nombre}</Text>
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
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                            <Ionicons name="person" size={16} color="#4f8cff" />
                                            <Text style={styles.candidatoNombre}>
                                                {cand.userprofiles?.nombres
                                                    ? `${cand.userprofiles.nombres} ${cand.userprofiles.apellidos}`
                                                    : cand.users?.username
                                                        ? cand.users.username
                                                        : 'Candidato desconocido'}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="bulb-outline" size={14} color="#4f8cff" />
                                            <Text style={styles.candidatoPropuesta}>{cand.propuesta}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                            <View style={{ marginTop: 16 }}>
                                <Pressable onPress={() => setModalVisible(false)} style={styles.btnCerrar}>
                                    <Text style={styles.btnCerrarText}>Cerrar</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: 10,
        shadowColor: '#4f8cff',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.96)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#4f8cff',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 18,
        textAlign: 'center',
    },
    touchable: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: '#f7faff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#4f8cff',
        shadowOpacity: 0.10,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 6,
        borderLeftColor: '#4f8cff',
        marginBottom: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eleccion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4f8cff',
    },
    descripcion: {
        fontSize: 15,
        color: '#333',
        marginTop: 2,
        marginBottom: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: '#555',
        marginLeft: 6,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#222',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    estado: {
        fontSize: 15,
        marginTop: 4,
        color: '#198754',
    },
    separator: {
        height: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 18,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#4f8cff',
        shadowOpacity: 0.13,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 12,
        color: '#4f8cff',
        textAlign: 'center',
    },
    candidaturaItem: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#eaf1ff',
        marginBottom: 12,
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderLeftColor: '#4f8cff',
        width: '100%',
    },
    candidatoNombre: {
        color: '#263159',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
    },
    candidatoPropuesta: {
        color: '#222',
        fontSize: 14,
        marginLeft: 6,
        marginTop: 2,
    },
    btnCerrar: {
        padding: 14,
        backgroundColor: '#4f8cff',
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
        marginTop: 8,
    },
    btnCerrarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
});