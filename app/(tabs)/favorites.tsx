// File: app/(tabs)/favorites.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';

// Import our Firebase tools
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Define the structure of a bottle object for TypeScript
interface Bottle {
  id: string;
  title: string;
  brand: string;
  isFavorite: boolean;
  images?: string[]; 
}

// This function will allow us to toggle the favorite status directly from this screen
const toggleFavoriteStatus = async (bottleId: string, currentStatus: boolean) => {
  const userId = auth().currentUser?.uid;
  if (!userId) return;

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('bar')
      .doc(bottleId)
      .update({
        isFavorite: !currentStatus
      });
  } catch (error) {
    console.error("Error updating favorite status: ", error);
  }
};


// A component to render a single favorite bottle in our list
const FavoriteItem = ({ bottle }: { bottle: Bottle }) => (
  <View style={styles.bottleContainer}>
    {bottle.images && bottle.images.length > 0 && (
      <Image source={{ uri: bottle.images[0] }} style={styles.bottleImage} />
    )}
    <View style={styles.bottleInfo}>
      <Text style={styles.bottleTitle}>{bottle.title}</Text>
      <Text style={styles.bottleBrand}>by {bottle.brand}</Text>
    </View>
    {/* This button lets you "un-favorite" an item directly from this list */}
    <TouchableOpacity onPress={() => toggleFavoriteStatus(bottle.id, bottle.isFavorite)}>
        <Image source={{ uri: 'https://i.imgur.com/mAnP2cT.png' }} style={{ width: 28, height: 28 }} />
    </TouchableOpacity>
  </View>
);

export default function FavoritesScreen() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Bottle[]>([]);

  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // This listener is different! It uses a .where() query
    // to only fetch documents where 'isFavorite' is true.
    const subscriber = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('bar')
      .where('isFavorite', '==', true)
      .onSnapshot(querySnapshot => {
        const favs: Bottle[] = [];
        querySnapshot.forEach(documentSnapshot => {
          favs.push({
            ...documentSnapshot.data() as Bottle,
            id: documentSnapshot.id,
          });
        });

        setFavorites(favs);
        setLoading(false);
      });

    return () => subscriber();
  }, [currentUser]);

  if (loading) {
    return <ActivityIndicator size="large" style={{flex: 1}} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FavoriteItem bottle={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet.</Text>
            <Text style={styles.emptySubText}>Use the 'Lookup' tab and tap the star to add a favorite!</Text>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    marginTop: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    textAlign: 'center',
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
    borderRadius: 8,
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
