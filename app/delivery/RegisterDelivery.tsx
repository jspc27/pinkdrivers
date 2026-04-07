"use client"

import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import StyledAlert from '../components/StyledAlert'
import styles from '../styles/Registerdeliverystyles'

const tiposIdentificacion = [
  { label: 'CC - Cédula de ciudadanía', value: 'CC' },
  { label: 'CE - Cédula de extranjería', value: 'CE' },
  { label: 'PA - Pasaporte', value: 'PA' },
  { label: 'TI - Tarjeta de identidad', value: 'TI' },
]

const RegisterDelivery = () => {
  const [nombre, setNombre] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [numeroId, setNumeroId] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [vehiculo, setVehiculo] = useState('')
  const [showTipoIdPicker, setShowTipoIdPicker] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const showStyledAlert = (msg: string) => {
    setAlertMessage(msg)
    setShowAlert(true)
  }

  const handleRegister = async () => {
    if (!nombre || !tipoId || !numeroId || !email || !telefono || !password || !vehiculo) {
      showStyledAlert('❌ Todos los campos son obligatorios.')
      return
    }
    if (telefono.length !== 10) {
      showStyledAlert('❌ El número de teléfono debe tener exactamente 10 dígitos.')
      return
    }

    try {
      const response = await fetch(
        'https://www.pinkdrivers.com/api-rest/index.php?action=register_domiciliario',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_completo: nombre,
            tipo_identificacion: tipoId,
            numero_identificacion: numeroId,
            email,
            telefono,
            password,
            tipo_vehiculo: vehiculo,
            rol: 'domiciliario',
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          router.push('/delivery/LoginDelivery')
        }, 2500)
      } else {
        showStyledAlert(`❌ ${data.message || 'Ocurrió un error.'}`)
      }
    } catch (error) {
      showStyledAlert('❌ No se pudo conectar al servidor.')
    }
  }

  return (
    <LinearGradient colors={['#C084FC', '#7C3AED']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C084FC" />
      <SafeAreaView style={styles.safeArea}>

        {/* Modal morado de registro exitoso */}
        <Modal transparent animationType="fade" visible={showSuccessModal}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 30,
              width: '85%',
              alignItems: 'center',
              borderTopWidth: 5,
              borderTopColor: '#5A189A',
            }}>
              <View style={{
                backgroundColor: '#F3EEF8',
                borderRadius: 50,
                padding: 16,
                marginBottom: 16,
              }}>
                <FontAwesome name="check" size={32} color="#5A189A" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#3B0F5C',
                marginBottom: 10,
                textAlign: 'center',
              }}>
                ¡Registro exitoso!
              </Text>
              <Text style={{
                fontSize: 15,
                color: '#555',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 6,
              }}>
                Tu cuenta de domiciliario ha sido creada correctamente.
              </Text>
              <Text style={{
                fontSize: 13,
                color: '#5A189A',
                fontWeight: '600',
              }}>
                Redirigiendo al inicio de sesión...
              </Text>
            </View>
          </View>
        </Modal>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            

            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Registro Domiciliario</Text>
            </View>

            <View style={styles.inputContainer}>

              {/* Nombre completo */}
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="user" color="#5A189A" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Nombre completo"
                  placeholderTextColor="#999"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              {/* Tipo de identificación */}
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowTipoIdPicker(!showTipoIdPicker)}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="id-card" color="#5A189A" size={20} style={styles.inputIcon} />
                <Text style={[styles.input, { paddingTop: 14, color: tipoId ? '#333' : '#999' }]}>
                  {tipoId
                    ? tiposIdentificacion.find(t => t.value === tipoId)?.label
                    : 'Tipo de identificación'}
                </Text>
                <FontAwesome
                  name={showTipoIdPicker ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#5A189A"
                  style={{ marginRight: 14 }}
                />
              </TouchableOpacity>

              {showTipoIdPicker && (
                <View style={styles.pickerOptions}>
                  {tiposIdentificacion.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[styles.pickerOption, tipoId === tipo.value && styles.pickerOptionActive]}
                      onPress={() => { setTipoId(tipo.value); setShowTipoIdPicker(false) }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        tipoId === tipo.value && styles.pickerOptionTextActive,
                      ]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Número de identificación */}
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="hashtag" color="#5A189A" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Número de identificación"
                  placeholderTextColor="#999"
                  value={numeroId}
                  onChangeText={(t) => setNumeroId(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              {/* Correo */}
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="envelope" color="#5A189A" size={20} style={styles.inputIcon} />
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

              {/* Teléfono */}
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="phone" color="#5A189A" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Teléfono (10 dígitos)"
                  placeholderTextColor="#999"
                  value={telefono}
                  onChangeText={(t) => setTelefono(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.input}
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="lock" color="#5A189A" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} color="#5A189A" size={20} />
                </TouchableOpacity>
              </View>

              {/* Tipo de vehículo */}
              <Text style={styles.vehiculoLabel}>Tipo de vehículo</Text>
              <View style={styles.vehiculoContainer}>

                <TouchableOpacity
                  style={[styles.vehiculoOption, vehiculo === 'bicicleta' && styles.vehiculoOptionActive]}
                  onPress={() => setVehiculo('bicicleta')}
                >
                  <FontAwesome5 name="bicycle" size={28} color={vehiculo === 'bicicleta' ? '#fff' : '#5A189A'} />
                  <Text style={[styles.vehiculoText, vehiculo === 'bicicleta' && styles.vehiculoTextActive]}>
                    Bicicleta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.vehiculoOption, vehiculo === 'patineta' && styles.vehiculoOptionActive]}
                  onPress={() => setVehiculo('patineta')}
                >
                  <MaterialCommunityIcons name="scooter" size={28} color={vehiculo === 'patineta' ? '#fff' : '#5A189A'} />
                  <Text style={[styles.vehiculoText, vehiculo === 'patineta' && styles.vehiculoTextActive]}>
                    Patineta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.vehiculoOption, vehiculo === 'silla_ruedas' && styles.vehiculoOptionActive]}
                  onPress={() => setVehiculo('silla_ruedas')}
                >
                  <FontAwesome5 name="wheelchair" size={28} color={vehiculo === 'silla_ruedas' ? '#fff' : '#5A189A'} />
                  <Text style={[styles.vehiculoText, vehiculo === 'silla_ruedas' && styles.vehiculoTextActive]}>
                    Silla ruedas
                  </Text>
                </TouchableOpacity>

              </View>
            </View>

            {/* Botón registrarse */}
            <TouchableOpacity onPress={handleRegister} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Registrarse</Text>
            </TouchableOpacity>

            {/* Ya tienes cuenta */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/delivery/LoginDelivery')}>
                <Text style={styles.signupLink}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* StyledAlert solo para errores */}
      <StyledAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </LinearGradient>
  )
}

export default RegisterDelivery