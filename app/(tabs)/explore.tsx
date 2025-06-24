// File: app/(tabs)/explore.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator, Image } from 'react-native';

// Import our Firebase tools
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Define the structure of a bottle object for TypeScript
interface Bottle {
  id: string;
  title: string;
  brand: string;
  description: string;
  // Add any other fields you expect from the UPCitemdb API
  images?: string[]; 
}

// A component to render a single bottle in our list
const BottleItem = ({ bottle }: { bottle: Bottle }) => (
  <View style={styles.bottleContainer}>
    {bottle.images && bottle.images.length > 0 && (
      <Image source={{ uri: bottle.images[0] }} style={styles.bottleImage} />
    )}
    <View style={styles.bottleInfo}>
      <Text style={styles.bottleTitle}>{bottle.title}</Text>
      <Text style={styles.bottleBrand}>by {bottle.brand}</Text>
    </View>
  </View>
);

export default function MyBarScreen() {
  const [loading, setLoading] = useState(true); // To show a spinner while we load data
  const [bottles, setBottles] = useState<Bottle[]>([]); // To hold the list of bottles

  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // This sets up a real-time listener on our database!
    // Any time a bottle is added or removed, this code will run automatically.
    const subscriber = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('bar')
      .onSnapshot(querySnapshot => {
        const bottles: Bottle[] = [];

        querySnapshot.forEach(documentSnapshot => {
          bottles.push({
            ...documentSnapshot.data() as Bottle,
            id: documentSnapshot.id,
          });
        });

        setBottles(bottles);
        setLoading(false);
      });

    // Unsubscribe from events when the component is unmounted
    return () => subscriber();
  }, [currentUser]);

  // Our simple logout function
  const handleLogout = () => {
    auth().signOut().then(() => console.log('User signed out!'));
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{flex: 1}} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bar</Text>
        <Button title="Sign Out" onPress={handleLogout} color="#ff3b30" />
      </View>
      
      <FlatList
        data={bottles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BottleItem bottle={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your bar is empty.</Text>
            <Text style={styles.emptySubText}>Use the 'Lookup' tab to add your first bottle!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // For notch/status bar
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  bottleContainer: {
    flexDirection: 'row',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  bottleImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#333',
  },
  bottleInfo: {
    flex: 1,
  },
  bottleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottleBrand: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  }
});
