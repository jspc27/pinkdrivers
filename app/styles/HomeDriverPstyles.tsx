import { Dimensions, Platform, StyleSheet } from "react-native"

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFE4F3",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  statusIndicator: {
    alignItems: "center",
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Requests list styles
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  listContainer: {
    paddingBottom: 20,
  },

  // TARJETA OPTIMIZADA - MÁS COMPACTA
  rideRequestCard: {
    backgroundColor: "#fff",
    borderRadius: 12, // Reducido de 16 a 12
    marginBottom: 10, // Reducido de 16 a 10
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Reducido de 2 a 1
    shadowOpacity: 0.08, // Reducido de 0.1 a 0.08
    shadowRadius: 4, // Reducido de 8 a 4
    elevation: 3, // Reducido de 4 a 3
  },

  // HEADER MÁS COMPACTO
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10, // Reducido de 16 a 10
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // AVATAR MÁS PEQUEÑO
  passengerAvatar: {
    width: 32, // Reducido de 40 a 32
    height: 32, // Reducido de 40 a 32
    borderRadius: 16, // Reducido de 20 a 16
    marginRight: 8, // Reducido de 12 a 8
  },

  // NOMBRE MÁS PEQUEÑO
  passengerName: {
    fontSize: 14, // Reducido de 16 a 14
    fontWeight: "600",
    color: "#333",
  },

  // BOTONES DE CONTACTO MÁS PEQUEÑOS
  contactActions: {
    flexDirection: "row",
    gap: 6, // Reducido de 10 a 6
  },

  whatsappButton: {
    padding: 6, // Reducido de 8 a 6
    borderRadius: 16, // Reducido de 20 a 16
    backgroundColor: "#f8f8f8",
  },

  callButton: {
    padding: 6, // Reducido de 8 a 6
    borderRadius: 16, // Reducido de 20 a 16
    backgroundColor: "#f8f8f8",
  },

  // UBICACIONES MÁS COMPACTAS
  locationsContainer: {
    padding: 10, // Reducido de 16 a 10
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2, // Agregado para reducir espacio
  },

  // PUNTOS DE UBICACIÓN MÁS PEQUEÑOS
  locationDot: {
    width: 8, // Reducido de 12 a 8
    height: 8, // Reducido de 12 a 8
    borderRadius: 4, // Reducido de 6 a 4
    backgroundColor: "#4CAF50",
    marginTop: 6, // Reducido de 8 a 6
    marginRight: 8, // Reducido de 12 a 8
  },

  destinationDot: {
    backgroundColor: "#FF69B4",
  },

  // LÍNEA DE RUTA MÁS CORTA
  routeLine: {
    width: 2,
    height: 14, // Reducido de 20 a 14
    backgroundColor: "#ddd",
    marginLeft: 3, // Reducido de 5 a 3
    marginVertical: 4, // Reducido de 8 a 4
  },

  locationInfo: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 10, // Reducido de 12 a 10
    color: "#666",
    marginBottom: 2, // Reducido de 4 a 2
  },

  // DIRECCIONES MÁS PEQUEÑAS
  locationAddress: {
    fontSize: 12, // Reducido de 14 a 12
    fontWeight: "500",
    color: "#333",
    marginBottom: 1, // Reducido de 2 a 1
  },

  locationNeighborhood: {
    fontSize: 10, // Reducido de 12 a 10
    color: "#888",
  },

  // INFORMACIÓN DEL VIAJE MÁS COMPACTA
  tripInfo: {
    flexDirection: "row",
    paddingHorizontal: 10, // Reducido de 16 a 10
    paddingVertical: 8, // Reducido de 12 a 8
    gap: 16, // Reducido de 20 a 16
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  tripInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Reducido de 6 a 4
  },

  tripInfoText: {
    fontSize: 12, // Reducido de 14 a 12
    color: "#666",
  },

  // SECCIÓN DE PRECIO MÁS COMPACTA
  priceSection: {
    padding: 10, // Reducido de 16 a 10
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  priceLabel: {
    fontSize: 12, // Reducido de 14 a 12
    color: "#666",
    marginBottom: 6, // Reducido de 8 a 6
  },

  priceDisplayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // PRECIO MÁS PEQUEÑO
  priceAmount: {
    fontSize: 20, // Reducido de 24 a 20
    fontWeight: "bold",
    color: "#FF69B4",
  },

  // BOTÓN DE EDITAR PRECIO MÁS PEQUEÑO
  editPriceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Reducido de 6 a 4
    paddingHorizontal: 8, // Reducido de 12 a 8
    paddingVertical: 4, // Reducido de 6 a 4
    borderRadius: 6, // Reducido de 8 a 6
    borderWidth: 1,
    borderColor: "#FF69B4",
  },

  editPriceText: {
    fontSize: 12, // Reducido de 14 a 12
    color: "#FF69B4",
    fontWeight: "500",
  },

  priceEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // Reducido de 8 a 6
  },

  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6, // Reducido de 8 a 6
    paddingHorizontal: 8, // Reducido de 12 a 8
    paddingVertical: 6, // Reducido de 8 a 6
    fontSize: 14, // Reducido de 16 a 14
  },

  submitPriceButton: {
    backgroundColor: "#FF69B4",
    paddingHorizontal: 12, // Reducido de 16 a 12
    paddingVertical: 6, // Reducido de 8 a 6
    borderRadius: 6, // Reducido de 8 a 6
  },

  submitPriceText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12, // Agregado tamaño más pequeño
  },

  cancelPriceButton: {
    paddingHorizontal: 8, // Reducido de 12 a 8
    paddingVertical: 6, // Reducido de 8 a 6
  },

  cancelPriceText: {
    color: "#666",
    fontSize: 12, // Agregado tamaño más pequeño
  },

  // BOTONES DE ACCIÓN MÁS COMPACTOS
  actionButtons: {
    flexDirection: "row",
    padding: 10, // Reducido de 16 a 10
    gap: 8, // Reducido de 12 a 8
  },

  rejectButton: {
    flex: 1,
    paddingVertical: 8, // Reducido de 12 a 8
    borderRadius: 6, // Reducido de 8 a 6
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  rejectButtonText: {
    fontSize: 14, // Reducido de 16 a 14
    fontWeight: "500",
    color: "#666",
  },

  acceptButton: {
    flex: 1,
    paddingVertical: 8, // Reducido de 12 a 8
    borderRadius: 6, // Reducido de 8 a 6
    backgroundColor: "#FF69B4",
    alignItems: "center",
  },

  acceptButtonText: {
    fontSize: 14, // Reducido de 16 a 14
    fontWeight: "600",
    color: "#fff",
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },

  inactiveState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  inactiveStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },

  inactiveStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },

  // Footer styles
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 35 : 25,
  },

  footerContent: {
    gap: 16,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  statusSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },

  updateLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  updateLocationText: {
    fontSize: 14,
    color: "#FF69B4",
    fontWeight: "500",
  },
})

export default styles
