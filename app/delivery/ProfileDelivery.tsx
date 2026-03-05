import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles/Profiledeliverystyles";

const ProfileDelivery = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "No se encontró el token.");
      return;
    }

    try {
      const response = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=getUser",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser({
          name: data.nombre_completo,
          email: data.email,
          phone: data.telefono,
        });
      } else {
        Alert.alert("Error", data.message || "No se pudo cargar el perfil.");
      }
    } catch (error) {
      Alert.alert("Error", "Fallo al conectar con el servidor.");
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = "573045720945";
    const message = "Hola, necesito ayuda y soporte con la aplicación Pink Drivers (domiciliario)";
    const whatsappURL = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappURL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappURL);
        } else {
          Alert.alert("Error", "WhatsApp no está instalado en este dispositivo");
        }
      })
      .catch((err) => console.error("Error al abrir WhatsApp:", err));
  };

  const navigateTo = (screen: any) => {
    router.push(screen);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5A189A" />

      <LinearGradient colors={["#7B2FBE", "#5A189A"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/delivery/HomeDelivery")}
          >
            <Ionicons name="chevron-back" color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#C9A7EB" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.profileContent}>
        <View style={styles.infoSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Información de contacto</Text>
            <TouchableOpacity onPress={() => router.push("/delivery/EditProfileDelivery")}>
              <FontAwesome name="edit" color="#7B2FBE" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome name="phone" size={20} color="#7B2FBE" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome name="envelope" size={20} color="#7B2FBE" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem} onPress={openWhatsApp}>
            <Text style={styles.optionText}>Ayuda y soporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo("/recuperar/CambiarContrasena")}
            style={styles.optionItem}
          >
            <Text style={styles.optionText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, styles.logoutButton]}
            onPress={async () => {
              try {
                await AsyncStorage.removeItem("token");
                router.replace("/");
              } catch (error) {
                console.error("Error al cerrar sesión:", error);
              }
            }}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileDelivery;