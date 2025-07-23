"use client"

import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { router, useFocusEffect, type ExternalPathString, type RelativePathString } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, FlatList, Linking, StatusBar, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import styles from "../styles/HomeDriverPstyles"
// __DEV__ is available globally in React Native

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

  // Estado para almacenar los viajes rechazados en memoria
  const [rejectedRides, setRejectedRides] = useState<Set<string>>(new Set())

  // New state for accepted ride
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null)
  const [rideStatus, setRideStatus] = useState<"pending" | "accepted" | "in_progress" | "completed">("pending")

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

  // Función para cargar los viajes rechazados desde AsyncStorage
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

  // Función para guardar los viajes rechazados en AsyncStorage
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

  useEffect(() => {
    const obtenerConductoraId = async () => {
      const token = await AsyncStorage.getItem("token")
      if (token) {
        const decoded = decodeJWT(token)
        if (decoded && decoded.id) {
          setConductoraId(decoded.id)
          console.log("✅ ID de conductora:", decoded.id)
        } else {
          console.warn("❌ No se pudo decodificar el token.")
        }
      }
    }

    obtenerConductoraId()
  }, [])

  // Cargar viajes rechazados cuando se obtiene el ID de la conductora
  useEffect(() => {
    if (conductoraId) {
      loadRejectedRides()
    }
  }, [conductoraId])

  const navigateTo = (screen: RelativePathString | ExternalPathString) => {
    router.push(screen)
  }

  const toggleDriverActive = () => setIsDriverActive(!isDriverActive)

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
    if (newPrice && newPrice > 0) {
      try {
        const token = await AsyncStorage.getItem("token")

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
        if (response.ok) {
          setRideRequests((prev) =>
            prev.map((request) => (request.id === requestId ? { ...request, proposedPrice: newPrice } : request)),
          )
          Alert.alert("Contrapropuesta enviada", `Has propuesto $${newPrice.toLocaleString()} COP`)
        } else {
          Alert.alert("Error", data.error || "No se pudo actualizar el precio")
        }
      } catch (error) {
        console.error("❌ Error al enviar contrapropuesta:", error)
        Alert.alert("Error", "Error al conectar con el servidor.")
      }
    } else {
      Alert.alert("Error", "Faltan datos para enviar la contrapropuesta.")
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
        // Find the accepted ride and set it as the active ride
        const acceptedRideData = rideRequests.find((request) => request.id === requestId)
        if (acceptedRideData) {
          setAcceptedRide(acceptedRideData)
          setRideStatus("accepted")
          setRideRequests([]) // Clear all other requests
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
      // Agregar el viaje a la lista de rechazados en memoria
      const newRejectedRides = new Set(rejectedRides)
      newRejectedRides.add(requestId)
      setRejectedRides(newRejectedRides)

      // Guardar en AsyncStorage
      await saveRejectedRides(newRejectedRides)

      // Remover de la lista actual
      setRideRequests((prev) => prev.filter((request) => request.id !== requestId))

      console.log(`✅ Viaje ${requestId} rechazado y guardado en memoria`)

      // Opcional: Mostrar una confirmación
      Alert.alert("Viaje rechazado", "Esta solicitud no volverá a aparecer para ti.")
    } catch (error) {
      console.error("❌ Error al rechazar viaje:", error)
      // Aún así remover de la lista actual para que no se quede colgado
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
              // Limpiar el estado del viaje aceptado
              setAcceptedRide(null)
              setRideStatus("pending")
              setIsDriverActive(true) // Reactivar para nuevas solicitudes

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
              // Limpiar el estado del viaje aceptado
              setAcceptedRide(null)
              setRideStatus("pending")
              setIsDriverActive(true) // Reactivar para nuevas solicitudes

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

  // ✅ FUNCIÓN MEJORADA: Detecta automáticamente viajes cancelados
  const fetchPendingRides = async () => {
    // Don't fetch new rides if driver has an accepted ride
    if (acceptedRide) return

    try {
      // Obtener IDs actuales para verificar cancelaciones
      const currentIds = rideRequests.map((r) => r.id).join(",")
      const lastId = rideRequests[0]?.id || 0

      // Construir URL con parámetros para verificar estados
      let url = `https://www.pinkdrivers.com/api-rest/index.php?action=viajes_pendientes&lastId=${lastId}`

      if (currentIds) {
        url += `&currentIds=${currentIds}&checkStates=true`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        // ✅ PASO 1: Procesar viajes cancelados
        if (data.cancelled_ids && data.cancelled_ids.length > 0) {
          console.log("🚫 Viajes cancelados detectados:", data.cancelled_ids)

          // Remover viajes cancelados de la lista
          setRideRequests((prev) => prev.filter((ride) => !data.cancelled_ids.includes(Number.parseInt(ride.id))))

          // Mostrar notificación opcional
          if (data.cancelled_ids.length === 1) {
            console.log("ℹ️ Un viaje fue cancelado por el pasajero")
          } else {
            console.log(`ℹ️ ${data.cancelled_ids.length} viajes fueron cancelados por los pasajeros`)
          }
        }

        // ✅ PASO 2: Agregar nuevos viajes (si los hay)
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
              passenger: {
                phone: "N/A",
                whatsapp: "N/A",
              },
            }))
            // Filtrar los viajes que ya fueron rechazados por esta conductora
            .filter((ride: RideRequest) => !rejectedRides.has(ride.id))

          // Solo agregar viajes nuevos que no estén ya en la lista y no hayan sido rechazados
          const existingIds = new Set(rideRequests.map((r) => r.id))
          const newRides = formattedRides.filter((ride: RideRequest) => !existingIds.has(ride.id))

          if (newRides.length > 0) {
            setRideRequests((prev) => [...newRides, ...prev])
            console.log(
              `✅ ${newRides.length} nuevas solicitudes agregadas (${rejectedRides.size} rechazadas filtradas)`,
            )
          }
        }
      }
    } catch (error) {
      console.error("❌ Error al conectar con la API:", error)
    }
  }

  // ✅ POLLING MEJORADO: Verifica cancelaciones más frecuentemente
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (isDriverActive && !acceptedRide) {
      // Verificar inmediatamente
      fetchPendingRides()

      // Polling cada 3 segundos para detectar cancelaciones rápidamente
      interval = setInterval(() => {
        fetchPendingRides()
      }, 3000)

      console.log("🔄 Polling iniciado para detectar cancelaciones")
    }

    return () => {
      if (interval) {
        clearInterval(interval)
        console.log("🛑 Polling detenido")
      }
    }
  }, [isDriverActive, acceptedRide, rideRequests, rejectedRides])

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile()
      if (!acceptedRide && isDriverActive) {
        fetchPendingRides()
      }
    }, [acceptedRide, rejectedRides, isDriverActive]),
  )

  // Función para limpiar viajes rechazados (opcional, para desarrollo/testing)
  const clearRejectedRides = async () => {
    try {
      if (!conductoraId) return

      const rejectedRidesKey = `rejected_rides_${conductoraId}`
      await AsyncStorage.removeItem(rejectedRidesKey)
      setRejectedRides(new Set())
      console.log("✅ Lista de viajes rechazados limpiada")
      Alert.alert("Lista limpiada", "Los viajes rechazados han sido limpiados de la memoria.")
    } catch (error) {
      console.error("❌ Error al limpiar viajes rechazados:", error)
    }
  }

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
      {/* Header compacto */}
      <View style={styles.requestHeader}>
        <View style={styles.passengerInfo}>
          <View style={styles.passengerIcon}>
            <FontAwesome name="user" size={14} color="#666" />
          </View>
          <Text style={styles.passengerName}>{item.passengerName}</Text>
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
          {/* Origen */}
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

          {/* Flecha */}
          <View style={styles.locationArrow}>
            <FontAwesome name="arrow-right" size={12} color="#ccc" />
          </View>

          {/* Destino */}
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

      {/* Info del viaje y precio en una línea */}
      <View style={styles.priceMainContainer}>
        <View style={styles.priceLeftSection}>
          <Text style={styles.priceAmount}>${item.proposedPrice.toLocaleString()}</Text>
        </View>

        {/* Botón de negociación o campos de edición */}
        {editingPrice === item.id ? (
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
        <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRide(item.id)}>
          <Text style={styles.acceptButtonText}>Aceptar</Text>
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
            {rejectedRides.size > 0 && ` • ${rejectedRides.size} rechazados`}
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
              <Text style={styles.emptyStateSubtext}>
                Mantente activa para recibir nuevas solicitudes
                {rejectedRides.size > 0 && `\n(${rejectedRides.size} solicitudes rechazadas ocultadas)`}
              </Text>
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
            {/* Switch de disponibilidad */}
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

            {/* Botón para actualizar ciudad y zona */}
            <TouchableOpacity style={styles.updateLocationButton} onPress={() => navigateTo("./EditProfileD")}>
              <FontAwesome name="map-marker" size={14} color="#FF69B4" />
              <Text style={styles.updateLocationText}>Actualizar ciudad y zona de trabajo</Text>
            </TouchableOpacity>

            {/* Botón para limpiar viajes rechazados (solo para desarrollo/testing) */}
            {__DEV__ && rejectedRides.size > 0 && (
              <TouchableOpacity style={styles.clearRejectedButton} onPress={clearRejectedRides}>
                <FontAwesome name="refresh" size={14} color="#FF6B6B" />
                <Text style={styles.clearRejectedText}>Limpiar rechazados ({rejectedRides.size})</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      )}
    </LinearGradient>
  )
}

export default HomeDriver
