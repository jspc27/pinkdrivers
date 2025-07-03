"use client"

import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { type ExternalPathString, type RelativePathString, router, type UnknownInputParams } from "expo-router"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
    Alert,
    Animated,
    BackHandler,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import styles from "../styles/HomePstyles"

const HomeP = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [ubicacion, setUbicacion] = useState("")
  const [destino, setDestino] = useState("")
  const [barrio, setBarrio] = useState("")
  const [puntoReferencia, setPuntoReferencia] = useState("")
  const [valorPersonalizado, setValorPersonalizado] = useState("")
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [region, setRegion] = useState({
    latitude: 3.4516, // Coordenadas de Cali
    longitude: -76.5319,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  })
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [routeDistance, setRouteDistance] = useState<number | null>(null)
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null)
  const [destinoCoords, setDestinoCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])

  // Animation references
  const menuAnimation = useRef(new Animated.Value(0)).current
  const formAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const obtenerUbicacion = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación")
        return
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 200000,
          distanceInterval: 50,
        },
        async (location) => {
          const { latitude, longitude } = location.coords
          setRegion((prev) => ({ ...prev, latitude, longitude }))
          await obtenerDireccion(latitude, longitude)
        },
      )
    }

    const obtenerDireccion = async (lat: number, lng: number) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: {
            "User-Agent": "PinkDrivers (soportepinkdrivers@gmail.com)",
          },
        })

        const textResponse = await response.text()
        console.log(textResponse)

        const data = JSON.parse(textResponse)
        console.log(data)

        if (data.address) {
          setUbicacion(data.address.road || "Ubicación no encontrada")
        } else {
          setUbicacion("Ubicación no encontrada")
        }
      } catch (error) {
        console.error("Error al obtener la dirección:", error)
        setUbicacion("Error al obtener ubicación")
      }
    }

    obtenerUbicacion()
  }, [])

  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFormExpanded) {
        collapseForm()
        return true // Prevent default back action
      }
      return false // Allow default back action
    })

    return () => backHandler.remove()
  }, [isFormExpanded])

  // Animation for menu appearance
  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [menuVisible])


  // Animation for form expansion
  useEffect(() => {
    Animated.timing(formAnimation, {
      toValue: isFormExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [isFormExpanded])

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  const navigateTo = (
    screen:
      | string
      | { pathname: RelativePathString; params?: UnknownInputParams }
      | { pathname: ExternalPathString; params?: UnknownInputParams }
      | { pathname: `/_sitemap`; params?: UnknownInputParams }
      | { pathname: `${"/(tabs)"}/explore` | `/explore`; params?: UnknownInputParams }
      | { pathname: `${"/(tabs)"}` | `/`; params?: UnknownInputParams }
      | { pathname: `/passenger/EditProfileP`; params?: UnknownInputParams }
      | { pathname: `/passenger/HomeP`; params?: UnknownInputParams }
      | { pathname: `/passenger/ProfileP`; params?: UnknownInputParams }
      | { pathname: `/passenger/RegisterP`; params?: UnknownInputParams }
      | { pathname: `/passenger/TripsP`; params?: UnknownInputParams }
      | { pathname: `/styles /EditPStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /HomePStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /IndexStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /LoginPStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /ProfilePStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /RegisterPStyles`; params?: UnknownInputParams }
      | { pathname: `/styles /TripsPStyles`; params?: UnknownInputParams },
  ) => {
    closeMenu()
    router.push(
      screen as
        | RelativePathString
        | ExternalPathString
        | "/_sitemap"
        | "/(tabs)"
        | "/(tabs)/explore"
        | "/explore"
        | "/"
        | "/passenger/EditProfileP"
        | "/passenger/HomeP"
        | "/passenger/ProfileP"
        | "/passenger/RegisterP"
        | "/passenger/TripsP",
    )
  }

  // Función para expandir el formulario
  const expandForm = () => {
    setIsFormExpanded(true)
  }

  // Función para colapsar el formulario
  const collapseForm = () => {
    setIsFormExpanded(false)
  }

  // Función para manejar toques fuera del formulario
  const handleOutsidePress = () => {
    if (isFormExpanded) {
      collapseForm()
    }
  }

  // Select vehicle type
  const selectVehicle = (vehicleType: React.SetStateAction<string>) => {
  setSelectedVehicle(vehicleType)
}

  // Validar si el formulario está completo
  const isFormComplete = () => {
    return destino && barrio && puntoReferencia && selectedVehicle && (valorPersonalizado || priceEstimate)
  }

  const handleConfirmarViaje = () => {
    if (isFormComplete()) {
      Alert.alert(
        "Viaje Confirmado",
        `Destino: ${destino}\nBarrio: ${barrio}\nPunto de referencia: ${puntoReferencia}\nVehículo: ${selectedVehicle}\nPrecio: $${valorPersonalizado || priceEstimate?.toLocaleString("es-CO")} COP`,
        [{ text: "OK" }],
      )
    } else {
      Alert.alert("Formulario incompleto", "Por favor completa todos los campos")
    }
  }

  return (
    <LinearGradient colors={["#CF5BA9", "#B33F8D"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />

      {/* Mapa como fondo */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region}>
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          {destinoCoords && <Marker coordinate={destinoCoords} pinColor="#FF1493" />}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF1493" />
          )}
        </MapView>
      </View>

      {/* Overlay para cerrar formulario cuando se toca fuera */}
      {isFormExpanded && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.formOverlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Overlay to close menu when clicking outside */}
      {menuVisible && <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />}

      {/* Avatar y menú desplegable mejorado */}
      <View style={styles.avatarMenuContainer}>
        <TouchableOpacity
          onPress={() => navigateTo("/passenger/ProfileP")}
          style={styles.avatarButtonContainer}
          activeOpacity={0.8}
        >
          <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.avatarSmall} />
        </TouchableOpacity>
      </View>

      {/* Formulario desplegable */}
      <Animated.View
        style={[
          styles.footer,
          {
            height: formAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [180, 600], // Altura aumentada: colapsada (180) vs expandida (600)
            }),
          },
        ]}
      >
        {/* Botón para colapsar cuando está expandido */}
        {isFormExpanded && (
          <TouchableOpacity style={styles.collapseButton} onPress={collapseForm}>
            <FontAwesome name="chevron-down" size={20} color="#FF1493" />
          </TouchableOpacity>
        )}

        <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false} scrollEnabled={isFormExpanded}>
          {/* Campo de ubicación actual - siempre visible */}
          <TextInput
            style={styles.input}
            placeholder="Ubicación actual"
            placeholderTextColor="#666"
            value={ubicacion}
            editable={false}
          />

          {/* Campo de destino - siempre visible pero expandible */}
          <View style={styles.searchContainer}>
            <TextInput
  style={styles.input}
  placeholder="¿A dónde quieres ir?"
  placeholderTextColor="#666"
  value={destino}
  onChangeText={setDestino}  // ← Solo esto
  onFocus={expandForm}       // ← Solo esto
