import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function PanelVotanteScreen() {
    const navigation = useNavigation();
    console.log('Usuario actual:', supabase.auth.user);

    const actions = [
        {
            label: 'Editar Perfil',
            icon: 'person',
            color: '#34495e',
            screen: 'Perfil',
        },
        {
            label: 'Resultados',
            icon: 'bar-chart-outline',
            color: '#e74c3c',
            screen: 'Resulados',
        },
        {
            label: 'Realizar Votación',
            icon: 'checkmark-circle-outline',
            color: '#27ae60',
            screen: 'Realizar Votacion',
        },
    ];

    return (
        <ImageBackground
            source={require('../assets/fondo.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.dashboardContainer}>
                    {/* Logo institucional vectorial */}
                    <View style={styles.logoContainer}>
                        <Ionicons name="school" size={80} color="#3498db" />
                    </View>
                    <Text style={styles.sectionTitle}>Panel de Votante</Text>
                    <View style={styles.profileSection}>
                        <Text style={styles.welcomeText}>Bienvenido a la Aplicación</Text>
                        <View style={styles.roleBadge}>
                            <Ionicons name="shield-checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.roleBadgeText}>Votante</Text>
                        </View>
                    </View>
                    <View style={styles.actionsContainer}>
                        {actions.map((action) => (
                            <TouchableOpacity
                                key={action.label}
                                style={[
                                    styles.actionCard,
                                    { shadowColor: action.color },
                                    Platform.OS === 'web' ? { cursor: 'pointer' } : {},
                                ]}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate(action.screen as never)}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: action.color + '22' }]}>
                                    <Ionicons name={action.icon as any} size={28} color={action.color} />
                                </View>
                                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
        padding: 32,
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
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#3498db',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        color: '#2c3e50',
        fontWeight: '700',
        fontSize: 26,
        marginBottom: 14,
        letterSpacing: 0.5,
        borderBottomWidth: 2,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 6,
        width: '100%',
        textAlign: 'center',
    },
    profileSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 18,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        alignItems: 'center',
        width: '100%',
    },
    welcomeText: {
        color: '#2c3e50',
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    roleBadge: {
        flexDirection: 'row',
        backgroundColor: '#3498db',
        borderRadius: 50,
        paddingVertical: 5,
        paddingHorizontal: 18,
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    roleBadgeText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    actionsContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 18,
    },
    actionCard: {
        backgroundColor: '#f7fafd',
        borderRadius: 14,
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: 'center',
        marginBottom: 14,
        width: '47%',
        minWidth: 150,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e3e9f7',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eaf1fb',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});