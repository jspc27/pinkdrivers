"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { router, useFocusEffect } from "expo-router"
import { Check, ChevronLeft, Mail, MapPin, Phone, User } from "lucide-react-native"
import { useCallback, useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import styles from "../styles/EditDstyles"

const EditProfileD = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    zone: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
      Alert.alert("Error", "No se encontró el token.")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=getUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setUserData({
          name: data.nombre_completo || "",
          email: data.email || "",
          phone: data.telefono || "",
          city: data.ciudad || "",
          zone: data.zona || "",
        })
      } else {
        Alert.alert("Error", data.message || "No se pudo cargar el perfil.")
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error)
      Alert.alert("Error", "Fallo al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value })
  }

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
      Alert.alert("Error", "No se encontró el token.")
      return
    }

    // Validaciones básicas
    if (!userData.name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.")
      return
    }
    if (!userData.email.trim()) {
      Alert.alert("Error", "El email es obligatorio.")
      return
    }
    if (!userData.phone.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio.")
      return
    }
    if (!userData.city.trim()) {
      Alert.alert("Error", "La ciudad es obligatoria.")
      return
    }
    if (!userData.zone.trim()) {
      Alert.alert("Error", "La zona es obligatoria.")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=edit_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo: userData.name,
          email: userData.email,
          telefono: userData.phone,
          ciudad: userData.city,
          zona: userData.zone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Éxito", "Perfil actualizado correctamente.", [
          {
            text: "OK",
            onPress: () => router.push("/driver/ProfileD"),
          },
        ])
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar el perfil.")
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      Alert.alert("Error", "Fallo al conectar con el servidor.")
    } finally {
      setSaving(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile()
    }, []),
  )

  if (loading) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />
        <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/driver/ProfileD")}>
              <ChevronLeft color="#FF69B4" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            <View style={styles.saveButton} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />

      {/* Header con gradiente */}
      <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/driver/ProfileD")}>
            <ChevronLeft color="#FF69B4" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Check color={saving ? "#ccc" : "#FF69B4"} size={28} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        {/* Sección de foto de perfil */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle-outline"
              size={100}
              color="#FF69B4"
            />
          </View>
        </View>

        {/* Formulario de edición */}
        <View style={styles.formSection}>
          {/* Campo de nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#FF69B4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Nombre completo"
                editable={!saving}
              />
            </View>
          </View>

          {/* Campo de correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#FF69B4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                editable={!saving}
              />
            </View>
          </View>

          {/* Campo de teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de teléfono</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#FF69B4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
          </View>

          {/* Campo de ciudad */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ciudad</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#FF69B4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.city}
                onChangeText={(text) => handleChange("city", text)}
                placeholder="Ciudad"
                editable={!saving}
              />
            </View>
          </View>

          {/* Campo de zona */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zona</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#FF69B4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={userData.zone}
                onChangeText={(text) => handleChange("zone", text)}
                placeholder="Ej: Norte, Sur, Centro"
                editable={!saving}
              />
            </View>
          </View>
        </View>

        {/* Espacio adicional para el scroll */}
        <View style={{ height: 50 }} />
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <Text style={styles.savingText}>Guardando cambios...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

export default EditProfileD
