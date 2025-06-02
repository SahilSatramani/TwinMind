// src/navigation/AppNavigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import SettingsScreen from '../screens/SettingScreen'; 
import { RootStackParamList } from '../types/navigationTypes';
import TranscriptionScreen from '../screens/TranscriptionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Transcription" component={TranscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}