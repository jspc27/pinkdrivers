import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { ExternalPathString, RelativePathString, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import styles from "../styles/HomeDriverPstyles";

const HomeDriver = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [ubicacion, setUbicacion] = useState("");
  const [isDriverActive, setIsDriverActive] = useState(false);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [region, setRegion] = useState({
    latitude: 3.4516,
    longitude: -76.5319,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [rideRequest, setRideRequest] = useState({
  pickupLocation: "Av. Circunvalar #9-42, Belen, Cali, Valle del Cauca",
  destination: "Centro Comercial Palmetto",
  distance: 3.5,
  estimatedTime: 12,
  price: 8500, // Nuevo campo para el precio
  passenger: {
    name: "Carolina Gómez",
    phone: "+57 315 789 4321",
    whatsapp: "+573157894321",
    photo: "https://i.pravatar.cc/150?img=23",
    latitude: 3.4409,
    longitude: -76.5225,
  },
});

  const [routeToPickup, setRouteToPickup] = useState<{ latitude: number; longitude: number }[]>([]);

  const fetchRouteToPickup = async () => {
    const origin = `${region.latitude},${region.longitude}`;
    const destination = `${rideRequest.passenger.latitude},${rideRequest.passenger.longitude}`;
    const apiKey = "AIzaSyBz9w_gTpme9AMOMzJtRk3AYDO1-JlMKEA";

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const coordinates = decodePolyline(points);
        setRouteToPickup(coordinates);
      }
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
    }
  };

  const decodePolyline = (t: string, e = 5) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0; result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const menuAnimation = useRef(new Animated.Value(0)).current;
  const rideRequestAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación");
        return;
      }
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 200000, distanceInterval: 50 },
        (location) => {
          const { latitude, longitude } = location.coords;
          setRegion((prev) => ({ ...prev, latitude, longitude }));
        }
      );
    })();
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDriverActive) {
      timeout = setTimeout(() => setShowRideRequest(true), 3000);
    } else {
      setShowRideRequest(false);
    }
    return () => clearTimeout(timeout);
  }, [isDriverActive]);

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    Animated.timing(rideRequestAnimation, {
      toValue: showRideRequest ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, showRideRequest]);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const closeMenu = () => setMenuVisible(false);
  const navigateTo = (screen: RelativePathString | ExternalPathString) => {
    closeMenu();
    router.push(screen);
  };
  const toggleDriverActive = () => setIsDriverActive(!isDriverActive);

  useEffect(() => { if (!showRideRequest && isDriverActive) fetchRouteToPickup(); }, [showRideRequest, isDriverActive]);

  const handleAcceptRide = () => {
    setShowRideRequest(false);
    fetchRouteToPickup();
  };
  const handleRejectRide = () => setShowRideRequest(false);

  const openWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${rideRequest.passenger.whatsapp}`).catch(() =>
      Alert.alert("Error", "No se pudo abrir WhatsApp.")
    );
  };
  const callPassenger = () => {
    Linking.openURL(`tel:${rideRequest.passenger.phone.replace(/\s/g, '')}`);
  };

  const menuOpacity = menuAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const menuTranslateY = menuAnimation.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });
  const rideRequestTranslateY = rideRequestAnimation.interpolate({ inputRange: [0, 1], outputRange: [200, 0] });
  const rideRequestOpacity = rideRequestAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <LinearGradient colors={['#FFE4F3', '#FFC1E3']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />

      <View style={styles.mapContainer}>
        <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region}>
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="Tú (conductora)" pinColor="red" />
          <Marker coordinate={{ latitude: rideRequest.passenger.latitude, longitude: rideRequest.passenger.longitude }} title="Pasajera" pinColor="green" />
          {routeToPickup.length > 0 && <Polyline coordinates={routeToPickup} strokeColor="#FF69B4" strokeWidth={4} />}
        </MapView>
      </View>

      {menuVisible && <TouchableOpacity style={styles.menuOverlay} onPress={closeMenu} activeOpacity={1} />}

      <View style={styles.avatarMenuContainer}>
        <TouchableOpacity onPress={() => navigateTo("./ProfileP")} style={styles.avatarButtonContainer} activeOpacity={0.8}>
          <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.avatarSmall} />
        </TouchableOpacity>
      </View>

      {showRideRequest && (
  <Animated.View style={[styles.rideRequestContainer, { opacity: rideRequestOpacity, transform: [{ translateY: rideRequestTranslateY }] }]}>
    {/* Header con precio destacado */}
    <View style={styles.rideRequestHeader}>
      <View style={styles.headerTop}>
        <Text style={styles.rideRequestTitle}>Nueva solicitud</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${rideRequest.price.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>COP</Text>
        </View>
      </View>
    </View>

    {/* Información del pasajero */}
    <View style={styles.passengerSection}>
      <View style={styles.passengerInfo}>
        <Image source={{ uri: rideRequest.passenger.photo }} style={styles.passengerAvatar} />
        <Text style={styles.passengerName}>{rideRequest.passenger.name}</Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <FontAwesome name="whatsapp" size={20} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={callPassenger}>
          <FontAwesome name="phone" size={20} color="#FF69B4" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Ruta del viaje */}
    <View style={styles.routeSection}>
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>
        <View style={styles.locationTexts}>
          <View style={styles.locationItem}>
            <Text style={styles.locationLabel}>Recoger en</Text>
            <Text style={styles.locationAddress}>{rideRequest.pickupLocation}</Text>
          </View>
          <View style={styles.locationItem}>
            <Text style={styles.locationLabel}>Destino</Text>
            <Text style={styles.locationAddress}>{rideRequest.destination}</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Información del viaje */}
    <View style={styles.tripInfoSection}>
      <View style={styles.tripInfoItem}>
        <FontAwesome name="road" size={16} color="#666" />
        <Text style={styles.tripInfoText}>{rideRequest.distance} km</Text>
      </View>
      <View style={styles.tripInfoItem}>
        <FontAwesome name="clock-o" size={16} color="#666" />
        <Text style={styles.tripInfoText}>{rideRequest.estimatedTime} min</Text>
      </View>
    </View>

    {/* Botones de acción */}
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.declineButton} onPress={handleRejectRide}>
        <Text style={styles.declineButtonText}>Rechazar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRide}>
        <Text style={styles.acceptButtonText}>Aceptar</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
)}

      <LinearGradient colors={['#FFE4F3', '#FFC1E3']} style={styles.driverFooter}>
        <View style={styles.footerContent}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{isDriverActive ? "Disponible" : "No disponible"}</Text>
            <Switch
              value={isDriverActive}
              onValueChange={toggleDriverActive}
              trackColor={{ false: "#d3d3d3", true: "#FF9ECE" }}
              thumbColor={isDriverActive ? "#FF69B4" : "#f4f3f4"}
              ios_backgroundColor="#d3d3d3"
              style={styles.statusSwitch}
            />
          </View>

          <Text style={styles.driverLocationText}>Tu ubicación actual: {ubicacion}</Text>
          <Text style={[styles.driverStatusInfo, { color: isDriverActive ? "#FF69B4" : "#757575" }]}>
            {isDriverActive ? "Esperando solicitudes de viaje..." : "Activa tu disponibilidad para recibir viajes"}
          </Text>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
};

export default HomeDriver;
