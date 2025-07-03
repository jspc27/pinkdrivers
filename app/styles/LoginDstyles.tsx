import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tituloContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20, // Ajustado para que no se superponga con el logo
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: -25,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white', // se mantiene tu color original
    textShadowColor: 'rgba(0, 0, 0, 0.25)', // se conserva del original
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white', // se mantiene tu color
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#FF1493', // sombra del segundo estilo
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    paddingRight: 16,
  },
  loginButton: {
    backgroundColor: 'white', // se conserva tu color
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonPressed: {
    backgroundColor: '#f0f0f0', // se mantiene de tu estilo original
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: "#FF69B4", // tu color original
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: 'white',
    fontSize: 16,
  },
  signupLink: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  supportContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 16,
},
supportText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
},
supportNumber: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
},
});

export default styles;
