// File: app/(tabs)/index.tsx (Now the Dashboard!)

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { CameraView } from 'expo-camera'; 
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';

const GOOGLE_VISION_API_KEY = 'YOUR_GOOGLE_VISION_API_KEY'; 

const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

// --- This is our main screen component now ---
export default function DashboardScreen() {
  // --- NEW: State to control if the camera is open ---
  const [isCameraOpen, setCameraOpen] = useState(false);

  // --- All the state for the camera logic ---
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [productInfo, setProductInfo] = useState<any | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- Mock data for our dashboard UI ---
  // In the future, this will come from Firestore
  const mockFavorites = [
    { id: '1', title: 'Maker\'s Mark', brand: 'Maker\'s Mark', images: ['https://i.imgur.com/gB4n05J.png'] },
    { id: '2', title: 'Hendrick\'s Gin', brand: 'Hendrick\'s', images: ['https://i.imgur.com/Jt2wE6k.png'] },
    { id: '3', title: 'The Glenlivet 12', brand: 'The Glenlivet', images: ['https://i.imgur.com/xvdHj24.png'] },
  ];
  const totalBottles = 27;
  const cocktailsAvailable = 58;

  // --- All our camera and API functions are now restored ---
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
    setProductInfo(null);
    try {
      const requestBody = { requests: [ { image: { content: base64ImageData }, features: [ { type: 'TEXT_DETECTION' } ] } ] };
      const googleResponse = await axios.post(visionApiUrl, requestBody, { timeout: 20000 });
      const text = googleResponse.data.responses[0]?.fullTextAnnotation?.text;
      
      if (text) {
        const searchTerms = text.split('\n').slice(0, 2).join(' ').trim();
        const productApiUrl = `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(searchTerms)}`;
        const productResponse = await axios.get(productApiUrl, { timeout: 15000 });
        if (productResponse.data && productResponse.data.items && productResponse.data.items.length > 0) {
          setProductInfo(productResponse.data.items[0]);
        } else {
          setProductInfo({ title: 'Product not found in database.' });
        }
      } else {
        setProductInfo({ title: 'No text found on the label.' });
      }
    } catch (error) {
      console.error("Error during API call:", error);
      if (axios.isCancel(error)) {
        setProductInfo({ title: 'Request timed out. Please try again.' });
      } else {
        setProductInfo({ title: 'Error during analysis. See terminal for details.'});
      }
    } finally {
      setIsLoading(false); 
    }
  };

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
        .add({ ...productInfo, isFavorite: isFavorite, savedAt: firestore.FieldValue.serverTimestamp() });
      Alert.alert("Success!", `${productInfo.title} has been added to your bar.`);
      setCameraOpen(false); // Go back to dashboard after saving
      setPhoto(null);
      setProductInfo(null);
      setIsFavorite(false);
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      Alert.alert("Error", "Could not save the item to your bar.");
    }
  };

  const handleCloseCamera = () => {
      setCameraOpen(false);
      setPhoto(null);
      setProductInfo(null);
  }


  // --- UI for the Camera Lookup flow ---
  const CameraViewComponent = (
    <View style={{flex: 1}}>
      {photo ? (
        <ScrollView contentContainerStyle={styles.previewContainer}>
            <View style={styles.resultsHeader}>
                <Button title="Back to Dashboard" onPress={handleCloseCamera} color="#ff3b30" />
            </View>
            <Image source={{ uri: photo }} style={styles.previewImage} />
            {isLoading ? ( <ActivityIndicator size="large" color="#00ff00" /> ) : (
              <>
                {productInfo && productInfo.title !== 'Product not found in database.' && productInfo.title !== 'No text found on the label.' ? (
                  <View style={styles.productResultContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.productTitle}>{productInfo.title}</Text>
                        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                            <FontAwesome name={isFavorite ? 'star' : 'star-o'} size={28} color={isFavorite ? '#FFD700' : '#ccc'} />
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
                        <Text style={styles.textResult}>{productInfo?.title}</Text>
                    </View>
                )}
              </>
            )}
            <Button title="Take Another" onPress={() => { setPhoto(null); setProductInfo(null); setIsFavorite(false); }} />
        </ScrollView>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}> 
          <View style={styles.cameraOverlay}>
            <Button title="Close Camera" onPress={handleCloseCamera} color="#ff3b30" />
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <View style={{width: 80}} />
          </View>
        </CameraView>
      )}
    </View>
  );

  // --- UI for our new Dashboard ---
  const DashboardComponent = (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsRow}>
            <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalBottles}</Text>
                <Text style={styles.statLabel}>Total Bottles</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statValue}>{cocktailsAvailable}</Text>
                <Text style={styles.statLabel}>Cocktails Available</Text>
            </View>
        </View>

        {/* Favorites Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            <FlatList
                horizontal
                data={mockFavorites}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.favoriteCard}>
                        <Image source={{ uri: item.images[0] }} style={styles.favoriteImage} />
                        <Text style={styles.favoriteTitle} numberOfLines={1}>{item.title}</Text>
                    </View>
                )}
            />
        </View>

        {/* Add New Bottle Button */}
        <View style={styles.actionSection}>
            <TouchableOpacity style={styles.scanButton} onPress={() => setCameraOpen(true)}>
                <FontAwesome name="camera" size={24} color="#000" />
                <Text style={styles.scanButtonText}>Scan New Bottle</Text>
            </TouchableOpacity>
        </View>

    </ScrollView>
  );

  // --- Main Render Logic ---
  return (
    <View style={{flex: 1}}>
        {isCameraOpen ? CameraViewComponent : DashboardComponent}
    </View>
  );
}


// --- New styles for the Dashboard have been added ---
const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    // --- Dashboard Styles ---
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    statBox: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        width: '45%',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00ff00',
    },
    statLabel: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 5,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 20,
        marginBottom: 15,
    },
    favoriteCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        width: 140,
        height: 180,
        marginLeft: 20,
        overflow: 'hidden',
    },
    favoriteImage: {
        width: '100%',
        height: 130,
    },
    favoriteTitle: {
        color: '#fff',
        fontWeight: 'bold',
        padding: 10,
    },
    actionSection: {
        alignItems: 'center',
        padding: 20,
    },
    scanButton: {
        flexDirection: 'row',
        backgroundColor: '#00ff00',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },

    // --- Camera & Results Styles ---
    camera: { flex: 1 },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    previewContainer: {
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 20,
        paddingHorizontal: 10,
        minHeight: '100%',
    },
    resultsHeader: {
        width: '100%',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    previewImage: {
        width: '90%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
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
        flex: 1,
        marginRight: 10,
    },
    productBrand: { 
        color: '#ccc', 
        fontSize: 16, 
        fontStyle: 'italic', 
        marginBottom: 10,
    },
    productDescription: { 
        color: 'white', 
        fontSize: 14,
    },
    textResultContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        width: '95%',
        marginBottom: 20,
    },
    textResultHeader: { 
        color: 'white', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    textResult: { 
        color: 'white', 
        fontSize: 14, 
        marginTop: 5 
    },
});