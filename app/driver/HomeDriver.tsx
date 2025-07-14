"use client"

import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { type ExternalPathString, type RelativePathString, router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import {
  Alert,
  FlatList,
  Image,
  Linking,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
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
  passenger: {
    phone: string
    whatsapp: string
    photo: string
  }
}

const HomeDriver = () => {
  const [isDriverActive, setIsDriverActive] = useState(false)
  const [currentCity, setCurrentCity] = useState("Cali")
  const [currentZone, setCurrentZone] = useState("Norte")
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [counterOfferPrice, setCounterOfferPrice] = useState("")

  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])


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

  const submitCounterOffer = (requestId: string) => {
    const newPrice = Number.parseInt(counterOfferPrice)
    if (newPrice && newPrice > 0) {
      setRideRequests((prev) =>
        prev.map((request) => (request.id === requestId ? { ...request, proposedPrice: newPrice } : request)),
      )
      Alert.alert("Contrapropuesta enviada", `Has propuesto $${newPrice.toLocaleString()} COP`)
    }
    setEditingPrice(null)
    setCounterOfferPrice("")
  }

  const acceptRide = (requestId: string) => {
    Alert.alert("Viaje aceptado", "Has aceptado la solicitud de viaje")
    setRideRequests((prev) => prev.filter((request) => request.id !== requestId))
  }

  const rejectRide = (requestId: string) => {
    setRideRequests((prev) => prev.filter((request) => request.id !== requestId))
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

  const fetchPendingRides = async () => {
  try {
    const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=viajes_pendientes")
    const data = await response.json()

    if (response.ok && data.viajes) {
      // Mapeamos los datos del backend al formato esperado en tu interfaz
      const formattedRides: RideRequest[] = data.viajes.map((viaje: any) => ({
        id: viaje.id.toString(),
        passengerName: "Pasajera", // Aquí puedes ajustar si luego tienes nombres
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
          photo: "https://i.pravatar.cc/150?img=47", // puedes cambiar esto por un campo real
        }
      }))
      setRideRequests(formattedRides)
    } else {
      console.error("❌ Error de respuesta de la API:", data)
    }
  } catch (error) {
    console.error("❌ Error al conectar con la API:", error)
  }
}


  useFocusEffect(
  useCallback(() => {
    fetchUserProfile()
    fetchPendingRides()
  }, [])
)


  const renderRideRequest = ({ item }: { item: RideRequest }) => (
    <View style={styles.rideRequestCard}>
      {/* Header compacto */}
      <View style={styles.requestHeader}>
        <View style={styles.passengerInfo}>
          <Image source={{ uri: item.passenger.photo }} style={styles.passengerAvatar} />
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
    <Text style={styles.priceAmount}>
      ${item.proposedPrice.toLocaleString()}
    </Text>
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
      onPress={() => handlePriceEdit(item.id, item.proposedPrice)}
    >
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
          <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.avatarSmall} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Solicitudes de viaje</Text>
          <Text style={styles.headerSubtitle}>
            {currentCity} - {currentZone}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isDriverActive ? "#4CAF50" : "#FF5722" }]} />
        </View>
      </View>

      {/* Lista de solicitudes */}
      <View style={styles.requestsList}>
        {isDriverActive ? (
          rideRequests.length > 0 ? (
            <FlatList
              data={rideRequests}
              renderItem={renderRideRequest}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              // Optimizaciones para mejor rendimiento
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

      {/* Footer con controles */}
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
          <TouchableOpacity   
            style={styles.updateLocationButton}   
            onPress={() => navigateTo("./EditProfileD")}
          >  
            <FontAwesome name="map-marker" size={14} color="#FF69B4" />  
            <Text style={styles.updateLocationText}>Actualizar ciudad y zona de trabajo</Text>
          </TouchableOpacity> 
        </View>
      </LinearGradient>
    </LinearGradient>
  )
}

export default HomeDriver