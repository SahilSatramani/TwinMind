import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function App(): React.JSX.Element {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1039339519947-41uuk9ejk9uja9ifpna5uga39us4o6h4.apps.googleusercontent.com', 
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
  }, []);

  return <AppNavigator />;
}