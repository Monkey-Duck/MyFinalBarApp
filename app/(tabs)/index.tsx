// Version with "Save to My Bar" Firestore logic

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CameraView } from 'expo-camera'; 
import axios from 'axios';

// --- NEW: Import the tools we need for our database ---
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const GOOGLE_VISION_API_KEY = 'PASTE_YOUR_GOOGLE_VISION_API_KEY_HERE'; 

const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export default function CameraLookupScreen() {
  // ... all our existing state variables are the same ...
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [recognizedText, setRecognizedText] = useState('');
  const [productInfo, setProductInfo] = useState<any | null>(null);

  const takePicture = async () => { /* ... this function is unchanged ... */ };
  const analyzeImage = async (base64ImageData: string | undefined) => { /* ... this function is unchanged ... */};
  
  // --- NEW FUNCTION: Save the current product to our Firestore database ---
  const saveToBar = async () => {
    // First, make sure we have product info and a logged-in user
    if (!productInfo || !productInfo.title) {
      Alert.alert("Error", "No product information to save.");
      return;
    }
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save to your bar.");
      return;
    }

    // Show a saving indicator (optional, but good UX)
    Alert.alert("Saving...", `Adding ${productInfo.title} to your bar.`);

    try {
      // This creates a document in our database:
      // users -> {user's_id} -> bar -> {new_bottle_id}
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('bar')
        .add({
          ...productInfo,
          savedAt: firestore.FieldValue.serverTimestamp(), // Add a timestamp
        });
      
      Alert.alert("Success!", `${productInfo.title} has been added to your bar.`);
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      Alert.alert("Error", "Could not save the item to your bar.");
    }
  };


  // If a photo has been taken, show the results
  if (photo) {
    return (
      <ScrollView contentContainerStyle={styles.previewContainer}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        {isLoading ? ( <ActivityIndicator size="large" color="#00ff00" /> ) : (
          <>
            {productInfo && productInfo.title !== 'Product not found in database.' ? (
              <View style={styles.productResultContainer}>
                <Text style={styles.productTitle}>{productInfo.title}</Text>
                <Text style={styles.productBrand}>by {productInfo.brand}</Text>
                <Text style={styles.productDescription}>{productInfo.description}</Text>
                
                {/* --- NEW: The "Save to My Bar" Button --- */}
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
        <Button title="Take Another" onPress={() => { setPhoto(null); setProductInfo(null); }} />
      </ScrollView>
    );
  }

  // Otherwise, show the camera
  return ( 
    <CameraView style={styles.camera} ref={cameraRef}> 
      <View style={styles.buttonContainer}>
        <Button title="Take Pic" onPress={takePicture} />
      </View>
    </CameraView>
  );
}

// All the styles are the same as before...
const styles = StyleSheet.create({
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
    productTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    productBrand: { color: '#ccc', fontSize: 16, fontStyle: 'italic', marginBottom: 10 },
    productDescription: { color: 'white', fontSize: 14 },
});