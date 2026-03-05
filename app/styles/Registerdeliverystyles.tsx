import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: -10,
  },
  tituloContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  // Inputs
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#3B0F5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#333',
  },
  passwordToggle: {
    paddingRight: 16,
  },

  // Picker tipo identificación
  pickerOptions: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#3B0F5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EEF8',
  },
  pickerOptionActive: {
    backgroundColor: '#F3EEF8',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#3B0F5C',
  },
  pickerOptionTextActive: {
    fontWeight: '700',
    color: '#5A189A',
  },

  // Selector vehículo
  vehiculoLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vehiculoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  vehiculoOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#3B0F5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vehiculoOptionActive: {
    backgroundColor: '#5A189A',
    borderColor: '#3B0F5C',
    shadowOpacity: 0.4,
    elevation: 6,
  },
  vehiculoText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#5A189A',
    textAlign: 'center',
  },
  vehiculoTextActive: {
    color: 'white',
  },

  // Botón
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B0F5C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#5A189A',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Ya tienes cuenta
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signupText: {
    color: 'white',
    fontSize: 15,
  },
  signupLink: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
})

export default styles