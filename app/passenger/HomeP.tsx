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

  // Estados para el manejo de la solicitud
  const [isWaitingForDriver, setIsWaitingForDriver] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  // Estados para contraofertas
  const [contraofertaData, setContraofertaData] = useState<ContraofertaData | null>(null)
  const [showContraoferta, setShowContraoferta] = useState(false)
  const [isProcessingResponse, setIsProcessingResponse] = useState(false)

  // New state for accepted trip
  const [acceptedTrip, setAcceptedTrip] = useState<AcceptedTripData | null>(null)
  const [isLoadingAcceptedTrip, setIsLoadingAcceptedTrip] = useState(false)

  // Estados para ubicación - mantenemos solo las coordenadas
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const [locationLoading, setLocationLoading] = useState(true)

  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [routeDistance, setRouteDistance] = useState<number | null>(null)
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null)

  // Animation references
  const menuAnimation = useRef(new Animated.Value(0)).current
  const modalAnimation = useRef(new Animated.Value(screenHeight)).current
  const overlayAnimation = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)

  // Referencias para los campos del formulario
  const ubicacionActualRef = useRef<TextInput>(null)
  const barrioActualRef = useRef<TextInput>(null)
  const ciudadActualRef = useRef<TextInput>(null)
  const destinoDireccionRef = useRef<TextInput>(null)
  const destinoBarrioRef = useRef<TextInput>(null)
  const referenciaRef = useRef<TextInput>(null)
  const precioRef = useRef<TextInput>(null)

  // Estado para el usuario logueado
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [usuarioData, setUsuarioData] = useState<any>(null)

  //estado para entregas pendientes 
  const [isWaitingForDelivery, setIsWaitingForDelivery] = useState(false)

  // 🔥 NUEVO: Referencias para el polling
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

