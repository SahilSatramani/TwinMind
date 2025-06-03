import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import HeaderSection from '../components/HeaderSection';
import BottomBar from '../components/BottomBar';
import CalendarTab from '../components/CalenderTab';
import mainStyles from '../styles/mainStyles';
import MemoriesTab from '../components/MemoriesTab';
import AllQuestionsTab from '../components/AllQuestionsTab';

export default function MainScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'Memories' | 'Calendar' | 'Questions'>('Memories');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Calendar':
        return <CalendarTab />;
      case 'Memories':
        return <MemoriesTab />;
      case 'Questions':
        case 'Questions':
        return <AllQuestionsTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={mainStyles.container}>
      <HeaderSection />

      <View style={mainStyles.tabContainer}>
        {['Memories', 'Calendar', 'Questions'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
            <Text
              style={[
                mainStyles.tabText,
                activeTab === tab ? mainStyles.activeTab : null,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={mainStyles.content}>{renderTabContent()}</View>

      <BottomBar  /> 
    </SafeAreaView>
  );
}