"use client"

import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import StyledAlert from "../components/StyledAlert"
import styles from "../styles/LoginDeliverystyles"

const LoginDelivery = () => {
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const router = useRouter()

  const showStyledAlert = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
  }

  const handleLogin = async () => {
    if (!telefono || !password) {
      showStyledAlert("Por favor completa todos los campos.")
      return
    }

    try {
      const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        const userRole = data.user?.rol?.toLowerCase()

        if (userRole !== "domiciliario") {
          showStyledAlert("Esta sección es solo para domiciliarios de PinkEntregas.")
          return
        }

        await AsyncStorage.setItem("token", data.token)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))
        await AsyncStorage.setItem("rol", "domiciliario")
        setShowPermissionModal(true)

      } else if (response.status === 403 && data.status === "inactive") {
        showStyledAlert(data.message || "Tu cuenta está inactiva. Contacta con soporte.")
      } else if (response.status === 401) {
        showStyledAlert("Credenciales inválidas. Verifica tu teléfono y contraseña.")
      } else {
        showStyledAlert(data.message || "Error al iniciar sesión. Intenta nuevamente.")
      }
    } catch (error) {
      showStyledAlert("Error de conexión con el servidor")
    }
  }

  const pedirPermisoUbicacion = async () => {
    setShowPermissionModal(false)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      showStyledAlert("Permiso de ubicación denegado. Algunas funciones no estarán disponibles.")
    }
    router.push("/delivery/HomeDelivery")
  }

  return (
    <>
      {/* Modal permiso ubicación */}
      {showPermissionModal && (
        <Modal transparent animationType="fade" visible>
          <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 25,
              width: "85%",
              alignItems: "center",
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#5A189A",
              }}>
                Permiso de ubicación
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 20, color: "#444" }}>
                PinkEntregas necesita acceder a tu ubicación para mostrarte los pedidos cercanos a ti.
              </Text>
              <TouchableOpacity
                onPress={pedirPermisoUbicacion}
                style={{
                  backgroundColor: "#5A189A",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Permitir acceso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <StyledAlert visible={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />

      {/* Gradiente morado igual que el rosa del LoginD */}
      <LinearGradient colors={["#C084FC", "#7C3AED"]} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#C084FC" />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Título arriba */}
            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>PinkEntregas</Text>
            </View>

           
            {/* Título abajo */}
            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Domiciliario</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="phone" size={24} color="#5A189A" style={styles.inputIcon} />
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
                <FontAwesome name="lock" size={24} color="#5A189A" style={styles.inputIcon} />
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
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={24} color="#5A189A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón iniciar sesión */}
            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* ¿Olvidaste contraseña? */}
            <TouchableOpacity onPress={() => router.push("/recuperar/CambiarContrasena")}>
              <Text style={{ color: "white", marginTop: 10, textAlign: "center" }}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Registro */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/delivery/RegisterDelivery")}>
                <Text style={styles.signupLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>

            {/* Soporte */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportText}>Soporte </Text>
              <FontAwesome name="whatsapp" size={24} color="#25D366" />
              <Text style={styles.supportNumber}> +57 304 5720945</Text>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}

export default LoginDelivery