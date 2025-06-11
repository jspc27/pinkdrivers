import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StatusBar } from "react-native";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import styles from "../styles/ProfilePstyles";

const ProfileP = () => {
  const [user, setUser] = useState({
    name: "Maria Rodriguez",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      {/* Header con gradiente */}
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
              onPress={() => router.push('/passenger/EditProfileP')}
            >
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

        {/* Opciones del perfil */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Ayuda y soporte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.logoutButton]} 
          onPress={() => router.push('/')}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileP;