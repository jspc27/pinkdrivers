import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import StyledAlert from '../components/StyledAlert';
import styles from "../styles/RegisterPstyles";

const RegisterP = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setAlertMessage("❌ Todos los campos son obligatorios.");
      setShowAlert(true);
      return;
    }

    if (phone.length !== 10) {
      setAlertMessage("❌ El número de teléfono debe tener exactamente 10 dígitos.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch('https://www.pinkdrivers.com/api-rest/index.php?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_completo: name,
          email,
          telefono: phone,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertMessage("✅ Registro completado correctamente.");
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
          router.push('/passenger/LoginP');
        }, 2000); 
      } else {
        // error: usuario ya registrado
        setAlertMessage(`❌ ${data.message || "Ocurrió un error."}`);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("❌ No se pudo conectar al servidor.");
      setShowAlert(true);
    }
  };

  return (
    <LinearGradient
      colors={['#FF69B4', '#FF1493']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
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

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="user" color="#FF1493" size={20} style={styles.inputIcon} />
              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                keyboardType="default"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome5 name="envelope" color="#FF1493" size={20} style={styles.inputIcon} />
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
              <FontAwesome5 name="phone" color="#FF1493" size={20} style={styles.inputIcon} />
              <TextInput
                placeholder="Teléfono"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setPhone(numericValue);
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                style={styles.input}
                maxLength={10}
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome5 name="lock" color="#FF1493" size={20} style={styles.inputIcon} />
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
                <FontAwesome5
                  name={showPassword ? "eye-slash" : "eye"}
                  color="#FF1493"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/passenger/LoginP")}>
              <Text style={styles.signupLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
          
          {/* StyledAlert con el mensaje que ya incluye el icono ❌ o ✅ */}
          <StyledAlert
            visible={showAlert}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterP;
