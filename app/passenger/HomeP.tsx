"use client"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
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
import MapView, { Marker, Polyline } from "react-native-maps"
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
  const ciudadActualRef = useRef<TextInput>(null)
  const destinoDireccionRef = useRef<TextInput>(null)
  const destinoBarrioRef = useRef<TextInput>(null)
  const referenciaRef = useRef<TextInput>(null)
  const precioRef = useRef<TextInput>(null)

  // Estado para el usuario logueado
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [usuarioData, setUsuarioData] = useState<any>(null)

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

  //CONSULTAR VIAJE ACEPTADO

 const consultarViajeAceptado = async () => {
  try {
    setIsLoadingAcceptedTrip(true)
    const token = await AsyncStorage.getItem("token")
    console.log("🟡 Consultando viaje aceptado...")

    const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=viaje_aceptado", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    console.log("🟡 Respuesta viaje aceptado:", data)

    // ✅ Si hay viaje aceptado o finalizado
    if (response.ok && (data.viaje_aceptado || data.viaje_finalizado)) {

      // 🔥 MANEJO DE VIAJES FINALIZADOS
      if (data.viaje_finalizado) {
        console.log("✅ Viaje finalizado encontrado")
        
        // Mostrar alert de finalización SIEMPRE que haya un viaje finalizado
        // Sin importar si había un viaje aceptado previo o no
        const firstName = data.viaje_finalizado.conductora_nombre.split(" ")[0]
        
        Alert.alert(
          "¡Viaje finalizado!", // 🎉 TÍTULO CORRECTO
          `Tu viaje con ${firstName} ha finalizado exitosamente.\n\nTotal pagado: ${data.viaje_finalizado.valorPersonalizado.toLocaleString()} COP\n\n¡Gracias por usar Pink Drivers!`,
          [
            {
              text: "OK",
              onPress: () => {
                // Limpiar todos los estados relacionados con el viaje
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
                console.log("🎉 Viaje completado exitosamente")
              }
            }
          ]
        )
        return // Salir de la función después de manejar el viaje finalizado
      }

      // ✅ Si el viaje está cancelado por la conductora
      if (data.viaje_aceptado && data.viaje_aceptado.estado === 'cancelado') {
        console.log("⚠️ El viaje ha sido cancelado por la conductora")
        Alert.alert(
          "Viaje cancelado", // 🚫 TÍTULO PARA CANCELACIÓN
          "Tu viaje fue cancelado por la conductora. Puedes solicitar un nuevo viaje.",
          [
            {
              text: "OK",
              onPress: () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
              }
            }
          ]
        )
        return
      }

      // ✅ Si hay un viaje aceptado (activo/en proceso)
      if (data.viaje_aceptado && data.viaje_aceptado.estado !== 'cancelado') {
        console.log("✅ Viaje aceptado encontrado:", data.viaje_aceptado.id)
        setAcceptedTrip(data.viaje_aceptado)
        setIsWaitingForDriver(false)
        setShowContraoferta(false)
        setContraofertaData(null)
      }

    } else {
      console.log("ℹ️ No hay viaje aceptado:", data.message)

      // Si antes había un viaje aceptado pero ya no hay nada → fue cancelado
      if (acceptedTrip && !data.viaje_aceptado && !data.viaje_finalizado) {
        console.log("⚠️ El viaje anterior desapareció - posiblemente cancelado")
        Alert.alert(
          "Viaje cancelado",
          "Tu viaje fue cancelado por la conductora. Puedes solicitar un nuevo viaje.",
          [
            {
              text: "OK",
              onPress: () => {
                setAcceptedTrip(null)
                setIsWaitingForDriver(false)
                setShowContraoferta(false)
                setContraofertaData(null)
              }
            }
          ]
        )
      } else {
        // No había viaje anterior, simplemente limpiar
        setAcceptedTrip(null)
      }
    }

  } catch (error) {
    console.error("❌ Error al consultar viaje aceptado:", error)
    setAcceptedTrip(null)
  } finally {
    setIsLoadingAcceptedTrip(false)
  }
}


// IMPORTANTE: También necesitas agregar un polling continuo para detectar cancelaciones
// Modifica el useEffect del polling:

