# Guía para crear una aplicación con Expo y TypeScript

# Repositorio GitHub
https://github.com/diegoMV17/ProyectoSistemaDeVotacion

## Instalación inicial
npm install

npm install -g expo-cli
npx create-expo-app mi-proyecto-expo-ts -t expo-template-blank-typescript
cd mi-proyecto-expo-ts
npm start
# o
npx expo start


## Habilitar soporte web

npx expo install react-native-web react-dom react-native-screens react-native-safe-area-context

## Estructura inicial del proyecto


mi-proyecto-expo-ts/
├── App.tsx
├── app/
│   ├── navigation.tsx
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── screens/
├── assets/
├── tsconfig.json
├── package.json
├── app.json

## Instalación de navegación

npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs

## Íconos y utilidades

npx expo install @expo/vector-icons

## Actualizar proyecto Expo

npm install -g expo-cli
expo upgrade

> Si es necesario, limpiar instalación:
rm -rf node_modules
npm install
expo start --clear

## Librerías adicionales

* **Persistencia (AsyncStorage)**:

  npx expo install @react-native-async-storage/async-storage

* **Selector (Picker)**:

  npm install @react-native-picker/picker


* **Exportar archivos**:

  npx expo install expo-file-system expo-sharing expo-media-library

* **Supabase SDK**:
  npm install @supabase/supabase-js


* **Utilidades extra**:

  npm install bcryptjs dotenv
  npm install -D ts-node typescript

## Scripts últiles

* Crear usuario administrador (ejecutar desde un script local).
* Alternativas para entornos de producción:

  npm install react-native-quick-crypto

