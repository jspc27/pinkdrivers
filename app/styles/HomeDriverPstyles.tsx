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
  // Solo una línea sutil debajo:
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0, 0, 0, 0.05)",
},

  avatarSmall: {
    width: 42, // Reducido de 50 a 42
    height: 42, // Reducido de 50 a 42
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#FFE4F3",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12, // Reducido de 15 a 12
  },

  headerTitle: {
    fontSize: 16, // Reducido de 18 a 16
    fontWeight: "600",
    color: "#333",
  },

  headerSubtitle: {
    fontSize: 13, // Reducido de 14 a 13
    color: "#666",
    marginTop: 1, // Reducido de 2 a 1
  },
  

  statusIndicator: {
    alignItems: "center",
  },

  statusDot: {
    width: 10, // Reducido de 12 a 10
    height: 10, // Reducido de 12 a 10
    borderRadius: 5,
  },

  // Lista más eficiente
  requestsList: {
    flex: 1,
    paddingHorizontal: 16, // Reducido de 20 a 16
    marginTop: 10,
  },

  listContainer: {
    paddingBottom: 16, // Reducido de 20 a 16
  },

  // TARJETA ULTRA COMPACTA
  rideRequestCard: {
    backgroundColor: "#fff",
    borderRadius: 10, // Reducido de 12 a 10
    marginBottom: 8, // Reducido de 10 a 8
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, // Reducido de 0.08 a 0.06
    shadowRadius: 3, // Reducido de 4 a 3
    elevation: 2, // Reducido de 3 a 2
  },

  // HEADER MINIMALISTA
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12, // Reducido de 10 a 12 para mejor balance
    paddingVertical: 8, // Reducido y específico
    borderBottomWidth: 0.5, // Línea más sutil
    borderBottomColor: "#f5f5f5",
  },

  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // AVATAR MÍNIMO
  passengerAvatar: {
    width: 28, // Reducido de 32 a 28
    height: 28, // Reducido de 32 a 28
    borderRadius: 14,
    marginRight: 6, // Reducido de 8 a 6
  },

  passengerName: {
    fontSize: 13, // Reducido de 14 a 13
    fontWeight: "600",
    color: "#333",
  },

  // BOTONES DE CONTACTO MINIMALISTAS
  contactActions: {
    flexDirection: "row",
    gap: 4, // Reducido de 6 a 4
  },

  whatsappButton: {
    padding: 4, // Reducido de 6 a 4
    borderRadius: 12, // Reducido de 16 a 12
    backgroundColor: "#f8f8f8",
  },

  callButton: {
    padding: 4, // Reducido de 6 a 4
    borderRadius: 12, // Reducido de 16 a 12
    backgroundColor: "#f8f8f8",
  },

  // UBICACIONES EN LÍNEA HORIZONTAL (NUEVA OPTIMIZACIÓN)
  locationsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6, // Muy reducido
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },

  // NUEVO: Layout horizontal para ubicaciones
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
    width: 6, // Muy pequeño
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
    fontSize: 9, // Muy pequeño
    color: "#666",
    marginBottom: 1,
  },

  locationAddress: {
    fontSize: 11, // Reducido de 12 a 11
    fontWeight: "500",
    color: "#333",
    // numberOfLines: 1, // Forzar una línea (esto se debe usar como prop en el componente, no en el estilo)
  },

  locationNeighborhood: {
    fontSize: 9, // Reducido de 10 a 9
    color: "#888",
  },

  // FLECHA ENTRE UBICACIONES
  locationArrow: {
    paddingHorizontal: 8,
  },

  // INFORMACIÓN DEL VIAJE EN UNA LÍNEA
  tripInfo: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6, // Muy reducido
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },

  tripInfoLeft: {
    flexDirection: "row",
    gap: 12,
  },

  tripInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3, // Reducido de 4 a 3
  },

  tripInfoText: {
    fontSize: 11, // Reducido de 12 a 11
    color: "#666",
  },

  // PRECIO Y NEGOCIACIÓN EN UNA LÍNEA
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8, // Reducido
  },

  priceAmount: {
  fontSize: 19,
  fontWeight: "bold",
  color: "#FF69B4",
  paddingRight: 10, // 👈 espacio a la derecha
},


  editPriceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3, // Reducido
    paddingHorizontal: 6, // Reducido
    paddingVertical: 3, // Reducido
    borderRadius: 4, // Reducido
    borderWidth: 1,
    borderColor: "#FF69B4",
  },

  editPriceText: {
    fontSize: 10, // Reducido de 12 a 10
    color: "#FF69B4",
    fontWeight: "500",
  },

  // BOTONES DE ACCIÓN MÁS PEQUEÑOS
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8, // Reducido
    gap: 6, // Reducido
  },

  rejectButton: {
    flex: 1,
    paddingVertical: 6, // Muy reducido
    borderRadius: 4, // Reducido
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  rejectButtonText: {
    fontSize: 12, // Reducido de 14 a 12
    fontWeight: "500",
    color: "#666",
  },

  acceptButton: {
    flex: 1,
    paddingVertical: 6, // Muy reducido
    borderRadius: 4, // Reducido
    backgroundColor: "#FF69B4",
    alignItems: "center",
  },

  acceptButtonText: {
    fontSize: 12, // Reducido de 14 a 12
    fontWeight: "600",
    color: "#fff",
  },

  // Estados vacíos más compactos
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32, // Reducido
  },

  emptyStateText: {
    fontSize: 16, // Reducido
    fontWeight: "600",
    color: "#666",
    marginTop: 12, // Reducido
    textAlign: "center",
  },

  emptyStateSubtext: {
    fontSize: 13, // Reducido
    color: "#888",
    marginTop: 6, // Reducido
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
    paddingHorizontal: 16, // Reducido
    paddingVertical: 16, // Reducido
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Reducido
  },

  footerContent: {
    gap: 12, // Reducido
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14, // Reducido
    paddingVertical: 12, // Reducido
    borderRadius: 10, // Reducido
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2, // Reducido
    elevation: 2,
  },

  statusText: {
    fontSize: 15, // Reducido
    fontWeight: "600",
    color: "#333",
  },

  statusSwitch: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }], // Tamaño normal
  },

  updateLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6, // Reducido
    backgroundColor: "#fff",
    paddingHorizontal: 14, // Reducido
    paddingVertical: 12, // Reducido
    borderRadius: 10, // Reducido
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  updateLocationText: {
    fontSize: 13, // Reducido
    color: "#FF69B4",
    fontWeight: "500",
  },

  // NUEVOS ESTILOS PARA EDICIÓN DE PRECIO COMPACTA
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

  submitPriceText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 10,
  },

 cancelPriceButton: {
  paddingHorizontal: 8,
  paddingVertical: 6,
  alignItems: "center",
  justifyContent: "center",
},

  cancelPriceText: {
    color: "#666",
    fontSize: 10,
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

priceLabel: {
  fontSize: 9,
  color: "#666",
  marginBottom: 2,
  fontWeight: "500",
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
})

export default styles