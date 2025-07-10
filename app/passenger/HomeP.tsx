"use client"

import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { router } from "expo-router"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import styles from "../styles/HomePstyles"

const { height: screenHeight } = Dimensions.get("window")

const HomeP = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [ubicacionActual, setUbicacionActual] = useState("")
  const [barrioActual, setBarrioActual] = useState("")
  const [zonaActual, setZonaActual] = useState("")
  const [destinoDireccion, setDestinoDireccion] = useState("")
  const [destinoBarrio, setDestinoBarrio] = useState("")
  const [destinoZona, setDestinoZona] = useState("")
  const [puntoReferencia, setPuntoReferencia] = useState("")
  const [valorPersonalizado, setValorPersonalizado] = useState("")
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [region, setRegion] = useState({
    latitude: 3.4516,
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
  const keyboardAnimation = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)

  // Referencias para medir la posición de cada campo
  const destinoDireccionRef = useRef<TextInput>(null)
  const destinoBarrioRef = useRef<TextInput>(null)
  const destinoZonaRef = useRef<TextInput>(null)
  const referenciaRef = useRef<TextInput>(null)
  const precioRef = useRef<TextInput>(null)

  // Función para determinar la zona basada en coordenadas
  const determinarZona = (latitude: number, longitude: number) => {
    if (latitude > 3.45 && longitude < -76.53) return "Norte"
    if (latitude < 3.45 && longitude < -76.53) return "Sur"
    if (latitude > 3.45 && longitude > -76.53) return "Oriente"
    return "Occidente"
  }

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
        const data = JSON.parse(textResponse)
        if (data.address) {
          setUbicacionActual(data.address.road || "Ubicación no encontrada")
          setBarrioActual(data.address.neighbourhood || data.address.suburb || "")
          setZonaActual(determinarZona(lat, lng))
        } else {
          setUbicacionActual("Ubicación no encontrada")
        }
      } catch (error) {
        console.error("Error al obtener la dirección:", error)
        setUbicacionActual("Error al obtener ubicación")
      }
    }

    obtenerUbicacion()
  }, [])

  // Keyboard event listeners - MODIFICADO para solo ejecutar con campo precio
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      const height = event.endCoordinates.height
      setKeyboardHeight(height)
      setIsKeyboardVisible(true)

      // SOLO ejecutar handleFieldFocus si el campo activo es "precio"
      if (activeField === "precio") {
        handleFieldFocus(activeField, height)
      }
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false)
      setActiveField(null)
      setKeyboardHeight(0)

      Animated.timing(keyboardAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start()
    })

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [activeField])

  // Función MEJORADA - Todos los campos deben ajustarse al teclado