useEffect(() => {
  let intervalId: number

  // NUEVO: Polling continuo cuando hay un viaje aceptado para detectar cancelaciones
  if (acceptedTrip) {
    console.log("🔄 Iniciando polling para viaje aceptado")
    consultarViajeAceptado()
    
    intervalId = setInterval(() => {
      consultarViajeAceptado()
    }, 3000) // Cada 3 segundos para detectar cancelaciones rápidamente
    
  } else if (isWaitingForDriver && !showContraoferta) {
    // Check for counter-offers first
    consultarContraoferta()
    // Then check for accepted trips
    consultarViajeAceptado()

    intervalId = setInterval(() => {
      consultarContraoferta()
      consultarViajeAceptado()
    }, 5000)
    
  } else if (!isWaitingForDriver && !acceptedTrip) {
    // Check for accepted trips on app load
    consultarViajeAceptado()
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId)
      console.log("🛑 Polling detenido")
    }
  }
}, [isWaitingForDriver, showContraoferta, acceptedTrip])
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
            // Mostrar loading
            setIsLoadingAcceptedTrip(true);
            
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
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

            const data = await response.json();
            
            if (response.ok && data.success) {
              // Limpiar el estado del viaje aceptado
              setAcceptedTrip(null);
              setIsLoadingAcceptedTrip(false);
              
              Alert.alert(
                "Viaje cancelado", 
                "El viaje ha sido cancelado exitosamente",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Resetear otros estados si es necesario
                      setIsWaitingForDriver(false);
                      setShowContraoferta(false);
                      setContraofertaData(null);
                    }
                  }
                ]
              );
              
              console.log("✅ Viaje cancelado exitosamente");
              
            } else {
              setIsLoadingAcceptedTrip(false);
              Alert.alert(
                "Error", 
                data.error || "No se pudo cancelar el viaje. Inténtalo de nuevo."
              );
              console.error("❌ Error al cancelar viaje:", data.error);
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
          `Has aceptado la propuesta de ${contraofertaData.conductora_nombre} por $${Number(contraofertaData.valorPersonalizado).toLocaleString()} COP`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowContraoferta(false)
                setContraofertaData(null)
                setIsWaitingForDriver(false)
                closeModal()
                // Check for accepted trip after accepting counter-offer
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

  // Polling for counter-offers and accepted trips
  useEffect(() => {
    let intervalId: number

    if (isWaitingForDriver && !showContraoferta && !acceptedTrip) {
      // Check for counter-offers first
      consultarContraoferta()
      // Then check for accepted trips
      consultarViajeAceptado()

      intervalId = setInterval(() => {
        consultarContraoferta()
        consultarViajeAceptado()
      }, 5000)
    } else if (!isWaitingForDriver && !acceptedTrip) {
      // Check for accepted trips on app load
      consultarViajeAceptado()
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isWaitingForDriver, showContraoferta, acceptedTrip])

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

  const cancelarBusqueda = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      // No se envía viaje_id: se cancela automáticamente el último con estado 'pendiente'
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log("🟡 Respuesta al cancelar búsqueda:", data);

    if (response.ok && data.success) {
      Alert.alert("Búsqueda cancelada", "Tu búsqueda fue cancelada exitosamente.");
      setIsWaitingForDriver(false);
      setAcceptedTrip(null);
      setShowContraoferta(false);
      setContraofertaData(null);
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

    // Extract first name only
    const firstName = acceptedTrip.conductora_nombre.split(" ")[0]

    return (
      <View style={styles.acceptedTripContainer}>
        <View style={styles.acceptedTripHeader}>
          <Text style={styles.acceptedTripTitle}>¡Tu viaje fue aceptado!</Text>
          <View style={styles.tripStatusBadge}>
            <Text style={styles.tripStatusText}>Confirmado</Text>
          </View>
        </View>

        <View style={styles.driverDetailCard}>
          <FontAwesome5 name="user-circle" size={80} color="#FF69B4" />
          <View style={styles.driverDetailInfo}>
            <Text style={styles.driverNameLarge}>{firstName}</Text>
            <Text style={styles.vehicleInfo}>{acceptedTrip.selectedVehicle}</Text>
            {acceptedTrip.vehiculo_placa && (
              <Text style={styles.vehicleDetails}>Placas: {acceptedTrip.vehiculo_placa}</Text>
            )}
            {acceptedTrip.vehiculo_color && (
              <Text style={styles.vehicleDetails}>Color: {acceptedTrip.vehiculo_color}</Text>
            )}
            <TouchableOpacity
              style={styles.callDriverButton}
              onPress={() => llamarConductora(acceptedTrip.conductora_telefono)}
            >
              <FontAwesome name="phone" size={16} color="#fff" />
              <Text style={styles.callDriverButtonText}>Llamar</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        <View style={styles.tripPriceDetailCard}>
          <Text style={styles.tripPriceDetailLabel}>Precio acordado</Text>
          <Text style={styles.tripPriceDetailAmount}>${acceptedTrip.valorPersonalizado.toLocaleString()} COP</Text>
          <Text style={styles.tripVehicleType}>Vehículo: {acceptedTrip.selectedVehicle}</Text>
        </View>

        <View style={styles.tripActionButtons}>
          <TouchableOpacity style={styles.cancelTripButtonFull} onPress={cancelarViajeAceptado}>
            <FontAwesome name="times" size={16} color="#FF5722" />
            <Text style={styles.cancelTripButtonText}>Cancelar viaje</Text>
          </TouchableOpacity>
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
      <LinearGradient colors={["#CF5BA9", "#B33F8D"]} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />

        <View style={[styles.mapContainer, { height: screenHeight * 0.4 }]}>
          <MapView style={styles.map} region={region}>
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
            {destinoCoords && <Marker coordinate={destinoCoords} pinColor="#FF1493" />}
            {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#FF1493" />
            )}
          </MapView>
        </View>

        <View style={styles.avatarMenuContainer}>
          <TouchableOpacity
            onPress={() => navigateTo("/passenger/ProfileP")}
            style={styles.avatarButtonContainer}
            activeOpacity={0.8}
          >
            <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.avatarSmall} />
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, flex: 1 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>{renderAcceptedTripDetail()}</ScrollView>
        </View>
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
                    <Text style={styles.contraofertaPlate}>Color: {contraofertaData.vehiculo_color}</Text>
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
                      onSubmitEditing={() => ciudadActualRef.current?.focus()}
                    />

                    {/* Picker para zona actual */}
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

                    {/* Picker para zona de destino */}
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