// Estados para PinkEntregas
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

  // Opciones de zona
  const zonasDisponibles = [
    { label: "Seleccionar zona", value: "" },
    { label: "Norte", value: "Norte" },
    { label: "Sur", value: "Sur" },
    { label: "Oriente", value: "Oriente" },
    { label: "Occidente", value: "Occidente" },
  ]

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

  // 🔥 FUNCIÓN MEJORADA PARA PARSEAR JSON CON MANEJO DE ERRORES
  const parseJSONSafely = (text: string) => {
    try {
      // Verificar si la respuesta está vacía o es null
      if (!text || text.trim() === '') {
        console.warn("⚠️ Respuesta vacía del servidor")
        return { error: "Respuesta vacía", isEmpty: true }
      }

      // Intentar parsear el JSON
      const parsed = JSON.parse(text)
      return parsed
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error)
      console.error("❌ Texto recibido:", text)
      return { error: "Error al parsear JSON", originalText: text }
    }
  }

  // 🔥 FUNCIÓN PARA HACER FETCH CON MANEJO ROBUSTO DE ERRORES
  const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
    try {
      console.log(`🌐 Haciendo petición a: ${url}`)
      
      const response = await fetch(url, {
        ...options
      })

      // Verificar si la respuesta HTTP es exitosa
      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`)
        return { 
          success: false, 
          error: `Error HTTP ${response.status}`, 
          status: response.status 
        }
      }

      // Obtener el texto de la respuesta
      const responseText = await response.text()
      console.log(`📥 Respuesta cruda (${responseText.length} chars):`, responseText.substring(0, 200) + '...')

      // Parsear JSON de forma segura
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

  // 🔥 FUNCIÓN PARA OBTENER DIRECCIÓN
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
        setCiudadActual(data.address.city || data.address.town || data.address.village || "Cali")
        // FORMULARIO PINKENTREGAS:
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

  // 🔥 FUNCIÓN PARA OBTENER UBICACIÓN ACTUAL (REUTILIZABLE)
  const obtenerUbicacionActual = async () => {
    try {
      setLocationLoading(true)
      console.log("🗺️ Obteniendo ubicación actual...")
      
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación")
        setLocationLoading(false)
        // Establecer una ubicación por defecto (Cali, Colombia)
        const defaultLocation = { latitude: 3.4516, longitude: -76.5319 }
        setCurrentLocation(defaultLocation)
        return
      }

      console.log("✅ Permisos de ubicación concedidos")
      
      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const { latitude, longitude } = location.coords
      console.log("📍 Nueva ubicación obtenida:", latitude, longitude)

      setCurrentLocation({ latitude, longitude })
      await obtenerDireccion(latitude, longitude)

    } catch (error) {
      console.error("❌ Error al obtener ubicación:", error)
      Alert.alert("Error", "No se pudo obtener la ubicación actual")
      // Establecer ubicación por defecto
      const defaultLocation = { latitude: 3.4516, longitude: -76.5319 }
      setCurrentLocation(defaultLocation)
    } finally {
      setLocationLoading(false)
    }
  }

  // 🔥 NUEVA FUNCIÓN PARA LIMPIAR COMPLETAMENTE EL FORMULARIO
  const limpiarFormularioCompleto = async () => {
    console.log("🧹 Limpiando formulario completo...")
    
    // Limpiar TODOS los campos del formulario
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
    // Campos PinkEntregas
    setPickupAddress("")
    setPickupBarrio("")
    setPickupZona("")
    setPickupCiudad("")
    // 🔥 OBTENER NUEVA UBICACIÓN DESPUÉS DE LIMPIAR TODO
    console.log("🔄 Obteniendo nueva ubicación después de limpiar formulario completo...")
    await obtenerUbicacionActual()
  }

  // 🔥 FUNCIÓN MEJORADA PARA PARAR POLLING
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log("🛑 Polling detenido")
    }
  }

  // 🔥 FUNCIÓN MEJORADA PARA INICIAR POLLING
  const startPolling = (callback: () => void, interval: number = 5000) => {
    stopPolling() // Detener cualquier polling anterior
    
    console.log(`🔄 Iniciando polling cada ${interval}ms`)
    
    // Ejecutar inmediatamente
    callback()
    
    // Configurar intervalo
    pollingIntervalRef.current = setInterval(callback, interval)
  }

  //CONSULTAR VIAJE ACEPTADO - VERSIÓN CORREGIDA CON MANEJO DE ERRORES Y ALERTA CORRECTA
 // MODIFICAR la función consultarViajeAceptado en tu frontend:

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
        console.log("ℹ️ Respuesta vacía del servidor - no hay viajes")
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

    // 🔥 PRIORIDAD 1: VIAJE CANCELADO (NUEVO)
    if (data.viaje_cancelado) {
      console.log("⚠️ Viaje cancelado encontrado")
      
      // Solo mostrar alert si no hemos mostrado este viaje cancelado antes
      if (!acceptedTrip || acceptedTrip.id !== data.viaje_cancelado.id || acceptedTrip.estado !== 'cancelado') {
        const firstName = data.viaje_cancelado.conductora_nombre ? 
          data.viaje_cancelado.conductora_nombre.split(" ")[0] : "La conductora"
        
        stopPolling()
        
        Alert.alert(
          "Viaje cancelado",
          `${firstName} ha cancelado el viaje. Puedes solicitar un nuevo viaje.`,
          [
            {
              text: "OK",
              onPress: async () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
                lastViajeIdRef.current = null
                await limpiarFormularioCompleto()
                console.log("🧹 Viaje cancelado procesado y formulario limpiado")
              }
            }
          ]
        )
      }
      return
    }

    // 🔥 PRIORIDAD 2: VIAJE FINALIZADO
    if (data.viaje_finalizado) {
      console.log("✅ Viaje finalizado encontrado")
      
      if (!acceptedTrip || acceptedTrip.id !== data.viaje_finalizado.id || acceptedTrip.estado !== 'finalizado') {
        const firstName = data.viaje_finalizado.conductora_nombre.split(" ")[0]
        
        stopPolling()
        
        Alert.alert(
          "¡Viaje finalizado!",
          `Tu viaje con ${firstName} ha finalizado exitosamente.\n\nTotal pagado: $${Number(data.viaje_finalizado.valorPersonalizado).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} \n\n¡Gracias por usar Pink Drivers!`,
          [
            {
              text: "OK",
              onPress: async () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
                lastViajeIdRef.current = null
                await limpiarFormularioCompleto()
                console.log("🎉 Viaje finalizado procesado y formulario limpiado")
              }
            }
          ]
        )
      }
      return
    }

    // 🔥 PRIORIDAD 3: VIAJE ACEPTADO ACTIVO
    if (data.viaje_aceptado) {
      
      // ✅ VERIFICAR SI EL VIAJE ESTÁ CANCELADO
      if (data.viaje_aceptado.estado === 'cancelado') {
        console.log("⚠️ Viaje cancelado detectado, ID:", data.viaje_aceptado.id)
        
        if (acceptedTrip && acceptedTrip.id === data.viaje_aceptado.id && acceptedTrip.estado !== 'cancelado') {
          console.log("🚨 Viaje actual fue cancelado por la conductora")
          
          stopPolling()
          
          Alert.alert(
            "Viaje cancelado",
            "Tu viaje fue cancelado por la conductora. Puedes solicitar un nuevo viaje.",
            [
              {
                text: "OK",
                onPress: async () => {
                  setAcceptedTrip(null)
                  setIsWaitingForDriver(false)
                  setShowContraoferta(false)
                  setContraofertaData(null)
                  lastViajeIdRef.current = null
                  await limpiarFormularioCompleto()
                }
              }
            ]
          )
        }
        
        return
      }

      // ✅ Si hay un viaje aceptado ACTIVO
      if (data.viaje_aceptado.estado !== 'cancelado') {
        console.log("✅ Viaje aceptado ACTIVO encontrado:", data.viaje_aceptado.id)
        
        if (!acceptedTrip || acceptedTrip.id !== data.viaje_aceptado.id) {
          console.log("🔄 Actualizando datos del viaje aceptado")
          setAcceptedTrip(data.viaje_aceptado)
          lastViajeIdRef.current = data.viaje_aceptado.id
        }
        
        setIsWaitingForDriver(false)
        setShowContraoferta(false)
        setContraofertaData(null)
        return
      }
    }

    // 🔥 PRIORIDAD 4: NO HAY VIAJES (CASO POR DEFECTO)
    console.log("ℹ️ No hay viaje aceptado, finalizado ni cancelado:", data.message || "Sin respuesta")
    
    // 🔥 CAMBIO IMPORTANTE: Ya no asumir que es "finalizado"
    // Si antes había un viaje y ahora no hay nada, simplemente limpiar sin mostrar alert
    if (acceptedTrip && !data.viaje_aceptado && !data.viaje_finalizado && !data.viaje_cancelado) {
      console.log("ℹ️ El viaje anterior ya no está disponible - limpiando estados")
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
  // 🔥 useEffect para obtener ubicación INICIAL y configurar watcher
  useEffect(() => {
    const configurarUbicacionInicial = async () => {
      // Obtener ubicación inicial
      await obtenerUbicacionActual()

      // OPCIONAL: Configurar un watcher MÁS LENTO que SOLO actualice currentLocation
      try {
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Cada 30 segundos
            distanceInterval: 100, // Cada 100 metros
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

  // 🔥 useEffect MEJORADO para el polling con mejor control
  useEffect(() => {
    console.log("🔄 Estado cambió - Evaluando polling:", {
      acceptedTrip: !!acceptedTrip,
      isWaitingForDriver,
      showContraoferta
    })

    if (acceptedTrip) {
      console.log("🔄 Iniciando polling para viaje aceptado")
      startPolling(() => {
        consultarViajeAceptado()
      }, 5000) // Cada 5 segundos para viajes aceptados
      
    } else if (isWaitingForDriver && !showContraoferta) {
      console.log("🔄 Iniciando polling para búsqueda de conductora")
      startPolling(() => {
        consultarContraoferta()
        consultarViajeAceptado()
      }, 7000) // Cada 7 segundos para búsqueda
      
    } else {
      console.log("🛑 Deteniendo polling - no hay condiciones activas")
      stopPolling()
    }

    // Cleanup al desmontar
    return () => {
      stopPolling()
    }
  }, [isWaitingForDriver, showContraoferta, acceptedTrip?.id]) // 🔥 DEPENDENCIA MEJORADA

  // Function to cancel accepted trip
  const cancelarViajeAceptado = async () => {
    if (!acceptedTrip) return;
    
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
              setIsLoadingAcceptedTrip(true);
              
              const token = await AsyncStorage.getItem("token");
              
              // 🔥 USAR LA NUEVA FUNCIÓN DE FETCH CON MANEJO DE ERRORES
              const result = await fetchWithErrorHandling(
                "https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    viaje_id: acceptedTrip.id
                  }),
                }
              );

              if (result.success && result.data.success) {
                stopPolling(); // 🔥 DETENER POLLING INMEDIATAMENTE
                
                setAcceptedTrip(null);
                setIsLoadingAcceptedTrip(false);
                
                Alert.alert(
                  "Viaje cancelado", 
                  "El viaje ha sido cancelado exitosamente",
                  [
                    {
                      text: "OK",
                      onPress: async () => {
                        setIsWaitingForDriver(false);
                        setShowContraoferta(false);
                        setContraofertaData(null);
                        lastViajeIdRef.current = null;
                        await limpiarFormularioCompleto();
                      }
                    }
                  ]
                );
                
                console.log("✅ Viaje cancelado exitosamente");
                
              } else {
                setIsLoadingAcceptedTrip(false);
                Alert.alert(
                  "Error", 
                  result.data?.error || result.error || "No se pudo cancelar el viaje. Inténtalo de nuevo."
                );
                console.error("❌ Error al cancelar viaje:", result.error);
              }
              
            } catch (error) {
              setIsLoadingAcceptedTrip(false);
              console.error("❌ Error de conexión al cancelar viaje:", error);
              Alert.alert(
                "Error de conexión", 
                "No se pudo conectar con el servidor. Verifica tu conexión a internet."
              );
            }
          },
        },
      ]
    );
  };

  // Function to call driver
  const llamarConductora = (telefono: string) => {
    if (telefono && telefono !== "N/A") {
      Linking.openURL(`tel:${telefono.replace(/\s/g, "")}`)
    } else {
      Alert.alert("Error", "Número de teléfono no disponible")
    }
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
          `Has aceptado la propuesta de ${contraofertaData.conductora_nombre} por $${Number(contraofertaData.valorPersonalizado).toLocaleString("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})}`
,
          [
            {
              text: "OK",
              onPress: () => {
                setShowContraoferta(false)
                setContraofertaData(null)
                setIsWaitingForDriver(false)
                closeModal()
                setTimeout(() => {
                  consultarViajeAceptado()
                }, 1000)
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
  setIsWaitingForDelivery(false)  // ← agrega esto
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

  // 🔥 FUNCIÓN MEJORADA PARA LIMPIAR FORMULARIO Y OBTENER NUEVA UBICACIÓN
  const limpiarFormulario = async () => {
    // Limpiar campos del formulario
    setDestinoDireccion("")
    setDestinoBarrio("")
    setDestinoZona("")
    setPuntoReferencia("")
    setValorPersonalizado("")
    setSelectedVehicle("")
    
    // 🔥 OBTENER NUEVA UBICACIÓN DESPUÉS DE LIMPIAR
    console.log("🔄 Obteniendo nueva ubicación después de limpiar formulario...")
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
        // NO llamar limpiarFormulario aquí para no perder los datos del viaje actual
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

  //confirmar pedido pinkentregas
  const handleConfirmarEntrega = async () => {
  if (!usuarioId) {
    Alert.alert("Error de sesión", "Por favor inicia sesión nuevamente.")
    return
  }
  setIsSubmittingRequest(true)
  try {
    const token = await AsyncStorage.getItem("token")
    const res = await fetch(
      "https://www.pinkdrivers.com/api-rest/index.php?action=post_entrega",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
  usuario_id: usuarioId,
  nombre_envia: senderName,
  telefono_envia: senderPhone,
  nombre_recibe: receiverName,
  telefono_recibe: receiverPhone,
  direccion_recogida: pickupAddress,
  barrio_recogida: pickupBarrio,      // ← agregar
  zona_recogida: pickupZona,          // ← agregar
  ciudad_recogida: pickupCiudad,      // ← agregar
  direccion_entrega: deliveryAddress,
  barrio_entrega: deliveryBarrio,     // ← agregar
  zona_entrega: deliveryZona,         // ← agregar
  es_fragil: isFragile ? 1 : 0,
  notas_adicionales: deliveryNotes,
  vehiculo_requerido: deliveryVehicle,
  precio_ofrecido: parseFloat(deliveryPrice),
}),
      }
    )
    const json = await res.json()
if (res.ok) {
  setIsSubmittingRequest(false)
  // Guardar resumen antes de limpiar
  setEntregaResumen({
    recogida: pickupAddress,
    entrega: deliveryAddress,
    precio: deliveryPrice,
    vehiculo: deliveryVehicle,
  })
  setIsWaitingForDelivery(true)
  // Limpiar formulario PinkEntregas
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
} else {
  setIsSubmittingRequest(false)
  Alert.alert("Error", json.error || "No se pudo registrar la entrega.")
}
} catch (error) {
  setIsSubmittingRequest(false)
  Alert.alert("Error de conexión", "Verifica tu conexión a internet.")
}
}
const [entregaResumen, setEntregaResumen] = useState<{
  recogida: string
  entrega: string
  precio: string
  vehiculo: string
} | null>(null)

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

  // 🔥 FUNCIÓN MEJORADA PARA CANCELAR BÚSQUEDA CON NUEVA UBICACIÓN
  const cancelarBusqueda = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      console.log("🟡 Respuesta al cancelar búsqueda:", data);

      if (response.ok && data.success) {
        Alert.alert("Búsqueda cancelada", "Tu búsqueda fue cancelada exitosamente.");
        
        // Resetear estados
        setIsWaitingForDriver(false);
        setAcceptedTrip(null);
        setShowContraoferta(false);
        setContraofertaData(null);
        
        // 🔥 LIMPIAR Y OBTENER NUEVA UBICACIÓN
        await limpiarFormulario();
        
      } else {
        Alert.alert("Error", data.error || "No se pudo cancelar la búsqueda.");
      }
    } catch (error) {
      console.error("❌ Error al cancelar búsqueda:", error);
      Alert.alert("Error", "Ocurrió un error al cancelar la búsqueda.");
    }
  };

  // Render accepted trip detail view - DiDi style
  const renderAcceptedTripDetail = () => {
  if (!acceptedTrip) return null

  const firstName = acceptedTrip.conductora_nombre.split(" ")[0]

  return (
    <View style={styles.acceptedTripContainer}>
      {/* Header mejorado */}
      <View style={styles.acceptedTripHeader}>
        <Text style={styles.acceptedTripTitle}>¡Tu viaje fue aceptado! 🎉</Text>
        <View style={styles.tripStatusBadge}>
          <Text style={styles.tripStatusText}>✓ CONFIRMADO</Text>
        </View>
      </View>

      {/* Información de la conductora mejorada */}
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

        {/* Información del vehículo mejorada */}
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

        {/* Botón de llamar mejorado */}
        <TouchableOpacity
          style={styles.callDriverButton}
          onPress={() => llamarConductora(acceptedTrip.conductora_telefono)}
        >
          <FontAwesome name="phone" size={18} color="#fff" />
          <Text style={styles.callDriverButtonText}>Llamar</Text>
        </TouchableOpacity>

        
      </View>

      {/* Información de ruta mejorada */}
      <View style={styles.tripRouteDetailCard}>


        <View style={styles.tripRoutePoint}>
          <View style={styles.tripRoutePointDot} />
          <View style={styles.tripRoutePointInfo}>
            <Text style={styles.tripRoutePointLabel}>ORIGEN</Text>
            <Text style={styles.tripRoutePointAddress}>{acceptedTrip.ubicacionActual}</Text>
            <Text style={styles.tripRoutePointNeighborhood}>
              {acceptedTrip.barrioActual} • {acceptedTrip.zonaActual}
            </Text>
            <Text style={styles.tripRouteReference}>Ref: {acceptedTrip.puntoReferencia}</Text>
          </View>
        </View>

        <View style={styles.tripRouteLine} />

        <View style={styles.tripRoutePoint}>
          <View style={[styles.tripRoutePointDot, styles.tripDestinationDot]} />
          <View style={styles.tripRoutePointInfo}>
            <Text style={styles.tripRoutePointLabel}>DESTINO</Text>
            <Text style={styles.tripRoutePointAddress}>{acceptedTrip.destinoDireccion}</Text>
            <Text style={styles.tripRoutePointNeighborhood}>
              {acceptedTrip.destinoBarrio} • {acceptedTrip.destinoZona}
            </Text>
          </View>
        </View>
      </View>

      {/* Tarjeta de precio mejorada */}
      <View style={[styles.tripPriceDetailCard]}>
        <Text style={styles.tripPriceDetailAmount}>
          ${acceptedTrip.valorPersonalizado.toLocaleString("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})}

        </Text>
      </View>

      {/* Botón de cancelar mejorado */}
      <View style={styles.tripActionButtons}>
        <TouchableOpacity 
          style={styles.cancelTripButtonFull} 
          onPress={cancelarViajeAceptado}
        >
          <FontAwesome name="times-circle" size={18} color="#FF5722" />
          <Text style={styles.cancelTripButtonText}>Cancelar viaje</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

  // Función para renderizar el mapa con imagen personalizada
  const renderMap = () => {
    if (locationLoading) {
      return (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 16 }}>
            Cargando ubicación...
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.map}>
        <Image
          source={require('../../assets/images/fondoN.jpg')}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'cover'
          }}
          onLoad={() => {
            console.log("🖼️ Imagen del mapa cargada correctamente");
          }}
          onError={(error) => {
            console.error("❌ Error al cargar la imagen:", error);
          }}
        />
        
        {/* Overlay con información de ubicación */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center'
        }}>
          <FontAwesome name="map-marker" size={24} color="#FF69B4" />
          <Text style={{ color: "#333", fontSize: 14, marginTop: 5, textAlign: 'center' }}>
            {currentLocation 
              ? `Ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : "Obteniendo ubicación..."
            }
          </Text>
        </View>
      </View>
    )
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

  // If there's an accepted trip, show it instead of the normal interface
  if (acceptedTrip) {
    return (
      <LinearGradient colors={["#D404C2", "#D404C2"]} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#D404C2" />

        <View style={[styles.mapContainer, { height: screenHeight * 0.4 }]}>
          {renderMap()}
        </View>

        <View style={styles.avatarMenuContainer}>
            <TouchableOpacity
              onPress={() => navigateTo("/passenger/ProfileP")}
              style={styles.avatarButtonContainer}
              activeOpacity={0.8}
              >
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
      <View style={[styles.mapContainer, isKeyboardVisible && styles.mapWithKeyboard]}>
        {renderMap()}
      </View>

      {menuVisible && <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />}

      <View style={styles.avatarMenuContainer}>
  <TouchableOpacity
    onPress={() => navigateTo("/passenger/ProfileP")}
    style={styles.avatarButtonContainer}
    activeOpacity={0.8}
  >
    <Ionicons name="person-circle-outline" size={45} color="#fff" />
  </TouchableOpacity>
</View>

      <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }]}>
  {/* Botones de selección de servicio */}
  <View style={styles.serviceSelectorContainer}>
    <TouchableOpacity
      style={[styles.serviceButton, serviceMode === 'viajes' && styles.serviceButtonActive]}
      onPress={() => { setServiceMode('viajes'); openModal(); }}
    >
      <FontAwesome5 name="car" size={16} color={serviceMode === 'viajes' ? "#fff" : "#D404C2"} />
      <Text style={[styles.serviceButtonText, serviceMode === 'viajes' && styles.serviceButtonTextActive]}>
        Viajes
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.serviceButton, serviceMode === 'pinkentregas' && styles.serviceButtonActive]}
      onPress={() => { setServiceMode('pinkentregas'); openModal(); }}
    >
      <FontAwesome5 name="box" size={16} color={serviceMode === 'pinkentregas' ? "#fff" : "#D404C2"} />
      <Text style={[styles.serviceButtonText, serviceMode === 'pinkentregas' && styles.serviceButtonTextActive]}>
        PinkEntregas
      </Text>
    </TouchableOpacity>
  </View>

  {/* Input de ubicación actual siempre visible */}
  <TouchableOpacity onPress={openModalFromCurrentLocation}>
    <View style={[styles.input, { justifyContent: "center" }]}>
      <Text style={{ color: ubicacionActual ? "#333" : "#666", fontSize: 15 }}>{getUbicacionActualText()}</Text>
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
                    <Text style={styles.contraofertaPlate}>Color: {contraofertaData.vehiculo_color}</Text>
                    <Text style={styles.contraofertaMessage}>Te propuso un precio de:</Text>
                    <Text style={styles.contraofertaPrice}>
                      ${Number(contraofertaData.valorPersonalizado).toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                      })}
 
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
            ) : isWaitingForDelivery ? (
  <View style={styles.waitingContainer}>
    <View style={[styles.waitingHeader, { backgroundColor: '#5A189A' }]}>
      <Text style={styles.waitingTitle}>Pedido enviado 📦</Text>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => { setIsWaitingForDelivery(false); closeModal() }}
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

      {/* Resumen del pedido */}
      {entregaResumen && (
        <View style={{
          backgroundColor: '#F3EEF8',
          borderRadius: 12,
          padding: 16,
          width: '100%',
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#5A189A',
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: '#D8CCE8',
          }}>
            <Text style={{ color: '#5A189A', fontSize: 13 }}>
              🚲 {entregaResumen.vehiculo}
            </Text>
            <Text style={{ color: '#5A189A', fontSize: 15, fontWeight: 'bold' }}>
              ${parseFloat(entregaResumen.precio).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.cancelSearchButton, { borderColor: '#5A189A' }]}
        onPress={() => { setIsWaitingForDelivery(false); closeModal() }}
      >
        <Text style={[styles.cancelSearchButtonText, { color: '#5A189A' }]}>
          Cancelar pedido
        </Text>
      </TouchableOpacity>
    </View>
  </View>
) : (

              <>
                {/* Header del modal */}
                <View style={dynHeader}>
                  <View style={{ width: 40 }} />
                  <Text style={dynTitle}>
                    {isPE ? 'PinkEntregas - Nuevo Pedido' : 'Detalles del viaje'}
                  </Text>
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
                    {serviceMode === 'pinkentregas' ? (
                      /* ====== FORMULARIO PINKENTREGAS ====== */
                      <>
                        {/* Datos de quien envía */}
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>
                          Datos de quien envía
                        </Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "senderName" && styles.modalInputFocusedPE]}
                          placeholder="Nombre de quien envía"
                          placeholderTextColor="#666"
                          value={senderName}
                          onChangeText={setSenderName}
                          onFocus={() => setActiveField("senderName")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "senderPhone" && styles.modalInputFocusedPE]}
                          placeholder="Teléfono de quien envía"
                          placeholderTextColor="#666"
                          value={senderPhone}
                          onChangeText={setSenderPhone}
                          keyboardType="phone-pad"
                          onFocus={() => setActiveField("senderPhone")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        {/* Datos de quien recibe */}
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>
                          Datos de quien recibe
                        </Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "receiverName" && styles.modalInputFocusedPE]}
                          placeholder="Nombre de quien recibe"
                          placeholderTextColor="#666"
                          value={receiverName}
                          onChangeText={setReceiverName}
                          onFocus={() => setActiveField("receiverName")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />
                        <TextInput
                          style={[styles.modalInput, activeField === "receiverPhone" && styles.modalInputFocusedPE]}
                          placeholder="Teléfono de quien recibe"
                          placeholderTextColor="#666"
                          value={receiverPhone}
                          onChangeText={setReceiverPhone}
                          keyboardType="phone-pad"
                          onFocus={() => setActiveField("receiverPhone")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                       {/* ================= DIRECCIONES ================= */}


                        {/* -------- DIRECCIÓN DE RECOGIDA -------- */}
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>
                          Dirección de Recogida
                        </Text>

                        <TextInput
                          style={[styles.modalInput, activeField === "pickupAddress" && styles.modalInputFocusedPE]}
                          placeholder="Dirección"
                          placeholderTextColor="#666"
                          value={pickupAddress}
                          onChangeText={setPickupAddress}
                          onFocus={() => setActiveField("pickupAddress")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        <TextInput
                          style={[styles.modalInput, activeField === "pickupBarrio" && styles.modalInputFocusedPE]}
                          placeholder="Barrio"
                          placeholderTextColor="#666"
                          value={pickupBarrio}
                          onChangeText={setPickupBarrio}
                          onFocus={() => setActiveField("pickupBarrio")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker
                            selectedValue={pickupZona}
                            onValueChange={(itemValue) => setPickupZona(itemValue)}
                            style={styles.picker}
                          >
                            {zonasDisponibles.map((zona) => (
                              <Picker.Item key={zona.value} label={zona.label} value={zona.value} />
                            ))}
                          </Picker>
                        </View>

                        <TextInput
                          style={[styles.modalInput, activeField === "pickupCiudad" && styles.modalInputFocusedPE]}
                          placeholder="Ciudad"
                          placeholderTextColor="#666"
                          value={pickupCiudad}
                          onChangeText={setPickupCiudad}
                          onFocus={() => setActiveField("pickupCiudad")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        {/* -------- DIRECCIÓN DE ENTREGA -------- */}
                        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>
                          Dirección de Entrega
                        </Text>

                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryAddress" && styles.modalInputFocusedPE]}
                          placeholder="Dirección"
                          placeholderTextColor="#666"
                          value={deliveryAddress}
                          onChangeText={setDeliveryAddress}
                          onFocus={() => setActiveField("deliveryAddress")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryBarrio" && styles.modalInputFocusedPE]}
                          placeholder="Barrio"
                          placeholderTextColor="#666"
                          value={deliveryBarrio}
                          onChangeText={setDeliveryBarrio}
                          onFocus={() => setActiveField("deliveryBarrio")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="next"
                        />

                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker
                            selectedValue={deliveryZona}
                            onValueChange={(itemValue) => setDeliveryZona(itemValue)}
                            style={styles.picker}
                          >
                            {zonasDisponibles.map((zona) => (
                              <Picker.Item key={zona.value} label={zona.label} value={zona.value} />
                            ))}
                          </Picker>
                        </View>

                        {/* Datos del paquete */}
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>
                          Datos del paquete
                        </Text>

                        {/* Indicador frágil */}
                        <Text style={styles.fragileLabel}>¿El paquete es frágil?</Text>
                        <View style={styles.fragileContainer}>
                          <TouchableOpacity
                            style={[styles.fragileOption, isFragile === true && styles.fragileOptionActive]}
                            onPress={() => setIsFragile(true)}
                          >
                            <Text style={[styles.fragileOptionText, isFragile === true && styles.fragileOptionTextActive]}>
                             Sí, es frágil
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.fragileOption, isFragile === false && styles.fragileOptionActive]}
                            onPress={() => setIsFragile(false)}
                          >
                            <Text style={[styles.fragileOptionText, isFragile === false && styles.fragileOptionTextActive]}>
                             No es frágil
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={[styles.modalInput, styles.notasInput, activeField === "deliveryNotes" && styles.modalInputFocusedPE]}
                          placeholder="Notas adicionales (opcional)"
                          placeholderTextColor="#666"
                          value={deliveryNotes}
                          onChangeText={setDeliveryNotes}
                          multiline
                          numberOfLines={3}
                          onFocus={() => setActiveField("deliveryNotes")}
                          onBlur={() => setActiveField(null)}
                        />

                        {/* Servicio */}
                        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 10 }]}>
                         Servicio
                        </Text>
                        <TextInput
                          style={[styles.modalInput, activeField === "deliveryPrice" && styles.modalInputFocusedPE]}
                          placeholder="Precio ofrecido"
                          placeholderTextColor="#666"
                          value={deliveryPrice}
                          onChangeText={setDeliveryPrice}
                          keyboardType="numeric"
                          onFocus={() => setActiveField("deliveryPrice")}
                          onBlur={() => setActiveField(null)}
                          returnKeyType="done"
                        />

                        {/* Vehículo requerido */}
                        <View style={styles.vehicleSelectionContainer}>
                          <Text style={styles.sectionTitle}>Vehículo requerido</Text>
                          <View style={styles.vehicleOptions}>
                            <TouchableOpacity
                              style={[styles.vehicleOption, deliveryVehicle === "bicicleta" && styles.selectedVehicleOptionPE]}
                              onPress={() => setDeliveryVehicle("bicicleta")}
                            >
                              <FontAwesome5 name="bicycle" size={24} color={deliveryVehicle === "bicicleta" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, deliveryVehicle === "bicicleta" && styles.selectedVehicleText]}>
                                Bicicleta
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.vehicleOption,
                                deliveryVehicle === "patineta" && styles.selectedVehicleOptionPE
                              ]}
                              onPress={() => setDeliveryVehicle("patineta")}
                            >
                              <MaterialCommunityIcons
                                name="scooter"
                                size={24}
                                color={deliveryVehicle === "patineta" ? "#fff" : "#333"}
                              />
                              <Text
                                style={[
                                  styles.vehicleText,
                                  deliveryVehicle === "patineta" && styles.selectedVehicleText
                                ]}
                              >
                                Patineta
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.vehicleOption, deliveryVehicle === "silla_ruedas" && styles.selectedVehicleOptionPE]}
                              onPress={() => setDeliveryVehicle("silla_ruedas")}
                            >
                              <FontAwesome5 name="wheelchair" size={24} color={deliveryVehicle === "silla_ruedas" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, deliveryVehicle === "silla_ruedas" && styles.selectedVehicleText]}>
                                Silla ruedas
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.modalButtonP,
                            (!senderName || !senderPhone || !receiverName || !receiverPhone || !pickupAddress || !deliveryAddress || isFragile === null || !deliveryPrice || !deliveryVehicle) && styles.modalButtonDisabledPEP,
                          ]}
                          disabled={!senderName || !senderPhone || !receiverName || !receiverPhone || !pickupAddress || !deliveryAddress || isFragile === null || !deliveryPrice || !deliveryVehicle}
                          onPress={() => handleConfirmarEntrega()}
                        >
                          <Text style={styles.modalButtonTextP}>Confirmar Pedido</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      /* ====== FORMULARIO VIAJES  ====== */
                      <>
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
                          onSubmitEditing={() => ciudadActualRef.current?.focus()}
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker
                            selectedValue={zonaActual}
                            onValueChange={(itemValue) => setZonaActual(itemValue)}
                            style={styles.picker}
                          >
                            {zonasDisponibles.map((zona) => (
                              <Picker.Item key={zona.value} label={zona.label} value={zona.value} />
                            ))}
                          </Picker>
                        </View>
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
                          onSubmitEditing={() => referenciaRef.current?.focus()}
                        />
                        <View style={[styles.modalInput, styles.pickerContainer]}>
                          <Picker
                            selectedValue={destinoZona}
                            onValueChange={(itemValue) => setDestinoZona(itemValue)}
                            style={styles.picker}
                          >
                            {zonasDisponibles.map((zona) => (
                              <Picker.Item key={zona.value} label={zona.label} value={zona.value} />
                            ))}
                          </Picker>
                        </View>
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
                              <MaterialCommunityIcons name="rickshaw" size={35} color={selectedVehicle === "motocarro" ? "#fff" : "#333"} />
                              <Text style={[styles.vehicleText, selectedVehicle === "motocarro" && styles.selectedVehicleText]}>
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
                            Precio sugerido: ${priceEstimate.toLocaleString("es-CO")}
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