const handleFieldFocus = (fieldName: string, keyboardHeight: number) => {
  let scrollOffset = 0
  let formOffset = 0

  switch (fieldName) {
    case "destinoDireccion":
      scrollOffset = 0
      formOffset = 0
      break
    case "destinoBarrio":
      scrollOffset = 100
      formOffset = keyboardHeight * 0.1
      break
    case "destinoZona":
      scrollOffset = 200
      formOffset = keyboardHeight * 0.15
      break
    case "referencia":
      scrollOffset = 300
      formOffset = keyboardHeight * 0.2
      break
    case "precio":
      scrollOffset = 400
      formOffset = keyboardHeight * 0.3
      break
    default:
      scrollOffset = 0
      formOffset = 0
  }

  // Animar el formulario hacia arriba para todos los campos después del primero
  if (fieldName !== "destinoDireccion") {
    Animated.timing(keyboardAnimation, {
      toValue: formOffset,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

   // Hacer scroll progresivo
  setTimeout(() => {
    scrollViewRef.current?.scrollTo({ y: scrollOffset, animated: true })
  }, 150)
}

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFormExpanded) {
        collapseForm()
        return true
      }
      return false
    })
    return () => backHandler.remove()
  }, [isFormExpanded])

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [menuVisible])

  useEffect(() => {
    Animated.timing(formAnimation, {
      toValue: isFormExpanded ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start()
  }, [isFormExpanded])

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  const navigateTo = (screen: any) => {
    closeMenu()
    router.push(screen)
  }

  const expandForm = () => {
    setIsFormExpanded(true)
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    }, 100)
  }

  const collapseForm = () => {
    setIsFormExpanded(false)
    setActiveField(null)
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }, 300)
  }

  const handleOutsidePress = () => {
    if (isFormExpanded) {
      collapseForm()
    }
  }

  const selectVehicle = (vehicleType: React.SetStateAction<string>) => {
    setSelectedVehicle(vehicleType)
  }

  const isFormComplete = () => {
    return destinoDireccion && destinoBarrio && destinoZona && puntoReferencia && selectedVehicle && valorPersonalizado
  }

  const handleConfirmarViaje = () => {
    if (isFormComplete()) {
      const ubicacionCompleta = `${ubicacionActual} ${barrioActual} ${zonaActual}`.trim()
      const destinoCompleto = `${destinoDireccion} ${destinoBarrio} ${destinoZona}`.trim()
      
      Alert.alert(
        "Solicitud Confirmada",
        `Estoy en: ${ubicacionCompleta}\nVoy a: ${destinoCompleto}\nPunto de referencia: ${puntoReferencia}\nVehículo: ${selectedVehicle}\nPrecio: $${valorPersonalizado} COP`,
        [{ text: "OK" }],
      )
    } else {
      Alert.alert("Formulario incompleto", "Por favor completa todos los campos")
    }
  }

  // Manejadores SIMPLIFICADOS - Solo setean el activeField
  const handleDestinoDireccionFocus = () => {
    setActiveField("destinoDireccion")
    if (!isFormExpanded) {
      expandForm()
    }
  }

  const handleDestinoBarrioFocus = () => {
    setActiveField("destinoBarrio")
  }

  const handleDestinoZonaFocus = () => {
    setActiveField("destinoZona")
  }

  const handleReferenciaFocus = () => {
    setActiveField("referencia")
  }

  const handlePrecioFocus = () => {
    setActiveField("precio")
    // No necesitamos llamar handleFieldFocus aquí, se ejecutará automáticamente
    // cuando el teclado aparezca debido al useEffect
  }

  const handleFieldBlur = () => {
    setTimeout(() => {
      setActiveField(null)
    }, 100)
  }

  // Función MEJORADA para calcular altura del formulario
const getFormHeight = () => {
  if (!isFormExpanded) return 180
  
  if (isKeyboardVisible) {
    // Reducir la altura disponible para evitar el espacio en blanco
    return screenHeight - keyboardHeight - 50
  }
  
  return 750
}

  const getUbicacionActualText = () => {
    const partes = [ubicacionActual, barrioActual, zonaActual].filter(Boolean)
    return partes.length > 0 ? `Estoy en ${partes.join(" ")}` : "Obteniendo ubicación..."
  }

  return (
    <LinearGradient colors={["#CF5BA9", "#B33F8D"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />

      <View style={[
  styles.mapContainer,
  isKeyboardVisible && styles.mapWithKeyboard
]}>
        <MapView style={styles.map} region={region}>
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          {destinoCoords && <Marker coordinate={destinoCoords} pinColor="#FF1493" />}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF1493" />
          )}
        </MapView>
      </View>

      {isFormExpanded && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.formOverlay} />
        </TouchableWithoutFeedback>
      )}

      {menuVisible && <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />}

      <View style={styles.avatarMenuContainer}>
        <TouchableOpacity
          onPress={() => navigateTo("/passenger/ProfileP")}
          style={styles.avatarButtonContainer}
          activeOpacity={0.8}
        >
          <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.avatarSmall} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : undefined}
  style={{ position: "absolute", bottom: 0, width: "100%" }}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
>
        <Animated.View
  style={[
    styles.footer,
    {
      height: formAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [180, getFormHeight()],
      }),
      // Cambiar de translateY a bottom
      bottom: keyboardAnimation.interpolate({
        inputRange: [0, 400],
        outputRange: [0, 0], // Mantener en 0, no mover
        extrapolate: "clamp",
      }),
      // Quitar marginBottom
      // marginBottom: isKeyboardVisible ? -30 : 0,
    },
    isKeyboardVisible && styles.footerWithKeyboard,
  ]}
