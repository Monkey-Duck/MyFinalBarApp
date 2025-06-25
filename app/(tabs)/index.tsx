// File: app/(tabs)/index.tsx
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Successful</Text>
      <Text style={styles.subtitle}>This is our new, stable foundation.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
  },
});