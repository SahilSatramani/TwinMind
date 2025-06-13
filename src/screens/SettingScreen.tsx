import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import settingStyles from '../styles/settingStyles';

export default function SettingScreen({ navigation }: any) {
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [initial, setInitial] = useState('U');
  const [name, setName] = useState('User');

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      const displayName = user.displayName || user.email || 'User';
      setName(displayName);
      setInitial(displayName.charAt(0).toUpperCase());
    }
  }, []);

  const handleSignOut = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();

    if (userInfo) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    }

    await auth().signOut();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

  return (
    <ScrollView style={settingStyles.container}>
      <View style={settingStyles.profileSection}>
        <View style={settingStyles.avatar}>
          <Text style={settingStyles.avatarText}>{initial}</Text>
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={settingStyles.name}>{name}</Text>
          <Text style={settingStyles.manage}>Manage Account</Text>
        </View>
        <View style={settingStyles.proBadge}>
          <Text style={settingStyles.proText}>PRO</Text>
        </View>
      </View>

      <View style={settingStyles.referBox}>
        <Text style={settingStyles.referTitle}>REFER A FRIEND</Text>
        <Text>Get 1 month pro for each friend you refer</Text>
      </View>

      <Text style={settingStyles.sectionTitle}>SETTINGS</Text>

      <View style={settingStyles.row}>
        <View>
          <Text style={settingStyles.optionText}>Backup Data</Text>
          <Text style={settingStyles.optionSubText}>
            Warning: Memories that aren't backed up cannot be recovered if you lose your device.{' '}
            <Text
              style={{ color: '#007aff' }}
              onPress={() => Linking.openURL('https://your-backup-link')}
            >
              Learn More
            </Text>
          </Text>
        </View>
        <Switch value={backupEnabled} onValueChange={setBackupEnabled} />
      </View>

      <TouchableOpacity style={settingStyles.row}>
        <Text style={settingStyles.optionText}>Get TwinMind for Desktop</Text>
        <Text style={settingStyles.download}>Download Now!</Text>
      </TouchableOpacity>

      <TouchableOpacity style={settingStyles.row}>
        <Text style={settingStyles.optionText}>Personalize</Text>
      </TouchableOpacity>

      <Text style={settingStyles.sectionTitle}>SUPPORT</Text>

      <TouchableOpacity style={settingStyles.row}>
        <Text style={settingStyles.optionText}>Chat with Support</Text>
      </TouchableOpacity>

      <TouchableOpacity style={settingStyles.row}>
        <Text style={settingStyles.optionText}>Discord</Text>
      </TouchableOpacity>

      <Text style={settingStyles.sectionTitle}>OTHER</Text>

      <TouchableOpacity style={settingStyles.row}>
        <Text style={settingStyles.optionText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={settingStyles.signOutButton} onPress={handleSignOut}>
        <Text style={settingStyles.signOutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <Text style={settingStyles.footer}>
        TwinMind • 1.0.64 • Unleashing deeper insights through sound since 2024.
      </Text>
    </ScrollView>
  );
}