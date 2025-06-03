import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initDatabase } from './src/db/database';

export default function App(): React.JSX.Element {
  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1039339519947-41uuk9ejk9uja9ifpna5uga39us4o6h4.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    // Initialize SQLite database
    initDatabase()
      .then(() => console.log('SQLite initialized'))
      .catch((e) => console.error('SQLite init error', e));
  }, []);

  return <AppNavigator />;
}