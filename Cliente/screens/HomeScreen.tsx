import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>App USTA </Text>
      <Button
        title="Ir a Productos"
        onPress={() => navigation.navigate('Productos' as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 16 },
});
