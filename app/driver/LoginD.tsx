"use client"

import { FontAwesome } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useState } from "react"
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
} from "react-native"
import StyledAlert from "../components/StyledAlert"
import styles from "../styles/LoginDstyles"
import AsyncStorage from "@react-native-async-storage/async-storage"

const LoginD = () => {
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
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // ✅ Verificar que sea una conductora
        const userRole = data.user?.rol?.toLowerCase()
        const esConductora = ["driver", "conductora", "conductor"].includes(userRole)

        if (!esConductora) {
          showStyledAlert("Esta aplicación es solo para conductoras. Los pasajeros deben usar la app de pasajeros.")
          return
        }

        // ✅ Guarda el token y datos del usuario
        await AsyncStorage.setItem("token", data.token)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))
        await AsyncStorage.setItem('rol', 'conductora');

        // Muestra modal y continúa
        setShowPermissionModal(true)
      }
      // ✅ Manejo de cuenta de conductora inactiva
      else if (response.status === 403 && data.status === "inactive") {
        showStyledAlert(data.message || "Tu cuenta de conductora está inactiva. Contacta con soporte para reactivarla.")
      }
      // Manejo de credenciales inválidas
      else if (response.status === 401) {
        showStyledAlert("Credenciales inválidas. Verifica tu teléfono y contraseña.")
      }
      // Otros errores
      else {
        showStyledAlert(data.message || "Error al iniciar sesión. Intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error en el login:", error)
      showStyledAlert("Error de conexión con el servidor")
    }
  }

  const pedirPermisoUbicacion = async () => {
    setShowPermissionModal(false)
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== "granted") {
      showStyledAlert("Permiso de ubicación denegado. Algunas funciones no estarán disponibles.")
    } else {
      console.log("Permiso de ubicación otorgado")
    }

    router.push("/driver/HomeDriver")
  }

  return (
    <>
      {/* Modal personalizado de permiso */}
      {showPermissionModal && (
        <Modal transparent animationType="fade" visible>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 25,
                width: "85%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: "#FF69B4",
                }}
              >
                Permiso de ubicación
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 20, color: "#444" }}>
                Esta aplicación necesita acceder a tu ubicación aproximada para brindarte un mejor servicio como
                conductora.
              </Text>
              <TouchableOpacity
                onPress={pedirPermisoUbicacion}
                style={{
                  backgroundColor: "#FF69B4",
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

      {/* Alerta personalizada */}
      <StyledAlert visible={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />

      <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Alquiler</Text>
            </View>

            <View style={styles.logoContainer}>
              <Image source={require("../../assets/images/LogoPink.png")} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.tituloContainer}>
              <Text style={styles.logoText}>Conductora</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <FontAwesome name="phone" size={24} color="#FF69B4" style={styles.inputIcon} />
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
                <FontAwesome name="lock" size={24} color="#FF69B4" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={24} color="#FF69B4" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => Linking.openURL("https://www.pinkdrivers.com/registerDrivers.html")}>
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
  )
}

export default LoginD
