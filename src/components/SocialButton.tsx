import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';

type Props = {
  title: string;
  icon: any;
  onPress: () => void;
};

export default function SocialButton({ title, icon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
    width: '90%',
    alignSelf: 'center',
    elevation: 2,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});