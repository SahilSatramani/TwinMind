// BottomBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigationTypes'; // adjust path if needed

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainScreen'>;

export default function BottomBar() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.askBox}>
        <Text>Ask All Memories</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.captureBtn}
        onPress={() => navigation.navigate('Transcription')}
      >
        <Text style={{ color: '#fff' }}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
  },
  askBox: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  captureBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#155B88',
    borderRadius: 20,
    justifyContent: 'center',
  },
});