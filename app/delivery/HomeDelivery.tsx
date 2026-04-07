"use client"
import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { router, useFocusEffect, type ExternalPathString, type RelativePathString } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import styles from "../styles/Homedeliverystyles"

interface DeliveryRequest {
  id: string
  clientName: string
  pickupAddress: string
  pickupNeighborhood: string
  pickupZone: string
  deliveryAddress: string
  deliveryNeighborhood: string
  deliveryZone: string
  puntoReferencia?: string
  isFragile: boolean
  proposedPrice: number
  counterOfferPrice?: number
  status: "pending" | "negotiation" | "accepted"
  client: {
    phone: string
    whatsapp: string
  }
}

const HomeDelivery = () => {
  const [isDeliveryActive, setIsDeliveryActive] = useState(false)
  const [currentCity, setCurrentCity] = useState("Cali")
  const [currentZone, setCurrentZone] = useState("Norte")
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [counterOfferPrice, setCounterOfferPrice] = useState("")
  const [domiciliarioId, setDomiciliarioId] = useState<number | null>(null)
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([])
  const [rejectedDeliveries, setRejectedDeliveries] = useState<Set<string>>(new Set())
  const [acceptedDelivery, setAcceptedDelivery] = useState<DeliveryRequest | null>(null)
  const [deliveryStatus, setDeliveryStatus] = useState<"pending" | "accepted" | "in_progress" | "completed">("pending")
  const [isScreenFocused, setIsScreenFocused] = useState(true)

  // ── Estados modal foto ─────────────────────────────────────────────────────
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPollingActiveRef = useRef(false)
  const lastFetchTimestamp = useRef<number>(0)

  // ─── JWT sin librería base-64 (compatible con Hermes/Android) ─────────────
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
      const jsonPayload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"))
      return jsonPayload
    } catch (error) {
      console.error("Error decodificando JWT:", error)
      return null
    }
  }

  // ─── ASYNC STORAGE ─────────────────────────────────────────────────────────
  const loadDeliveryActiveStatus = async () => {
    try {
      if (!domiciliarioId) return false
      const key = `delivery_active_${domiciliarioId}`
      const storedStatus = await AsyncStorage.getItem(key)
      if (storedStatus !== null) {
        const isActive = JSON.parse(storedStatus)
        setIsDeliveryActive(isActive)
        return isActive
      } else {
        setIsDeliveryActive(false)
        return false
      }
    } catch (error) {
      console.error("❌ Error al cargar estado:", error)
      setIsDeliveryActive(false)
      return false
    }
  }

  const saveDeliveryActiveStatus = async (status: boolean) => {
    try {
      if (!domiciliarioId) return
      const key = `delivery_active_${domiciliarioId}`
      await AsyncStorage.setItem(key, JSON.stringify(status))
    } catch (error) {
      console.error("❌ Error al guardar estado:", error)
    }
  }

  const loadRejectedDeliveries = async () => {
    try {
      if (!domiciliarioId) return
      const key = `rejected_deliveries_${domiciliarioId}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) {
        setRejectedDeliveries(new Set(JSON.parse(stored)))
      }
    } catch (error) {
      console.error("❌ Error al cargar rechazados:", error)
    }
  }

  const saveRejectedDeliveries = async (newRejected: Set<string>) => {
    try {
      if (!domiciliarioId) return
      const key = `rejected_deliveries_${domiciliarioId}`
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(newRejected)))
    } catch (error) {
      console.error("❌ Error al guardar rechazados:", error)
    }
  }

  // ─── POLLING ───────────────────────────────────────────────────────────────
  const cleanupPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      isPollingActiveRef.current = false
    }
  }

  // ─── EFFECTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const obtenerDomiciliarioId = async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        if (token) {
          const decoded = decodeJWT(token)
          if (decoded && decoded.id) {
            setDomiciliarioId(decoded.id)
          }
        }
      } catch (error) {
        console.error("❌ Error al obtener ID de domiciliario:", error)
      }
    }
    obtenerDomiciliarioId()
  }, [])

  useEffect(() => {
    if (domiciliarioId) {
      loadRejectedDeliveries()
      loadDeliveryActiveStatus()
    }
  }, [domiciliarioId])

  // Verificar estado del pedido aceptado cada 5 segundos
  useEffect(() => {
    if (!acceptedDelivery) return

    const intervalId = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem("token")
        if (!token) return

        const response = await fetch(
          "https://www.pinkdrivers.com/api-rest/index.php?action=entrega_aceptada_domiciliario",
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const text = await response.text()
        if (!text || text.trim() === "") {
          Alert.alert("Pedido cancelado", "El cliente ha cancelado el pedido.")
          setAcceptedDelivery(null)
          setDeliveryStatus("pending")
          return
        }

        let data
        try { data = JSON.parse(text) } catch { return }

        const pedidoAceptado = data?.pedido_aceptado || data?.pedido

        if (!pedidoAceptado || pedidoAceptado.estado === "cancelado" || data.success === false) {
          Alert.alert("Pedido cancelado", "El cliente ha cancelado el pedido.")
          setAcceptedDelivery(null)
          setDeliveryStatus("pending")
          return
        }

        const mapped: DeliveryRequest = {
          id: pedidoAceptado.id.toString(),
          clientName: pedidoAceptado.cliente_nombre ? pedidoAceptado.cliente_nombre.split(" ")[0] : "Cliente",
          pickupAddress: pedidoAceptado.ubicacionRecogida || "",
          pickupNeighborhood: pedidoAceptado.barrioRecogida || "",
          pickupZone: pedidoAceptado.zonaRecogida || "",
          puntoReferencia: pedidoAceptado.puntoReferencia || "",
          deliveryAddress: pedidoAceptado.ubicacionEntrega || "",
          deliveryNeighborhood: pedidoAceptado.barrioEntrega || "",
          deliveryZone: pedidoAceptado.zonaEntrega || "",
          isFragile: pedidoAceptado.es_fragil === 1 || pedidoAceptado.es_fragil === "1" || pedidoAceptado.es_fragil === true,
          proposedPrice: pedidoAceptado.valorPersonalizado ? Number(pedidoAceptado.valorPersonalizado) : 0,
          counterOfferPrice: pedidoAceptado.valor_contraoferta ? Number(pedidoAceptado.valor_contraoferta) : undefined,
          status: pedidoAceptado.estado === "negociacion" ? "negotiation" :
                  pedidoAceptado.estado === "aceptado" ? "accepted" : "pending",
          client: {
            phone: pedidoAceptado.cliente_telefono || "N/A",
            whatsapp: pedidoAceptado.cliente_telefono || "N/A",
          },
        }

        if (acceptedDelivery && mapped.id !== acceptedDelivery.id) {
          setAcceptedDelivery(null)
          setDeliveryStatus("pending")
          return
        }

        setAcceptedDelivery(mapped)
        if (pedidoAceptado.estado === "aceptado") setDeliveryStatus("accepted")
        else if (pedidoAceptado.estado === "en_progreso") setDeliveryStatus("in_progress")
      } catch (error) {
        console.error("❌ Error al verificar pedido aceptado:", error)
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [acceptedDelivery])

  // ─── NAVEGACIÓN ────────────────────────────────────────────────────────────
  const navigateTo = (screen: RelativePathString | ExternalPathString) => {
    cleanupPolling()
    router.push(screen)
  }

  // ─── TOGGLE ACTIVO ─────────────────────────────────────────────────────────
  const toggleDeliveryActive = async () => {
    const newStatus = !isDeliveryActive
    if (!newStatus) {
      cleanupPolling()
      setDeliveryRequests([])
    }
    setIsDeliveryActive(newStatus)
    await saveDeliveryActiveStatus(newStatus)
  }

  // ─── CONTACTO ──────────────────────────────────────────────────────────────
  const openWhatsApp = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/[\s\-\(\)\+]/g, "")
    const formattedNumber = cleanNumber.startsWith("57") ? cleanNumber : `57${cleanNumber}`
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}`
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(whatsappUrl)
        return Linking.openURL(`https://wa.me/${formattedNumber}`)
      })
      .catch(() => Alert.alert("Error", "No se pudo abrir WhatsApp."))
  }

  const callClient = (phone: string) => {
    const cleanNumber = phone.replace(/[\s\-\(\)\+]/g, "")
    Linking.canOpenURL(`tel:${cleanNumber}`)
      .then((supported) => {
        if (supported) return Linking.openURL(`tel:${cleanNumber}`)
        Alert.alert("Error", "No se puede realizar la llamada desde este dispositivo.")
      })
      .catch(() => Alert.alert("Error", "No se pudo realizar la llamada."))
  }

  // ─── NEGOCIACIÓN ───────────────────────────────────────────────────────────
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
      if (!token) { Alert.alert("Error", "Token no encontrado"); return }

      const response = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=crear_contraoferta_entrega",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ entrega_id: requestId, nuevo_precio: newPrice }),
        }
      )
      const data = await response.json()
      if (response.ok) {
        setDeliveryRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, counterOfferPrice: newPrice, status: "negotiation" as const } : r
          )
        )
        Alert.alert("Contrapropuesta enviada", `Has propuesto $${newPrice.toLocaleString()}. El cliente será notificado.`)
      } else {
        Alert.alert("Error", data.error || "No se pudo enviar la contrapropuesta")
      }
    } catch {
      Alert.alert("Error", "Error al conectar con el servidor.")
    }
    setEditingPrice(null)
    setCounterOfferPrice("")
  }

  // ─── ACEPTAR / RECHAZAR ────────────────────────────────────────────────────
  const acceptDelivery = async (requestId: string) => {
    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) { Alert.alert("Error", "Token no encontrado"); return }

      const response = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=aceptar_entrega_directa",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ entrega_id: requestId }),
        }
      )
      const data = await response.json()

      if (response.ok && data.success) {
        const found = deliveryRequests.find((r) => r.id === requestId)
        const deliveryToSet: DeliveryRequest = found ?? {
          id: requestId,
          clientName: "Cliente",
          pickupAddress: "",
          pickupNeighborhood: "",
          pickupZone: "",
          deliveryAddress: "",
          deliveryNeighborhood: "",
          deliveryZone: "",
          puntoReferencia: "",
          isFragile: false,
          proposedPrice: 0,
          status: "accepted",
          client: { phone: "N/A", whatsapp: "N/A" },
        }
        setAcceptedDelivery(deliveryToSet)
        setDeliveryStatus("accepted")
        setDeliveryRequests([])
        cleanupPolling()
        await checkContraofertaAceptada()
      } else {
        Alert.alert("Error", data.error || "No se pudo aceptar el pedido.")
      }
    } catch {
      Alert.alert("Error", "Error al conectar con el servidor.")
    }
  }

  const rejectDelivery = async (requestId: string) => {
    try {
      const newRejected = new Set(rejectedDeliveries)
      newRejected.add(requestId)
      setRejectedDeliveries(newRejected)
      await saveRejectedDeliveries(newRejected)
      setDeliveryRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      setDeliveryRequests((prev) => prev.filter((r) => r.id !== requestId))
    }
  }

  // ─── FLUJO FOTO + FINALIZAR (estilo Uber/Didi con FormData) ───────────────

  // PASO 1: Toca "Entregado" → pedir permiso y abrir cámara
  const completeDelivery = async () => {
    if (!acceptedDelivery) return

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu cámara para tomar la foto de evidencia de entrega."
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.4,        // ✅ Calidad reducida para ahorrar memoria
      allowsEditing: false,
      base64: false,       // ✅ Sin base64 - evita crash en Android
    })

    if (result.canceled || !result.assets?.[0]) return

    setPhotoUri(result.assets[0].uri)
    setPhotoBase64(null)
    setShowPhotoModal(true)
  }

  // PASO 2A: Repetir foto
  const retakePhoto = async () => {
    setShowPhotoModal(false)
    setPhotoUri(null)
    setPhotoBase64(null)
    setTimeout(() => { completeDelivery() }, 300)
  }

  // PASO 2B: Confirmar foto → subir con FormData (como Uber/Didi) y finalizar
  const confirmAndFinalize = async () => {
    if (!acceptedDelivery || !photoUri) return
    setIsUploadingPhoto(true)

    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) throw new Error("Token no encontrado")

      // ✅ FormData - mucho más eficiente que base64, igual que Uber/Didi/Rappi
      const formData = new FormData()
      formData.append("entrega_id", acceptedDelivery.id)
      formData.append("foto", {
        uri: photoUri,
        name: `entrega_${acceptedDelivery.id}.jpg`,
        type: "image/jpeg",
      } as any)

      const uploadResponse = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=subir_foto_entrega",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      )

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || "No se pudo subir la foto de evidencia")
      }

      // Finalizar entrega
      const finalizeResponse = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=finalizar_entrega",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entrega_id: acceptedDelivery.id }),
        }
      )
      const finalizeData = await finalizeResponse.json()

      if (finalizeResponse.ok && finalizeData.success) {
        setShowPhotoModal(false)
        setPhotoUri(null)
        setPhotoBase64(null)
        setAcceptedDelivery(null)
        setDeliveryStatus("pending")
        Alert.alert(
          "¡Pedido finalizado! 🎉",
          `Entrega completada con evidencia fotográfica.\nValor: $${finalizeData.valor_final?.toLocaleString("es-CO")}`
        )
      } else {
        throw new Error(finalizeData.error || "No se pudo finalizar el pedido")
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Ocurrió un error al finalizar el pedido.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // ─── CANCELAR PEDIDO ACEPTADO ──────────────────────────────────────────────
  const cancelAcceptedDelivery = async () => {
    if (!acceptedDelivery) return
    Alert.alert("Cancelar pedido", "¿Estás seguro de que quieres cancelar este pedido?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token")
            const response = await fetch(
              "https://www.pinkdrivers.com/api-rest/index.php?action=cancelar_entrega",
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ entrega_id: acceptedDelivery.id }),
              }
            )
            const data = await response.json()
            if (response.ok && data.success) {
              setAcceptedDelivery(null)
              setDeliveryStatus("pending")
              Alert.alert("Pedido cancelado", "El pedido ha sido cancelado. El cliente será notificado.")
            } else {
              Alert.alert("Error", data.error || "No se pudo cancelar el pedido.")
            }
          } catch {
            Alert.alert("Error de conexión", "No se pudo conectar con el servidor.")
          }
        },
      },
    ])
  }

  // ─── FETCH PROFILE / CONTRAOFERTA / PENDIENTES ────────────────────────────
  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem("token")
    if (!token) return
    try {
      const response = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=getUser", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setCurrentCity(data.ciudad || "")
        setCurrentZone(data.zona || "")
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error)
    }
  }

  const checkContraofertaAceptada = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) return

      const response = await fetch(
        "https://www.pinkdrivers.com/api-rest/index.php?action=entrega_aceptada_domiciliario",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const text = await response.text()
      if (!text || text.trim() === "") return

      let data
      try { data = JSON.parse(text) } catch { return }

      const pedidoAceptado = data?.pedido_aceptado || data?.pedido

      if (pedidoAceptado && !acceptedDelivery) {
        const acceptedData: DeliveryRequest = {
          id: pedidoAceptado.id.toString(),
          clientName: pedidoAceptado.cliente_nombre ? pedidoAceptado.cliente_nombre.split(" ")[0] : "Cliente",
          pickupAddress: pedidoAceptado.ubicacionRecogida || "",
          pickupNeighborhood: pedidoAceptado.barrioRecogida || "",
          pickupZone: pedidoAceptado.zonaRecogida || "",
          puntoReferencia: pedidoAceptado.puntoReferencia || "",
          deliveryAddress: pedidoAceptado.ubicacionEntrega || "",
          deliveryNeighborhood: pedidoAceptado.barrioEntrega || "",
          deliveryZone: pedidoAceptado.zonaEntrega || "",
          isFragile: pedidoAceptado.es_fragil === 1 || pedidoAceptado.es_fragil === "1" || pedidoAceptado.es_fragil === true,
          proposedPrice: Number(pedidoAceptado.valorPersonalizado || 0),
          counterOfferPrice: pedidoAceptado.valor_contraoferta ? Number(pedidoAceptado.valor_contraoferta) : undefined,
          status: "accepted",
          client: {
            phone: pedidoAceptado.cliente_telefono || "N/A",
            whatsapp: pedidoAceptado.cliente_telefono || "N/A",
          },
        }
        setAcceptedDelivery(acceptedData)
        setDeliveryStatus("accepted")
        setDeliveryRequests([])
        cleanupPolling()

        const isCounterOfferAccepted =
          pedidoAceptado.valor_contraoferta &&
          pedidoAceptado.valorPersonalizado === pedidoAceptado.valor_contraoferta

        Alert.alert(
          isCounterOfferAccepted ? "¡Contrapropuesta aceptada!" : "¡Pedido aceptado!",
          isCounterOfferAccepted
            ? `El cliente ha aceptado tu propuesta de $${Number(pedidoAceptado.valor_contraoferta).toLocaleString("es-CO")}`
            : `Tienes un nuevo pedido de ${acceptedData.clientName}`,
          [{ text: "Ver pedido" }]
        )
      }
    } catch (error) {
      console.error("❌ Error al verificar pedido aceptado:", error)
    }
  }

  const fetchPendingDeliveries = async () => {
    if (acceptedDelivery) return
    await checkContraofertaAceptada()
    if (acceptedDelivery) return

    const now = Date.now()
    if (now - lastFetchTimestamp.current < 2000) return
    lastFetchTimestamp.current = now

    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) return

      const currentIds = deliveryRequests.map((r) => r.id)
      if (currentIds.length > 0) {
        for (const rid of currentIds) {
          try {
            const res = await fetch(
              `https://www.pinkdrivers.com/api-rest/index.php?action=verificar_estado_entrega&entrega_id=${rid}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            if (!res.ok) {
              setDeliveryRequests((prev) => prev.filter((r) => r.id !== rid))
              continue
            }
            const statusData = await res.json()
            if (
              !statusData.success ||
              statusData.estado === "cancelado" ||
              statusData.cancelled === true ||
              statusData.message?.includes("cancelado") ||
              statusData.message?.includes("No encontrado")
            ) {
              setDeliveryRequests((prev) => prev.filter((r) => r.id !== rid))
              const newRejected = new Set(rejectedDeliveries)
              newRejected.add(rid)
              setRejectedDeliveries(newRejected)
              await saveRejectedDeliveries(newRejected)
            }
          } catch {
            setDeliveryRequests((prev) => prev.filter((r) => r.id !== rid))
          }
        }
      }

      const currentIdsStr = deliveryRequests.map((r) => r.id).join(",")
      const url = `https://www.pinkdrivers.com/api-rest/index.php?action=entregas_pendientes&checkStates=true&currentIds=${currentIdsStr}&timestamp=${now}`
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()

      if (response.ok) {
        const cancelledIds = (data.cancelled_ids || []).map((id: any) => id.toString())
        if (cancelledIds.length > 0) {
          setDeliveryRequests((prev) => prev.filter((r) => !cancelledIds.includes(r.id)))
          const newRejected = new Set(rejectedDeliveries)
          cancelledIds.forEach((id: string) => newRejected.add(id))
          setRejectedDeliveries(newRejected)
          await saveRejectedDeliveries(newRejected)
        }

        const rejectedCO = (data.rejected_counteroffers || []).map((id: any) => id.toString())
        if (rejectedCO.length > 0) {
          setDeliveryRequests((prev) => prev.filter((r) => !rejectedCO.includes(r.id)))
          const newRejected = new Set(rejectedDeliveries)
          rejectedCO.forEach((id: string) => newRejected.add(id))
          setRejectedDeliveries(newRejected)
          await saveRejectedDeliveries(newRejected)
        }

        if (data.pedidos?.length) {
          const formatted: DeliveryRequest[] = data.pedidos
            .filter((p: any) => !["cancelado", "finalizado", "aceptado"].includes(p.estado))
            .map((p: any) => ({
              id: p.id.toString(),
              clientName: p.cliente_nombre ? p.cliente_nombre.split(" ")[0] : "Cliente",
              pickupAddress: p.ubicacionRecogida || "",
              pickupNeighborhood: p.barrioRecogida || "",
              pickupZone: p.zonaRecogida || "",
              puntoReferencia: p.puntoReferencia || "",
              deliveryAddress: p.ubicacionEntrega || "",
              deliveryNeighborhood: p.barrioEntrega || "",
              deliveryZone: p.zonaEntrega || "",
              isFragile: p.es_fragil === 1 || p.es_fragil === "1" || p.es_fragil === true,
              proposedPrice: Number(p.valorPersonalizado ?? 0),
              counterOfferPrice: p.valor_contraoferta ? Number(p.valor_contraoferta) : undefined,
              status: p.estado === "negociacion" ? "negotiation" : "pending",
              client: {
                phone: p.cliente_telefono || "N/A",
                whatsapp: p.cliente_telefono || "N/A",
              },
            }))
            .filter((r: DeliveryRequest) => !rejectedDeliveries.has(r.id))

          setDeliveryRequests((prev) => {
            if (formatted.length === 0) return []
            return formatted.reduce((acc, newItem) => {
              const idx = acc.findIndex((r) => r.id === newItem.id)
              if (idx !== -1) {
                acc[idx] = { ...acc[idx], status: newItem.status, counterOfferPrice: newItem.counterOfferPrice }
              } else {
                acc.push(newItem)
              }
              return acc
            }, [...prev])
          })
        } else {
          setDeliveryRequests((prev) => (prev.length > 0 ? [] : prev))
        }
      }
    } catch (error) {
      console.error("❌ Error al conectar con la API:", error)
    }
  }

  // ✅ Polling con delay inicial de 1s y intervalo de 5s (estable en Android)
  useEffect(() => {
    cleanupPolling()
    if (isDeliveryActive && !acceptedDelivery && domiciliarioId && isScreenFocused) {
      const startupTimer = setTimeout(() => {
        fetchPendingDeliveries()
        isPollingActiveRef.current = true
        pollingIntervalRef.current = setInterval(() => {
          if (isPollingActiveRef.current) fetchPendingDeliveries()
        }, 5000) // ✅ 5 segundos como Uber/Didi
      }, 1000) // ✅ Espera 1s para que el componente cargue bien

      return () => {
        clearTimeout(startupTimer)
        cleanupPolling()
      }
    }
    return () => { cleanupPolling() }
  }, [isDeliveryActive, acceptedDelivery, domiciliarioId, isScreenFocused, rejectedDeliveries])

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true)
      fetchUserProfile()
      return () => {
        setIsScreenFocused(false)
        cleanupPolling()
      }
    }, [])
  )

  // ─── MODAL FOTO EVIDENCIA ──────────────────────────────────────────────────
  const renderPhotoModal = () => (
    <Modal
      visible={showPhotoModal}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (!isUploadingPhoto) {
          setShowPhotoModal(false)
          setPhotoUri(null)
          setPhotoBase64(null)
        }
      }}
    >
      <LinearGradient colors={["#EDE0F5", "#D4B8E0"]} style={styles.photoModalContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#EDE0F5" />

        <View style={styles.photoModalHeader}>
          <FontAwesome name="camera" size={20} color="#5A189A" />
          <Text style={styles.photoModalHeaderTitle}>Foto de evidencia</Text>
        </View>

        <Text style={styles.photoModalSubtitle}>
          Asegúrate de que la foto muestre claramente el paquete entregado
        </Text>

        {photoUri && (
          <View style={styles.photoImageContainer}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            <View style={styles.photoImageBadge}>
              <FontAwesome name="check-circle" size={16} color="#25D366" />
              <Text style={styles.photoImageBadgeText}>Foto tomada</Text>
            </View>
          </View>
        )}

        {acceptedDelivery && (
          <View style={styles.photoOrderInfo}>
            <FontAwesome name="map-marker" size={14} color="#5A189A" />
            <Text style={styles.photoOrderInfoText} numberOfLines={2}>
              {acceptedDelivery.deliveryAddress}
            </Text>
          </View>
        )}

        {isUploadingPhoto ? (
          <View style={styles.photoLoadingContainer}>
            <ActivityIndicator size="large" color="#5A189A" />
            <Text style={styles.photoLoadingText}>Subiendo evidencia y finalizando...</Text>
          </View>
        ) : (
          <View style={styles.photoButtonsContainer}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePhoto}
              disabled={isUploadingPhoto}
            >
              <FontAwesome name="repeat" size={16} color="#5A189A" />
              <Text style={styles.retakeButtonText}>Repetir foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmAndFinalize}
              disabled={isUploadingPhoto}
            >
              <FontAwesome name="check" size={16} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirmar entrega</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </Modal>
  )

  // ─── RENDER PEDIDO ACEPTADO ────────────────────────────────────────────────
  const renderAcceptedDeliveryDetail = () => {
    if (!acceptedDelivery) return null

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.acceptedDeliveryHeader}>
          <Text style={styles.acceptedDeliveryTitle}>Pedido en curso</Text>
          <View style={styles.deliveryStatusBadge}>
            <Text style={styles.deliveryStatusText}>
              {deliveryStatus === "accepted" ? "Confirmado" : "En camino"}
            </Text>
          </View>
        </View>

        <View style={styles.clientDetailCard}>
          <View style={styles.clientIconLarge}>
            <FontAwesome name="user" size={32} color="#7B2FBE" />
          </View>
          <View style={styles.clientDetailInfo}>
            <Text style={styles.clientNameLarge}>{acceptedDelivery.clientName}</Text>
            {acceptedDelivery.isFragile && (
              <View style={styles.fragileBadgeLarge}>
                <FontAwesome name="warning" size={12} color="#fff" />
                <Text style={styles.fragileBadgeText}>Pedido frágil</Text>
              </View>
            )}
            <View style={styles.contactButtonsLarge}>
              <TouchableOpacity
                style={styles.whatsappButtonLarge}
                onPress={() => openWhatsApp(acceptedDelivery.client.whatsapp)}
              >
                <FontAwesome name="whatsapp" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callButtonLarge}
                onPress={() => callClient(acceptedDelivery.client.phone)}
              >
                <FontAwesome name="phone" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Llamar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.routeDetailCard}>
          <View style={styles.routePoint}>
            <View style={styles.routePointDot} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routePointLabel}>RECOGIDA</Text>
              <Text style={styles.routePointAddress}>{acceptedDelivery.pickupAddress}</Text>
              <Text style={styles.routePointNeighborhood}>
                {acceptedDelivery.pickupNeighborhood} • {acceptedDelivery.pickupZone}
              </Text>
            </View>
          </View>

          {!!acceptedDelivery.puntoReferencia && (
            <View style={styles.referencePill}>
              <Text style={styles.referencePillText}>
                <Text style={styles.referencePillLabel}>Notas: </Text>
                {acceptedDelivery.puntoReferencia}
              </Text>
            </View>
          )}

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <View style={[styles.routePointDot, styles.destinationDotLarge]} />
            <View style={styles.routePointInfo}>
              <Text style={styles.routePointLabel}>ENTREGA</Text>
              <Text style={styles.routePointAddress}>{acceptedDelivery.deliveryAddress}</Text>
              <Text style={styles.routePointNeighborhood}>
                {acceptedDelivery.deliveryNeighborhood} • {acceptedDelivery.deliveryZone}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceDetailCard}>
          <Text style={styles.priceDetailLabel}>Precio acordado</Text>
          <Text style={styles.priceDetailAmount}>
            ${acceptedDelivery.proposedPrice.toLocaleString()}
          </Text>
        </View>

        <View style={styles.photoNotice}>
          <FontAwesome name="camera" size={13} color="#5A189A" />
          <Text style={styles.photoNoticeText}>
            Al finalizar se tomará una foto como evidencia de entrega
          </Text>
        </View>

        <View style={styles.deliveryActionButtons}>
          <TouchableOpacity style={styles.cancelDeliveryButton} onPress={cancelAcceptedDelivery}>
            <FontAwesome name="times" size={16} color="#C0392B" />
            <Text style={styles.cancelDeliveryButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.completeDeliveryButton} onPress={completeDelivery}>
            <FontAwesome name="camera" size={16} color="#fff" />
            <Text style={styles.completeDeliveryButtonText}>Entregado</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // ─── RENDER TARJETA SOLICITUD ──────────────────────────────────────────────
  const renderDeliveryRequest = ({ item }: { item: DeliveryRequest }) => {
    const proposedPrice = item.proposedPrice || 0
    const coPrice = item.counterOfferPrice

    return (
      <View style={styles.deliveryRequestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.clientIcon}>
              <FontAwesome name="user" size={14} color="#7B2FBE" />
            </View>
            <Text style={styles.clientName}>{item.clientName || "Cliente"}</Text>
            {item.isFragile && (
              <View style={styles.fragileBadge}>
                <FontAwesome name="warning" size={10} color="#fff" />
                <Text style={styles.fragileBadgeSmallText}>⚠ Frágil</Text>
              </View>
            )}
            {item.status === "negotiation" && (
              <View style={styles.negotiationBadge}>
                <Text style={styles.negotiationBadgeText}>En negociación</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.locationsContainer}>
          <View style={styles.locationsRow}>
            <View style={styles.locationCompact}>
              <View style={styles.locationDot} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>RECOGIDA</Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {item.pickupAddress || "Dirección no disponible"}
                </Text>
                <Text style={styles.locationNeighborhood}>
                  {item.pickupNeighborhood} · {item.pickupZone}
                </Text>
              </View>
            </View>
            <View style={styles.locationArrow}>
              <FontAwesome name="arrow-right" size={12} color="#C9A7EB" />
            </View>
            <View style={styles.locationCompact}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel2}>ENTREGA</Text>
                <Text style={[styles.locationAddress, { flexShrink: 1, flexWrap: "wrap" }]}>
                  {item.deliveryAddress || "Destino no disponible"}
                </Text>
                <Text style={styles.locationNeighborhood}>
                  {item.deliveryNeighborhood} · {item.deliveryZone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {!!item.puntoReferencia && (
          <View style={styles.notasCardBanner}>
            <FontAwesome name="sticky-note" size={12} color="#7B2FBE" />
            <Text style={styles.notasCardText}>
              <Text style={styles.notasCardLabel}>Notas: </Text>
              {item.puntoReferencia}
            </Text>
          </View>
        )}

        <View style={styles.priceMainContainer}>
          <View style={styles.priceLeftSection}>
            {item.status === "negotiation" && coPrice ? (
              <View style={styles.priceNegotiationContainer}>
                <Text style={styles.originalPrice}>${proposedPrice.toLocaleString()}</Text>
                <Text style={styles.counterOfferPrice}>→ ${coPrice.toLocaleString()}</Text>
              </View>
            ) : (
              <Text style={styles.priceAmount}>${proposedPrice.toLocaleString()}</Text>
            )}
          </View>

          {item.status === "negotiation" ? (
            <View style={styles.waitingResponse}>
              <FontAwesome name="clock-o" size={12} color="#7B2FBE" />
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
                <FontAwesome name="times" size={12} color="#7B2FBE" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.negotiateButton} onPress={() => handlePriceEdit(item.id, proposedPrice)}>
              <FontAwesome name="edit" size={12} color="#7B2FBE" />
              <Text style={styles.negotiateButtonText}>Negociar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => rejectDelivery(item.id)}>
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.acceptButton,
              (item.status === "negotiation" || editingPrice === item.id) && styles.acceptButtonDisabled,
            ]}
            onPress={() => acceptDelivery(item.id)}
            disabled={item.status === "negotiation" || editingPrice === item.id}
          >
            <Text
              style={[
                styles.acceptButtonText,
                (item.status === "negotiation" || editingPrice === item.id) && styles.acceptButtonTextDisabled,
              ]}
            >
              {item.status === "negotiation"
                ? "En negociación"
                : editingPrice === item.id
                ? "Negociando"
                : "Aceptar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ─── RENDER PRINCIPAL ──────────────────────────────────────────────────────
  return (
    <LinearGradient colors={["#EDE0F5", "#D4B8E0"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EDE0F5" />

      {renderPhotoModal()}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo("./ProfileDelivery")}>
          <View style={styles.profileIconSmall}>
            <FontAwesome name="user" size={19} color="#7B2FBE" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {acceptedDelivery ? "Pedido en curso" : "Solicitudes de domicilio"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentCity} - {currentZone}
          </Text>
        </View>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: acceptedDelivery
                  ? "#9B59B6"
                  : isDeliveryActive
                  ? "#6C3FC5"
                  : "#BDC3C7",
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.requestsList}>
        {acceptedDelivery ? (
          renderAcceptedDeliveryDetail()
        ) : isDeliveryActive ? (
          deliveryRequests.length > 0 ? (
            <FlatList
              data={deliveryRequests}
              renderItem={renderDeliveryRequest}
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
              <FontAwesome name="motorcycle" size={40} color="#C9A7EB" />
              <Text style={styles.emptyStateText}>No hay pedidos disponibles</Text>
              <Text style={styles.emptyStateSubtext}>Mantente activo para recibir nuevas solicitudes</Text>
            </View>
          )
        ) : (
          <View style={styles.inactiveState}>
            <FontAwesome name="pause-circle" size={40} color="#C9A7EB" />
            <Text style={styles.inactiveStateText}>Estás desconectado</Text>
            <Text style={styles.inactiveStateSubtext}>Activa tu disponibilidad para recibir pedidos</Text>
          </View>
        )}
      </View>

      {!acceptedDelivery && (
        <LinearGradient colors={["#EDE0F5", "#D4B8E0"]} style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{isDeliveryActive ? "Disponible" : "No disponible"}</Text>
              <Switch
                value={isDeliveryActive}
                onValueChange={toggleDeliveryActive}
                trackColor={{ false: "#d3d3d3", true: "#C9A7EB" }}
                thumbColor={isDeliveryActive ? "#7B2FBE" : "#f4f3f4"}
                ios_backgroundColor="#d3d3d3"
                style={styles.statusSwitch}
              />
            </View>
            <TouchableOpacity style={styles.updateLocationButton} onPress={() => navigateTo("./EditProfileDelivery")}>
              <FontAwesome name="map-marker" size={14} color="#7B2FBE" />
              <Text style={styles.updateLocationText}>Actualizar ciudad y zona de trabajo</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
    </LinearGradient>
  )
}

export default HomeDelivery