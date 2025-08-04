import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles/ProfilePstyles";

const ProfileP = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert("Error", "No se encontró el token.");
      return;
    }

    try {
      const response = await fetch('https://www.pinkdrivers.com/api-rest/index.php?action=getUser', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      <LinearGradient
        colors={['#FF69B4', '#FF1493']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/passenger/HomeP')}
          >
            <Ionicons name="chevron-back" color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
  <Ionicons name="person-circle-outline" size={100} color="#FF1493" />
</View>

          <Text style={styles.userName}>{user.name}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.profileContent}>
        <View style={styles.infoSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Información de contacto</Text>
            <TouchableOpacity onPress={() => router.push('/passenger/EditProfileP')}>
              <FontAwesome name="edit" color="#FF1493" size={20} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="phone" size={20} color="#FF1493" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="envelope" size={20} color="#FF1493" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Ayuda y soporte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
  style={[styles.optionItem, styles.logoutButton]}
  onPress={async () => {
    try {
      await AsyncStorage.removeItem('token'); // ✅ Elimina solo el token
      router.replace('/'); // 🔁 Redirige a la pantalla inicial
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

export default ProfileP;
