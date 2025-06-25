// File: app/(tabs)/explore.tsx
import { StyleSheet, Text, View } from 'react-native';

export default function MyBarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bar</Text>
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
});