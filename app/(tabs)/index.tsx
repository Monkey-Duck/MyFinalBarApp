// File: app/(tabs)/index.tsx

import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold' }}>It Works!</Text>
      <Text style={{ fontSize: 18, marginTop: 10 }}>This is our clean slate.</Text>
    </View>
  );
}