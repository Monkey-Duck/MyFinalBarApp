// The full-featured camera screen code for: app/(tabs)/index.tsx

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView } from 'expo-camera'; 
import axios from 'axios';

// IMPORTANT: You'll need to re-add your Google Vision API Key here
const GOOGLE_VISION_API_KEY = 'PASTE_YOUR_GOOGLE_VISION_API_KEY_HERE'; 

const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export default function CameraLookupScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [recognizedText, setRecognizedText] = useState('');
  const [productInfo, setProductInfo] = useState<any | null>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        if (data) {
            setPhoto(data.uri); 
            analyzeImage(data.base64);
        }
    }
  };
  
  const analyzeImage = async (base64ImageData: string | undefined) => {
    if (!base64ImageData) return;
    setIsLoading(true); 
    setRecognizedText('');
    setProductInfo(null);
    try {
      const requestBody = { requests: [ { image: { content: base64ImageData }, features: [ { type: 'TEXT_DETECTION' } ] } ] };
      const googleResponse = await axios.post(visionApiUrl, requestBody, { timeout: 20000 });
      const text = googleResponse.data.responses[0]?.fullTextAnnotation?.text;
      
      if (text) {
        setRecognizedText(text);
        const searchTerms = text.split('\n').slice(0, 2).join(' ').trim();
        const productApiUrl = `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(searchTerms)}`;
        const productResponse = await axios.get(productApiUrl, { timeout: 15000 });
        if (productResponse.data && productResponse.data.items && productResponse.data.items.length > 0) {
          setProductInfo(productResponse.data.items[0]);
        } else {
          setProductInfo({ title: 'Product not found in database.' });
        }
      } else {
        setRecognizedText('No text found on the label.');
      }
    } catch (error) {
      console.error("Error during API call:", error);
      if (axios.isCancel(error)) {
        setRecognizedText('Request timed out. Please try again.');
      } else {
        setRecognizedText('Error during analysis. See terminal for details.');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  // If a photo has been taken, show the results
  if (photo) {
    return (
      <ScrollView contentContainerStyle={styles.previewContainer}>
        <Image source={{ uri: photo }} style={styles.previewImage} />
        {isLoading ? ( <ActivityIndicator size="large" color="#00ff00" /> ) : (
          <>
            {productInfo ? (
              <View style={styles.productResultContainer}>
                <Text style={styles.productTitle}>{productInfo.title}</Text>
                <Text style={styles.productBrand}>by {productInfo.brand}</Text>
                <Text style={styles.productDescription}>{productInfo.description}</Text>
              </View>
            ) : (
                <View style={styles.textResultContainer}>
                    <Text style={styles.textResultHeader}>Recognized Text:</Text>
                    <Text style={styles.textResult}>{recognizedText}</Text>
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