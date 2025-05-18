import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { InventarioContext } from '../screens/InventarioContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ProductScreen() {
  const { productos } = useContext(InventarioContext);
  const [busqueda, setBusqueda] = useState('');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [filtroCondicion, setFiltroCondicion] = useState<'todos' | 'nuevo' | 'usado'>('todos');
  const [mensajeFlash, setMensajeFlash] = useState('');

  const productosFiltrados = productos
    .filter((producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((producto) =>
      filtroCondicion === 'todos' ? true : producto.condicion === filtroCondicion
    )
    .sort((a, b) => (ordenAscendente ? a.precio - b.precio : b.precio - a.precio));

  const total = productosFiltrados.reduce((acc, prod) => acc + prod.precio, 0);

  const alternarOrden = () => setOrdenAscendente(!ordenAscendente);

  const limpiarNombre = (nombre: string) => {
    // Elimina el ícono inicial (carácter no alfanumérico) y espacios
    return nombre.replace(/^[^\w\s]+/, '').trim();
  };

  const exportarCSV = async () => {
    if (productosFiltrados.length === 0) {
      alert('No hay productos para exportar.');
      return;
    }

    const encabezado = '\uFEFFID,Nombre,Precio,Condición\n';
    const filas = productosFiltrados
      .map((p) => {
        const nombreLimpio = limpiarNombre(p.nombre);
        return `${p.id},"${nombreLimpio}",${p.precio},${p.condicion}`;
      })
      .join('\n');

    const csv = encabezado + filas;

    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventario.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setMensajeFlash('✅ CSV descargado con éxito.');
      } else {
        const fileUri = FileSystem.cacheDirectory + 'inventario.csv';
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Compartir o guardar CSV',
          });
          setMensajeFlash('✅ CSV exportado con éxito.');
        } else {
          alert('No se puede compartir en este dispositivo.');
        }
      }
    } catch (error) {
      console.error('Error exportando CSV:', error);
      alert('Ocurrió un error al exportar el archivo.');
    }

    setTimeout(() => setMensajeFlash(''), 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos Registrados</Text>

      <TextInput
        placeholder="Buscar por nombre o ícono..."
        style={styles.searchBox}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.sortButton} onPress={alternarOrden}>
          <Text style={styles.sortText}>
            Orden: {ordenAscendente ? '⬆️ Precio ascendente' : '⬇️ Precio descendente'}
          </Text>
        </TouchableOpacity>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filtroCondicion}
            onValueChange={(value) => setFiltroCondicion(value)}
            style={styles.picker}
          >
            <Picker.Item label="Todos" value="todos" />
            <Picker.Item label="Nuevos" value="nuevo" />
            <Picker.Item label="Usados" value="usado" />
          </Picker>
        </View>
      </View>

      {mensajeFlash !== '' && (
        <View style={styles.flash}>
          <Text style={styles.flashText}>{mensajeFlash}</Text>
        </View>
      )}

      {productosFiltrados.length === 0 ? (
        <Text style={styles.empty}>No hay productos que coincidan con los filtros.</Text>
      ) : (
        <>
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.price}>
                  ${item.precio.toLocaleString('es-CO')} - {item.condicion.toUpperCase()}
                </Text>
              </View>
            )}
          />

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total del inventario:</Text>
            <Text style={styles.totalPrice}>
              ${total.toLocaleString('es-CO')}
            </Text>
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={exportarCSV}>
            <Text style={styles.exportText}>
              {Platform.OS === 'web' ? '💾 Descargar CSV' : '📤 Exportar CSV'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  searchBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  sortButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sortText: {
    color: 'white',
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: 'white',
    width: 150,
  },
  picker: {
    height: 50,
    color: '#000',
    width: '100%',
  },
  flash: {
    backgroundColor: '#d1ecf1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  flashText: {
    color: '#0c5460',
    textAlign: 'center',
    fontWeight: '500',
  },
  empty: { textAlign: 'center', fontStyle: 'italic', color: '#666' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  name: { fontSize: 16 },
  price: { fontWeight: 'bold' },
  totalContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  exportButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
