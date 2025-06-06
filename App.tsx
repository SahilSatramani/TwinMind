import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initDatabase } from './src/db/database';
import { syncSessionsFromCloud } from './src/services/cloudSyncService';

export default function App(): React.JSX.Element {
  useEffect(() => {
  const initApp = async () => {
    try {
      GoogleSignin.configure({
        webClientId: '1039339519947-41uuk9ejk9uja9ifpna5uga39us4o6h4.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      });

      await initDatabase();
      console.log('SQLite initialized');

      await syncSessionsFromCloud();
      console.log('Cloud sync complete');
    } catch (e) {
      console.error('App init failed:', e);
    }
  };

  initApp();
}, []);
  return <AppNavigator />;
}