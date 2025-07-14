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
  View,
  ActivityIndicator,
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import styles from "../styles/HomePstyles"

const { height: screenHeight, width: screenWidth } = Dimensions.get("window")

const HomeP = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [ubicacionActual, setUbicacionActual] = useState("")
  const [barrioActual, setBarrioActual] = useState("")
  const [zonaActual, setZonaActual] = useState("")
  const [ciudadActual, setCiudadActual] = useState("")
  const [destinoDireccion, setDestinoDireccion] = useState("")
  const [destinoBarrio, setDestinoBarrio] = useState("")
  const [destinoZona, setDestinoZona] = useState("")
  const [puntoReferencia, setPuntoReferencia] = useState("")
  const [valorPersonalizado, setValorPersonalizado] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Nuevos estados para el manejo de la solicitud
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

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
  const modalAnimation = useRef(new Animated.Value(screenHeight)).current
  const overlayAnimation = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)

  // Referencias para los campos del formulario - AGREGADAS LAS DE UBICACIÓN ACTUAL
  const ubicacionActualRef = useRef<TextInput>(null)
  const barrioActualRef = useRef<TextInput>(null)
  const zonaActualRef = useRef<TextInput>(null)
  const ciudadActualRef = useRef<TextInput>(null)
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
          // Solo actualizar si los campos están vacíos (para no sobrescribir ediciones del usuario)
          if (!ubicacionActual) {
            setUbicacionActual(data.address.road || "Ubicación no encontrada")
          }
          if (!barrioActual) {
            setBarrioActual(data.address.neighbourhood || data.address.suburb || "")
          }
          if (!zonaActual) {
            setZonaActual(determinarZona(lat, lng))
          }
          if (!ciudadActual) {
            setCiudadActual(data.address.city || data.address.town || data.address.village || "")
          }
        } else {
          if (!ubicacionActual) {
            setUbicacionActual("Ubicación no encontrada")
          }
        }
      } catch (error) {
        console.error("Error al obtener la dirección:", error)
        if (!ubicacionActual) {
          setUbicacionActual("Error al obtener ubicación")
        }
      }
    }

    obtenerUbicacion()
  }, [ubicacionActual, barrioActual, zonaActual, ciudadActual])

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      const height = event.endCoordinates.height
      setKeyboardHeight(height)
      setIsKeyboardVisible(true)
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false)
      setActiveField(null)
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  // Back handler para cerrar el modal
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isModalVisible) {
        closeModal()
        return true
      }
      return false
    })
    return () => backHandler.remove()
  }, [isModalVisible])

  // Animación del menú
  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [menuVisible])

  // Animaciones del modal
  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isModalVisible])

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

  const openModal = () => {
    setIsModalVisible(true)
    setTimeout(() => {
      ubicacionActualRef.current?.focus()
    }, 500)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setActiveField(null)
    setIsWaitingForDriver(false)
    setIsSubmittingRequest(false)
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
  }

  const selectVehicle = (vehicleType: React.SetStateAction<string>) => {
    setSelectedVehicle(vehicleType)
  }

  // ACTUALIZADA - Ahora incluye los campos de ubicación actual
  const isFormComplete = () => {
    return (
      ubicacionActual &&
      barrioActual &&
      zonaActual &&
      ciudadActual &&
      destinoDireccion &&
      destinoBarrio &&
      destinoZona &&
      puntoReferencia &&
      selectedVehicle &&
      valorPersonalizado
    )
  }

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setUbicacionActual("")
    setBarrioActual("")
    setZonaActual("")
    setCiudadActual("")
    setDestinoDireccion("")
    setDestinoBarrio("")
    setDestinoZona("")
    setPuntoReferencia("")
    setValorPersonalizado("")
    setSelectedVehicle("")
  }

  const handleConfirmarViaje = async () => {
    if (!isFormComplete()) {
      Alert.alert("Formulario incompleto", "Por favor completa todos los campos")
      return
    }

    setIsSubmittingRequest(true)

    try {
      const baseUrl = "https://www.pinkdrivers.com/api-rest/index.php?action=viajes"

      const viajeData = {
        ubicacionActual,
        barrioActual,
        zonaActual,
        ciudadActual,
        destinoDireccion,
        destinoBarrio,
        destinoZona,
        puntoReferencia,
        selectedVehicle,
        valorPersonalizado: Number.parseFloat(valorPersonalizado),
      }

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viajeData),
      })

      const json = await res.json()

      if (res.ok) {
        // En lugar de mostrar alert, cambiar al estado de espera
        setIsSubmittingRequest(false)
        setIsWaitingForDriver(true)
        limpiarFormulario()
      } else {
        console.error("❌ Error en la solicitud:", json)
        setIsSubmittingRequest(false)
        Alert.alert("Error", json.error || "Hubo un problema al solicitar el viaje.")
      }
    } catch (error) {
      console.error("❌ Error al conectar con la API:", error)
      setIsSubmittingRequest(false)
      Alert.alert("Error de conexión", "No se pudo enviar el viaje. Verifica tu conexión.")
    }
  }

  const getUbicacionActualText = () => {
    const partes = [ubicacionActual, barrioActual, zonaActual, ciudadActual].filter(Boolean)
    return partes.length > 0 ? `${partes.join(" ")}` : "Obteniendo ubicación..."
  }

  // NUEVA FUNCIÓN - Para abrir el modal desde el campo de ubicación actual
  const openModalFromCurrentLocation = () => {
    setIsModalVisible(true)
    setTimeout(() => {
      ubicacionActualRef.current?.focus()
    }, 500)
  }

  // Función para cancelar la búsqueda de conductora
  const cancelarBusqueda = () => {
    setIsWaitingForDriver(false)
    closeModal()
  }

  return (
    <LinearGradient colors={["#CF5BA9", "#B33F8D"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />

      <View style={[styles.mapContainer, isKeyboardVisible && styles.mapWithKeyboard]}>
        <MapView style={styles.map} region={region}>
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          {destinoCoords && <Marker coordinate={destinoCoords} pinColor="#FF1493" />}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF1493" />
          )}
        </MapView>
      </View>

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

      {/* Footer con campo de búsqueda principal */}
      <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }]}>
        {/* Campo de ubicación actual - AHORA EDITABLE */}
        <TouchableOpacity onPress={openModalFromCurrentLocation}>
          <View style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: ubicacionActual ? "#333" : "#666", fontSize: 15 }}>{getUbicacionActualText()}</Text>
          </View>
        </TouchableOpacity>

        {/* Campo de destino - al tocarlo abre el modal */}
        <TouchableOpacity onPress={openModal}>
          <View style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: destinoDireccion ? "#333" : "#666", fontSize: 15 }}>
              {destinoDireccion || "¿A dónde quieres ir?"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal estilo DiDi */}
      {isModalVisible && (
        <>
          {/* Overlay */}
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: overlayAnimation,
              },
            ]}
          ></Animated.View>

          {/* Modal Container */}
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalAnimation }],
              },
            ]}
          >
            {/* Mostrar estado de espera de conductora */}
            {isWaitingForDriver ? (
              <View style={styles.waitingContainer}>
                <View style={styles.waitingHeader}>
                  <Text style={styles.waitingTitle}>Esperando conductora</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelarBusqueda}>
                    <FontAwesome name="times" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.waitingContent}>
                  <ActivityIndicator size="large" color="#FF69B4" style={styles.loadingIndicator} />
                  <Text style={styles.waitingMessage}>Buscando una conductora disponible...</Text>
                  <Text style={styles.waitingSubMessage}>Te notificaremos cuando encontremos una conductora</Text>

                  <TouchableOpacity style={styles.cancelSearchButton} onPress={cancelarBusqueda}>
                    <Text style={styles.cancelSearchButtonText}>Cancelar búsqueda</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Header del modal */}
                <View style={styles.modalHeader}>
                  <View style={{ width: 40 }} />
                  <Text style={styles.modalTitle}>Detalles del viaje</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <FontAwesome name="chevron-up" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del modal */}
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.modalContent}
                >
                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.modalScrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20,
                    }}
                  >
                    {/* SECCIÓN DE UBICACIÓN ACTUAL */}
                    <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 10 }]}>Ubicación actual</Text>

                    {/* Campo de ubicación actual - dirección */}
                    <TextInput
                      ref={ubicacionActualRef}
                      style={[styles.modalInput, activeField === "ubicacionActual" && styles.modalInputFocused]}
                      placeholder="Dirección actual"
                      placeholderTextColor="#666"
                      value={ubicacionActual}
                      onChangeText={setUbicacionActual}
                      onFocus={() => setActiveField("ubicacionActual")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => barrioActualRef.current?.focus()}
                    />

                    {/* Campo de ubicación actual - barrio */}
                    <TextInput
                      ref={barrioActualRef}
                      style={[styles.modalInput, activeField === "barrioActual" && styles.modalInputFocused]}
                      placeholder="Barrio actual"
                      placeholderTextColor="#666"
                      value={barrioActual}
                      onChangeText={setBarrioActual}
                      onFocus={() => setActiveField("barrioActual")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => zonaActualRef.current?.focus()}
                    />

                    {/* Campo de ubicación actual - zona */}
                    <TextInput
                      ref={zonaActualRef}
                      style={[styles.modalInput, activeField === "zonaActual" && styles.modalInputFocused]}
                      placeholder="Zona actual (Norte, Sur, Oriente, Occidente)"
                      placeholderTextColor="#666"
                      value={zonaActual}
                      onChangeText={setZonaActual}
                      onFocus={() => setActiveField("zonaActual")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => destinoDireccionRef.current?.focus()}
                    />

                    {/* Campo de ubicación actual - ciudad */}
                    <TextInput
                      ref={ciudadActualRef}
                      style={[styles.modalInput, activeField === "ciudadActual" && styles.modalInputFocused]}
                      placeholder="Ciudad actual"
                      placeholderTextColor="#666"
                      value={ciudadActual}
                      onChangeText={setCiudadActual}
                      onFocus={() => setActiveField("ciudadActual")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => destinoDireccionRef.current?.focus()}
                    />

                    {/* SECCIÓN DE DESTINO */}
                    <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Destino</Text>

                    {/* Campo de destino - dirección */}
                    <TextInput
                      ref={destinoDireccionRef}
                      style={[styles.modalInput, activeField === "destinoDireccion" && styles.modalInputFocused]}
                      placeholder="Dirección de destino"
                      placeholderTextColor="#666"
                      value={destinoDireccion}
                      onChangeText={setDestinoDireccion}
                      onFocus={() => setActiveField("destinoDireccion")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => destinoBarrioRef.current?.focus()}
                    />

                    {/* Campo de destino - barrio */}
                    <TextInput
                      ref={destinoBarrioRef}
                      style={[styles.modalInput, activeField === "destinoBarrio" && styles.modalInputFocused]}
                      placeholder="Barrio de destino"
                      placeholderTextColor="#666"
                      value={destinoBarrio}
                      onChangeText={setDestinoBarrio}
                      onFocus={() => setActiveField("destinoBarrio")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => destinoZonaRef.current?.focus()}
                    />

                    {/* Campo de destino - zona */}
                    <TextInput
                      ref={destinoZonaRef}
                      style={[styles.modalInput, activeField === "destinoZona" && styles.modalInputFocused]}
                      placeholder="Zona de destino (Norte, Sur, Oriente, Occidente)"
                      placeholderTextColor="#666"
                      value={destinoZona}
                      onChangeText={setDestinoZona}
                      onFocus={() => setActiveField("destinoZona")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => referenciaRef.current?.focus()}
                    />

                    {/* Campo de punto de referencia */}
                    <TextInput
                      ref={referenciaRef}
                      style={[styles.modalInput, activeField === "referencia" && styles.modalInputFocused]}
                      placeholder="Punto de referencia cercano (recogida)"
                      placeholderTextColor="#666"
                      value={puntoReferencia}
                      onChangeText={setPuntoReferencia}
                      onFocus={() => setActiveField("referencia")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="next"
                      onSubmitEditing={() => precioRef.current?.focus()}
                    />

                    {/* Selección de vehículo */}
                    <View style={styles.vehicleSelectionContainer}>
                      <Text style={styles.sectionTitle}>Selecciona el vehículo</Text>
                      <View style={styles.vehicleOptions}>
                        <TouchableOpacity
                          style={[styles.vehicleOption, selectedVehicle === "moto" && styles.selectedVehicleOption]}
                          onPress={() => selectVehicle("moto")}
                        >
                          <FontAwesome5
                            name="motorcycle"
                            size={24}
                            color={selectedVehicle === "moto" ? "#fff" : "#333"}
                          />
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
                          style={[
                            styles.vehicleOption,
                            selectedVehicle === "motocarro" && styles.selectedVehicleOption,
                          ]}
                          onPress={() => selectVehicle("motocarro")}
                        >
                          <FontAwesome
                            name="truck"
                            size={24}
                            color={selectedVehicle === "motocarro" ? "#fff" : "#333"}
                          />
                          <Text
                            style={[styles.vehicleText, selectedVehicle === "motocarro" && styles.selectedVehicleText]}
                          >
                            Motocarro
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Campo de precio personalizado */}
                    <TextInput
                      ref={precioRef}
                      style={[styles.modalInput, activeField === "precio" && styles.modalInputFocused]}
                      placeholder="Pon tu precio"
                      placeholderTextColor="#666"
                      value={valorPersonalizado}
                      onChangeText={setValorPersonalizado}
                      keyboardType="numeric"
                      onFocus={() => setActiveField("precio")}
                      onBlur={() => setActiveField(null)}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />

                    {priceEstimate && !valorPersonalizado && (
                      <Text style={styles.priceEstimateText}>
                        Precio sugerido: ${priceEstimate.toLocaleString("es-CO")} COP
                        {routeDistance && ` (${routeDistance.toFixed(1)} km)`}
                      </Text>
                    )}

                    {/* Botón de confirmar solicitud */}
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        (!isFormComplete() || isSubmittingRequest) && styles.modalButtonDisabled,
                      ]}
                      disabled={!isFormComplete() || isSubmittingRequest}
                      onPress={handleConfirmarViaje}
                    >
                      {isSubmittingRequest ? (
                        <View style={styles.buttonLoadingContainer}>
                          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                          <Text style={styles.modalButtonText}>Enviando solicitud...</Text>
                        </View>
                      ) : (
                        <Text style={styles.modalButtonText}>Confirmar solicitud</Text>
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </KeyboardAvoidingView>
              </>
            )}
          </Animated.View>
        </>
      )}
    </LinearGradient>
  )
}

export default HomeP
