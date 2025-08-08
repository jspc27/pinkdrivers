import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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
import styles from '../styles/LoginPstyles';

const LoginP = () => {
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();
  const navigateTo = (screen: any) => {
  router.push(screen)
}

  const showStyledAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!telefono || !password) {
      showStyledAlert('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://www.pinkdrivers.com/api-rest/index.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telefono, password }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Inicio de sesión exitoso') {
        // ✅ Guardar token en AsyncStorage
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('rol', 'pasajero');
          console.log('Token guardado correctamente');
        } else {
          console.warn('No se recibió token del servidor');
        }

        setShowPermissionModal(true);
      } else {
        showStyledAlert(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      showStyledAlert('Error de conexión con el servidor');
    }
  };

  const pedirPermisoUbicacion = async () => {
    console.log('📍 Permiso ubicación solicitado');
console.log('🧭 Navegando a /passenger/HomeP');

try {
  router.replace('/passenger/HomeP');
} catch (err) {
  console.error('❌ Error al navegar a HomeP', err);
}

    setShowPermissionModal(false);
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      showStyledAlert('Permiso de ubicación denegado. Algunas funciones no estarán disponibles.');
    } else {
      console.log('Permiso de ubicación otorgado');
    }

    router.replace('/passenger/HomeP');
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
                Esta aplicación necesita acceder a tu ubicación aproximada para brindarte un mejor servicio como pasajera.
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

      <LinearGradient colors={['#FF69B4', '#FF1493']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Alquiler</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/LogoPink.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Pasajera(o)</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="phone" size={24} color="#FF1493" style={styles.inputIcon} />
                <TextInput
                  placeholder="Número de celular"
                  placeholderTextColor="#999"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <FontAwesome name="lock" size={24} color="#FF1493" style={styles.inputIcon} />
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
                    color="#FF1493"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

             <TouchableOpacity
                            onPress={() => navigateTo("/recuperar/CambiarContrasena")}>
              <Text style={{ color: "#ffff", marginTop: 10, textAlign: "center" }}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity
                onPress={() => router.push("/passenger/RegisterP")}
              >
                <Text style={styles.signupLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.supportContainer}>
              <Text style={styles.supportText}>Soporte </Text>
              <FontAwesome name="whatsapp" size={24} color="#25D366" />
              <Text style={styles.supportNumber}> +57 304 5720945</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default LoginP;

