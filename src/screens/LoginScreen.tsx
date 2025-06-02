import React from 'react';
import { View, Text, Image, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import loginStyles from '../styles/loginStyles';
import SocialButton from '../components/SocialButton';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }: any) {
  const handleGoogleLogin = async () => {
  try {
    console.log('[GoogleLogin] Checking for Play Services...');
    const hasPlayServices = await GoogleSignin.hasPlayServices();
    console.log('[GoogleLogin] Play Services available:', hasPlayServices);

    console.log('[GoogleLogin] Initiating sign-in...');
    const userInfo = await GoogleSignin.signIn();
    console.log('[GoogleLogin] User Info:', userInfo);

    console.log('[GoogleLogin] Fetching ID token...');
    const { idToken } = await GoogleSignin.getTokens();
    console.log('[GoogleLogin] ID Token:', idToken);

    console.log('[GoogleLogin] Creating Firebase credential...');
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    console.log('[GoogleLogin] Signing in with Firebase credential...');
    const userCred = await auth().signInWithCredential(googleCredential);
    console.log('[GoogleLogin] Firebase Sign-In Success:', userCred.user.email);

    // Navigation
    console.log('[GoogleLogin] Navigating to MainScreen...');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainScreen' }],
    });

  } catch (error: any) {
    console.error('[GoogleLogin] Error during login');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
  }
};
  return (
    <LinearGradient
      colors={['#155B88', '#EAA168']} 
      style={loginStyles.container}
    >
      <Image
        source={require('../assets/twinmind-logo.png')}
        style={loginStyles.logoImage}
        resizeMode="contain"
      />

      <Text style={loginStyles.subtitle}>
        To get the best out of TwinMind, pick the account with your main calendar.
      </Text>

      <SocialButton
        title="Continue with Google"
        icon={require('../assets/google-logo.png')}
        onPress={handleGoogleLogin}
      />
      <SocialButton
        title="Continue with Apple"
        icon={require('../assets/apple-logo.png')}
        onPress={() => {}}
      />

      <View style={loginStyles.footer}>
        <Text style={loginStyles.link} onPress={() => Linking.openURL('https://privacy.policy')}>
          Privacy Policy
        </Text>
        <Text style={loginStyles.link} onPress={() => Linking.openURL('https://terms.of.service')}>
          Terms of Service
        </Text>
      </View>
    </LinearGradient>
  );
}