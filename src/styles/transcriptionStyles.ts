import { StyleSheet, Dimensions } from 'react-native';
const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 8,
  paddingBottom: 12,
},
back: {
  fontSize: 16,
  color: '#155B88',
  paddingLeft: 2,
},
timerBadge: {
  backgroundColor: '#ffe6e6',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  alignSelf: 'center',
},
timerText: {
  color: '#d32f2f',
  fontWeight: 'bold',
  fontSize: 14,
},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  notesPrompt: {
    backgroundColor: '#e6f0ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  notesText: {
    color: '#333',
    flex: 1,
  },
  notesButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginTop: 10,
  },
  tabText: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#888',
  },
  activeTab: {
    color: '#155B88',
    borderBottomColor: '#155B88',
    borderBottomWidth: 2,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 30,
  },
  bottomBar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 4,
  borderTopWidth: 1,
  borderColor: '#eee',
},
chatButton: {
  backgroundColor: '#e0f7fa',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 24,
  flex: 1,
  marginRight: 12,
  alignItems: 'center',
},
  chatText: {
    color: '#155B88',
    fontWeight: 'bold',
  },
  stopButton: {
  backgroundColor: '#ffcdd2',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 24,
},
  stopText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});