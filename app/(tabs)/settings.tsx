// File: app/(tabs)/settings.tsx

import React from 'react';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SettingsScreen() {
  // Get the current user from Firebase Auth
  const currentUser = auth().currentUser;

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: () => auth().signOut(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Section */}
      {currentUser && (
        <View style={styles.profileSection}>
          {currentUser.photoURL && (
            <Image source={{ uri: currentUser.photoURL }} style={styles.avatar} />
          )}
          <Text style={styles.profileName}>{currentUser.displayName || 'No Name'}</Text>
          <Text style={styles.profileEmail}>{currentUser.email}</Text>
        </View>
      )}

      {/* Action Section */}
      <View style={styles.actionSection}>
          <Button title="Sign Out" onPress={handleLogout} color="#ff3b30" />
      </View>
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
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 5,
  },
  actionSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  }
});
