import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigationTypes';

export default function HeaderSection() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>S</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.centerSection}>
        <Text style={styles.title}>TwinMind</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      </View>

      <TouchableOpacity>
        <Text style={styles.help}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00897B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 6,
  },
  proBadge: {
    backgroundColor: '#003366',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  help: {
    color: '#155B88',
    fontWeight: '600',
  },
});