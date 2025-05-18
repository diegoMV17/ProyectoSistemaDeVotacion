import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { InventarioContext, Producto } from './InventarioContext';

const iconosDisponibles = [
  '🧰', '🔩', '🪚', '🧲', '🧤', '🔧', '📏', '🪛',
  '💻', '🖥️', '🖨️', '🖱️', '⌨️', '💾', '📡', '🛜', '🧮', '🧑‍💻',
];

export default function InventoryScreen() {
  const { productos, agregarProducto, editarProducto, eliminarProducto } = useContext(InventarioContext);
  const [nombreProducto, setNombreProducto] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');
  const [iconoSeleccionado, setIconoSeleccionado] = useState<string | null>(null);
  const [condicion, setCondicion] = useState<'nuevo' | 'usado'>('nuevo');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [mensaje, setMensaje] = useState('');

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  const resetFormulario = () => {
    setNombreProducto('');
    setPrecioProducto('');
    setIconoSeleccionado(null);
    setCondicion('nuevo');
    setModoEdicion(false);
    setProductoEditando(null);
  };

  const handleGuardar = async () => {
    if (!nombreProducto || !precioProducto || !iconoSeleccionado) {
      Alert.alert('Campos incompletos', 'Completa todos los campos.');
      return;
    }

    const precio = parseFloat(precioProducto);
    if (isNaN(precio) || precio <= 0) {
      Alert.alert('Precio inválido', 'El precio debe ser un número positivo.');
      return;
    }

    try {
      if (modoEdicion && productoEditando) {
        await editarProducto({
          id: productoEditando.id,
          nombre: `${iconoSeleccionado} ${nombreProducto}`,
          precio,
          condicion,
        });
        mostrarMensaje('✏️ Producto actualizado');
      } else {
        await agregarProducto({
          nombre: `${iconoSeleccionado} ${nombreProducto}`,
          precio,
          condicion,
        });
        mostrarMensaje('✅ Producto agregado');
      }

      resetFormulario();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    }
  };

  const prepararEdicion = (producto: Producto) => {
    const [icono, ...nombre] = producto.nombre.split(' ');
    setIconoSeleccionado(icono);
    setNombreProducto(nombre.join(' '));
    setPrecioProducto(producto.precio.toString());
    setCondicion(producto.condicion);
    setModoEdicion(true);
    setProductoEditando(producto);
  };

  const handleEliminar = (id: string) => {
    Platform.OS === 'web'
      ? window.confirm('¿Eliminar producto?') && eliminarProducto(id)
      : Alert.alert('Eliminar', '¿Estás seguro?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', onPress: () => eliminarProducto(id), style: 'destructive' },
        ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Inventario</Text>

      {mensaje !== '' && (
        <View style={styles.flash}>
          <Text style={styles.flashText}>{mensaje}</Text>
        </View>
      )}

      <View style={styles.form}>
        {modoEdicion && <Text style={styles.editingLabel}>📝 Editando producto...</Text>}

        <Text style={styles.label}>Ícono:</Text>
        <ScrollView horizontal style={styles.iconRow}>
          {iconosDisponibles.map((icono) => (
            <TouchableOpacity
              key={icono}
              style={[styles.iconButton, icono === iconoSeleccionado && styles.iconSelected]}
              onPress={() => setIconoSeleccionado(icono)}
            >
              <Text style={styles.iconText}>{icono}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          placeholder="Nombre del producto"
          style={styles.input}
          value={nombreProducto}
          onChangeText={setNombreProducto}
        />
        <TextInput
          placeholder="Precio"
          style={styles.input}
          value={precioProducto}
          onChangeText={setPrecioProducto}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Condición del producto:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={condicion}
            onValueChange={(itemValue) => setCondicion(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Nuevo" value="nuevo" />
            <Picker.Item label="Usado" value="usado" />
          </Picker>
        </View>

        <Button title={modoEdicion ? 'Actualizar' : 'Agregar'} onPress={handleGuardar} />
        {modoEdicion && (
          <Button title="Cancelar edición" color="#888" onPress={resetFormulario} />
        )}
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.price}>${item.precio.toLocaleString()} - {item.condicion.toUpperCase()}</Text>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => prepararEdicion(item)}>
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEliminar(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  flash: {
    backgroundColor: '#d1ecf1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  flashText: { color: '#0c5460', textAlign: 'center', fontWeight: '500' },
  editingLabel: { textAlign: 'center', marginBottom: 10, color: '#007bff' },
  form: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  iconRow: { flexDirection: 'row', marginBottom: 10 },
  iconButton: { padding: 10, borderRadius: 6, backgroundColor: '#eee', marginRight: 10 },
  iconSelected: { backgroundColor: '#007bff' },
  iconText: { fontSize: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 10, backgroundColor: 'white' },
  picker: { height: 50 },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { fontSize: 16 },
  price: { fontWeight: 'bold' },
  buttons: { flexDirection: 'row', gap: 10 },
  delete: { color: 'red', fontSize: 18 },
});
