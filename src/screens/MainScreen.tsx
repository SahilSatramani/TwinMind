import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import HeaderSection from '../components/HeaderSection';
import BottomBar from '../components/BottomBar';
import CalendarTab from '../components/CalenderTab';
import MemoriesTab from '../components/MemoriesTab';
import AllQuestionsTab from '../components/AllQuestionsTab';
import mainStyles from '../styles/mainStyles';

export default function MainScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'Memories' | 'Calendar' | 'Questions'>('Memories');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Calendar':
        return <CalendarTab />;
      case 'Memories':
        return <MemoriesTab />;
      case 'Questions':
        return <AllQuestionsTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <HeaderSection />

      <View style={mainStyles.progressCard}>
        <View style={{ flex: 1 }}>
          <Text style={mainStyles.progressTitle}>Capture 100 Hours to Unlock Features</Text>
          <Text style={mainStyles.progressSubtitle}>Building Your Second Brain</Text>
          <View style={mainStyles.progressBarContainer}>
            <View style={mainStyles.progressBarFill} />
          </View>
        </View>
        <View style={mainStyles.progressStatus}>
          <Text style={mainStyles.progressStatusText}>0 / 100 hours</Text>
        </View>
      </View>

      <View style={mainStyles.tabContainer}>
        {['Memories', 'Calendar', 'Questions'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
            <Text
              style={[
                mainStyles.tabText,
                activeTab === tab && mainStyles.activeTab,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={mainStyles.content}>{renderTabContent()}</View>

      <BottomBar />
    </SafeAreaView>
  );
}