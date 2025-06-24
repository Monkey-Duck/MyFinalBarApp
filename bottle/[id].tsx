// File: bottle/[id].tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Slider from '@react-native-community/slider'; // We'll need to install this!

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function BottleDetailScreen() {
  const { id } = useLocalSearchParams(); // Gets the bottle ID from the URL
  const [loading, setLoading] = useState(true);
  const [bottle, setBottle] = useState<any>(null); // Using 'any' for simplicity
  const [fillLevel, setFillLevel] = useState(100);

  const bottleId = Array.isArray(id) ? id[0] : id; // Ensure id is a string

  useEffect(() => {
    if (!bottleId) return;
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const subscriber = firestore()
      .collection('users')
      .doc(userId)
      .collection('bar')
      .doc(bottleId)
      .onSnapshot(documentSnapshot => {
        const bottleData = documentSnapshot.data();
        setBottle(bottleData);
        // Set the initial slider value from the database, or default to 100
        if (bottleData?.fillLevel) {
          setFillLevel(bottleData.fillLevel);
        }
        setLoading(false);
      });

    return () => subscriber();
  }, [bottleId]);

  // Function to update the fill level in Firestore
  const updateFillLevel = async (value: number) => {
    if (!bottleId) return;
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    
    const roundedValue = Math.round(value);

    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('bar')
        .doc(bottleId)
        .update({
          fillLevel: roundedValue
        });
    } catch (error) {
      console.error("Error updating fill level: ", error);
      Alert.alert("Error", "Could not update the fill level.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{flex: 1, backgroundColor: '#000'}} />;
  }

  if (!bottle) {
    return <View style={styles.container}><Text style={styles.title}>Bottle not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* This gives us a nice header with the bottle's title */}
      <Stack.Screen options={{ title: bottle.title, headerBackTitle: "My Bar" }} />
      
      {bottle.images && bottle.images.length > 0 && (
        <Image source={{ uri: bottle.images[0] }} style={styles.headerImage} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{bottle.title}</Text>
        <Text style={styles.brand}>by {bottle.brand}</Text>
        <Text style={styles.description}>{bottle.description}</Text>

        <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Amount Remaining: {Math.round(fillLevel)}%</Text>
            <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                value={fillLevel}
                onValueChange={setFillLevel} // Updates the UI instantly
                onSlidingComplete={updateFillLevel} // Updates the database when user lets go
                minimumTrackTintColor="#00ff00"
                maximumTrackTintColor="#333"
                thumbTintColor="#00ff00"
            />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', },
    headerImage: { width: '100%', height: 300, resizeMode: 'contain', backgroundColor: '#111' },
    content: { padding: 20, },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5, },
    brand: { fontSize: 18, color: '#ccc', fontStyle: 'italic', marginBottom: 20, },
    description: { fontSize: 16, color: '#fff', lineHeight: 24, },
    sliderContainer: { marginTop: 30, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, },
    sliderLabel: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }
});
