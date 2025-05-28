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
    Pressable,
    ScrollView,
    ImageBackground
} from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AgregarVotacionScreen() {
    const [elecciones, setElecciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [eleccionSeleccionada, setEleccionSeleccionada] = useState<any>(null);
    const [candidaturas, setCandidaturas] = useState<any[]>([]);
    const [candidaturaSeleccionada, setCandidaturaSeleccionada] = useState<any>(null);
    const [votando, setVotando] = useState(false);

    // Solo se puede votar en una elección en todo el sistema
    const [yaVotoEnAlguna, setYaVotoEnAlguna] = useState(false);

    const [userid, setUserId] = useState<number | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        AsyncStorage.getItem('usuario').then((json: string | null) => {
            if (json) {
                const usuario = JSON.parse(json);
                setUserId(usuario.id);
                verificarSiYaVotoEnAlguna(usuario.id);
            }
        });
        cargarElecciones();
    }, []);

    // Solo cargar elecciones activas
    const cargarElecciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('eleccions')
            .select('*')
            .eq('estado', 'activa')
            .order('fecha_inicio', { ascending: false });
        if (!error) setElecciones(data || []);
        setLoading(false);
    };

    // Cargar solo candidaturas activas (requiere campo estado en candidaturas)
    const cargarCandidaturas = async (eleccionId: number) => {
        const { data, error } = await supabase
            .from('candidaturas')
            .select('id, propuesta, userid, users(username)')
            .eq('eleccionid', eleccionId);
        // Si tu tabla candidaturas NO tiene campo estado, elimina el filtro
        if (!error) setCandidaturas(data || []);
        else setCandidaturas([]);
    };

    // Verifica si el usuario ya votó en alguna elección
    const verificarSiYaVotoEnAlguna = async (userId: number) => {
        const { data } = await supabase
            .from('votos')
            .select('id')
            .eq('userid', userId)
            .maybeSingle();
        setYaVotoEnAlguna(!!data);
    };

    // Solo permite votar si la elección está activa
    const handleSeleccion = async (eleccion: any) => {
        if (eleccion.estado !== 'activa') {
            Alert.alert('No disponible', 'Solo puedes votar en elecciones activas.');
            return;
        }
        setEleccionSeleccionada(eleccion);
        setCandidaturaSeleccionada(null);
        if (!yaVotoEnAlguna) {
            await cargarCandidaturas(eleccion.id);
        }
        setModalVisible(true);
    };

    const guardarVoto = async () => {
        if (yaVotoEnAlguna) {
            return;
        }
        if (!userid) {
            Alert.alert('Error', 'No se encontró el usuario en sesión');
            return;
        }
        if (!eleccionSeleccionada || !eleccionSeleccionada.id) {
            Alert.alert('Error', 'No se seleccionó una elección');
            return;
        }
        if (!candidaturaSeleccionada || !candidaturaSeleccionada.id) {
            Alert.alert('Error', 'Debes seleccionar una candidatura');
            return;
        }

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
            Alert.alert('Error', 'No se pudo guardar el voto');
        } else {
            Alert.alert('Éxito', '¡Voto guardado!');
            setYaVotoEnAlguna(true);
            setModalVisible(false);
            setCandidaturaSeleccionada(null);
            setEleccionSeleccionada(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4361ee" />
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.dashboardContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="school" size={64} color="#3498db" />
                    </View>
                    <Text style={styles.title}>Votaciones Disponibles</Text>
                    <Text style={styles.subtitle}>Total elecciones: {elecciones.length}</Text>
                    <FlatList
                        data={elecciones}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleSeleccion(item)}
                                style={[
                                    styles.touchable,
                                    yaVotoEnAlguna && { opacity: 0.6 }
                                ]}
                                disabled={yaVotoEnAlguna}
                            >
                                <View style={styles.card}>
                                    <Text style={styles.eleccion}>
                                        <Ionicons name="balloon-outline" size={20} color="#3a0ca3" /> {item.nombre || 'Sin nombre'}
                                    </Text>
                                    <Text style={styles.descripcion}>{item.descripcion || 'Sin descripción'}</Text>
                                    <Text style={styles.info}>Tipo: <Text style={styles.infoValue}>{item.tipo_representacion}</Text></Text>
                                    <Text style={styles.info}>Estado: <Text style={styles.infoValue}>{item.estado}</Text></Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No hay elecciones disponibles.</Text>}
                        style={{ width: '100%' }}
                    />

                    {/* Modal para votar */}
                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    <Ionicons name="balloon-outline" size={22} color="#4361ee" /> Votar en: <Text style={{ color: '#4361ee' }}>{eleccionSeleccionada?.nombre}</Text>
                                </Text>
                                {yaVotoEnAlguna ? (
                                    <>
                                        <Text style={{ color: '#e74c3c', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' }}>
                                            Ya has votado en una elección. Solo puedes votar una vez.
                                        </Text>
                                        <View style={styles.modalBtnRow}>
                                            <TouchableOpacity
                                                style={styles.btnCancel}
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    navigation.goBack();
                                                }}
                                            >
                                                <Text style={styles.btnCancelText}>Volver al panel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.modalSubtitle}>Selecciona una candidatura:</Text>
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
                                                        color: candidaturaSeleccionada?.id === cand.id ? '#fff' : '#22223b',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {cand.users?.username || 'Candidato desconocido'}
                                                    </Text>
                                                    <Text style={{
                                                        color: candidaturaSeleccionada?.id === cand.id ? '#fff' : '#555',
                                                        fontSize: 13,
                                                        marginTop: 2
                                                    }}>
                                                        {cand.propuesta}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                        <View style={styles.modalBtnRow}>
                                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                                <Text style={styles.btnCancelText}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.btnVotar,
                                                    (!candidaturaSeleccionada || votando) && { opacity: 0.6 }
                                                ]}
                                                onPress={guardarVoto}
                                                disabled={!candidaturaSeleccionada || votando}
                                            >
                                                <Text style={styles.btnVotarText}>{votando ? "Guardando..." : "Votar"}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </Modal>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    dashboardContainer: {
        width: '98%',
        maxWidth: 500,
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        shadowColor: '#2c3e50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 24,
        elevation: 10,
        alignItems: 'center',
    },
    logoContainer: {
        backgroundColor: '#ecf0f1',
        borderRadius: 60,
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#3498db',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        color: '#3a0ca3',
        fontWeight: '700',
        fontSize: 24,
        marginBottom: 6,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 18,
        textAlign: 'center',
    },
    touchable: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#f7fafd',
        padding: 18,
        borderRadius: 14,
        shadowColor: '#4361ee',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
        borderLeftWidth: 5,
        borderLeftColor: '#4361ee',
    },
    eleccion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3a0ca3',
        marginBottom: 4,
    },
    descripcion: {
        fontSize: 15,
        color: '#22223b',
        marginBottom: 4,
    },
    info: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    infoValue: {
        fontWeight: 'bold',
        color: '#4361ee',
    },
    separator: {
        height: 10,
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
        padding: 26,
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
        fontSize: 20,
        marginBottom: 10,
        color: '#3a0ca3',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#22223b',
        marginBottom: 8,
        textAlign: 'center',
    },
    candidaturaItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eaf1ff',
        marginBottom: 8,
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderLeftColor: '#3a0ca3',
    },
    candidaturaItemSelected: {
        backgroundColor: '#4361ee',
        borderLeftColor: '#3a0ca3',
    },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 14,
        marginTop: 18,
        width: '100%',
        justifyContent: 'center',
    },
    btnCancel: {
        backgroundColor: '#e3e7ef',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 100,
    },
    btnCancelText: {
        color: '#3a0ca3',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnVotar: {
        backgroundColor: '#4361ee',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 100,
    },
    btnVotarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
});