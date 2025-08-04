import {
  FontAwesome,
  Ionicons
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import styles from "../styles/EditPstyles";

const EditProfileP = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Token no encontrado. Inicia sesión nuevamente.");
        return;
      }

      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=getUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData({
          name: data.nombre_completo || "",
          email: data.email || "",
          phone: data.telefono || ""
        });
      } else {
        Alert.alert("Error", data.message || "No se pudo cargar el perfil.");
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      Alert.alert("Error", "Fallo al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Token no encontrado. Inicia sesión nuevamente.");
        return;
      }

      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=edit_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_completo: userData.name,
          email: userData.email,
          telefono: userData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Perfil actualizado correctamente.");
        router.push("/passenger/ProfileP");
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar el perfil.");
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Alert.alert("Error", "Hubo un problema al guardar los cambios.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />

      <LinearGradient
        colors={["#FF69B4", "#FF1493"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/passenger/ProfileP")}
          >
            <Ionicons name="chevron-back" color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <FontAwesome name="check" color="white" size={28} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle-outline"
              size={100}
              color="#FF1493"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="user"
                size={20}
                color="#FF1493"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={userData.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Nombre completo"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope"
                size={20}
                color="#FF1493"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={userData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="Correo electrónico"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de teléfono</Text>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="phone"
                size={20}
                color="#FF1493"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={userData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileP;
