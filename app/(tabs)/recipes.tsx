// File: app/(tabs)/recipes.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

// Define the structure of a Drink for TypeScript
interface Drink {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
}

const RecipeItem = ({ drink }: { drink: Drink }) => (
  <View style={styles.recipeCard}>
    <Image source={{ uri: drink.strDrinkThumb }} style={styles.recipeImage} />
    <Text style={styles.recipeTitle}>{drink.strDrink}</Text>
  </View>
);

export default function RecipeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [drinks, setDrinks] = useState<Drink[]>([]);

  const searchCocktails = async () => {
    if (!searchTerm.trim()) {
      Alert.alert("Empty Search", "Please enter an ingredient or cocktail name.");
      return;
    }
    setLoading(true);
    setDrinks([]);
    try {
      const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`;
      const response = await axios.get(url);
      
      if (response.data.drinks) {
        setDrinks(response.data.drinks);
      } else {
        Alert.alert("No Results", `Could not find any cocktails matching "${searchTerm}".`);
      }
    } catch (error) {
      console.error("Error searching for cocktails:", error);
      Alert.alert("Error", "Could not fetch recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Recipes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ingredient..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={searchCocktails} // Allows searching by pressing "enter" on keyboard
        />
        <Button title="Search" onPress={searchCocktails} color="#00ff00" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00ff00" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={drinks}
          keyExtractor={(item) => item.idDrink}
          renderItem={({ item }) => <RecipeItem drink={item} />}
          numColumns={2} // Creates a nice grid layout
          columnWrapperStyle={styles.row}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Search for a cocktail to get started!</Text>
            </View>
          )}
        />
      )}
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
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
    marginRight: 10,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  recipeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 5,
    flex: 1,
    maxWidth: '48%',
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: 150,
  },
  recipeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  }
});
