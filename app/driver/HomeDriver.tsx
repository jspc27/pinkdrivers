"use client"
import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { router, useFocusEffect, type ExternalPathString, type RelativePathString } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, FlatList, Linking, StatusBar, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import styles from "../styles/HomeDriverPstyles"

interface RideRequest {
  id: string
  passengerName: string
  pickupAddress: string
  pickupNeighborhood: string
  pickupZone: string
  puntoReferencia?: string // ✅ AGREGADO: Punto de referencia
  destinationAddress: string
  destinationNeighborhood: string
  destinationZone: string
  proposedPrice: number
  counterOfferPrice?: number
  status: "pending" | "negotiation" | "accepted"
  passenger: {
    phone: string
    whatsapp: string
  }
}

const HomeDriver = () => {
  const [isDriverActive, setIsDriverActive] = useState(false)
  const [currentCity, setCurrentCity] = useState("Cali")
  const [currentZone, setCurrentZone] = useState("Norte")
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [counterOfferPrice, setCounterOfferPrice] = useState("")
  const [conductoraId, setConductoraId] = useState<number | null>(null)
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [rejectedRides, setRejectedRides] = useState<Set<string>>(new Set())
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null)
  const [rideStatus, setRideStatus] = useState<"pending" | "accepted" | "in_progress" | "completed">("pending")
  const [isScreenFocused, setIsScreenFocused] = useState(true)

  // Referencias para controlar el polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPollingActiveRef = useRef(false)
  const lastFetchTimestamp = useRef<number>(0)


  const canceladoMostradoRef = useRef(false)

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

  const loadDriverActiveStatus = async () => {
    try {
      if (!conductoraId) return false
      const driverStatusKey = `driver_active_${conductoraId}`
      const storedStatus = await AsyncStorage.getItem(driverStatusKey)
      if (storedStatus !== null) {
        const isActive = JSON.parse(storedStatus)
        setIsDriverActive(isActive)
        console.log("✅ Estado de disponibilidad cargado:", isActive ? "Disponible" : "No disponible")
        return isActive
      } else {
        setIsDriverActive(false)
        console.log("ℹ️ No hay estado previo, iniciando como no disponible")
        return false
      }
    } catch (error) {
      console.error("❌ Error al cargar estado de disponibilidad:", error)
      setIsDriverActive(false)
      return false
    }
  }

  const saveDriverActiveStatus = async (status: boolean) => {
    try {
      if (!conductoraId) {
        console.warn("⚠️ No se puede guardar estado sin ID de conductora")
        return
      }
      const driverStatusKey = `driver_active_${conductoraId}`
      await AsyncStorage.setItem(driverStatusKey, JSON.stringify(status))
      console.log("✅ Estado de disponibilidad guardado:", status ? "Disponible" : "No disponible")
    } catch (error) {
      console.error("❌ Error al guardar estado de disponibilidad:", error)
    }
  }

  const loadRejectedRides = async () => {
    try {
      if (!conductoraId) return
      const rejectedRidesKey = `rejected_rides_${conductoraId}`
      const storedRejectedRides = await AsyncStorage.getItem(rejectedRidesKey)
      if (storedRejectedRides) {
        const rejectedArray = JSON.parse(storedRejectedRides)
        setRejectedRides(new Set(rejectedArray))
        console.log("✅ Viajes rechazados cargados desde memoria:", rejectedArray.length)
      }
    } catch (error) {
      console.error("❌ Error al cargar viajes rechazados:", error)
    }
  }

  const saveRejectedRides = async (newRejectedRides: Set<string>) => {
    try {
      if (!conductoraId) return
      const rejectedRidesKey = `rejected_rides_${conductoraId}`
      const rejectedArray = Array.from(newRejectedRides)
      await AsyncStorage.setItem(rejectedRidesKey, JSON.stringify(rejectedArray))
      console.log("✅ Viajes rechazados guardados en memoria:", rejectedArray.length)
    } catch (error) {
      console.error("❌ Error al guardar viajes rechazados:", error)
    }
  }

  const cleanupPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      isPollingActiveRef.current = false
      console.log("🛑 Polling anterior limpiado")
    }
  }

  useEffect(() => {
    const obtenerConductoraId = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        if (token) {
          const decoded = decodeJWT(token)
          if (decoded && decoded.id) {
            setConductoraId(decoded.id)
            console.log("✅ ID de conductora establecido:", decoded.id)
          } else {
            console.warn("❌ No se pudo decodificar el token.")
          }
        }
      } catch (error) {
        console.error("❌ Error al obtener ID de conductora:", error)
      }
    }
    obtenerConductoraId()
  }, [])

  useEffect(() => {
    if (conductoraId) {
      loadRejectedRides()
      loadDriverActiveStatus()
    }
  }, [conductoraId])

  useEffect(() => {
    if (!acceptedRide) return

    const intervalId = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        if (!token) {
          console.warn("⚠️ Token no disponible para verificar viaje aceptado.")
          return
        }

        const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=viaje_aceptado_conductora", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const text = await response.text()

        // Tratar respuesta vacía como cancelación
        if (!text || text.trim() === '') {
  if (canceladoMostradoRef.current) return
  canceladoMostradoRef.current = true
  clearInterval(intervalId)
  Alert.alert("Viaje cancelado", "La pasajera ha cancelado el viaje.", [{
    text: "OK", onPress: () => {
      canceladoMostradoRef.current = false
      setAcceptedRide(null)
      setRideStatus("pending")
    }
  }])
  return
}

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error("❌ Error al parsear respuesta:", parseError)
          return
        }

        // Obtener el viaje de cualquier formato de respuesta
        const viajeAceptado = data?.viaje_aceptado || data?.viaje

        // Si no hay viaje o está cancelado
        if (!viajeAceptado || viajeAceptado.estado === "cancelado" || data.success === false) {
  if (canceladoMostradoRef.current) return
  canceladoMostradoRef.current = true
  clearInterval(intervalId)
  Alert.alert("Viaje cancelado", "La pasajera ha cancelado el viaje.", [{
    text: "OK", onPress: () => {
      canceladoMostradoRef.current = false
      setAcceptedRide(null)
      setRideStatus("pending")
    }
  }])
  return
}

        // ✅ CLAVE: Mapear correctamente los datos del backend al formato RideRequest
        const mappedRide: RideRequest = {
          id: viajeAceptado.id.toString(),
          passengerName: viajeAceptado.pasajera_nombre ? viajeAceptado.pasajera_nombre.split(" ")[0] : "Pasajera",
          pickupAddress: viajeAceptado.ubicacionActual || "",
          pickupNeighborhood: viajeAceptado.barrioActual || "",
          pickupZone: viajeAceptado.zonaActual || "",
          puntoReferencia: viajeAceptado.puntoReferencia || "", // ✅ AGREGADO
          destinationAddress: viajeAceptado.destinoDireccion || "",
          destinationNeighborhood: viajeAceptado.destinoBarrio || "",
          destinationZone: viajeAceptado.destinoZona || "",
          // ✅ IMPORTANTE: Convertir string a number y manejar valores undefined
          proposedPrice: viajeAceptado.valorPersonalizado ? 
            Number(viajeAceptado.valorPersonalizado) : 0,
          counterOfferPrice: viajeAceptado.valor_contraoferta ? 
            Number(viajeAceptado.valor_contraoferta) : undefined,
          status: viajeAceptado.estado === "negociacion" ? "negotiation" : 
                  viajeAceptado.estado === "aceptado" ? "accepted" : "pending",
          passenger: {
            phone: viajeAceptado.pasajera_telefono || "N/A",
            whatsapp: viajeAceptado.pasajera_telefono || "N/A",
          }
        }

        // Verificar ID solo si el viaje anterior existe
        if (acceptedRide && mappedRide.id !== acceptedRide.id) {
          console.log("⚠️ ID de viaje diferente - limpiando estado")
          setAcceptedRide(null)
          setRideStatus("pending")
          return
        }

        console.log("✅ Viaje sigue activo - actualizando datos")
        setAcceptedRide(mappedRide)
        
        // Actualizar estado según backend
        if (viajeAceptado.estado === "aceptado") {
          setRideStatus("accepted")
        } else if (viajeAceptado.estado === "en_progreso") {
          setRideStatus("in_progress")
        }

      } catch (error) {
        console.error("❌ Error al verificar viaje aceptado:", error)
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [acceptedRide])

  const navigateTo = (screen: RelativePathString | ExternalPathString) => {
    cleanupPolling()
    router.push(screen)
  }

  const toggleDriverActive = async () => {
    const newStatus = !isDriverActive
    if (!newStatus) {
      cleanupPolling()
      setRideRequests([])
      console.log("🧹 Solicitudes limpiadas al desactivar")
    }
    setIsDriverActive(newStatus)
    await saveDriverActiveStatus(newStatus)
  }

  // ✅ FUNCIONALIDAD MEJORADA PARA WHATSAPP Y LLAMADAS
  const openWhatsApp = (whatsapp: string) => {
    // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
    const cleanNumber = whatsapp.replace(/[\s\-\(\)\+]/g, "")
    
    // Si no empieza con código de país, agregar +57 para Colombia
    const formattedNumber = cleanNumber.startsWith("57") ? cleanNumber : `57${cleanNumber}`
    
    console.log("📱 Abriendo WhatsApp:", formattedNumber)
    
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}`
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl)
        } else {
          // Si WhatsApp no está instalado, abrir en el navegador
          const webUrl = `https://wa.me/${formattedNumber}`
          return Linking.openURL(webUrl)
        }
      })
      .catch((error) => {
        console.error("❌ Error al abrir WhatsApp:", error)
        Alert.alert("Error", "No se pudo abrir WhatsApp. Verifica que esté instalado.")
      })
  }

  const callPassenger = (phone: string) => {
    // Limpiar el número de teléfono
    const cleanNumber = phone.replace(/[\s\-\(\)\+]/g, "")
    
    console.log("📞 Llamando a:", cleanNumber)
    
    const phoneUrl = `tel:${cleanNumber}`
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl)
        } else {
          Alert.alert("Error", "No se puede realizar la llamada desde este dispositivo.")
        }
      })
      .catch((error) => {
        console.error("❌ Error al realizar llamada:", error)
        Alert.alert("Error", "No se pudo realizar la llamada.")
      })
  }

  const handlePriceEdit = (requestId: string, currentPrice: number) => {
    setEditingPrice(requestId)
    setCounterOfferPrice(currentPrice.toString())
  }

  const submitCounterOffer = async (requestId: string) => {
    const newPrice = Number.parseInt(counterOfferPrice)
    if (!newPrice || newPrice <= 0) {
      Alert.alert("Error", "Por favor ingresa un precio válido.")
      return
    }

    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        Alert.alert("Error", "Token no encontrado")
        return
      }

      console.log("📤 Enviando contrapropuesta:", {
        viaje_id: requestId,
        nuevo_precio: newPrice,
      })

      const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=crear_contraoferta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          viaje_id: requestId,
          nuevo_precio: newPrice,
        }),
      })

      const data = await response.json()
      console.log("📥 Respuesta del servidor:", data)

      if (response.ok) {
        setRideRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  counterOfferPrice: newPrice,
                  status: "negotiation" as const,
                }
              : request,
          ),
        )

        Alert.alert(
          "Contrapropuesta enviada",
          `Has propuesto $${newPrice.toLocaleString("es-CO")}. La pasajera será notificada y podrá aceptar o rechazar tu propuesta.`,
        )
        console.log("✅ Contrapropuesta enviada exitosamente")
      } else {
        console.error("❌ Error del servidor:", data)
        Alert.alert("Error", data.error || "No se pudo enviar la contrapropuesta")
      }
    } catch (error) {
      console.error("❌ Error al enviar contrapropuesta:", error)
      Alert.alert("Error", "Error al conectar con el servidor.")
    }

    setEditingPrice(null)
    setCounterOfferPrice("")
  }

  const acceptRide = async (requestId: string) => {
    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        Alert.alert("Error", "Token no encontrado")
        return
      }

      const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=aceptar_viaje_directo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          viaje_id: requestId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const acceptedRideData = rideRequests.find((request) => request.id === requestId)
        if (acceptedRideData) {
          setAcceptedRide(acceptedRideData)
          setRideStatus("accepted")
          setRideRequests([])
          cleanupPolling()
          Alert.alert("¡Éxito!", "Has aceptado el viaje.")
        }
      } else {
        Alert.alert("Error", data.error || "No se pudo aceptar el viaje.")
      }
    } catch (error) {
      console.error("❌ Error al aceptar viaje:", error)
      Alert.alert("Error", "Error al conectar con el servidor.")
    }
  }

  const rejectRide = async (requestId: string) => {
    try {
      const newRejectedRides = new Set(rejectedRides)
      newRejectedRides.add(requestId)
      setRejectedRides(newRejectedRides)
      await saveRejectedRides(newRejectedRides)
      setRideRequests((prev) => prev.filter((request) => request.id !== requestId))
      console.log(`✅ Viaje ${requestId} rechazado y guardado en memoria`)
    } catch (error) {
      console.error("❌ Error al rechazar viaje:", error)
      setRideRequests((prev) => prev.filter((request) => request.id !== requestId))
    }
  }

  const completeRide = async () => {
    if (!acceptedRide) return

    Alert.alert("Finalizar viaje", "¿Has completado el viaje exitosamente?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, finalizar",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token")
            const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=finalizar_viaje", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                viaje_id: acceptedRide.id,
              }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
              setAcceptedRide(null)
              setRideStatus("pending")
              Alert.alert(
                "¡Viaje finalizado!",
                `Viaje completado exitosamente. Valor: $${data.valor_final?.toLocaleString("es-CO")}`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      console.log("✅ Viaje finalizado por conductora")
                    },
                  },
                ],
              )
            } else {
              Alert.alert("Error", data.error || "No se pudo finalizar el viaje. Inténtalo de nuevo.")
              console.error("❌ Error al finalizar viaje:", data.error)
            }
          } catch (error) {
            console.error("❌ Error de conexión al finalizar viaje:", error)
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet.")
          }
        },
      },
    ])
  }

  const cancelAcceptedRide = async () => {
    if (!acceptedRide) return

    Alert.alert("Cancelar viaje", "¿Estás segura de que quieres cancelar este viaje?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token")
            const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=cancelar_viaje", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                viaje_id: acceptedRide.id,
              }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
              setAcceptedRide(null)
              setRideStatus("pending")
              Alert.alert("Viaje cancelado", "El viaje ha sido cancelado. La pasajera será notificada.", [
                {
                  text: "OK",
                  onPress: () => {
                    console.log("✅ Viaje cancelado por conductora")
                  },
                },
              ])
            } else {
              Alert.alert("Error", data.error || "No se pudo cancelar el viaje. Inténtalo de nuevo.")
              console.error("❌ Error al cancelar viaje:", data.error)
            }
          } catch (error) {
            console.error("❌ Error de conexión al cancelar viaje:", error)
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet.")
          }
        },
      },
    ])
  }

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
      console.log("No se encontró el token.")
      return
    }

    try {
      const response = await fetch("https://www.ellasvan.com/api-rest/index.php?action=getUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentCity(data.ciudad || "")
        setCurrentZone(data.zona || "")
      } else {
        console.log("Error al cargar perfil:", data.message)
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error)
    }
  }

  

 // Función para verificar si alguna contraoferta ha sido aceptada
