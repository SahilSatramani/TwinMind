
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import transcriptionStyles from '../styles/transcriptionStyles';

const audioRecorderPlayer = new AudioRecorderPlayer();
const TABS = ['Questions', 'Notes', 'Transcript'];

export default function TranscriptionScreen({ navigation }: any) {
  const [recordTime, setRecordTime] = useState('00:00');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('Questions');

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStartTime(`${dateStr} • ${timeStr}`);

    getLocation();
    startRecording();
  }, []);

  const getLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyC4D77MM-P0KCV9uy93m9Hd8C6p7stMYS0`;
          const response = await fetch(url);
          const data = await response.json();
          console.log('Geocode data:', JSON.stringify(data, null, 2));

          if (data.results && data.results.length > 0) {
            const components = data.results[0].address_components;

            const cityObj = components.find((c: any) =>
              c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            const stateObj = components.find((c: any) =>
              c.types.includes('administrative_area_level_1')
            );

            const city = cityObj?.long_name || 'Unknown';
            const state = stateObj?.short_name || 'Unknown';

            console.log('Parsed city/state:', city, state);
            setLocation(`${city}, ${state}`);
          } else {
            setLocation('Location unavailable');
          }
        } catch (err) {
          console.warn('Reverse geocoding failed:', err);
          setLocation('Location unavailable');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocation('Location unavailable');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startRecording = async () => {
    const hasPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    if (hasPermission !== PermissionsAndroid.RESULTS.GRANTED) return;

    await audioRecorderPlayer.startRecorder();
    audioRecorderPlayer.addRecordBackListener((e) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });
  };

  const stopRecording = async () => {
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    navigation.goBack();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Questions':
        return <Text style={transcriptionStyles.placeholder}>TwinMind is transcribing...</Text>;
      case 'Notes':
        return <Text style={transcriptionStyles.placeholder}>You can write your own notes!</Text>;
      case 'Transcript':
        return <Text style={transcriptionStyles.placeholder}>Transcript will appear here</Text>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={transcriptionStyles.container}>
      {/* Header */}
      <View style={transcriptionStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={transcriptionStyles.back}>‹ Back</Text>
        </TouchableOpacity>
        <View style={transcriptionStyles.timerBadge}>
          <Text style={transcriptionStyles.timerText}>{recordTime}</Text>
        </View>
      </View>

      {/* Title + Subtitle */}
      <Text style={transcriptionStyles.title}>Untitled</Text>
      <Text style={transcriptionStyles.subtitle}>
        {startTime} • {location}
      </Text>

      {/* Notes Prompt */}
      <View style={transcriptionStyles.notesPrompt}>
        <Text style={transcriptionStyles.notesText}>You can write your own notes!</Text>
        <TouchableOpacity style={transcriptionStyles.notesButton}>
          <Text style={{ fontWeight: 'bold' }}>Add Notes</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={transcriptionStyles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                transcriptionStyles.tabText,
                activeTab === tab && transcriptionStyles.activeTab,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={transcriptionStyles.content}>{renderTabContent()}</View>

      {/* Fixed Bottom Bar */}
      <View style={transcriptionStyles.bottomBar}>
        <TouchableOpacity style={transcriptionStyles.chatButton}>
          <Text style={transcriptionStyles.chatText}>💬 Chat with Transcript</Text>
        </TouchableOpacity>
        <TouchableOpacity style={transcriptionStyles.stopButton} onPress={stopRecording}>
          <Text style={transcriptionStyles.stopText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}