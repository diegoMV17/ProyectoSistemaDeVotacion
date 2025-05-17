# Paso a paso para crear el proyecto:

# Instalar Expo CLI (solo si no funciona la instalción del siguiente paso: Crea el proyecto con TypeScript)
npm install -g expo-cli


# Crea el proyecto con TypeScript
npx create-expo-app mi-proyecto-expo-ts -t expo-template-blank-typescript
# Esto va a crear una carpeta llamada mi-proyecto-expo-ts con TypeScript preconfigurado.

# abrir el proyecto en la terminal VSCode
cd mi-proyecto-expo-ts

# Ejecutar el proyecto (se recomienda npx)
npm start
npx expo start

# para permitir la ejecución en web
npx expo install react-native-web react-dom react-native-screens react-native-safe-area-context


# archivos iniciales del proyecto
mi-proyecto-expo-ts/
├── App.tsx               ← Archivo principal de la app
├── tsconfig.json         ← Configuración de TypeScript
├── app.json              ← Configuración del proyecto Expo
├── assets/               ← Imágenes y recursos estáticos
└── ...


# resumen de la estructura del proyecto:
mi-proyecto-expo-ts/
├── App.tsx
├── app/                   ← Navegación (React Navigation)
│   └── navigation.tsx
├── components/            ← Componentes reutilizables
│   └── Header.tsx
├── constants/             ← Constantes como colores, textos, rutas
│   └── colors.ts
├── hooks/                 ← Hooks personalizados (custom hooks)
│   └── useCounter.ts
├── screens/               ← Vistas o pantallas
│   ├── HomeScreen.tsx
│   └── ProductScreen.tsx
├── assets/                ← Imágenes, fuentes, sonidos
├── tsconfig.json
├── package.json
├── app.json


# estructura formal del proyecto
MI-PROYECTO-EXPO-TS/
│
├── .expo/                        # Archivos internos de Expo (ocultos por defecto)
├── app/
│   ├── navigation.tsx           # Archivo para configurar la navegación (React Navigation)
│   ├── assets/                  # Carpeta para imágenes, íconos, etc.
│   ├── constants/               # Constantes reutilizables (colores, estilos, etc.)
│   ├── node_modules/            # Módulos instalados con npm
│   └── screens/                 # Pantallas de la aplicación
│       ├── HomeScreen.tsx       # Pantalla de inicio
│       ├── InventoryScreen.tsx  # Pantalla para el inventario
│       ├── ProductScreen.tsx    # Pantalla para productos
│       ├── ProfileScreen.tsx    # Pantalla de perfil de usuario
│
├── .gitignore                   # Archivos y carpetas a ignorar por Git
├── app.json                     # Configuración general del proyecto Expo
├── App.tsx                      # Componente raíz de la aplicación
├── index.ts                     # Punto de entrada principal
├── package-lock.json            # Versión exacta de dependencias instaladas
├── package.json                 # Dependencias y scripts del proyecto
├── readme.md                    # Documentación del proyecto
└── tsconfig.json                # Configuración del compilador TypeScript



# Configurar la navegación (React Navigation)
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/native-stack

# Bottom Tab Navigation CON EXPO Y TYPESCRIPT (menú inferior con pestañas o componente Header)
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

#  instalar íconos
npx expo install @expo/vector-icons


# Actualizar el proyecto expo a la última versión---------------------------------------------------

# 1. Instalar el CLI global de Expo:
npm install -g expo-cli

# 2.Ejecutar el comando de upgrade
expo upgrade

// seguir las sugerencias del asistente (y)

# 3. Verificar archivos actualizados: package.json
package.json:

"dependencies": {
  "expo": "^53.0.0",
  "react-native": "0.7x.x",
  ...
}
--------------------------------------------------------------------------------------------------

# _____________________________________________________________________________
# Opcional (si no tomó los cambios) Limpiar y volver a iniciar:

// Ejecuta instalación limpia
rm -rf node_modules
npm install

expo start --clear  
// --clear limpia caché y asegura una carga limpia del proyecto.
# _____________________________________________________________________________



# Para persistencia AsyncStorage

1. instalar AsyncStorage
npx expo install @react-native-async-storage/async-storage

# para otros elementos (lista select)
npm install @react-native-picker/picker

# -- --- -- --- --- 15 y 16 de mayo -- --- -- --- --- -- --- -- --- ----- --- -- --- ----- --- -- --- ---
# para instalar librería para exportar el registro del inventario
npx expo install expo-file-system expo-sharing
npx expo install expo-media-library


# Instalar el SDK de Supabase en el proyecto
npm install @supabase/supabase-js@1.35.6


npm install @supabase/supabase-js bcrypt
npm install bcryptjs dotenv
npm install -D ts-node typescript
npm install bcryptjs

# si se usa la última versión se tienen que actualizar los scripts
npm install @supabase/supabase-js@latest

#  tablas para la base de datos en supabase:

base de datos:
inventario_usta

create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric not null,
  condicion text check (condicion in ('nuevo', 'usado')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);


create table if not exists users (
  id serial primary key,
  identificacion varchar(20) not null,
  username varchar(50) not null unique,
  password_hash varchar(255) not null,
  role varchar(20) check (role in ('ADMIN', 'ADMINISTRATIVO', 'CANDIDATO', 'VOTANTE')) not null
);


# crear al usuario ADMIN de la app
node scripts/crearAdmin.js

# esta la podemos usar en un entorno de producción diferente a expo go
npm install react-native-quick-crypto