const checkContraofertaAceptada = async () => {
  try {
    const token = await AsyncStorage.getItem("token")
    if (!token) return

    const response = await fetch(
      "https://www.ellasvan.com/api-rest/index.php?action=viaje_aceptado_conductora", 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const text = await response.text()
    
    if (!text || text.trim() === '') {
      return
    }

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("❌ Error al parsear respuesta:", parseError)
      return
    }

    const viajeAceptado = data?.viaje_aceptado || data?.viaje
    
    if (viajeAceptado && !acceptedRide) {
      console.log("🎉 ¡Viaje encontrado! (Puede ser contraoferta aceptada)")
      
      const acceptedRideData: RideRequest = {
        id: viajeAceptado.id.toString(),
        passengerName: viajeAceptado.pasajera_nombre ? viajeAceptado.pasajera_nombre.split(" ")[0] : "Pasajera",
        pickupAddress: viajeAceptado.ubicacionActual || "",
        pickupNeighborhood: viajeAceptado.barrioActual || "",
        pickupZone: viajeAceptado.zonaActual || "",
        puntoReferencia: viajeAceptado.puntoReferencia || "", // ✅ AGREGADO
        destinationAddress: viajeAceptado.destinoDireccion || "",
        destinationNeighborhood: viajeAceptado.destinoBarrio || "",
        destinationZone: viajeAceptado.destinoZona || "",
        proposedPrice: Number(viajeAceptado.valorPersonalizado || 0),
        counterOfferPrice: viajeAceptado.valor_contraoferta ? Number(viajeAceptado.valor_contraoferta) : undefined,
        status: "accepted",
        passenger: {
          phone: viajeAceptado.pasajera_telefono || "N/A",
          whatsapp: viajeAceptado.pasajera_telefono || "N/A",
        }
      }

      setAcceptedRide(acceptedRideData)
      setRideStatus("accepted")
      setRideRequests([])
      cleanupPolling()

      const isCounterOfferAccepted = viajeAceptado.valor_contraoferta && 
        viajeAceptado.valorPersonalizado === viajeAceptado.valor_contraoferta

      if (isCounterOfferAccepted) {
        Alert.alert(
          "¡Contraoferta aceptada!",
          `La pasajera ${acceptedRideData.passengerName} ha aceptado tu propuesta de $${Number(viajeAceptado.valor_contraoferta).toLocaleString("es-CO")}`,
          [{ text: "Ver viaje" }]
        )
      } else {
        Alert.alert(
          "¡Viaje aceptado!",
          `Tienes un nuevo viaje con ${acceptedRideData.passengerName}`,
          [{ text: "Ver viaje" }]
        )
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar viaje aceptado:", error)
  }
}

// ✅ FUNCIÓN MEJORADA PARA MANEJAR CANCELACIONES EN TIEMPO REAL
const fetchPendingRides = async () => {
  if (acceptedRide) return

  // 🎯 NUEVA VERIFICACIÓN: Comprobar si alguna contraoferta fue aceptada
  await checkContraofertaAceptada()
  
  // Si después de verificar contraofertas ya tenemos un viaje aceptado, salir
  if (acceptedRide) {
    console.log("✅ Viaje aceptado encontrado, deteniendo fetch de pendientes")
    return
  }

  const now = Date.now()
  if (now - lastFetchTimestamp.current < 2000) { // Reducido a 2 segundos para mayor velocidad
    return
  }
  lastFetchTimestamp.current = now

  try {
    const token = await AsyncStorage.getItem("token")
    if (!token) {
      console.warn("⚠️ Token no disponible para viajes pendientes.")
      return
    }

    // 🔥 PASO 1: Verificar estado de viajes actuales ANTES de obtener nuevos
    const currentRideIds = rideRequests.map(ride => ride.id)
    
    if (currentRideIds.length > 0) {
      console.log("🔍 Verificando estado de viajes actuales:", currentRideIds)
      
      // Verificar cada viaje individualmente para detectar cancelaciones
      for (const rideId of currentRideIds) {
        try {
          const statusResponse = await fetch(
            `https://www.ellasvan.com/api-rest/index.php?action=verificar_estado_viaje&viaje_id=${rideId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          
          if (!statusResponse.ok) {
            console.log(`🚫 Viaje ${rideId} no encontrado - probablemente cancelado`)
            setRideRequests(prev => prev.filter(ride => ride.id !== rideId))
            continue
          }

          const statusData = await statusResponse.json()
          console.log(`📊 Estado del viaje ${rideId}:`, statusData)
          
          // Múltiples condiciones para detectar cancelación
          if (
            !statusData.success ||
            statusData.estado === "cancelado" || 
            statusData.cancelled === true ||
            statusData.status === "cancelled" ||
            statusData.message?.includes("cancelado") ||
            statusData.message?.includes("No encontrado")
          ) {
            console.log(`🚫 Viaje ${rideId} cancelado - eliminando inmediatamente`)
            setRideRequests(prev => prev.filter(ride => ride.id !== rideId))
            
            const newRejectedRides = new Set(rejectedRides)
            newRejectedRides.add(rideId)
            setRejectedRides(newRejectedRides)
            await saveRejectedRides(newRejectedRides)
          }
        } catch (statusError) {
          console.log(`🚫 Error consultando viaje ${rideId} - asumiendo cancelado:`, statusError)
          // Si hay error al consultar, asumir que está cancelado
          setRideRequests(prev => prev.filter(ride => ride.id !== rideId))
        }
      }
    }

    // 🔥 PASO 2: Obtener lista actualizada del servidor
    const currentIdsForServer = rideRequests.map((r) => r.id).join(",")
    const url = `https://www.ellasvan.com/api-rest/index.php?action=viajes_pendientes&checkStates=true&currentIds=${currentIdsForServer}&timestamp=${now}`

    console.log("📡 Consultando servidor:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log("📥 Respuesta del servidor:", data)

    if (response.ok) {
      let hasChanges = false

      // 🚫 CANCELACIONES del servidor
      const cancelledIds = data.cancelled_ids || []
      
      if (cancelledIds.length > 0) {
        console.log("🚫 Cancelaciones reportadas por servidor:", cancelledIds)
        
        const cancelledIdsString = cancelledIds.map((id: any) => id.toString())
        
        setRideRequests((prev) => {
          const filteredRides = prev.filter((ride) => !cancelledIdsString.includes(ride.id))
          if (filteredRides.length !== prev.length) {
            console.log(`🗑️ Eliminando ${prev.length - filteredRides.length} viajes cancelados por servidor`)
            hasChanges = true
          }
          return filteredRides
        })

        const newRejectedRides = new Set(rejectedRides)
        cancelledIdsString.forEach((id: string) => {
          newRejectedRides.add(id)
        })
        setRejectedRides(newRejectedRides)
        await saveRejectedRides(newRejectedRides)
      }

      // ❌ Contraofertas rechazadas
      const rejectedCounterOffers = data.rejected_counteroffers || []
      
      if (rejectedCounterOffers.length > 0) {
        console.log("❌ Contraofertas rechazadas:", rejectedCounterOffers)
        
        const rejectedCounterOffersString = rejectedCounterOffers.map((id: any) => id.toString())
        
        setRideRequests((prev) => {
          const filteredRides = prev.filter((ride) => !rejectedCounterOffersString.includes(ride.id))
          if (filteredRides.length !== prev.length) {
            console.log(`🗑️ Eliminando ${prev.length - filteredRides.length} contraofertas rechazadas`)
            hasChanges = true
          }
          return filteredRides
        })

        const newRejectedRides = new Set(rejectedRides)
        rejectedCounterOffersString.forEach((id: string) => {
          newRejectedRides.add(id)
        })
        setRejectedRides(newRejectedRides)
        await saveRejectedRides(newRejectedRides)
      }

      // ✅ Procesar nuevos viajes o actualizaciones
      if (data.viajes?.length) {
        const formattedRides: RideRequest[] = data.viajes
          .filter((viaje: any) => {
            // Filtrar viajes cancelados o inválidos
            return viaje.estado !== "cancelado" && 
                   viaje.estado !== "finalizado" && 
                   viaje.estado !== "aceptado"
          })
          .map((viaje: any) => ({
            id: viaje.id.toString(),
            passengerName: viaje.pasajero_nombre ? viaje.pasajero_nombre.split(" ")[0] : "Pasajera",
            pickupAddress: viaje.ubicacionActual || "",
            pickupNeighborhood: viaje.barrioActual || "",
            pickupZone: viaje.zonaActual || "",
            puntoReferencia: viaje.puntoReferencia || "", // ✅ AGREGADO: Punto de referencia
            destinationAddress: viaje.destinoDireccion || "",
            destinationNeighborhood: viaje.destinoBarrio || "",
            destinationZone: viaje.destinoZona || "",
            proposedPrice: Number(viaje.valorPersonalizado ?? 0),
            counterOfferPrice: viaje.valor_contraoferta
              ? Number(viaje.valor_contraoferta)
              : undefined,
            status: viaje.estado === "negociacion" ? "negotiation" : "pending",
            passenger: {
              phone: viaje.pasajero_telefono || "N/A", // ✅ AGREGADO: Teléfono real del pasajero
              whatsapp: viaje.pasajero_telefono || "N/A", // ✅ AGREGADO: WhatsApp real del pasajero
            },
          }))
          .filter((ride: RideRequest) => {
            const isRejected = rejectedRides.has(ride.id)
            if (isRejected) {
              console.log(`🚫 Viaje ${ride.id} filtrado (rechazado previamente)`)
            }
            return !isRejected
          })

        console.log("✅ Viajes válidos recibidos:", formattedRides.length)

        // Actualizar lista con validación adicional
        setRideRequests((prev) => {
          // Si no hay viajes nuevos válidos, limpiar la lista
          if (formattedRides.length === 0) {
            if (prev.length > 0) {
              console.log("🧹 No hay viajes válidos - limpiando lista")
              hasChanges = true
            }
            return []
          }

          // Combinar viajes existentes con nuevos
          const updatedList = formattedRides.reduce((accList, newRide) => {
            const existingIndex = accList.findIndex((r) => r.id === newRide.id)
            if (existingIndex !== -1) {
              // Actualizar viaje existente
              accList[existingIndex] = {
                ...accList[existingIndex],
                status: newRide.status,
                counterOfferPrice: newRide.counterOfferPrice,
              }
            } else {
              // Agregar nuevo viaje
              accList.push(newRide)
              hasChanges = true
            }
            return accList
          }, [...prev])

          if (hasChanges) {
            console.log(`🔄 Lista actualizada: ${prev.length} → ${updatedList.length}`)
          }

          return updatedList
        })
      } else {
        // Si no hay viajes en la respuesta, limpiar la lista
        setRideRequests((prev) => {
          if (prev.length > 0) {
            console.log("🧹 No hay viajes en respuesta - limpiando lista")
            return []
          }
          return prev
        })
      }

    } else {
      console.warn("⚠️ Error de servidor al consultar viajes:", data)
    }
  } catch (error) {
    console.error("❌ Error al conectar con la API:", error)
  }
}

  useEffect(() => {
    cleanupPolling()

    if (isDriverActive && !acceptedRide && conductoraId && isScreenFocused) {
      fetchPendingRides()
      isPollingActiveRef.current = true
      pollingIntervalRef.current = setInterval(() => {
        if (isPollingActiveRef.current) {
          fetchPendingRides()
        }
      }, 2000) // Reducido a 2 segundos para respuesta más rápida
      console.log("🔄 Polling iniciado con intervalo de 2 segundos")
    }

    return () => {
      cleanupPolling()
    }
  }, [isDriverActive, acceptedRide, conductoraId, isScreenFocused, rejectedRides])

  useFocusEffect(
    useCallback(() => {
      console.log("📱 Pantalla enfocada - cargando datos...")
      setIsScreenFocused(true)
      fetchUserProfile()

      return () => {
        console.log("📱 Pantalla desenfocada - limpiando polling...")
        setIsScreenFocused(false)
        cleanupPolling()
      }
    }, []),
  )

  // Render accepted ride detail view
  const renderAcceptedRideDetail = () => {
    if (!acceptedRide) return null

    return (
      <View style={styles.acceptedRideContainer}>
        <View style={styles.acceptedRideHeader}>
          <Text style={styles.acceptedRideTitle}>Viaje Aceptado</Text>
          <View style={styles.rideStatusBadge}>
            <Text style={styles.rideStatusText}>{rideStatus === "accepted" ? "Confirmado" : "En progreso"}</Text>
          </View>
        </View>

        <View style={styles.passengerDetailCard}>
          <View style={styles.passengerIconLarge}>
            <FontAwesome name="user" size={32} color="#FF69B4" />
          </View>
          <View style={styles.passengerDetailInfo}>
            <Text style={styles.passengerNameLarge}>{acceptedRide.passengerName}</Text>
            {/* ✅ BOTONES DE CONTACTO SOLO CUANDO EL VIAJE ESTÁ ACEPTADO */}
            <View style={styles.contactButtonsLarge}>
              <TouchableOpacity
                style={styles.whatsappButtonLarge}
                onPress={() => openWhatsApp(acceptedRide.passenger.whatsapp)}
              >
                <FontAwesome name="whatsapp" size={20} color="#fff" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callButtonLarge}
                onPress={() => callPassenger(acceptedRide.passenger.phone)}
              >
                <FontAwesome name="phone" size={20} color="#fff" />
                <Text style={styles.contactButtonText}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.routeDetailCard}>
          <View style={styles.routePoint}>
            <View style={styles.routePointDot} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routePointLabel}>ORIGEN</Text>
              <Text style={styles.routePointAddress}>{acceptedRide.pickupAddress}</Text>
              <Text style={styles.routePointNeighborhood}>
                {acceptedRide.pickupNeighborhood} • {acceptedRide.pickupZone}
              </Text>
              {/* ✅ MOSTRAR PUNTO DE REFERENCIA SI EXISTE */}
              {acceptedRide.puntoReferencia && (
                <Text style={styles.routePointReference}>
                  📍 {acceptedRide.puntoReferencia}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routePointDot, styles.destinationDotLarge]} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routePointLabel}>DESTINO</Text>
              <Text style={styles.routePointAddress}>{acceptedRide.destinationAddress}</Text>
              <Text style={styles.routePointNeighborhood}>
                {acceptedRide.destinationNeighborhood} • {acceptedRide.destinationZone}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceDetailCard}>
          <Text style={styles.priceDetailLabel}>Precio acordado</Text>
          <Text style={styles.priceDetailAmount}>${acceptedRide.proposedPrice.toLocaleString("es-CO")} </Text>
        </View>

        <View style={styles.rideActionButtons}>
          <TouchableOpacity style={styles.cancelRideButton} onPress={cancelAcceptedRide}>
            <FontAwesome name="times" size={16} color="#FF5722" />
            <Text style={styles.cancelRideButtonText}>Cancelar viaje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeRideButton} onPress={completeRide}>
            <FontAwesome name="check" size={16} color="#fff" />
            <Text style={styles.completeRideButtonText}>Finalizar viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderRideRequest = ({ item }: { item: RideRequest }) => {
    // ✅ VALIDACIÓN: Asegurar que los precios existen
    const proposedPrice = item.proposedPrice || 0
    const counterOfferPrice = item.counterOfferPrice

    return (
      <View style={styles.rideRequestCard}>
        {/* ✅ HEADER SIN BOTONES DE CONTACTO */}
        <View style={styles.requestHeader}>
          <View style={styles.passengerInfo}>
            <View style={styles.passengerIcon}>
              <FontAwesome name="user" size={14} color="#666" />
            </View>
            <Text style={styles.passengerName}>
              {item.passengerName || "Pasajera"}
            </Text>
            {/* Indicador de negociación */}
            {item.status === "negotiation" && (
              <View style={styles.negotiationBadge}>
                <Text style={styles.negotiationBadgeText}>En negociación</Text>
              </View>
            )}
          </View>
          {/* ✅ ELIMINADOS: Los botones de WhatsApp y teléfono */}
        </View>

        {/* Ubicaciones en layout horizontal */}
        <View style={styles.locationsContainer}>
          <View style={styles.locationsRow}>
            <View style={styles.locationCompact}>
              <View style={styles.locationDot} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>ORIGEN</Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {item.pickupAddress || "Dirección no disponible"}
                </Text>
                <Text style={styles.locationNeighborhood}>
                  {item.pickupNeighborhood} • {item.pickupZone}
                </Text>
                {/* ✅ PUNTO DE REFERENCIA EN SOLICITUDES PENDIENTES */}
                {item.puntoReferencia && (
                  <Text style={styles.referencePoint}>
    <Text style={styles.referenceLabel}>Punto referencia:</Text> {item.puntoReferencia}
  </Text>
                )}
              </View>
            </View>
            <View style={styles.locationArrow}>
              <FontAwesome name="arrow-right" size={12} color="#ccc" />
            </View>
            <View style={styles.locationCompact}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel2}>DESTINO</Text>
                <Text
  style={[styles.locationAddress, { flexShrink: 1, flexWrap: "wrap" }]}
>
  {item.destinationAddress || "Destino no disponible"}
</Text>


                <Text style={styles.locationNeighborhood}>
                  {item.destinationNeighborhood} • {item.destinationZone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info del viaje con precios */}
        <View style={styles.priceMainContainer}>
          <View style={styles.priceLeftSection}>
            {item.status === "negotiation" && counterOfferPrice ? (
              <View style={styles.priceNegotiationContainer}>
                <Text style={styles.originalPrice}>
                  ${proposedPrice.toLocaleString("es-CO")}
                </Text>
                <Text style={styles.counterOfferPrice}>
                  → ${counterOfferPrice.toLocaleString("es-CO")}
                </Text>
              </View>
            ) : (
              <Text style={styles.priceAmount}>
                ${proposedPrice.toLocaleString("es-CO")}
              </Text>
            )}
          </View>
          
          {/* Botón de negociación o campos de edición */}
          {item.status === "negotiation" ? (
            <View style={styles.waitingResponse}>
              <FontAwesome name="clock-o" size={12} color="#FF9500" />
              <Text style={styles.waitingResponseText}>Esperando respuesta</Text>
            </View>
          ) : editingPrice === item.id ? (
            <View style={styles.priceEditContainer}>
              <TextInput
                style={styles.priceInput}
                //no arreglar hasta ver otra manera de que funcione completamente, el error no interfiere en nada
                value={counterOfferPrice}
                onChangeText={setCounterOfferPrice}
                keyboardType="numeric"
                placeholder="Precio"
                autoFocus
              />
              <TouchableOpacity 
                style={styles.submitPriceButton} 
                onPress={() => submitCounterOffer(item.id)}
              >
                <FontAwesome name="check" size={12} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelPriceButton} 
                onPress={() => setEditingPrice(null)}
              >
                <FontAwesome name="times" size={12} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.negotiateButton} 
              onPress={() => handlePriceEdit(item.id, proposedPrice)}
            >
              <FontAwesome name="edit" size={12} color="#FF69B4" />
              <Text style={styles.negotiateButtonText}>Negociar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => rejectRide(item.id)}
          >
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.acceptButton, 
              (item.status === "negotiation" || editingPrice === item.id) && styles.acceptButtonDisabled
            ]}
            onPress={() => acceptRide(item.id)}
            disabled={item.status === "negotiation" || editingPrice === item.id}
          >
            <Text style={[
              styles.acceptButtonText, 
              (item.status === "negotiation" || editingPrice === item.id) && styles.acceptButtonTextDisabled
            ]}>
              {item.status === "negotiation" ? "En negociación" : 
               editingPrice === item.id ? "Negociando precio" : "Aceptar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo("./ProfileD")}>
          <View style={styles.profileIconSmall}>
            <FontAwesome name="user" size={19} color="#FF69B4" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{acceptedRide ? "Viaje en curso" : "Solicitudes de viaje"}</Text>
          <Text style={styles.headerSubtitle}>
            {currentCity} - {currentZone}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: acceptedRide ? "#FF9500" : isDriverActive ? "#4CAF50" : "#FF5722",
              },
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.requestsList}>
        {acceptedRide ? (
          renderAcceptedRideDetail()
        ) : isDriverActive ? (
          rideRequests.length > 0 ? (
            <FlatList
              data={rideRequests}
              renderItem={renderRideRequest}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={3}
            />
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="car" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay solicitudes disponibles</Text>
              <Text style={styles.emptyStateSubtext}>Mantente activa para recibir nuevas solicitudes</Text>
            </View>
          )
        ) : (
          <View style={styles.inactiveState}>
            <FontAwesome name="pause-circle" size={40} color="#ccc" />
            <Text style={styles.inactiveStateText}>Estás desconectada</Text>
            <Text style={styles.inactiveStateSubtext}>Activa tu disponibilidad para recibir solicitudes</Text>
          </View>
        )}
      </View>

      {/* Footer with controls - only show if no accepted ride */}
      {!acceptedRide && (
        <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.footer}>
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
            <TouchableOpacity style={styles.updateLocationButton} onPress={() => navigateTo("./EditProfileD")}>
              <FontAwesome name="map-marker" size={14} color="#FF69B4" />
              <Text style={styles.updateLocationText}>Actualizar ciudad y zona de trabajo</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
    </LinearGradient>
  )
}

export default HomeDriver