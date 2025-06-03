import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, TouchableOpacity, Text } from 'react-native';
import PanelCandidatoScreen from '../screens/PanelCandidatoScreen';
import PanelVotanteScreen from '../screens/PanelVotanteScreen';
import PanelAdministrativoScreen from '../screens/PanelAdministrativoScreen';
import PanelAdminScreen from '../screens/PanelAdminScreen';
import CrearEleccionScreen from '../screens/CrearEleccionScreen';
import EditarEleccionesScreen from '../screens/EditarEleccionScreen';
import AgregarCandidatoScreen from '../screens/AgregarCandidatoScreen';
import AgregarVotacionScreen from '../screens/AgregarVotacionScreen';
import ResultadosVotacionesScreen from '../screens/ResultadosVotacionesScreen';
import ListaCandidaturaScreen from '../screens/ListaCandidaturasScreen';

const Tab = createBottomTabNavigator();

export default function Navigation({ onLogout }: { onLogout: () => void }) {
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const obtenerRol = async () => {
      let usuarioJSON;

      if (Platform.OS === 'web') {
        usuarioJSON = localStorage.getItem('usuario');
      } else {
        usuarioJSON = await AsyncStorage.getItem('usuario');
      }

      if (usuarioJSON) {
        const usuario = JSON.parse(usuarioJSON);
        setRol(usuario.role);
      }
    };

    obtenerRol();
  }, []);

  const headerRight = () => (
    <TouchableOpacity
      onPress={async () => {
        const confirmar = Platform.OS === 'web'
          ? window.confirm('¿Deseas salir de la aplicación?')
          : true;

        if (!confirmar) return;

        if (Platform.OS === 'web') {
          localStorage.removeItem('usuario');
          sessionStorage.setItem('logoutMessage', '🚪 Has cerrado sesión exitosamente');
          window.location.reload();
        } else {
          await AsyncStorage.removeItem('usuario');
          onLogout();
        }
      }}
      style={{
        marginRight: 18,
        backgroundColor: '#e74c3c',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#e74c3c',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Salir</Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help';
            if (route.name === 'Panel') iconName = 'home';
            else if (route.name === 'Perfil') iconName = 'person';
            else if (route.name === 'Usuarios') iconName = 'people';
            else if (route.name === 'Crear Eleccion') iconName = 'checkbox-outline';
            else if (route.name === 'Lista Elecciones') iconName = 'create-outline';
            else if (route.name === 'Asignar Candidato') iconName = 'add-circle-outline';
            else if (route.name === 'Realizar Votacion') iconName = 'checkmark-circle-outline';
            else if (route.name === 'Lista de candidaturas') iconName = 'list-outline';
            else if (route.name === 'Resulados') iconName = 'bar-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerRight,
        })}
      >        
        {rol === 'ADMIN' && (
          <>
            <Tab.Screen name="Panel" component={PanelAdminScreen} />
            <Tab.Screen name="Usuarios" component={UserManagementScreen} />
            <Tab.Screen name="Crear Eleccion" component={CrearEleccionScreen} />
            <Tab.Screen name="Lista Elecciones" component={EditarEleccionesScreen} />
            <Tab.Screen name="Asignar Candidato" component={AgregarCandidatoScreen} />
            <Tab.Screen name="Lista de candidaturas" component={ListaCandidaturaScreen} />
          </>
        )}
        {rol === 'CANDIDATO' && (
          <>
            <Tab.Screen name="Panel" component={PanelCandidatoScreen} />
            <Tab.Screen name="Lista de candidaturas" component={ListaCandidaturaScreen} />
          </>
        )}
        {rol === 'VOTANTE' && (
          <>
            <Tab.Screen name="Panel" component={PanelVotanteScreen} />
            <Tab.Screen name="Realizar Votacion" component={AgregarVotacionScreen} />
            
          </>
        )}
        {rol === 'ADMINISTRATIVO' && (
          <>
            <Tab.Screen name="Panel" component={PanelAdministrativoScreen} />
            <Tab.Screen name="Lista de candidaturas" component={ListaCandidaturaScreen} />
          </>
        )}
        <Tab.Screen name="Resulados" component={ResultadosVotacionesScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
