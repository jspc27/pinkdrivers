import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft, Edit2, Mail, MapPin, Phone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from "../styles/ProfileDstyles";

const ProfileP = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    zone: '',
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
          city: data.ciudad || '',
          zone: data.zona || '',
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#FFE4F3', '#FFC1E3']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/driver/HomeDriver')}
          >
            <ChevronLeft color="#FF69B4" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        
        {/* Avatar y nombre */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: "https://i.pravatar.cc/150?img=47" }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
      </LinearGradient>

       {/* Contenido del perfil */}
       <ScrollView style={styles.profileContent}>
        {/* Sección de información */}
        <View style={styles.infoSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Información de contacto</Text>
            <TouchableOpacity 
              onPress={() => router.push('/driver/EditProfileD')}
            >
              <Edit2 color="#FF69B4" size={20} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={20} color="#FF69B4" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={20} color="#FF69B4" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin size={20} color="#FF69B4" />
            <Text style={styles.infoText}>{user.city} - Zona {user.zone}</Text>
          </View>
        </View>

        {/* Opciones del perfil */}
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