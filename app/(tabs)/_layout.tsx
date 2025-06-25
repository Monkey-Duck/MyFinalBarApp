// File: app/(tabs)/_layout.tsx (Corrected Version)

import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons'; // We will use a standard icon library

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // We don't need a header on the tabs themselves
        tabBarActiveTintColor: '#00ff00', // A nice bright color for the active tab
        tabBarStyle: {
          backgroundColor: '#1a1a1a', // A dark background for the tab bar
          borderTopColor: '#333',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'My Bar',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="glass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="book" color={color} />,
        }}
      />
    </Tabs>
  );
}
