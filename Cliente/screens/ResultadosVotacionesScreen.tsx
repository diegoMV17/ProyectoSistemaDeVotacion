import React, { useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, StyleSheet,
    ScrollView, TouchableOpacity, Modal, Button
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ResultadosVotacionesScreen() {
    const [resultados, setResultados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [eleccionModal, setEleccionModal] = useState<any>(null);

    useEffect(() => {
        cargarResultados();
    }, []);

    const cargarResultados = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('votos')
            .select(`
                eleccionid,
                eleccions(nombre),
                candidaturaid,
                candidaturas(propuesta, users(username))
            `);

        if (!error && data) {
            const conteo = data.reduce((acc: any, curr: any) => {
                const key = `${curr.eleccionid}-${curr.candidaturaid}`;
                if (!acc[key]) {
                    acc[key] = { ...curr, count: 1 };
                } else {
                    acc[key].count += 1;
                }
                return acc;
            }, {});
            setResultados(Object.values(conteo));
        }
        setLoading(false);
    };

    const agrupados = resultados.reduce((acc, curr) => {
        const key = curr.eleccionid;
        if (!acc[key]) acc[key] = { nombre: curr.eleccions?.nombre, resultados: [] };
        acc[key].resultados.push(curr);
        return acc;
    }, {});

    const abrirModal = (eleccion: any) => {
        setEleccionModal(eleccion);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando resultados...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Resultados de Votaciones</Text>
            {Object.values(agrupados).length === 0 && (
                <Text style={styles.emptyText}>No hay votos registrados.</Text>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
                {Object.values(agrupados).map((eleccion: any, idx: number) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.eleccionCard}
                        onPress={() => abrirModal(eleccion)}
                    >
                        <Text style={styles.eleccionNombre}>{eleccion.nombre}</Text>
                        {eleccion.resultados.map((res: any) => (
                            <View key={res.candidaturaid} style={styles.resultRow}>
                                <Text style={styles.candidato}>
                                    {res.candidaturas?.users?.username || 'Candidato desconocido'}
                                </Text>
                                <Text style={styles.propuesta}>“{res.candidaturas?.propuesta || 'Sin propuesta'}”</Text>
                                <Text style={styles.votos}>Votos: {res.count}</Text>
                            </View>
                        ))}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Estadísticas de: {eleccionModal?.nombre}</Text>
                        {eleccionModal && (
                            <>
                                {(() => {
                                    const totalVotos = eleccionModal.resultados.reduce((sum: number, r: any) => sum + r.count, 0);
                                    return eleccionModal.resultados.map((res: any) => {
                                        const porcentaje = totalVotos > 0 ? ((res.count / totalVotos) * 100).toFixed(2) : 0;
                                        return (
                                            <View key={res.candidaturaid} style={styles.modalResult}>
                                                <Text style={styles.modalUsername}>
                                                    {res.candidaturas?.users?.username || 'Candidato desconocido'}
                                                </Text>
                                                <Text style={styles.modalPropuesta}>“{res.candidaturas?.propuesta}”</Text>
                                                <Text style={styles.modalVotos}>
                                                    {res.count} votos ({porcentaje}%)
                                                </Text>
                                            </View>
                                        );
                                    });
                                })()}
                                <Text style={styles.totalVotos}>
                                    Total de votos: {eleccionModal.resultados.reduce((sum: number, r: any) => sum + r.count, 0)}
                                </Text>
                            </>
                        )}
                        <Button title="Cerrar" color="#007AFF" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#111' },
    eleccionCard: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    eleccionNombre: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
    resultRow: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F0F4F8',
        borderRadius: 8,
    },
    candidato: { fontWeight: 'bold', fontSize: 16, color: '#111' },
    propuesta: { fontSize: 14, fontStyle: 'italic', color: '#555' },
    votos: { fontSize: 15, color: '#007AFF', fontWeight: 'bold' },
    emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 20 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '85%',
        alignItems: 'center',
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalResult: {
        marginBottom: 12,
        alignItems: 'center',
    },
    modalUsername: { fontWeight: 'bold', fontSize: 16 },
    modalPropuesta: { fontSize: 14, fontStyle: 'italic', color: '#444', textAlign: 'center' },
    modalVotos: { fontSize: 15, color: '#007AFF', marginTop: 4 },
    totalVotos: { marginTop: 20, fontWeight: 'bold', fontSize: 16 },
});
