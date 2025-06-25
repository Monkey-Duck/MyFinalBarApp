// File: app/(tabs)/index.tsx (Simplest Possible Test Screen)

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SimplestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Successful!</Text>
      <Text style={styles.subtitle}>If you can see this text, the tunnel is working.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fff' 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    subtitle: {
        fontSize: 16,
        color: 'gray'
    }
});
