import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function PanelVotanteScreen() {
    const navigation = useNavigation();
    console.log('Usuario actual:', supabase.auth.user);

    return (
        <View style={styles.bg}>
            <View style={styles.dashboardContainer}>
                {/* Logo institucional vectorial */}
                <View style={styles.logoContainer}>
                    <Ionicons name="school" size={80} color="#3498db" />
                </View>
                <Text style={styles.sectionTitle}>Panel de Votante</Text>
                <View style={styles.profileSection}>
                    <Text style={styles.welcomeText}>Bienvenido a la Aplicación</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Votante</Text>
                    </View>
                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary]}
                        onPress={() => navigation.navigate('Perfil' as never)}
                    >
                        <Ionicons name="person" size={22} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>Editar Perfil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dashboardContainer: {
        width: '98%',
        maxWidth: 600,
        backgroundColor: '#fff',
        padding: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
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
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#3498db',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    sectionTitle: {
        color: '#2c3e50',
        fontWeight: '700',
        fontSize: 28,
        marginBottom: 18,
        letterSpacing: 0.5,
        borderBottomWidth: 2,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
        width: '100%',
        textAlign: 'center',
    },
    profileSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        width: '100%',
    },
    welcomeText: {
        color: '#2c3e50',
        fontWeight: '600',
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    roleBadge: {
        backgroundColor: '#3498db',
        borderRadius: 50,
        paddingVertical: 6,
        paddingHorizontal: 22,
        alignSelf: 'center',
    },
    roleBadgeText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 16,
        marginTop: 8,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 28,
        marginHorizontal: 8,
        marginTop: 8,
        flex: 1,
        justifyContent: 'center',
        shadowColor: '#3498db',
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
    btnPrimary: {
        backgroundColor: '#3498db',
    },
    btnSecondary: {
        backgroundColor: '#34495e',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 1,
        textAlign: 'center',
    },
});