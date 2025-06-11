import {
    FontAwesome,
    Ionicons
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import styles from "../styles/TripsPstyles";

const TripsScreen = () => {
  const [activeTab, setActiveTab] = useState("completed");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#FF69B4', '#FF1493']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/passenger/HomeP')}
          >
            <Ionicons name="chevron-back" color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Viajes</Text>
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesome name="search" color="white" size={22} />
          </TouchableOpacity>
        </View>
        
        {/* Tabs de navegación */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>
              Completados
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === "canceled" && styles.activeTab]}
            onPress={() => setActiveTab("canceled")}
          >
            <Text style={[styles.tabText, activeTab === "canceled" && styles.activeTabText]}>
              Cancelados
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Contenedor de lista vacío */}
      <View style={styles.emptyContainer}>
        {/*
        <Image 
          source={require('../assets/empty-trips.png')} 
          style={styles.emptyImage} 
        />
         */}
        <Text style={styles.emptyTitle}>No hay viajes en esta sección</Text>
        <Text style={styles.emptyText}>Tus viajes aparecerán aquí</Text>
      </View>
    </View>
  );
};

export default TripsScreen;