import React, { useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, StyleSheet,
    ScrollView, TouchableOpacity, Modal, ImageBackground
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

    // Agrupados por elección
    const agrupados = resultados.reduce((acc, curr) => {
        const key = curr.eleccionid;
        if (!acc[key]) acc[key] = { nombre: curr.eleccions?.nombre, resultados: [] };
        acc[key].resultados.push(curr);
        return acc;
    }, {} as Record<string, any>);

    // Estadísticas generales
    const totalVotosGlobal = resultados.reduce((sum, r) => sum + r.count, 0);
    const totalElecciones = Object.keys(agrupados).length;
    const totalCandidaturas = resultados.length;

    const abrirModal = (eleccion: any) => {
        setEleccionModal(eleccion);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4361ee" />
                <Text style={styles.loadingText}>Cargando resultados...</Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={require('../assets/fondo.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Resultados de Votaciones</Text>

                {/* Estadísticas generales */}
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>Total de votos: <Text style={styles.statsValue}>{totalVotosGlobal}</Text></Text>
                    <Text style={styles.statsText}>Total de elecciones: <Text style={styles.statsValue}>{totalElecciones}</Text></Text>
                    <Text style={styles.statsText}>Total de candidaturas: <Text style={styles.statsValue}>{totalCandidaturas}</Text></Text>
                </View>

                {Object.values(agrupados).length === 0 && (
                    <Text style={styles.emptyText}>No hay votos registrados.</Text>
                )}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {Object.values(agrupados).map((eleccion: any, idx: number) => {
                        const totalVotos = eleccion.resultados.reduce((sum: number, r: any) => sum + r.count, 0);
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={styles.eleccionCard}
                                onPress={() => abrirModal(eleccion)}
                                activeOpacity={0.93}
                            >
                                <Text style={styles.eleccionNombre}>{eleccion.nombre}</Text>
                                <View style={styles.barChartContainer}>
                                    {eleccion.resultados.map((res: any, i: number) => {
                                        const porcentajeLocal = totalVotos > 0 ? ((res.count / totalVotos) * 100) : 0;
                                        const porcentajeGlobal = totalVotosGlobal > 0 ? ((res.count / totalVotosGlobal) * 100) : 0;
                                        return (
                                            <View key={res.candidaturaid} style={{ marginBottom: 18 }}>
                                                <View style={styles.barRow}>
                                                    <View style={styles.barLabelContainer}>
                                                        <Text style={styles.barLabel}>
                                                            {res.candidaturas?.users?.username || 'Candidato desconocido'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.barWrapper}>
                                                        <View style={[
                                                            styles.bar,
                                                            { width: `${porcentajeLocal}%`, backgroundColor: barColors[i % barColors.length] }
                                                        ]} />
                                                    </View>
                                                </View>
                                                <View style={styles.barInfoRow}>
                                                    <Text style={styles.barValue}>
                                                        {res.count} votos
                                                    </Text>
                                                    <Text style={styles.barPercent}>
                                                        {porcentajeLocal.toFixed(1)}% elección / {porcentajeGlobal.toFixed(1)}% total
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                                <Text style={styles.totalVotosSmall}>
                                    Total de votos: {totalVotos}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Modal detallado */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Estadísticas de: <Text style={{ color: '#4361ee' }}>{eleccionModal?.nombre}</Text>
                            </Text>
                            {eleccionModal && (
                                <>
                                    {(() => {
                                        const totalVotos = eleccionModal.resultados.reduce((sum: number, r: any) => sum + r.count, 0);
                                        return eleccionModal.resultados.map((res: any, i: number) => {
                                            const porcentajeLocal = totalVotos > 0 ? ((res.count / totalVotos) * 100).toFixed(2) : 0;
                                            const porcentajeGlobal = totalVotosGlobal > 0 ? ((res.count / totalVotosGlobal) * 100).toFixed(2) : 0;
                                            return (
                                                <View key={res.candidaturaid} style={styles.modalResult}>
                                                    <Text style={styles.modalUsername}>
                                                        {res.candidaturas?.users?.username || 'Candidato desconocido'}
                                                    </Text>
                                                    <Text style={styles.modalPropuesta}>“{res.candidaturas?.propuesta}”</Text>
                                                    <View style={styles.progressBarContainer}>
                                                        <View style={[
                                                            styles.progressBar,
                                                            { width: `${Number(porcentajeLocal)}%`, backgroundColor: barColors[i % barColors.length] }
                                                        ]} />
                                                    </View>
                                                    <Text style={styles.modalVotos}>
                                                        {res.count} votos ({porcentajeLocal}% elección / {porcentajeGlobal}% total)
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
                            <TouchableOpacity style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnCerrarText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
}

const barColors = [
    '#4361ee', '#3a86ff', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a0ca3'
];

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.93)',
        padding: 18,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 18,
        marginTop: 8,
        backgroundColor: '#eaf1ff',
        borderRadius: 10,
        padding: 10,
    },
    statsText: {
        fontSize: 15,
        color: '#22223b',
        fontWeight: 'bold',
    },
    statsValue: {
        color: '#4361ee',
        fontWeight: 'bold',
        fontSize: 16,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#4361ee',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    eleccionCard: {
        marginBottom: 22,
        padding: 20,
        backgroundColor: '#f7faff',
        borderRadius: 16,
        shadowColor: '#4361ee',
        shadowOpacity: 0.10,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 6,
        borderLeftColor: '#4361ee',
    },
    eleccionNombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4361ee',
        letterSpacing: 0.2,
    },
    barChartContainer: {
        marginBottom: 10,
        marginTop: 8,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    barLabelContainer: {
        width: 120,
        marginRight: 8,
    },
    barLabel: {
        fontSize: 15,
        color: '#22223b',
        fontWeight: 'bold',
    },
    barWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    barInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 2,
        marginBottom: 8,
    },
    bar: {
        height: 22,
        borderRadius: 8,
        marginRight: 8,
    },
    barValue: {
        fontSize: 15,
        color: '#22223b',
        fontWeight: 'bold',
    },
    barPercent: {
        fontSize: 12,
        color: '#4361ee',
        fontWeight: 'bold',
    },
    totalVotosSmall: {
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 15,
        color: '#3a0ca3',
        textAlign: 'right',
    },
    emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 20 },

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
        width: '90%',
        alignItems: 'center',
        shadowColor: '#4361ee',
        shadowOpacity: 0.13,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 16,
        color: '#3a0ca3',
        textAlign: 'center',
    },
    modalResult: {
        marginBottom: 16,
        alignItems: 'center',
        width: '100%',
    },
    modalUsername: { fontWeight: 'bold', fontSize: 16, color: '#22223b' },
    modalPropuesta: { fontSize: 14, fontStyle: 'italic', color: '#444', textAlign: 'center', marginBottom: 4 },
    modalVotos: { fontSize: 15, color: '#4361ee', marginTop: 4, fontWeight: 'bold' },
    totalVotos: { marginTop: 18, fontWeight: 'bold', fontSize: 16, color: '#3a0ca3' },
    btnCerrar: {
        marginTop: 18,
        backgroundColor: '#4361ee',
        paddingVertical: 12,
        paddingHorizontal: 36,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
    },
    btnCerrarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    progressBarContainer: {
        width: '100%',
        height: 14,
        backgroundColor: '#eaf1ff',
        borderRadius: 6,
        marginTop: 6,
        marginBottom: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
});