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

  const openWhatsApp = (whatsapp: string) => {
    Linking.openURL(`whatsapp://send?phone=${whatsapp}`).catch(() => Alert.alert("Error", "No se pudo abrir WhatsApp."))
  }

  const callPassenger = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`)
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

      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=crear_contraoferta", {
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
          `Has propuesto $${newPrice.toLocaleString()} COP. La pasajera será notificada y podrá aceptar o rechazar tu propuesta.`,
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

      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=aceptar_viaje_directo", {
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
      Alert.alert("Viaje rechazado", "Esta solicitud no volverá a aparecer para ti.")
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
            const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=finalizar_viaje", {
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
                `Viaje completado exitosamente. Valor: $${data.valor_final?.toLocaleString()} COP`,
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
            const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_viaje", {
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
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=getUser", {
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

  // ✅ MEJORADA: Función de fetch con manejo de contraofertas rechazadas
  const fetchPendingRides = async () => {
    if (acceptedRide) return

    const now = Date.now()
    if (now - lastFetchTimestamp.current < 2500) {
      return
    }
    lastFetchTimestamp.current = now

    try {
      const currentIds = rideRequests.map((r) => r.id).join(",")
      const lastId = rideRequests[0]?.id || 0
      let url = `https://www.pinkdrivers.com/api-rest/index.php?action=viajes_pendientes&lastId=${lastId}`

      if (currentIds) {
        url += `&currentIds=${currentIds}&checkStates=true`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        // Procesar viajes cancelados
        if (data.cancelled_ids && data.cancelled_ids.length > 0) {
          console.log("🚫 Viajes cancelados detectados:", data.cancelled_ids)
          setRideRequests((prev) => prev.filter((ride) => !data.cancelled_ids.includes(Number.parseInt(ride.id))))
          if (data.cancelled_ids.length === 1) {
            console.log("ℹ️ Un viaje fue cancelado por el pasajero")
          } else {
            console.log(`ℹ️ ${data.cancelled_ids.length} viajes fueron cancelados por los pasajeros`)
          }
        }

        // ✅ NUEVO: Procesar contraofertas rechazadas
        if (data.rejected_counteroffers && data.rejected_counteroffers.length > 0) {
          console.log("❌ Contraofertas rechazadas detectadas:", data.rejected_counteroffers)
          setRideRequests((prev) =>
            prev.filter((ride) => !data.rejected_counteroffers.includes(Number.parseInt(ride.id))),
          )

          // Agregar a la lista de rechazados para que no vuelvan a aparecer
          const newRejectedRides = new Set(rejectedRides)
          data.rejected_counteroffers.forEach((id: number) => {
            newRejectedRides.add(id.toString())
          })
          setRejectedRides(newRejectedRides)
          await saveRejectedRides(newRejectedRides)

          if (data.rejected_counteroffers.length === 1) {
            console.log("ℹ️ Una contraoferta fue rechazada por el pasajero")
          } else {
            console.log(`ℹ️ ${data.rejected_counteroffers.length} contraofertas fueron rechazadas por los pasajeros`)
          }
        }

        // Agregar nuevos viajes con estado
        if (data.viajes?.length) {
          const formattedRides: RideRequest[] = data.viajes
            .map((viaje: any) => ({
              id: viaje.id.toString(),
              passengerName: viaje.pasajero_nombre.split(" ")[0],
              pickupAddress: viaje.ubicacionActual,
              pickupNeighborhood: viaje.barrioActual,
              pickupZone: viaje.zonaActual,
              destinationAddress: viaje.destinoDireccion,
              destinationNeighborhood: viaje.destinoBarrio,
              destinationZone: viaje.destinoZona,
              proposedPrice: Number(viaje.valorPersonalizado ?? 0),
              counterOfferPrice: viaje.valor_contraoferta ? Number(viaje.valor_contraoferta) : undefined,
              status: viaje.estado === "negociacion" ? ("negotiation" as const) : ("pending" as const),
              passenger: {
                phone: "N/A",
                whatsapp: "N/A",
              },
            }))
            .filter((ride: RideRequest) => {
              const isRejected = rejectedRides.has(ride.id)
              if (isRejected) {
                console.log(`🚫 Viaje ${ride.id} filtrado (rechazado previamente)`)
              }
              return !isRejected
            })

          setRideRequests((prev) => {
            return formattedRides.reduce(
              (updatedList, newRide) => {
                const existingIndex = updatedList.findIndex((r) => r.id === newRide.id)
                if (existingIndex !== -1) {
                  // Si ya existe pero su estado cambió
                  updatedList[existingIndex] = {
                    ...updatedList[existingIndex],
                    status: newRide.status,
                    counterOfferPrice: newRide.counterOfferPrice,
                  }
                } else {
                  updatedList.push(newRide)
                }
                return updatedList
              },
              [...prev],
            )
          })
        }
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
      }, 3000)
      console.log("🔄 Polling iniciado")
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
          <Text style={styles.priceDetailAmount}>${acceptedRide.proposedPrice.toLocaleString()} COP</Text>
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

  const renderRideRequest = ({ item }: { item: RideRequest }) => (
    <View style={styles.rideRequestCard}>
      {/* Header compacto con indicador de estado */}
      <View style={styles.requestHeader}>
        <View style={styles.passengerInfo}>
          <View style={styles.passengerIcon}>
            <FontAwesome name="user" size={14} color="#666" />
          </View>
          <Text style={styles.passengerName}>{item.passengerName}</Text>
          {/* Indicador de negociación */}
          {item.status === "negotiation" && (
            <View style={styles.negotiationBadge}>
              <Text style={styles.negotiationBadgeText}>En negociación</Text>
            </View>
          )}
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.whatsappButton} onPress={() => openWhatsApp(item.passenger.whatsapp)}>
            <FontAwesome name="whatsapp" size={16} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={() => callPassenger(item.passenger.phone)}>
            <FontAwesome name="phone" size={16} color="#FF69B4" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ubicaciones en layout horizontal */}
      <View style={styles.locationsContainer}>
        <View style={styles.locationsRow}>
          <View style={styles.locationCompact}>
            <View style={styles.locationDot} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>ORIGEN</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {item.pickupAddress}
              </Text>
              <Text style={styles.locationNeighborhood}>
                {item.pickupNeighborhood} • {item.pickupZone}
              </Text>
            </View>
          </View>
          <View style={styles.locationArrow}>
            <FontAwesome name="arrow-right" size={12} color="#ccc" />
          </View>
          <View style={styles.locationCompact}>
            <View style={[styles.locationDot, styles.destinationDot]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>DESTINO</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {item.destinationAddress}
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
          {item.status === "negotiation" && item.counterOfferPrice ? (
            <View style={styles.priceNegotiationContainer}>
              <Text style={styles.originalPrice}>${item.proposedPrice.toLocaleString()}</Text>
              <Text style={styles.counterOfferPrice}>→ ${item.counterOfferPrice.toLocaleString()}</Text>
            </View>
          ) : (
            <Text style={styles.priceAmount}>${item.proposedPrice.toLocaleString()}</Text>
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
              value={counterOfferPrice}
              onChangeText={setCounterOfferPrice}
              keyboardType="numeric"
              placeholder="Precio"
              autoFocus
            />
            <TouchableOpacity style={styles.submitPriceButton} onPress={() => submitCounterOffer(item.id)}>
              <FontAwesome name="check" size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelPriceButton} onPress={() => setEditingPrice(null)}>
              <FontAwesome name="times" size={12} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.negotiateButton} onPress={() => handlePriceEdit(item.id, item.proposedPrice)}>
            <FontAwesome name="edit" size={12} color="#FF69B4" />
            <Text style={styles.negotiateButtonText}>Negociar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => rejectRide(item.id)}>
          <Text style={styles.rejectButtonText}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptButton, item.status === "negotiation" && styles.acceptButtonDisabled]}
          onPress={() => acceptRide(item.id)}
          disabled={item.status === "negotiation"}
        >
          <Text style={[styles.acceptButtonText, item.status === "negotiation" && styles.acceptButtonTextDisabled]}>
            {item.status === "negotiation" ? "En negociación" : "Aceptar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <LinearGradient colors={["#FFE4F3", "#FFC1E3"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFE4F3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo("./ProfileD")}>
          <View style={styles.profileIconSmall}>
            <FontAwesome name="user" size={18} color="#FF69B4" />
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