>
          {/* Botón para colapsar - solo visible cuando no hay teclado o no es el campo precio */}
          {isFormExpanded && (!isKeyboardVisible || activeField !== "precio") && (
            <TouchableOpacity style={styles.collapseButton} onPress={collapseForm}>
              <FontAwesome name="chevron-down" size={20} color="#FF1493" />
            </TouchableOpacity>
          )}

          <ScrollView
  ref={scrollViewRef}
  style={styles.formScrollView}
  showsVerticalScrollIndicator={false}
  scrollEnabled={isFormExpanded}
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{
    // Padding dinámico basado en el teclado
    paddingBottom: isKeyboardVisible ? 150 : 20,
    flexGrow: 1,
  }}
>
            {/* Campo de ubicación actual */}
            <TextInput
              style={styles.input}
              placeholder="Ubicación actual"
              placeholderTextColor="#666"
              value={getUbicacionActualText()}
              editable={false}
            />

            {/* Campo de destino - dirección */}
            <View style={styles.searchContainer}>
              <TextInput
                ref={destinoDireccionRef}
                style={[styles.input, activeField === "destinoDireccion" && styles.inputFocused]}
                placeholder="¿A dónde quieres ir?"
                placeholderTextColor="#666"
                value={destinoDireccion}
                onChangeText={setDestinoDireccion}
                onFocus={handleDestinoDireccionFocus}
                onBlur={handleFieldBlur}
                returnKeyType="next"
                onSubmitEditing={() => destinoBarrioRef.current?.focus()}
              />
            </View>

            {isFormExpanded && (
              <Animated.View
                style={{
                  opacity: formAnimation,
                }}
              >
                {/* Campo de destino - barrio */}
                <TextInput
                  ref={destinoBarrioRef}
                  style={[styles.input, activeField === "destinoBarrio" && styles.inputFocused]}
                  placeholder="Barrio de destino"
                  placeholderTextColor="#666"
                  value={destinoBarrio}
                  onChangeText={setDestinoBarrio}
                  onFocus={handleDestinoBarrioFocus}
                  onBlur={handleFieldBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => destinoZonaRef.current?.focus()}
                />

                {/* Campo de destino - zona */}
                <TextInput
                  ref={destinoZonaRef}
                  style={[styles.input, activeField === "destinoZona" && styles.inputFocused]}
                  placeholder="Zona (Norte, Sur, Oriente, Occidente)"
                  placeholderTextColor="#666"
                  value={destinoZona}
                  onChangeText={setDestinoZona}
                  onFocus={handleDestinoZonaFocus}
                  onBlur={handleFieldBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => referenciaRef.current?.focus()}
                />

                {/* Campo de punto de referencia */}
                <TextInput
                  ref={referenciaRef}
                  style={[styles.input, activeField === "referencia" && styles.inputFocused]}
                  placeholder="Punto de referencia cercano (recogida)"
                  placeholderTextColor="#666"
                  value={puntoReferencia}
                  onChangeText={setPuntoReferencia}
                  onFocus={handleReferenciaFocus}
                  onBlur={handleFieldBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    setTimeout(() => {
                      precioRef.current?.focus()
                    }, 200)
                  }}
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

                {/* Campo de precio personalizado - ESPECIAL */}
                <View style={styles.priceContainer}>
                  <TextInput
                    ref={precioRef}
                    style={[
                      styles.input,
                      activeField === "precio" && styles.inputFocused,
                      isKeyboardVisible && activeField === "precio" && styles.inputWithKeyboard,
                    ]}
                    placeholder="Pon tu precio"
                    placeholderTextColor="#666"
                    value={valorPersonalizado}
                    onChangeText={setValorPersonalizado}
                    keyboardType="numeric"
                    onFocus={handlePrecioFocus}
                    onBlur={handleFieldBlur}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  {priceEstimate && !valorPersonalizado && (
                    <Text style={styles.priceEstimateText}>
                      Precio sugerido: ${priceEstimate.toLocaleString("es-CO")} COP
                      {routeDistance && ` (${routeDistance.toFixed(1)} km)`}
                    </Text>
                  )}
                </View>

                {/* Botón de confirmar solicitud - visible siempre que el formulario esté expandido */}
{isFormExpanded && (
  <TouchableOpacity
    style={[styles.button, !isFormComplete() && styles.buttonDisabled]}
    disabled={!isFormComplete()}
    onPress={handleConfirmarViaje}
  >
    <Text style={styles.buttonText}>Confirmar solicitud</Text>
  </TouchableOpacity>
)}
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default HomeP