import { StyleSheet } from 'react-native';

const WelcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 90,
  },
 logo: {
  width: 180,
  height: 180,
  borderRadius: 100, // Esto hace que el logo sea redondo
  marginBottom: 20,
},

  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FF1493',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default WelcomeStyles;
