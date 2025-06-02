import { StyleSheet } from 'react-native';

const settingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#00897B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: '600' },
  manage: { color: '#007aff', fontSize: 12 },
  proBadge: {
    backgroundColor: '#003366',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  proText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  referBox: {
    backgroundColor: '#fff7ee',
    padding: 16,
    borderRadius: 12,
    borderColor: '#ffd6a0',
    borderWidth: 1,
    marginBottom: 24,
  },
  referTitle: {
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  optionText: { fontSize: 16 },
  optionSubText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    maxWidth: '90%',
  },
  download: { color: '#d633ff', fontWeight: 'bold' },
  signOutButton: {
    backgroundColor: '#fddede',
    borderRadius: 24,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  signOutText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default settingStyles;