/>
          </View>

         

          {/* Campos adicionales - solo visibles cuando está expandido */}
          {isFormExpanded && (
            <Animated.View
              style={{
                opacity: formAnimation,
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Barrio"
                placeholderTextColor="#666"
                value={barrio}
                onChangeText={setBarrio}
              />

              <TextInput
                style={styles.input}
                placeholder="Punto de referencia (punto cercano)"
                placeholderTextColor="#666"
                value={puntoReferencia}
                onChangeText={setPuntoReferencia}
              />

              {/* Selección de vehículo */}
              <View style={styles.vehicleSelectionContainer}>
                <Text style={styles.sectionTitle}>Selecciona el vehículo</Text>
                <View style={styles.vehicleOptions}>
                  <TouchableOpacity
                    style={[styles.vehicleOption, selectedVehicle === "moto" && styles.selectedVehicleOption]}
                    onPress={() => selectVehicle("moto")}
                  >
                    <FontAwesome5 name="motorcycle" size={24} color={selectedVehicle === "moto" ? "#fff" : "#333"} />
                    <Text style={[styles.vehicleText, selectedVehicle === "moto" && styles.selectedVehicleText]}>
                      Moto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.vehicleOption, selectedVehicle === "carro" && styles.selectedVehicleOption]}
                    onPress={() => selectVehicle("carro")}
                  >
                    <FontAwesome name="car" size={24} color={selectedVehicle === "carro" ? "#fff" : "#333"} />
                    <Text style={[styles.vehicleText, selectedVehicle === "carro" && styles.selectedVehicleText]}>
                      Carro
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.vehicleOption, selectedVehicle === "motocarro" && styles.selectedVehicleOption]}
                    onPress={() => selectVehicle("motocarro")}
                  >
                    <FontAwesome name="truck" size={24} color={selectedVehicle === "motocarro" ? "#fff" : "#333"} />
                    <Text style={[styles.vehicleText, selectedVehicle === "motocarro" && styles.selectedVehicleText]}>
                      Motocarro
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campo de precio personalizado */}
              <View style={styles.priceContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Valor a pagar (pon tu precio)"
                  placeholderTextColor="#666"
                  value={valorPersonalizado}
                  onChangeText={setValorPersonalizado}
                  keyboardType="numeric"
                />
                {priceEstimate && !valorPersonalizado && (
                  <Text style={styles.priceEstimateText}>
                    Precio sugerido: ${priceEstimate.toLocaleString("es-CO")} COP
                    {routeDistance && ` (${routeDistance.toFixed(1)} km)`}
                  </Text>
                )}
              </View>

              {/* Botón de confirmar viaje */}
              <TouchableOpacity
                style={[styles.button, !isFormComplete() && styles.buttonDisabled]}
                disabled={!isFormComplete()}
                onPress={handleConfirmarViaje}
              >
                <Text style={styles.buttonText}>Confirmar solicitud</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  )
}

export default HomeP