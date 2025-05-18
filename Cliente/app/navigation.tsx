import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InventoryScreen from '../screens/InventoryScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, TouchableOpacity, Text } from 'react-native';

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
      style={{ marginRight: 15 }}
    >
      <Text style={{ color: 'red', fontWeight: 'bold' }}>Salir</Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help';
            if (route.name === 'Inicio') iconName = 'home';
            else if (route.name === 'Productos') iconName = 'pricetags';
            else if (route.name === 'Perfil') iconName = 'person';
            else if (route.name === 'Inventario') iconName = 'cube';
            else if (route.name === 'Usuarios') iconName = 'people';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerRight,
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Productos" component={ProductScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
        <Tab.Screen name="Inventario" component={InventoryScreen} />
        {rol === 'ADMIN' && (
          <Tab.Screen name="Usuarios" component={UserManagementScreen} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
