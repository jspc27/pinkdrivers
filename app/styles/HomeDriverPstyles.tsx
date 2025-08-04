import { Dimensions, Platform, StyleSheet } from "react-native"

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles - más compacto
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 45 : 25,
    paddingBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  profileIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFE4F3",
    borderWidth: 2,
    borderColor: "#FF69B4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18, // Aumentado de 16 a 18
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 15, // Aumentado de 13 a 15
    color: "#666",
    marginTop: 1,
  },
  statusIndicator: {
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Lista más eficiente
  requestsList: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  // TARJETA ULTRA COMPACTA
  rideRequestCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  // HEADER MINIMALISTA
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  // ICONO DE PERFIL MÍNIMO
  passengerIcon: {
    width: 32, // Aumentado de 28 a 32
    height: 32, // Aumentado de 28 a 32
    borderRadius: 16, // Ajustado proporcionalmente
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8, // Aumentado de 6 a 8
  },
  passengerName: {
    fontSize: 16, // Aumentado de 13 a 16
    fontWeight: "600",
    color: "#333",
  },
  // BOTONES DE CONTACTO MINIMALISTAS
  contactActions: {
    flexDirection: "row",
    gap: 6, // Aumentado de 4 a 6
  },
  whatsappButton: {
    padding: 8, // Aumentado de 4 a 8
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },
  callButton: {
    padding: 8, // Aumentado de 4 a 8
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },
  // UBICACIONES EN LÍNEA HORIZONTAL
  locationsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8, // Aumentado de 6 a 8
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },
  locationsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  locationDot: {
    width: 8, // Aumentado de 6 a 8
    height: 8, // Aumentado de 6 a 8
    borderRadius: 4, // Ajustado proporcionalmente
    backgroundColor: "#4CAF50",
    marginRight: 8, // Aumentado de 6 a 8
  },
  destinationDot: {
    backgroundColor: "#FF69B4",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11, // Aumentado de 9 a 11
    color: "#666",
    marginBottom: 2, // Aumentado de 1 a 2
    fontWeight: "600",
  },
  locationAddress: {
    fontSize: 14, // Aumentado de 11 a 14
    fontWeight: "600", // Aumentado de 500 a 600
    color: "#333",
    marginBottom: 2,
  },
  locationNeighborhood: {
    fontSize: 12, // Aumentado de 9 a 12
    color: "#888",
  },
  locationArrow: {
    paddingHorizontal: 8,
  },
  priceMainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12, // Aumentado de 10 a 12
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },
  priceLeftSection: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 24, // Aumentado de 19 a 24
    fontWeight: "bold",
    color: "#FF69B4",
    paddingRight: 10,
  },
  negotiateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12, // Aumentado de 10 a 12
    paddingVertical: 8, // Aumentado de 6 a 8
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF69B4",
    backgroundColor: "#fff",
  },
  negotiateButtonText: {
    fontSize: 13, // Aumentado de 11 a 13
    color: "#FF69B4",
    fontWeight: "600",
  },
  priceEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14, // Aumentado de 13 a 14
    width: 90,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  submitPriceButton: {
    backgroundColor: "#FF69B4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPriceButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  // BOTONES DE ACCIÓN MÁS GRANDES
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10, // Aumentado de 8 a 10
    gap: 8, // Aumentado de 6 a 8
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 8, // Aumentado de 6 a 8
    borderRadius: 6, // Aumentado de 4 a 6
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  rejectButtonText: {
    fontSize: 14, // Aumentado de 12 a 14
    fontWeight: "600", // Aumentado de 500 a 600
    color: "#666",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 8, // Aumentado de 6 a 8
    borderRadius: 6, // Aumentado de 4 a 6
    backgroundColor: "#FF69B4",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14, // Aumentado de 12 a 14
    fontWeight: "600",
    color: "#fff",
  },
  // ESTILOS MEJORADOS PARA LA VISTA DE VIAJE ACEPTADO
  acceptedRideContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  acceptedRideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  acceptedRideTitle: {
    fontSize: 24, // Aumentado de 22 a 24
    fontWeight: "bold",
    color: "#333",
  },
  rideStatusBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rideStatusText: {
    color: "#fff",
    fontSize: 13, // Aumentado de 12 a 13
    fontWeight: "600",
  },
  passengerDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passengerIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#FF69B4",
  },
  passengerDetailInfo: {
    flex: 1,
  },
  passengerNameLarge: {
    fontSize: 20, // Aumentado de 18 a 20
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  contactButtonsLarge: {
    flexDirection: "row",
    gap: 8,
  },
  whatsappButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 16, // Aumentado de 14 a 16
    paddingVertical: 10, // Aumentado de 8 a 10
    borderRadius: 20,
    gap: 6,
  },
  callButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF69B4",
    paddingHorizontal: 16, // Aumentado de 14 a 16
    paddingVertical: 10, // Aumentado de 8 a 10
    borderRadius: 20,
    gap: 6,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 14, // Aumentado de 13 a 14
    fontWeight: "600",
  },
  routeDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routePointDot: {
    width: 14, // Aumentado de 12 a 14
    height: 14, // Aumentado de 12 a 14
    borderRadius: 7, // Ajustado proporcionalmente
    backgroundColor: "#4CAF50",
    marginRight: 16,
    marginTop: 4,
  },
  destinationDotLarge: {
    backgroundColor: "#FF69B4",
  },
  routePointInfo: {
    flex: 1,
  },
  routePointLabel: {
    fontSize: 13, // Aumentado de 12 a 13
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  routePointAddress: {
    fontSize: 17, // Aumentado de 15 a 17
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  routePointNeighborhood: {
    fontSize: 14, // Aumentado de 13 a 14
    color: "#888",
  },
  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: "#ddd",
    marginLeft: 6, // Aumentado de 5 a 6
    marginVertical: 8,
  },
  priceDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    marginHorizontal: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priceDetailLabel: {
    fontSize: 15, // Aumentado de 14 a 15
    color: "#666",
    marginBottom: 6,
  },
  priceDetailAmount: {
    fontSize: 32, // Aumentado de 28 a 32
    fontWeight: "bold",
    color: "#FF69B4",
  },
  rideActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  cancelRideButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF5722",
    paddingVertical: 16, // Aumentado de 14 a 16
    borderRadius: 12,
    gap: 8,
  },
  cancelRideButtonText: {
    color: "#FF5722",
    fontSize: 16, // Aumentado de 15 a 16
    fontWeight: "600",
  },
  completeRideButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16, // Aumentado de 14 a 16
    borderRadius: 12,
    gap: 8,
  },
  completeRideButtonText: {
    color: "#fff",
    fontSize: 16, // Aumentado de 15 a 16
    fontWeight: "600",
  },
  // Estados vacíos más compactos
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18, // Aumentado de 16 a 18
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14, // Aumentado de 13 a 14
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
  inactiveState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  inactiveStateText: {
    fontSize: 18, // Aumentado de 16 a 18
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  inactiveStateSubtext: {
    fontSize: 14, // Aumentado de 13 a 14
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
  // Footer más compacto
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  footerContent: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 16, // Aumentado de 15 a 16
    fontWeight: "600",
    color: "#333",
  },
  statusSwitch: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  updateLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  updateLocationText: {
    fontSize: 14, // Aumentado de 13 a 14
    color: "#FF69B4",
    fontWeight: "500",
  },
  clearRejectedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFB8B8",
  },
  clearRejectedText: {
    fontSize: 13, // Aumentado de 12 a 13
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 6,
  },
  negotiationBadge: {
    backgroundColor: "#ff9500",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  negotiationBadgeText: {
    color: "#ffffff",
    fontSize: 11, // Aumentado de 10 a 11
    fontWeight: "bold",
  },
  priceNegotiationContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  originalPrice: {
    fontSize: 15, // Aumentado de 14 a 15
    color: "#999999",
    textDecorationLine: "line-through",
  },
  counterOfferPrice: {
    fontSize: 20, // Aumentado de 18 a 20
    fontWeight: "bold",
    color: "#ff69b4",
  },
  waitingResponse: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffe0b2",
  },
  waitingResponseText: {
    marginLeft: 4,
    fontSize: 13, // Aumentado de 12 a 13
    color: "#ff9500",
    fontWeight: "500",
  },
  acceptButtonDisabled: {
    backgroundColor: "#e0e0e0",
    borderColor: "#bdbdbd",
  },
  acceptButtonTextDisabled: {
    color: "#9e9e9e",
  },
})

export default styles
