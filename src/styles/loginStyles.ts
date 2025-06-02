// src/styles/loginStyles.ts
import { StyleSheet } from 'react-native';

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f6f0e6',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    width: '90%',
    marginBottom: 12,
    alignItems: 'center',
  },
  googleText: {
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  appleText: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 24,
  },
  logoImage: {
  width: 160,
  height: 80,
  marginBottom: 20,
},
  link: {
    color: '#007aff',
  },
});

export default loginStyles;