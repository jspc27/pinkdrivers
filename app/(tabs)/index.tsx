import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/WelcomeStyles';

const Index = () => {
  useEffect(() => {
    const checkSession = async () => {
      const token = await AsyncStorage.getItem('token');
      const rol = await AsyncStorage.getItem('rol');

      if (token && rol) {
        // Redirige al home según el rol
        if (rol === 'conductora') {
          router.replace('/driver/HomeDriver');
        } else if (rol === 'pasajero') {
          router.replace('/passenger/HomeP');
        }
      }
    };

    checkSession();
  }, []);

  return (
    <LinearGradient colors={['#FF69B4', '#FF1493']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/LogoPink.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Bienvenid@</Text>
        </View>

        <View style={{ marginTop: 60, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/passenger/LoginP')}
          >
            <Text style={styles.buttonText}>Soy pasajer@</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/driver/LoginD')}
          >
            <Text style={styles.buttonText}>Soy conductora</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Index;
