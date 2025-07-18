"use client"

import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { router } from "expo-router"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
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
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import styles from "../styles/HomePstyles"
const { height: screenHeight, width: screenWidth } = Dimensions.get("window")

interface ContraofertaData {
  viaje_id: number
  valorPersonalizado: string
  conductora_nombre: string
  vehiculo_placa: string
}

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

  // Estados para el manejo de la solicitud
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  // Estados para contraofertas
  const [contraofertaData, setContraofertaData] = useState<ContraofertaData | null>(null)
  const [showContraoferta, setShowContraoferta] = useState(false)
  const [isProcessingResponse, setIsProcessingResponse] = useState(false)

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

  // Referencias para los campos del formulario
  const ubicacionActualRef = useRef<TextInput>(null)
  const barrioActualRef = useRef<TextInput>(null)
  const zonaActualRef = useRef<TextInput>(null)
  const ciudadActualRef = useRef<TextInput>(null)
  const destinoDireccionRef = useRef<TextInput>(null)
  const destinoBarrioRef = useRef<TextInput>(null)
  const destinoZonaRef = useRef<TextInput>(null)
  const referenciaRef = useRef<TextInput>(null)
  const precioRef = useRef<TextInput>(null)

  // Estado para el usuario logueado
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [usuarioData, setUsuarioData] = useState<any>(null)

  // Función para decodificar JWT
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error decodificando JWT:", error)
      return null
    }
  }

  // Función para determinar la zona basada en coordenadas
  const determinarZona = (latitude: number, longitude: number) => {
    if (latitude > 3.45 && longitude < -76.53) return "Norte"
    if (latitude < 3.45 && longitude < -76.53) return "Sur"
    if (latitude > 3.45 && longitude > -76.53) return "Oriente"
    return "Occidente"
  }

  // Función para consultar contraofertas usando el controlador PHP
 const consultarContraoferta = async () => {
  try {
    const token = await AsyncStorage.getItem("token")
    console.log("🟡 Token usado:", token)

    const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=ver_contraoferta", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    console.log("🟡 Respuesta cruda:", data)

    if (response.ok && data.success && data.data) {
      console.log("✅ Contraoferta recibida:", data.data)
      setContraofertaData(data.data)
      setShowContraoferta(true)
    } else {
      console.log("ℹ️ No hay contraofertas disponibles:", data.message)
      setContraofertaData(null)
      setShowContraoferta(false)
    }
  } catch (error) {
    console.error("❌ Error al consultar contraoferta:", error)
    setContraofertaData(null)
    setShowContraoferta(false)
  }
}


  // Función para aceptar contraoferta
  const aceptarContraoferta = async () => {
    if (!contraofertaData) return

    setIsProcessingResponse(true)
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=aceptar_contraoferta", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viaje_id: contraofertaData.viaje_id,
          aceptado: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        Alert.alert(
          "¡Contraoferta aceptada!",
          `Has aceptado la propuesta de ${contraofertaData.conductora_nombre} por $${Number(contraofertaData.valorPersonalizado).toLocaleString()} COP`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowContraoferta(false)
                setContraofertaData(null)
                setIsWaitingForDriver(false)
                closeModal()
              },
            },
          ],
        )
      } else {
        Alert.alert("Error", data.message || "No se pudo aceptar la contraoferta")
      }
    } catch (error) {
      console.error("Error al aceptar contraoferta:", error)
      Alert.alert("Error", "No se pudo procesar la respuesta")
    } finally {
      setIsProcessingResponse(false)
    }
  }

  // Función para rechazar contraoferta
  const rechazarContraoferta = async () => {
    if (!contraofertaData) return

    setIsProcessingResponse(true)
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=rechazar_contraoferta", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viaje_id: contraofertaData.viaje_id,
          aceptado: false,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        Alert.alert(
          "Contraoferta rechazada",
          "Has rechazado la propuesta. Seguiremos buscando otras conductoras disponibles.",
          [
            {
              text: "OK",
              onPress: () => {
                setShowContraoferta(false)
                setContraofertaData(null)
                // Continuar buscando conductoras
              },
            },
          ],
        )
      } else {
        Alert.alert("Error", data.message || "No se pudo rechazar la contraoferta")
      }
    } catch (error) {
      console.error("Error al rechazar contraoferta:", error)
      Alert.alert("Error", "No se pudo procesar la respuesta")
    } finally {
      setIsProcessingResponse(false)
    }
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

  // Polling para consultar contraofertas cuando se está esperando conductora
  useEffect(() => {
    let intervalId: number

    if (isWaitingForDriver && !showContraoferta) {
      // Consultar inmediatamente
      consultarContraoferta()

      // Luego consultar cada 5 segundos
      intervalId = setInterval(() => {
        consultarContraoferta()
      },5000 )
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isWaitingForDriver, showContraoferta])

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

  // Obtener datos del usuario desde el token
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem("token")

        if (!token) {
          console.warn("No se encontró el token")
          router.push("/passenger/LoginP")
          return
        }

        const decodedToken = decodeJWT(token)
        if (decodedToken && decodedToken.id) {
          setUsuarioId(decodedToken.id)
          setUsuarioData(decodedToken)
          console.log("✅ Usuario obtenido del token:", decodedToken)
          return
        }

        const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=getUser", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data && data.id) {
            setUsuarioId(data.id)
            setUsuarioData(data)
            console.log("✅ Usuario obtenido del servidor:", data)
          } else {
            console.warn("No se pudo obtener el ID del usuario del servidor")
          }
        } else {
          console.warn("Error al obtener usuario del servidor:", response.status)
          if (response.status === 401) {
            await AsyncStorage.removeItem("token")
            router.push("/passenger/LoginP")
          }
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error)
      }
    }

    obtenerUsuario()
  }, [])

  

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
    setShowContraoferta(false)
    setContraofertaData(null)
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
  }

  const selectVehicle = (vehicleType: React.SetStateAction<string>) => {
    setSelectedVehicle(vehicleType)
  }

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
      valorPersonalizado &&
      usuarioId
    )
  }

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
    if (!usuarioId) {
      Alert.alert("Error de sesión", "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
      router.push("/passenger/LoginP")
      return
    }

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
        usuario_id: usuarioId,
      }

      console.log("📤 Enviando solicitud de viaje:", viajeData)

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
        body: JSON.stringify(viajeData),
      })

      const json = await res.json()
      console.log("📥 Respuesta del servidor:", json)

      if (res.ok) {
        setIsSubmittingRequest(false)
        setIsWaitingForDriver(true)
        limpiarFormulario()
        console.log("✅ Solicitud de viaje enviada exitosamente")
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

  const openModalFromCurrentLocation = () => {
    setIsModalVisible(true)
    setTimeout(() => {
      ubicacionActualRef.current?.focus()
    }, 500)
  }

  const cancelarBusqueda = () => {
    setIsWaitingForDriver(false)
    setShowContraoferta(false)
    setContraofertaData(null)
    closeModal()
  }

  if (!usuarioId) {
    return (
      <LinearGradient
        colors={["#CF5BA9", "#B33F8D"]}
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>Cargando...</Text>
      </LinearGradient>
    )
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

      <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }]}>
        <TouchableOpacity onPress={openModalFromCurrentLocation}>
          <View style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: ubicacionActual ? "#333" : "#666", fontSize: 15 }}>{getUbicacionActualText()}</Text>
          </View>
        </TouchableOpacity>

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
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: overlayAnimation,
              },
            ]}
          ></Animated.View>

          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalAnimation }],
              },
            ]}
          >
            {/* Mostrar contraoferta si está disponible */}
            {isWaitingForDriver && showContraoferta && contraofertaData ? (
              <View style={styles.waitingContainer}>
                <View style={styles.waitingHeader}>
                  <Text style={styles.waitingTitle}>¡Nueva propuesta!</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelarBusqueda}>
                    <FontAwesome name="times" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.waitingContent}>
                  <View style={styles.contraofertaCard}>
                    <FontAwesome5 name="user-circle" size={60} color="#FF69B4" style={{ marginBottom: 20 }} />

                    <Text style={styles.contraofertaDriverName}>
                      {contraofertaData.conductora_nombre.split(" ")[0]}
                    </Text>

                    <Text style={styles.contraofertaPlate}>Placas: {contraofertaData.vehiculo_placa}</Text>

                    <Text style={styles.contraofertaMessage}>Te propuso un precio de:</Text>

                    <Text style={styles.contraofertaPrice}>
                      ${Number(contraofertaData.valorPersonalizado).toLocaleString()} COP
                    </Text>

                    <View style={styles.contraofertaButtons}>
                      <TouchableOpacity
                        style={[styles.contraofertaButton, styles.rejectButton]}
                        onPress={rechazarContraoferta}
                        disabled={isProcessingResponse}
                      >
                        {isProcessingResponse ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <>
                            <FontAwesome name="times" size={16} color="#666" />
                            <Text style={styles.rejectButtonText}>Rechazar</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.contraofertaButton, styles.acceptButton]}
                        onPress={aceptarContraoferta}
                        disabled={isProcessingResponse}
                      >
                        {isProcessingResponse ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <FontAwesome name="check" size={16} color="#fff" />
                            <Text style={styles.acceptButtonText}>Aceptar</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : isWaitingForDriver ? (
              // Mostrar estado de espera normal
              <View style={styles.waitingContainer}>
                <View style={styles.waitingHeader}>
                  <Text style={styles.waitingTitle}>Buscando conductora</Text>
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
                    <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Ubicación actual</Text>

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
