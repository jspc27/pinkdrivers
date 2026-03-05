"use client"
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Picker } from "@react-native-picker/picker"
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
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import styles from "../styles/HomePstyles"

const { height: screenHeight, width: screenWidth } = Dimensions.get("window")

interface ContraofertaData {
  viaje_id: number
  valorPersonalizado: string
  conductora_nombre: string
  vehiculo_placa: string
  vehiculo_color: string
}

interface AcceptedTripData {
  id: number
  ubicacionActual: string
  barrioActual: string
  zonaActual: string
  ciudadActual: string
  destinoDireccion: string
  destinoBarrio: string
  destinoZona: string
  puntoReferencia: string
  valorPersonalizado: number
  selectedVehicle: string
  estado: string
  fecha_creacion: string
  conductora_nombre: string
  conductora_telefono: string
  vehiculo_placa?: string
  vehiculo_color?: string
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

  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  const [contraofertaData, setContraofertaData] = useState<ContraofertaData | null>(null)
  const [showContraoferta, setShowContraoferta] = useState(false)
  const [isProcessingResponse, setIsProcessingResponse] = useState(false)

  const [acceptedTrip, setAcceptedTrip] = useState<AcceptedTripData | null>(null)
  const [isLoadingAcceptedTrip, setIsLoadingAcceptedTrip] = useState(false)

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const [locationLoading, setLocationLoading] = useState(true)

  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [routeDistance, setRouteDistance] = useState<number | null>(null)
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null)

  const menuAnimation = useRef(new Animated.Value(0)).current
  const modalAnimation = useRef(new Animated.Value(screenHeight)).current
  const overlayAnimation = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)

  const ubicacionActualRef = useRef<TextInput>(null)
  const barrioActualRef = useRef<TextInput>(null)
  const ciudadActualRef = useRef<TextInput>(null)
  const destinoDireccionRef = useRef<TextInput>(null)
  const destinoBarrioRef = useRef<TextInput>(null)
  const referenciaRef = useRef<TextInput>(null)
  const precioRef = useRef<TextInput>(null)

  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [usuarioData, setUsuarioData] = useState<any>(null)

  // ✅ CORRECCIÓN 1: isWaitingForDelivery mantenido separado de closeModal
  const [isWaitingForDelivery, setIsWaitingForDelivery] = useState(false)

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastViajeIdRef = useRef<number | null>(null)

  const [serviceMode, setServiceMode] = useState<'viajes' | 'pinkentregas' | null>(null)

  const isPE = serviceMode === 'pinkentregas'
  const dynHeader     = isPE ? styles.modalHeaderPE     : styles.modalHeader
  const dynTitle      = isPE ? styles.modalTitlePE      : styles.modalTitle
  const dynInput      = isPE ? styles.modalInputPE      : styles.modalInput
  const dynInputFocus = isPE ? styles.modalInputFocusedPE : styles.modalInputFocused
  const dynButton     = isPE ? styles.modalButtonPE     : styles.modalButton
  const dynBtnDis     = isPE ? styles.modalButtonDisabledPE : styles.modalButtonDisabled
  const dynVehicleSel = isPE ? styles.selectedVehicleOptionPE : styles.selectedVehicleOption
  const dynSecTitle   = isPE ? styles.sectionTitlePE    : styles.sectionTitle

  const [senderName, setSenderName] = useState("")
  const [senderPhone, setSenderPhone] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [receiverPhone, setReceiverPhone] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [isFragile, setIsFragile] = useState<boolean | null>(null)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [deliveryPrice, setDeliveryPrice] = useState("")
  const [deliveryVehicle, setDeliveryVehicle] = useState("")
  const [pickupBarrio, setPickupBarrio] = useState("")
  const [pickupZona, setPickupZona] = useState("")
  const [pickupCiudad, setPickupCiudad] = useState("")
  const [deliveryBarrio, setDeliveryBarrio] = useState("")
  const [deliveryZona, setDeliveryZona] = useState("")
  const [deliveryCiudad, setDeliveryCiudad] = useState("")

  const [entregaResumen, setEntregaResumen] = useState<{
    recogida: string
    entrega: string
    precio: string
    vehiculo: string
  } | null>(null)

  const zonasDisponibles = [
    { label: "Seleccionar zona", value: "" },
    { label: "Norte", value: "Norte" },
    { label: "Sur", value: "Sur" },
    { label: "Oriente", value: "Oriente" },
    { label: "Occidente", value: "Occidente" },
  ]

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

  const determinarZona = (latitude: number, longitude: number) => {
    if (latitude > 3.45 && longitude < -76.53) return "Norte"
    if (latitude < 3.45 && longitude < -76.53) return "Sur"
    if (latitude > 3.45 && longitude > -76.53) return "Oriente"
    return "Occidente"
  }

  const parseJSONSafely = (text: string) => {
    try {
      if (!text || text.trim() === '') {
        console.warn("⚠️ Respuesta vacía del servidor")
        return { error: "Respuesta vacía", isEmpty: true }
      }
      const parsed = JSON.parse(text)
      return parsed
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error)
      console.error("❌ Texto recibido:", text)
      return { error: "Error al parsear JSON", originalText: text }
    }
  }

  const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
    try {
      console.log(`🌐 Haciendo petición a: ${url}`)
      const response = await fetch(url, { ...options })
      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`)
        return { success: false, error: `Error HTTP ${response.status}`, status: response.status }
      }
      const responseText = await response.text()
      console.log(`📥 Respuesta cruda (${responseText.length} chars):`, responseText.substring(0, 200) + '...')
      const parsedData = parseJSONSafely(responseText)
      if (parsedData.error) {
        return {
          success: false,
          error: parsedData.error,
          originalText: parsedData.originalText || responseText,
          isEmpty: parsedData.isEmpty || false
        }
      }
      return { success: true, data: parsedData, response }
    } catch (error) {
      console.error("❌ Error en fetchWithErrorHandling:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        isNetworkError: true
      }
    }
  }

  const obtenerDireccion = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: { "User-Agent": "PinkDrivers (soportepinkdrivers@gmail.com)" },
      })
      const textResponse = await response.text()
      const data = JSON.parse(textResponse)
      if (data.address) {
        setUbicacionActual(data.address.road || "Ubicación no encontrada")
        setBarrioActual(data.address.neighbourhood || data.address.suburb || "")
        setZonaActual(determinarZona(lat, lng))
        setCiudadActual(data.address.city || data.address.town || data.address.village || "Cali")
        setPickupAddress(data.address.road || "")
        setPickupBarrio(data.address.neighbourhood || data.address.suburb || "")
        setPickupZona(determinarZona(lat, lng))
        setPickupCiudad(data.address.city || data.address.town || data.address.village || "Cali")
      } else {
        setUbicacionActual("Ubicación no encontrada")
      }
    } catch (error) {
      console.error("❌ Error al obtener la dirección:", error)
      setUbicacionActual("Error al obtener ubicación")
    }
  }

  const obtenerUbicacionActual = async () => {
    try {
      setLocationLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación")
        setLocationLoading(false)
        const defaultLocation = { latitude: 3.4516, longitude: -76.5319 }
        setCurrentLocation(defaultLocation)
        return
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const { latitude, longitude } = location.coords
      setCurrentLocation({ latitude, longitude })
      await obtenerDireccion(latitude, longitude)
    } catch (error) {
      console.error("❌ Error al obtener ubicación:", error)
      Alert.alert("Error", "No se pudo obtener la ubicación actual")
      const defaultLocation = { latitude: 3.4516, longitude: -76.5319 }
      setCurrentLocation(defaultLocation)
    } finally {
      setLocationLoading(false)
    }
  }

  const limpiarFormularioCompleto = async () => {
    console.log("🧹 Limpiando formulario completo...")
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
    setRouteDistance(null)
    setPriceEstimate(null)
    setPickupAddress("")
    setPickupBarrio("")
    setPickupZona("")
    setPickupCiudad("")
    await obtenerUbicacionActual()
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log("🛑 Polling detenido")
    }
  }

  const startPolling = (callback: () => void, interval: number = 5000) => {
    stopPolling()
    console.log(`🔄 Iniciando polling cada ${interval}ms`)
    callback()
    pollingIntervalRef.current = setInterval(callback, interval)
  }

  const consultarViajeAceptado = async () => {
    try {
      setIsLoadingAcceptedTrip(true)
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        console.error("❌ No hay token disponible")
        setAcceptedTrip(null)
        return
      }
      console.log("🟡 Consultando viaje aceptado...")
      const result = await fetchWithErrorHandling(
        "https://www.pinkdrivers.com/api-rest/index.php?action=viaje_aceptado",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      if (!result.success) {
        if (result.isEmpty) {
          setAcceptedTrip(null)
          return
        }
        if (result.isNetworkError) {
          console.error("❌ Error de red al consultar viaje:", result.error)
          return
        }
        console.error("❌ Error al verificar estado del viaje:", result.error)
        return
      }
      const data = result.data
      console.log("🟡 Respuesta viaje aceptado parseada:", JSON.stringify(data, null, 2))

      if (data.viaje_cancelado) {
        if (!acceptedTrip || acceptedTrip.id !== data.viaje_cancelado.id || acceptedTrip.estado !== 'cancelado') {
          const firstName = data.viaje_cancelado.conductora_nombre ?
            data.viaje_cancelado.conductora_nombre.split(" ")[0] : "La conductora"
          stopPolling()
          Alert.alert(
            "Viaje cancelado",
            `${firstName} ha cancelado el viaje. Puedes solicitar un nuevo viaje.`,
            [{
              text: "OK",
              onPress: async () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
                lastViajeIdRef.current = null
                await limpiarFormularioCompleto()
              }
            }]
          )
        }
        return
      }

      if (data.viaje_finalizado) {
        if (!acceptedTrip || acceptedTrip.id !== data.viaje_finalizado.id || acceptedTrip.estado !== 'finalizado') {
          const firstName = data.viaje_finalizado.conductora_nombre.split(" ")[0]
          stopPolling()
          Alert.alert(
            "¡Viaje finalizado!",
            `Tu viaje con ${firstName} ha finalizado exitosamente.\n\nTotal pagado: $${Number(data.viaje_finalizado.valorPersonalizado).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} \n\n¡Gracias por usar Pink Drivers!`,
            [{
              text: "OK",
              onPress: async () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
                lastViajeIdRef.current = null
                await limpiarFormularioCompleto()
              }
            }]
          )
        }
        return
      }

      if (data.viaje_aceptado) {
        if (data.viaje_aceptado.estado === 'cancelado') {
          if (acceptedTrip && acceptedTrip.id === data.viaje_aceptado.id && acceptedTrip.estado !== 'cancelado') {
            stopPolling()
            Alert.alert(
              "Viaje cancelado",
              "Tu viaje fue cancelado por la conductora. Puedes solicitar un nuevo viaje.",
              [{
                text: "OK",
                onPress: async () => {
                  setAcceptedTrip(null)
                  setIsWaitingForDriver(false)
                  setShowContraoferta(false)
                  setContraofertaData(null)
                  lastViajeIdRef.current = null
                  await limpiarFormularioCompleto()
                }
              }]
            )
          }
          return
        }
        if (data.viaje_aceptado.estado !== 'cancelado') {
          if (!acceptedTrip || acceptedTrip.id !== data.viaje_aceptado.id) {
            setAcceptedTrip(data.viaje_aceptado)
            lastViajeIdRef.current = data.viaje_aceptado.id
          }
          setIsWaitingForDriver(false)
          setShowContraoferta(false)
          setContraofertaData(null)
          return
        }
      }

      if (acceptedTrip && !data.viaje_aceptado && !data.viaje_finalizado && !data.viaje_cancelado) {
        setAcceptedTrip(null)
        setIsWaitingForDriver(false)
        setShowContraoferta(false)
        setContraofertaData(null)
        lastViajeIdRef.current = null
      } else {
        setAcceptedTrip(null)
        lastViajeIdRef.current = null
      }
    } catch (error) {
      console.error("❌ Error al consultar viaje aceptado:", error)
    } finally {
      setIsLoadingAcceptedTrip(false)
    }
  }

  useEffect(() => {
    const configurarUbicacionInicial = async () => {
      await obtenerUbicacionActual()
      try {
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000,
            distanceInterval: 100,
          },
          async (newLocation) => {
            const { latitude: newLat, longitude: newLng } = newLocation.coords
            setCurrentLocation(prevLocation => {
              if (!prevLocation) return { latitude: newLat, longitude: newLng }
              const latDiff = Math.abs(prevLocation.latitude - newLat)
              const lngDiff = Math.abs(prevLocation.longitude - newLng)
              if (latDiff > 0.001 || lngDiff > 0.001) {
                return { latitude: newLat, longitude: newLng }
              }
              return prevLocation
            })
            if (!ubicacionActual ||
              ubicacionActual === "Obteniendo ubicación..." ||
              ubicacionActual === "Ubicación no encontrada" ||
              ubicacionActual === "Error al obtener ubicación") {
              await obtenerDireccion(newLat, newLng)
            }
          },
        )
      } catch (error) {
        console.error("❌ Error configurando watcher:", error)
      }
    }
    configurarUbicacionInicial()
  }, [])

  useEffect(() => {
    if (acceptedTrip) {
      startPolling(() => { consultarViajeAceptado() }, 5000)
    } else if (isWaitingForDriver && !showContraoferta) {
      startPolling(() => {
        consultarContraoferta()
        consultarViajeAceptado()
      }, 7000)
    } else {
      stopPolling()
    }
    return () => { stopPolling() }
  }, [isWaitingForDriver, showContraoferta, acceptedTrip?.id])

  const cancelarViajeAceptado = async () => {
    if (!acceptedTrip) return
    Alert.alert(
      "Cancelar viaje",
      "¿Estás segura de que quieres cancelar este viaje?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoadingAcceptedTrip(true)
              const token = await AsyncStorage.getItem("token")
              const result = await fetchWithErrorHandling(
                "https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ viaje_id: acceptedTrip.id }),
                }
              )
              if (result.success && result.data.success) {
                stopPolling()
                setAcceptedTrip(null)
                setIsLoadingAcceptedTrip(false)
                Alert.alert(
                  "Viaje cancelado",
                  "El viaje ha sido cancelado exitosamente",
                  [{
                    text: "OK",
                    onPress: async () => {
                      setIsWaitingForDriver(false)
                      setShowContraoferta(false)
                      setContraofertaData(null)
                      lastViajeIdRef.current = null
                      await limpiarFormularioCompleto()
                    }
                  }]
                )
              } else {
                setIsLoadingAcceptedTrip(false)
                Alert.alert("Error", result.data?.error || result.error || "No se pudo cancelar el viaje.")
              }
            } catch (error) {
              setIsLoadingAcceptedTrip(false)
              Alert.alert("Error de conexión", "No se pudo conectar con el servidor.")
            }
          },
        },
      ]
    )
  }

  const llamarConductora = (telefono: string) => {
    if (telefono && telefono !== "N/A") {
      Linking.openURL(`tel:${telefono.replace(/\s/g, "")}`)
    } else {
      Alert.alert("Error", "Número de teléfono no disponible")
    }
  }

  const consultarContraoferta = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=ver_contraoferta", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (response.ok && data.success && data.data) {
        setContraofertaData(data.data)
        setShowContraoferta(true)
      } else {
        setContraofertaData(null)
        setShowContraoferta(false)
      }
    } catch (error) {
      console.error("❌ Error al consultar contraoferta:", error)
      setContraofertaData(null)
      setShowContraoferta(false)
    }
  }

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
        body: JSON.stringify({ viaje_id: contraofertaData.viaje_id, aceptado: true }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        Alert.alert(
          "¡Contraoferta aceptada!",
          `Has aceptado la propuesta de ${contraofertaData.conductora_nombre} por $${Number(contraofertaData.valorPersonalizado).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
          [{
            text: "OK",
            onPress: () => {
              setShowContraoferta(false)
              setContraofertaData(null)
              setIsWaitingForDriver(false)
              closeModal()
              setTimeout(() => { consultarViajeAceptado() }, 1000)
            },
          }],
        )
      } else {
        Alert.alert("Error", data.message || "No se pudo aceptar la contraoferta")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la respuesta")
    } finally {
      setIsProcessingResponse(false)
    }
  }

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
        body: JSON.stringify({ viaje_id: contraofertaData.viaje_id, aceptado: false }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        Alert.alert(
          "Contraoferta rechazada",
          "Has rechazado la propuesta. Seguiremos buscando otras conductoras disponibles.",
          [{ text: "OK", onPress: () => { setShowContraoferta(false); setContraofertaData(null) } }],
        )
      } else {
        Alert.alert("Error", data.message || "No se pudo rechazar la contraoferta")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la respuesta")
    } finally {
      setIsProcessingResponse(false)
    }
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height)
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

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [menuVisible])

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnimation, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(modalAnimation, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(overlayAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(modalAnimation, { toValue: screenHeight, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }, [isModalVisible])

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        if (!token) {
          router.push("/passenger/LoginP")
          return
        }
        const decodedToken = decodeJWT(token)
        if (decodedToken && decodedToken.id) {
          setUsuarioId(decodedToken.id)
          setUsuarioData(decodedToken)
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
          }
        } else {
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

  const toggleMenu = () => setMenuVisible(!menuVisible)
  const closeMenu = () => setMenuVisible(false)
  const navigateTo = (screen: any) => { closeMenu(); router.push(screen) }
  const openModal = () => {
    setIsModalVisible(true)
    setTimeout(() => { ubicacionActualRef.current?.focus() }, 500)
  }

  // ✅ CORRECCIÓN 2: closeModal ya NO resetea isWaitingForDelivery
  const closeModal = () => {
    setIsModalVisible(false)
    setActiveField(null)
    setIsWaitingForDriver(false)
    setIsSubmittingRequest(false)
    setShowContraoferta(false)
    setContraofertaData(null)
    // ❌ ELIMINADO: setIsWaitingForDelivery(false) — ya no va aquí
    if (isKeyboardVisible) {
      Keyboard.dismiss()
    }
  }

  const selectVehicle = (vehicleType: React.SetStateAction<string>) => setSelectedVehicle(vehicleType)

  const isFormComplete = () => {
    return (
      ubicacionActual && barrioActual && zonaActual && ciudadActual &&
      destinoDireccion && destinoBarrio && destinoZona &&
      puntoReferencia && selectedVehicle && valorPersonalizado && usuarioId
    )
  }

  const limpiarFormulario = async () => {
    setDestinoDireccion("")
    setDestinoBarrio("")
    setDestinoZona("")
    setPuntoReferencia("")
    setValorPersonalizado("")
    setSelectedVehicle("")
    await obtenerUbicacionActual()
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
        ubicacionActual, barrioActual, zonaActual, ciudadActual,
        destinoDireccion, destinoBarrio, destinoZona, puntoReferencia,
        selectedVehicle,
        valorPersonalizado: Number.parseFloat(valorPersonalizado),
        usuario_id: usuarioId,
      }
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
        body: JSON.stringify(viajeData),
      })
      const json = await res.json()
      if (res.ok) {
        setIsSubmittingRequest(false)
        setIsWaitingForDriver(true)
      } else {
        setIsSubmittingRequest(false)
        Alert.alert("Error", json.error || "Hubo un problema al solicitar el viaje.")
      }
    } catch (error) {
      setIsSubmittingRequest(false)
      Alert.alert("Error de conexión", "No se pudo enviar el viaje. Verifica tu conexión.")
    }
  }

  // ✅ CORRECCIÓN 3: handleConfirmarEntrega corregido
  const handleConfirmarEntrega = async () => {
    if (!usuarioId) {
      Alert.alert("Error de sesión", "Por favor inicia sesión nuevamente.")
      return
    }
    setIsSubmittingRequest(true)
    try {
      const token = await AsyncStorage.getItem("token")

      const bodyData = {
        usuario_id: usuarioId,
        nombre_envia: senderName,
        telefono_envia: senderPhone,
        nombre_recibe: receiverName,
        telefono_recibe: receiverPhone,
        direccion_recogida: pickupAddress,
        barrio_recogida: pickupBarrio,
        zona_recogida: pickupZona,
        ciudad_recogida: pickupCiudad,
        direccion_entrega: deliveryAddress,
        barrio_entrega: deliveryBarrio,
        zona_entrega: deliveryZona,
        ciudad_entrega: deliveryCiudad,   // ✅ campo que faltaba
        es_fragil: isFragile ? 1 : 0,
        notas_adicionales: deliveryNotes,
        vehiculo_requerido: deliveryVehicle,
        precio_ofrecido: parseFloat(deliveryPrice),
      }

      console.log("📤 Enviando entrega:", JSON.stringify(bodyData, null, 2))

      const res = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=post_entrega",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }
      )

      console.log("📥 Status HTTP:", res.status)
      const responseText = await res.text()
      console.log("📥 Respuesta cruda:", responseText)

      let json: any = {}
      try {
        json = JSON.parse(responseText)
      } catch (e) {
        console.error("❌ Error al parsear respuesta:", e)
        setIsSubmittingRequest(false)
        Alert.alert("Error del servidor", "Respuesta inesperada del servidor. Intenta de nuevo.")
        return
      }

      if (res.ok && (json.success !== false)) {
        // ✅ Guardar resumen ANTES de limpiar los campos
        setEntregaResumen({
          recogida: pickupAddress,
          entrega: deliveryAddress,
          precio: deliveryPrice,
          vehiculo: deliveryVehicle,
        })

        // ✅ Limpiar campos del formulario
        setSenderName("")
        setSenderPhone("")
        setReceiverName("")
        setReceiverPhone("")
        setDeliveryAddress("")
        setDeliveryBarrio("")
        setDeliveryZona("")
        setIsFragile(null)
        setDeliveryNotes("")
        setDeliveryPrice("")
        setDeliveryVehicle("")

        setIsSubmittingRequest(false)

        // ✅ CORRECCIÓN CLAVE: Activar pantalla de espera DESPUÉS de todo lo demás
        // Esto garantiza que el modal permanece abierto y muestra la pantalla de espera
        setIsWaitingForDelivery(true)

      } else {
        setIsSubmittingRequest(false)
        Alert.alert("Error", json.error || "No se pudo registrar la entrega.")
      }
    } catch (error) {
      setIsSubmittingRequest(false)
      Alert.alert("Error de conexión", "Verifica tu conexión a internet.")
    }
  }

  const getUbicacionActualText = () => {
    const partes = [ubicacionActual, barrioActual, zonaActual, ciudadActual].filter(Boolean)
    return partes.length > 0 ? `${partes.join(" ")}` : "Obteniendo ubicación..."
  }

  const openModalFromCurrentLocation = () => {
    setIsModalVisible(true)
    setTimeout(() => { ubicacionActualRef.current?.focus() }, 500)
  }

  const cancelarBusqueda = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })
      const data = await response.json()
      if (response.ok && data.success) {
        Alert.alert("Búsqueda cancelada", "Tu búsqueda fue cancelada exitosamente.")
        setIsWaitingForDriver(false)
        setAcceptedTrip(null)
        setShowContraoferta(false)
        setContraofertaData(null)
        await limpiarFormulario()
      } else {
        Alert.alert("Error", data.error || "No se pudo cancelar la búsqueda.")
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al cancelar la búsqueda.")
    }
  }

  const renderAcceptedTripDetail = () => {
    if (!acceptedTrip) return null
    const firstName = acceptedTrip.conductora_nombre.split(" ")[0]
    return (
      <View style={styles.acceptedTripContainer}>
        <View style={styles.acceptedTripHeader}>
          <Text style={styles.acceptedTripTitle}>¡Tu viaje fue aceptado! 🎉</Text>
          <View style={styles.tripStatusBadge}>
            <Text style={styles.tripStatusText}>✓ CONFIRMADO</Text>
          </View>
        </View>
        <View style={styles.driverDetailCard}>
          <View style={styles.driverHeaderInfo}>
            <View style={styles.driverAvatarContainer}>
              <View style={styles.driverAvatar}>
                <FontAwesome5 name="user" size={35} color="#fff" />
              </View>
            </View>
            <View style={styles.driverMainInfo}>
              <Text style={styles.driverNameLarge}>{firstName}</Text>
            </View>
          </View>
          <View style={styles.vehicleInfoSection}>
            <View style={styles.vehicleInfoHeader}>
              <FontAwesome5 name="car" size={18} color="#FF69B4" />
              <Text style={styles.vehicleInfoTitle}>Información del vehículo</Text>
            </View>
            <View style={styles.vehicleDetailsRow}>
              <View style={styles.vehicleDetailItem}>
                <Text style={styles.vehicleDetailLabel}>Tipo</Text>
                <Text style={styles.vehicleDetailValue}>{acceptedTrip.selectedVehicle}</Text>
              </View>
              {acceptedTrip.vehiculo_placa && (
                <View style={styles.vehicleDetailItem}>
                  <Text style={styles.vehicleDetailLabel}>Placas</Text>
                  <Text style={styles.vehicleDetailValue}>{acceptedTrip.vehiculo_placa}</Text>
                </View>
              )}
            </View>
            {acceptedTrip.vehiculo_color && (
              <View style={styles.vehicleDetailsRow}>
                <View style={styles.vehicleDetailItem}>
                  <Text style={styles.vehicleDetailLabel}>Color</Text>
                  <Text style={styles.vehicleDetailValue}>{acceptedTrip.vehiculo_color}</Text>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.callDriverButton} onPress={() => llamarConductora(acceptedTrip.conductora_telefono)}>
            <FontAwesome name="phone" size={18} color="#fff" />
            <Text style={styles.callDriverButtonText}>Llamar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tripRouteDetailCard}>
          <View style={styles.tripRoutePoint}>
            <View style={styles.tripRoutePointDot} />
            <View style={styles.tripRoutePointInfo}>
              <Text style={styles.tripRoutePointLabel}>ORIGEN</Text>
              <Text style={styles.tripRoutePointAddress}>{acceptedTrip.ubicacionActual}</Text>
              <Text style={styles.tripRoutePointNeighborhood}>{acceptedTrip.barrioActual} • {acceptedTrip.zonaActual}</Text>
              <Text style={styles.tripRouteReference}>Ref: {acceptedTrip.puntoReferencia}</Text>
            </View>
          </View>
          <View style={styles.tripRouteLine} />
          <View style={styles.tripRoutePoint}>
            <View style={[styles.tripRoutePointDot, styles.tripDestinationDot]} />
            <View style={styles.tripRoutePointInfo}>
              <Text style={styles.tripRoutePointLabel}>DESTINO</Text>
              <Text style={styles.tripRoutePointAddress}>{acceptedTrip.destinoDireccion}</Text>
              <Text style={styles.tripRoutePointNeighborhood}>{acceptedTrip.destinoBarrio} • {acceptedTrip.destinoZona}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.tripPriceDetailCard]}>
          <Text style={styles.tripPriceDetailAmount}>
            ${acceptedTrip.valorPersonalizado.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={styles.tripActionButtons}>
          <TouchableOpacity style={styles.cancelTripButtonFull} onPress={cancelarViajeAceptado}>
            <FontAwesome name="times-circle" size={18} color="#FF5722" />
            <Text style={styles.cancelTripButtonText}>Cancelar viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderMap = () => {
    if (locationLoading) {
      return (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>Cargando ubicación...</Text>
        </View>
      )
    }
    return (
      <View style={styles.map}>
        <Image
          source={require('../../assets/images/fondoN.jpg')}
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
        />
        <View style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 15, borderRadius: 10, alignItems: 'center'
        }}>
          <FontAwesome name="map-marker" size={24} color="#FF69B4" />
          <Text style={{ color: "#333", fontSize: 14, marginTop: 5, textAlign: 'center' }}>
            {currentLocation
              ? `Ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : "Obteniendo ubicación..."}
          </Text>
        </View>
      </View>
    )
  }

  if (!usuarioId) {
    return (
      <LinearGradient colors={["#CF5BA9", "#B33F8D"]} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>Cargando...</Text>
      </LinearGradient>
    )
  }

  if (acceptedTrip) {
    return (
      <LinearGradient colors={["#D404C2", "#D404C2"]} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#D404C2" />
        <View style={[styles.mapContainer, { height: screenHeight * 0.4 }]}>{renderMap()}</View>
        <View style={styles.avatarMenuContainer}>
          <TouchableOpacity onPress={() => navigateTo("/passenger/ProfileP")} style={styles.avatarButtonContainer} activeOpacity={0.8}>
            <Ionicons name="person-circle-outline" size={45} color="#B33F8D" />
          </TouchableOpacity>
        </View>
        <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, flex: 1 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>{renderAcceptedTripDetail()}</ScrollView>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#D404C2", "#D404C2"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D404C2" />
      <View style={[styles.mapContainer, isKeyboardVisible && styles.mapWithKeyboard]}>{renderMap()}</View>

      {menuVisible && <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />}

      <View style={styles.avatarMenuContainer}>
        <TouchableOpacity onPress={() => navigateTo("/passenger/ProfileP")} style={styles.avatarButtonContainer} activeOpacity={0.8}>
          <Ionicons name="person-circle-outline" size={45} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }]}>
        <View style={styles.serviceSelectorContainer}>
          <TouchableOpacity
            style={[styles.serviceButton, serviceMode === 'viajes' && styles.serviceButtonActive]}
            onPress={() => { setServiceMode('viajes'); openModal() }}
          >
            <FontAwesome5 name="car" size={16} color={serviceMode === 'viajes' ? "#fff" : "#D404C2"} />
            <Text style={[styles.serviceButtonText, serviceMode === 'viajes' && styles.serviceButtonTextActive]}>Viajes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.serviceButton, serviceMode === 'pinkentregas' && styles.serviceButtonActive]}
            onPress={() => { setServiceMode('pinkentregas'); openModal() }}
          >
            <FontAwesome5 name="box" size={16} color={serviceMode === 'pinkentregas' ? "#fff" : "#D404C2"} />
            <Text style={[styles.serviceButtonText, serviceMode === 'pinkentregas' && styles.serviceButtonTextActive]}>PinkEntregas</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={openModalFromCurrentLocation}>
          <View style={[styles.input, { justifyContent: "center" }]}>
            <Text style={{ color: ubicacionActual ? "#333" : "#666", fontSize: 15 }}>{getUbicacionActualText()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isModalVisible && (
        <>
          <Animated.View style={[styles.modalOverlay, { opacity: overlayAnimation }]} />
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalAnimation }] }]}>

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
                    <Text style={styles.contraofertaDriverName}>{contraofertaData.conductora_nombre.split(" ")[0]}</Text>
                    <Text style={styles.contraofertaPlate}>Placas: {contraofertaData.vehiculo_placa}</Text>
                    <Text style={styles.contraofertaPlate}>Color: {contraofertaData.vehiculo_color}</Text>
                    <Text style={styles.contraofertaMessage}>Te propuso un precio de:</Text>
                    <Text style={styles.contraofertaPrice}>
                      ${Number(contraofertaData.valorPersonalizado).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                    <View style={styles.contraofertaButtons}>
                      <TouchableOpacity style={[styles.contraofertaButton, styles.rejectButton]} onPress={rechazarContraoferta} disabled={isProcessingResponse}>
                        {isProcessingResponse ? <ActivityIndicator size="small" color="#666" /> : (
                          <><FontAwesome name="times" size={16} color="#666" /><Text style={styles.rejectButtonText}>Rechazar</Text></>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.contraofertaButton, styles.acceptButton]} onPress={aceptarContraoferta} disabled={isProcessingResponse}>
                        {isProcessingResponse ? <ActivityIndicator size="small" color="#fff" /> : (
                          <><FontAwesome name="check" size={16} color="#fff" /><Text style={styles.acceptButtonText}>Aceptar</Text></>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

            ) : isWaitingForDriver ? (
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

            ) : isWaitingForDelivery ? (
              // ✅ PANTALLA DE ESPERA PINKENTREGAS
              <View style={styles.waitingContainer}>
                <View style={[styles.waitingHeader, { backgroundColor: '#5A189A' }]}>
                  <Text style={styles.waitingTitle}>Pedido enviado 📦</Text>
                  {/* ✅ CORRECCIÓN 4: Botón X cierra sin llamar closeModal() */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={async () => {
                      try {
                        const token = await AsyncStorage.getItem("token")
                        await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_entrega", {
                          method: "POST",
                          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                          body: JSON.stringify({})
                        })
                      } catch (e) { console.error("Error al cancelar entrega:", e) }
                      setIsWaitingForDelivery(false)
                      setEntregaResumen(null)
                      setIsModalVisible(false)
                    }}
                  >
                    <FontAwesome name="times" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.waitingContent}>
                  <ActivityIndicator size="large" color="#5A189A" style={styles.loadingIndicator} />
                  <Text style={[styles.waitingMessage, { color: '#3B0F5C', fontWeight: 'bold' }]}>
                    Esperando que alguien tome tu pedido...
                  </Text>
                  <Text style={[styles.waitingSubMessage, { color: '#5A189A', marginBottom: 20 }]}>
                    Te avisaremos cuando una conductora acepte tu entrega
                  </Text>

                  {entregaResumen && (
                    <View style={{
                      backgroundColor: '#F3EEF8', borderRadius: 12, padding: 16,
                      width: '100%', marginBottom: 20,
                      borderLeftWidth: 4, borderLeftColor: '#5A189A',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#5A189A', marginRight: 8 }} />
                        <Text style={{ color: '#3B0F5C', fontSize: 13, fontWeight: '600' }}>RECOGIDA</Text>
                      </View>
                      <Text style={{ color: '#333', fontSize: 14, marginBottom: 14, paddingLeft: 18 }}>
                        {entregaResumen.recogida}
                      </Text>
                      <View style={{ width: 1, height: 12, backgroundColor: '#5A189A', marginLeft: 4, marginBottom: 2 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#D404C2', marginRight: 8 }} />
                        <Text style={{ color: '#3B0F5C', fontSize: 13, fontWeight: '600' }}>ENTREGA</Text>
                      </View>
                      <Text style={{ color: '#333', fontSize: 14, paddingLeft: 18 }}>
                        {entregaResumen.entrega}
                      </Text>
                      <View style={{
                        flexDirection: 'row', justifyContent: 'space-between',
                        marginTop: 14, paddingTop: 14,
                        borderTopWidth: 1, borderTopColor: '#D8CCE8',
                      }}>
                        <Text style={{ color: '#5A189A', fontSize: 13 }}>🚲 {entregaResumen.vehiculo}</Text>
                        <Text style={{ color: '#5A189A', fontSize: 15, fontWeight: 'bold' }}>
                          ${parseFloat(entregaResumen.precio).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* ✅ CORRECCIÓN 5: Botón cancelar NO llama closeModal() */}
                  <TouchableOpacity
                    style={[styles.cancelSearchButton, { borderColor: '#5A189A' }]}
                    onPress={async () => {
                      try {
                        const token = await AsyncStorage.getItem("token")
                        await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_entrega", {
                          method: "POST",
                          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                          body: JSON.stringify({})
                        })
                      } catch (e) { console.error("Error al cancelar entrega:", e) }
                      setIsWaitingForDelivery(false)
                      setEntregaResumen(null)
                      setIsModalVisible(false)
                    }}
                  >
                    <Text style={[styles.cancelSearchButtonText, { color: '#5A189A' }]}>
                      Cancelar pedido
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            ) : (
              <>
                <View style={dynHeader}>
                  <View style={{ width: 40 }} />
                  <Text style={dynTitle}>
                    {isPE ? 'PinkEntregas - Nuevo Pedido' : 'Detalles del viaje'}
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <FontAwesome name="chevron-up" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.modalScrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20 }}
                  >
                    {serviceMode === 'pinkentregas' ? (
                      <>
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Datos de quien envía</Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "senderName" && styles.modalInputFocusedPE]}
                          placeholder="Nombre de quien envía" placeholderTextColor="#666"
                          value={senderName} onChangeText={setSenderName}
                          onFocus={() => setActiveField("senderName")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "senderPhone" && styles.modalInputFocusedPE]}
                          placeholder="Teléfono de quien envía" placeholderTextColor="#666"
                          value={senderPhone} onChangeText={setSenderPhone} keyboardType="phone-pad"
                          onFocus={() => setActiveField("senderPhone")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Datos de quien recibe</Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "receiverName" && styles.modalInputFocusedPE]}
                          placeholder="Nombre de quien recibe" placeholderTextColor="#666"
                          value={receiverName} onChangeText={setReceiverName}
                          onFocus={() => setActiveField("receiverName")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "receiverPhone" && styles.modalInputFocusedPE]}
                          placeholder="Teléfono de quien recibe" placeholderTextColor="#666"
                          value={receiverPhone} onChangeText={setReceiverPhone} keyboardType="phone-pad"
                          onFocus={() => setActiveField("receiverPhone")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Dirección de Recogida</Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "pickupAddress" && styles.modalInputFocusedPE]}
                          placeholder="Dirección" placeholderTextColor="#666"
                          value={pickupAddress} onChangeText={setPickupAddress}
                          onFocus={() => setActiveField("pickupAddress")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "pickupBarrio" && styles.modalInputFocusedPE]}
                          placeholder="Barrio" placeholderTextColor="#666"
                          value={pickupBarrio} onChangeText={setPickupBarrio}
                          onFocus={() => setActiveField("pickupBarrio")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker selectedValue={pickupZona} onValueChange={(itemValue) => setPickupZona(itemValue)} style={styles.picker}>
                            {zonasDisponibles.map((zona) => (<Picker.Item key={zona.value} label={zona.label} value={zona.value} />))}
                          </Picker>
                        </View>
                        <TextInput
                          style={[styles.modalInput, activeField === "pickupCiudad" && styles.modalInputFocusedPE]}
                          placeholder="Ciudad" placeholderTextColor="#666"
                          value={pickupCiudad} onChangeText={setPickupCiudad}
                          onFocus={() => setActiveField("pickupCiudad")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Dirección de Entrega</Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryAddress" && styles.modalInputFocusedPE]}
                          placeholder="Dirección" placeholderTextColor="#666"
                          value={deliveryAddress} onChangeText={setDeliveryAddress}
                          onFocus={() => setActiveField("deliveryAddress")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryBarrio" && styles.modalInputFocusedPE]}
                          placeholder="Barrio" placeholderTextColor="#666"
                          value={deliveryBarrio} onChangeText={setDeliveryBarrio}
                          onFocus={() => setActiveField("deliveryBarrio")} onBlur={() => setActiveField(null)} returnKeyType="next"
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker selectedValue={deliveryZona} onValueChange={(itemValue) => setDeliveryZona(itemValue)} style={styles.picker}>
                            {zonasDisponibles.map((zona) => (<Picker.Item key={zona.value} label={zona.label} value={zona.value} />))}
                          </Picker>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Datos del paquete</Text>
                        <Text style={styles.fragileLabel}>¿El paquete es frágil?</Text>
                        <View style={styles.fragileContainer}>
                          <TouchableOpacity
                            style={[styles.fragileOption, isFragile === true && styles.fragileOptionActive]}
                            onPress={() => setIsFragile(true)}
                          >
                            <Text style={[styles.fragileOptionText, isFragile === true && styles.fragileOptionTextActive]}>Sí, es frágil</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.fragileOption, isFragile === false && styles.fragileOptionActive]}
                            onPress={() => setIsFragile(false)}
                          >
                            <Text style={[styles.fragileOptionText, isFragile === false && styles.fragileOptionTextActive]}>No es frágil</Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          style={[styles.modalInput, styles.notasInput, activeField === "deliveryNotes" && styles.modalInputFocusedPE]}
                          placeholder="Notas adicionales (opcional)" placeholderTextColor="#666"
                          value={deliveryNotes} onChangeText={setDeliveryNotes}
                          multiline numberOfLines={3}
                          onFocus={() => setActiveField("deliveryNotes")} onBlur={() => setActiveField(null)}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Servicio</Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryPrice" && styles.modalInputFocusedPE]}
                          placeholder="Precio ofrecido" placeholderTextColor="#666"
                          value={deliveryPrice} onChangeText={setDeliveryPrice} keyboardType="numeric"
                          onFocus={() => setActiveField("deliveryPrice")} onBlur={() => setActiveField(null)} returnKeyType="done"
                        />

                        <View style={styles.vehicleSelectionContainer}>
                          <Text style={styles.sectionTitle}>Vehículo requerido</Text>
                          <View style={styles.vehicleOptions}>
                            <TouchableOpacity
                              style={[styles.vehicleOption, deliveryVehicle === "bicicleta" && styles.selectedVehicleOptionPE]}
                              onPress={() => setDeliveryVehicle("bicicleta")}
                            >
                              <FontAwesome5 name="bicycle" size={24} color={deliveryVehicle === "bicicleta" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, deliveryVehicle === "bicicleta" && styles.selectedVehicleText]}>Bicicleta</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.vehicleOption, deliveryVehicle === "patineta" && styles.selectedVehicleOptionPE]}
                              onPress={() => setDeliveryVehicle("patineta")}
                            >
                              <MaterialCommunityIcons name="scooter" size={24} color={deliveryVehicle === "patineta" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, deliveryVehicle === "patineta" && styles.selectedVehicleText]}>Patineta</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.vehicleOption, deliveryVehicle === "silla_ruedas" && styles.selectedVehicleOptionPE]}
                              onPress={() => setDeliveryVehicle("silla_ruedas")}
                            >
                              <FontAwesome5 name="wheelchair" size={24} color={deliveryVehicle === "silla_ruedas" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, deliveryVehicle === "silla_ruedas" && styles.selectedVehicleText]}>Silla ruedas</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.modalButtonP,
                            (!senderName || !senderPhone || !receiverName || !receiverPhone || !pickupAddress || !deliveryAddress || isFragile === null || !deliveryPrice || !deliveryVehicle) && styles.modalButtonDisabledPEP,
                          ]}
                          disabled={!senderName || !senderPhone || !receiverName || !receiverPhone || !pickupAddress || !deliveryAddress || isFragile === null || !deliveryPrice || !deliveryVehicle || isSubmittingRequest}
                          onPress={handleConfirmarEntrega}
                        >
                          {isSubmittingRequest ? (
                            <View style={styles.buttonLoadingContainer}>
                              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                              <Text style={styles.modalButtonTextP}>Enviando pedido...</Text>
                            </View>
                          ) : (
                            <Text style={styles.modalButtonTextP}>Confirmar Pedido</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>Ubicación actual</Text>
                        <TextInput
                          ref={ubicacionActualRef}
                          style={[styles.modalInput, activeField === "ubicacionActual" && styles.modalInputFocused]}
                          placeholder="Dirección actual" placeholderTextColor="#666"
                          value={ubicacionActual} onChangeText={setUbicacionActual}
                          onFocus={() => setActiveField("ubicacionActual")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => barrioActualRef.current?.focus()}
                        />
                        <TextInput
                          ref={barrioActualRef}
                          style={[styles.modalInput, activeField === "barrioActual" && styles.modalInputFocused]}
                          placeholder="Barrio actual" placeholderTextColor="#666"
                          value={barrioActual} onChangeText={setBarrioActual}
                          onFocus={() => setActiveField("barrioActual")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => ciudadActualRef.current?.focus()}
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker selectedValue={zonaActual} onValueChange={(itemValue) => setZonaActual(itemValue)} style={styles.picker}>
                            {zonasDisponibles.map((zona) => (<Picker.Item key={zona.value} label={zona.label} value={zona.value} />))}
                          </Picker>
                        </View>
                        <TextInput
                          ref={ciudadActualRef}
                          style={[styles.modalInput, activeField === "ciudadActual" && styles.modalInputFocused]}
                          placeholder="Ciudad actual" placeholderTextColor="#666"
                          value={ciudadActual} onChangeText={setCiudadActual}
                          onFocus={() => setActiveField("ciudadActual")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => destinoDireccionRef.current?.focus()}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Destino</Text>
                        <TextInput
                          ref={destinoDireccionRef}
                          style={[styles.modalInput, activeField === "destinoDireccion" && styles.modalInputFocused]}
                          placeholder="Dirección de destino" placeholderTextColor="#666"
                          value={destinoDireccion} onChangeText={setDestinoDireccion}
                          onFocus={() => setActiveField("destinoDireccion")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => destinoBarrioRef.current?.focus()}
                        />
                        <TextInput
                          ref={destinoBarrioRef}
                          style={[styles.modalInput, activeField === "destinoBarrio" && styles.modalInputFocused]}
                          placeholder="Barrio de destino" placeholderTextColor="#666"
                          value={destinoBarrio} onChangeText={setDestinoBarrio}
                          onFocus={() => setActiveField("destinoBarrio")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => referenciaRef.current?.focus()}
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker selectedValue={destinoZona} onValueChange={(itemValue) => setDestinoZona(itemValue)} style={styles.picker}>
                            {zonasDisponibles.map((zona) => (<Picker.Item key={zona.value} label={zona.label} value={zona.value} />))}
                          </Picker>
                        </View>
                        <TextInput
                          ref={referenciaRef}
                          style={[styles.modalInput, activeField === "referencia" && styles.modalInputFocused]}
                          placeholder="Punto de referencia cercano (recogida)" placeholderTextColor="#666"
                          value={puntoReferencia} onChangeText={setPuntoReferencia}
                          onFocus={() => setActiveField("referencia")} onBlur={() => setActiveField(null)}
                          returnKeyType="next" onSubmitEditing={() => precioRef.current?.focus()}
                        />

                        <View style={styles.vehicleSelectionContainer}>
                          <Text style={styles.sectionTitle}>Selecciona el vehículo</Text>
                          <View style={styles.vehicleOptions}>
                            <TouchableOpacity
                              style={[styles.vehicleOption, selectedVehicle === "moto" && styles.selectedVehicleOption]}
                              onPress={() => selectVehicle("moto")}
                            >
                              <FontAwesome5 name="motorcycle" size={24} color={selectedVehicle === "moto" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, selectedVehicle === "moto" && styles.selectedVehicleText]}>Moto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.vehicleOption, selectedVehicle === "carro" && styles.selectedVehicleOption]}
                              onPress={() => selectVehicle("carro")}
                            >
                              <FontAwesome name="car" size={24} color={selectedVehicle === "carro" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, selectedVehicle === "carro" && styles.selectedVehicleText]}>Carro</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.vehicleOption, selectedVehicle === "motocarro" && styles.selectedVehicleOption]}
                              onPress={() => selectVehicle("motocarro")}
                            >
                              <MaterialCommunityIcons name="rickshaw" size={35} color={selectedVehicle === "motocarro" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, selectedVehicle === "motocarro" && styles.selectedVehicleText]}>Motocarro</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TextInput
                          ref={precioRef}
                          style={[styles.modalInput, activeField === "precio" && styles.modalInputFocused]}
                          placeholder="Pon tu precio" placeholderTextColor="#666"
                          value={valorPersonalizado} onChangeText={setValorPersonalizado} keyboardType="numeric"
                          onFocus={() => setActiveField("precio")} onBlur={() => setActiveField(null)}
                          returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
                        />

                        {priceEstimate && !valorPersonalizado && (
                          <Text style={styles.priceEstimateText}>
                            Precio sugerido: ${priceEstimate.toLocaleString("es-CO")}
                            {routeDistance && ` (${routeDistance.toFixed(1)} km)`}
                          </Text>
                        )}

                        <TouchableOpacity
                          style={[styles.modalButton, (!isFormComplete() || isSubmittingRequest) && styles.modalButtonDisabled]}
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
                      </>
                    )}
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