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
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  headerSubtitle: {
    fontSize: 13,
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
    paddingHorizontal: 12, // Reducido de 16 a 12
    marginTop: 8, // Reducido de 10 a 8
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  passengerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  // BOTONES DE CONTACTO MINIMALISTAS
  contactActions: {
    flexDirection: "row",
    gap: 4,
  },

  whatsappButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },

  callButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
  },

  // UBICACIONES EN LÍNEA HORIZONTAL
  locationsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },

  destinationDot: {
    backgroundColor: "#FF69B4",
  },

  locationInfo: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 1,
  },

  locationAddress: {
    fontSize: 11,
    fontWeight: "500",
    color: "#333",
  },

  locationNeighborhood: {
    fontSize: 9,
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
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },

  priceLeftSection: {
    flex: 1,
  },

  priceAmount: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FF69B4",
    paddingRight: 10,
  },

  negotiateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF69B4",
    backgroundColor: "#fff",
  },

  negotiateButtonText: {
    fontSize: 11,
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
    fontSize: 13,
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

  // BOTONES DE ACCIÓN MÁS PEQUEÑOS
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },

  rejectButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  rejectButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },

  acceptButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#FF69B4",
    alignItems: "center",
  },

  acceptButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  // ESTILOS MEJORADOS PARA LA VISTA DE VIAJE ACEPTADO
  acceptedRideContainer: {
    flex: 1,
    paddingVertical: 8, // Reducido de 10 a 8
    paddingHorizontal: 4, // Agregado para más espacio lateral
  },

  acceptedRideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Reducido de 20 a 16
    paddingHorizontal: 4, // Agregado padding lateral
  },

  acceptedRideTitle: {
    fontSize: 22, // Reducido de 24 a 22
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
    fontSize: 12,
    fontWeight: "600",
  },

  passengerDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16, // Reducido de 20 a 16
    marginBottom: 12, // Reducido de 16 a 12
    marginHorizontal: 2, // Agregado margen lateral
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  passengerIconLarge: {
    width: 70, // Reducido de 80 a 70
    height: 70, // Reducido de 80 a 70
    borderRadius: 35, // Ajustado proporcionalmente
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14, // Reducido de 16 a 14
    borderWidth: 2,
    borderColor: "#FF69B4",
  },

  passengerDetailInfo: {
    flex: 1,
  },

  passengerNameLarge: {
    fontSize: 18, // Reducido de 20 a 18
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10, // Reducido de 12 a 10
  },

  contactButtonsLarge: {
    flexDirection: "row",
    gap: 8, // Reducido de 10 a 8
  },

  whatsappButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 14, // Reducido de 16 a 14
    paddingVertical: 8, // Reducido de 10 a 8
    borderRadius: 20, // Reducido de 25 a 20
    gap: 6, // Reducido de 8 a 6
  },

  callButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF69B4",
    paddingHorizontal: 14, // Reducido de 16 a 14
    paddingVertical: 8, // Reducido de 10 a 8
    borderRadius: 20, // Reducido de 25 a 20
    gap: 6, // Reducido de 8 a 6
  },

  contactButtonText: {
    color: "#fff",
    fontSize: 13, // Reducido de 14 a 13
    fontWeight: "600",
  },

  routeDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16, // Reducido de 20 a 16
    marginBottom: 12, // Reducido de 16 a 12
    marginHorizontal: 2, // Agregado margen lateral
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
    width: 12,
    height: 12,
    borderRadius: 6,
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
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },

  routePointAddress: {
    fontSize: 15, // Reducido de 16 a 15
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  routePointNeighborhood: {
    fontSize: 13, // Reducido de 14 a 13
    color: "#888",
  },

  routeLine: {
    width: 2,
    height: 25, // Reducido de 30 a 25
    backgroundColor: "#ddd",
    marginLeft: 5,
    marginVertical: 8, // Reducido de 10 a 8
  },

  priceDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18, // Reducido de 20 a 18
    marginBottom: 16, // Reducido de 20 a 16
    marginHorizontal: 2, // Agregado margen lateral
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  priceDetailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6, // Reducido de 8 a 6
  },

  priceDetailAmount: {
    fontSize: 28, // Reducido de 32 a 28
    fontWeight: "bold",
    color: "#FF69B4",
  },

  rideActionButtons: {
    flexDirection: "row",
    gap: 10, // Reducido de 12 a 10
    marginTop: 8, // Reducido de 10 a 8
    paddingHorizontal: 2, // Agregado padding lateral
  },

  cancelRideButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF5722",
    paddingVertical: 14, // Reducido de 16 a 14
    borderRadius: 12,
    gap: 8,
  },

  cancelRideButtonText: {
    color: "#FF5722",
    fontSize: 15, // Reducido de 16 a 15
    fontWeight: "600",
  },

  completeRideButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14, // Reducido de 16 a 14
    borderRadius: 12,
    gap: 8,
  },

  completeRideButtonText: {
    color: "#fff",
    fontSize: 15, // Reducido de 16 a 15
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
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },

  emptyStateSubtext: {
    fontSize: 13,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },

  inactiveStateSubtext: {
    fontSize: 13,
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
    fontSize: 15,
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
    fontSize: 13,
    color: "#FF69B4",
    fontWeight: "500",
  },

  clearRejectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFB8B8',
  },
  clearRejectedText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 6,
  },

  negotiationBadge: {
    backgroundColor: '#ff9500',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },

  negotiationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  priceNegotiationContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
  },

  counterOfferPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff69b4',
  },

  waitingResponse: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },

  waitingResponseText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '500',
  },

  acceptButtonDisabled: {
    backgroundColor: '#e0e0e0',
    borderColor: '#bdbdbd',
  },

  acceptButtonTextDisabled: {
    color: '#9e9e9e',
  },
})

export default styles