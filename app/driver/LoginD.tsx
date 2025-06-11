import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import StyledAlert from '../components/StyledAlert';
import styles from '../styles/LoginDstyles';

const LoginD = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();

  const showStyledAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showStyledAlert('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://www.pinkdrivers.com/api-rest/index.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Inicio de sesión exitoso') {
        setShowPermissionModal(true); // Mostrar modal antes de redirigir
      } else {
        showStyledAlert(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      showStyledAlert('Error de conexión con el servidor');
    }
  };

  const pedirPermisoUbicacion = async () => {
    setShowPermissionModal(false);
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      showStyledAlert('Permiso de ubicación denegado. Algunas funciones no estarán disponibles.');
    } else {
      console.log('Permiso de ubicación otorgado');
    }

    router.push('/driver/HomeDriver');
  };

  return (
    <>
      {/* Modal personalizado de permiso */}
      {showPermissionModal && (
        <Modal transparent animationType="fade" visible>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 25,
              width: '85%',
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#FF69B4'
              }}>
                Permiso de ubicación
              </Text>
              <Text style={{ textAlign: 'center', marginBottom: 20, color: '#444' }}>
                Esta aplicación necesita acceder a tu ubicación aproximada para brindarte un mejor servicio como conductora.
              </Text>
              <TouchableOpacity
                onPress={pedirPermisoUbicacion}
                style={{
                  backgroundColor: '#FF69B4',
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Permitir acceso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Alerta personalizada */}
      <StyledAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <LinearGradient colors={['#FFE4F3', '#FFC1E3']} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/LogoPink.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Conductora</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="envelope" size={24} color="#FF69B4" style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <FontAwesome name="lock" size={24} color="#FF69B4" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <FontAwesome
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={24}
                    color="#FF69B4"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.pinkdrivers.com/registerDrivers.html')}
              >
                <Text style={styles.signupLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default LoginD;
