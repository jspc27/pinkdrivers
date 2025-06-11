import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import styles from '../styles/WelcomeStyles'; // usa los estilos que se te dan abajo

const Index = () => {
  return (
    <LinearGradient
      colors={['#FF69B4', '#FF1493']}
      style={styles.container}
    >
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
