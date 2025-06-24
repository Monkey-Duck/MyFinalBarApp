// File: app/(tabs)/index.tsx

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera'; 
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FontAwesome } from '@expo/vector-icons'; // We need this for the star icon

const GOOGLE_VISION_API_KEY = 'AIzaSyB-VR33XCpfhwY52D71LERIJ-TN5YRcUuQ'; 

const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export default function CameraLookupScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [recognizedText, setRecognizedText] = useState('');
  const [productInfo, setProductInfo] = useState<any | null>(null);

  // --- NEW: State to track if the current item should be saved as a favorite ---
  const [isFavorite, setIsFavorite] = useState(false);

  const takePicture = async () => { /* ... unchanged ... */ };
  const analyzeImage = async (base64ImageData: string | undefined) => { /* ... unchanged ... */};
  
  const saveToBar = async () => {
    if (!productInfo || !productInfo.title) {
      Alert.alert("Error", "No product information to save.");
      return;
    }
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save to your bar.");
      return;
    }

    Alert.alert("Saving...", `Adding ${productInfo.title} to your bar.`);

    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('bar')
        .add({
          ...productInfo,
          // --- NEW: We now save the favorite status ---
          isFavorite: isFavorite, 
          savedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      Alert.alert("Success!", `${productInfo.title} has been added to your bar.`);
      // Reset for the next lookup
      setPhoto(null);
      setProductInfo(null);
      setIsFavorite(false);

    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      Alert.alert("Error", "Could not save the item to your bar.");
    }
  };


  if (photo) {
    return (
      <ScrollView contentContainerStyle={styles.previewContainer}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        {isLoading ? ( <ActivityIndicator size="large" color="#00ff00" /> ) : (
          <>
            {productInfo && productInfo.title !== 'Product not found in database.' ? (
              <View style={styles.productResultContainer}>
                {/* --- NEW: A row for the title and the favorite button --- */}
                <View style={styles.titleRow}>
                    <Text style={styles.productTitle}>{productInfo.title}</Text>
                    <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                        <FontAwesome 
                            name={isFavorite ? 'star' : 'star-o'} 
                            size={28} 
                            color={isFavorite ? '#FFD700' : '#ccc'} 
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.productBrand}>by {productInfo.brand}</Text>
                <Text style={styles.productDescription}>{productInfo.description}</Text>
                
                <View style={{marginTop: 20}}>
                    <Button title="Save to My Bar" onPress={saveToBar} color="#00ff00" />
                </View>

              </View>
            ) : (
                <View style={styles.textResultContainer}>
                    <Text style={styles.textResultHeader}>Result:</Text>
                    <Text style={styles.textResult}>{productInfo?.title || recognizedText}</Text>
                </View>
            )}
          </>
        )}
        <Button title="Take Another" onPress={() => { setPhoto(null); setProductInfo(null); setIsFavorite(false); }} />
      </ScrollView>
    );
  }

  return ( 
    <CameraView style={styles.camera} ref={cameraRef}> 
      <View style={styles.buttonContainer}>
        <Button title="Take Pic" onPress={takePicture} />
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
    // --- NEW STYLE FOR THE TITLE ROW ---
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    camera: { flex: 1 },
    previewContainer: {
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 10,
        minHeight: '100%',
    },
    previewImage: {
        width: '90%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 15,
    },
    textResultContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        width: '95%',
        marginBottom: 20,
    },
    textResultHeader: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    textResult: { color: 'white', fontSize: 14, marginTop: 5, },
    productResultContainer: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 12,
        width: '95%',
        marginBottom: 20,
        borderLeftColor: '#00ff00',
        borderLeftWidth: 5,
    },
    productTitle: { 
        color: 'white', 
        fontSize: 22, 
        fontWeight: 'bold',
        flex: 1, // Allows text to wrap if long
        marginRight: 10,
    },
    productBrand: { color: '#ccc', fontSize: 16, fontStyle: 'italic', marginBottom: 10 },
    productDescription: { color: 'white', fontSize: 14 },
});
