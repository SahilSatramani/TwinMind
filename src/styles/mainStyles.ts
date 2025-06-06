import { StyleSheet } from 'react-native';

const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    paddingBottom: 4,
  },
  activeTab: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#155B88',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  progressCard: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 16,
  marginTop: 8,
  padding: 16,
  borderRadius: 12,
  backgroundColor: '#F7F7F7',
  borderColor: '#EEE',
  borderWidth: 1,
},

progressTitle: {
  fontSize: 13,
  color: '#F57C00',
  fontWeight: '500',
},

progressSubtitle: {
  fontSize: 16,
  fontWeight: '600',
  marginTop: 4,
  marginBottom: 8,
},

progressBarContainer: {
  height: 6,
  width: '90%',
  backgroundColor: '#E0E0E0',
  borderRadius: 4,
  overflow: 'hidden',
},

progressBarFill: {
  height: 6,
  width: '0%', // You can dynamically set this later
  backgroundColor: '#155B88',
  borderRadius: 4,
},

progressStatus: {
  marginLeft: 12,
  justifyContent: 'center',
},

progressStatusText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#444',
},
});

export default mainStyles;