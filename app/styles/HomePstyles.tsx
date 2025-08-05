import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  // ESTILOS EXISTENTES
  container: {
    flex: 1,
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  mapWithKeyboard: {
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  footer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 5,
    minHeight: 140,
  },

  // ESTILOS MEJORADOS PARA LA VISTA DE VIAJE ACEPTADO
  acceptedTripContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

    acceptedTripHeader: {
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 8,
  },

  acceptedTripTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },

   tripStatusBadge: {
    backgroundColor: "#00C851",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#00C851",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  tripStatusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // TARJETA DE INFORMACIÓN DE LA CONDUCTORA
  driverDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

   driverHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  driverAvatarContainer: {
    position: "relative",
    marginRight: 12,
  },

 driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF69B4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  driverOnlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C851",
    borderWidth: 2,
    borderColor: "#fff",
  },

  driverMainInfo: {
    flex: 1,
  },

   driverNameLarge: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  driverRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  driverRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF8A00",
    marginLeft: 4,
  },

  // INFORMACIÓN DEL VEHÍCULO
   vehicleInfoSection: {
    backgroundColor: "#f8f9ff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF69B4",
  },

  vehicleInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  vehicleInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginLeft: 6,
  },

  vehicleDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  vehicleDetailItem: {
    flex: 1,
  },

  vehicleDetailLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  vehicleDetailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    textTransform: "capitalize",
  },

  // Estilos deprecados mantenidos para compatibilidad
  driverDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },

  vehicleInfo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textTransform: "capitalize",
  },

  vehicleDetails: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },

  // BOTÓN DE LLAMAR
  callDriverButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF69B4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 6,
  },

  callDriverButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  // TARJETA DE RUTA
  tripRouteDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  routeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 6,
  },

  tripRoutePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 3,
  },

  tripRoutePointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C851",
    marginRight: 12,
    marginTop: 4,
    shadowColor: "#00C851",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  tripDestinationDot: {
    backgroundColor: "#FF69B4",
    shadowColor: "#FF69B4",
  },

  tripRoutePointInfo: {
    flex: 1,
  },

  tripRoutePointLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "700",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  tripRoutePointAddress: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 3,
    lineHeight: 18,
  },

  tripRoutePointNeighborhood: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },

 tripRouteReference: {
    fontSize: 10,
    color: "#FF69B4",
    fontStyle: "italic",
    fontWeight: "500",
  },

  tripRouteLine: {
    width: 2,
    height: 20,
    backgroundColor: "#e0e0e0",
    marginLeft: 5,
    marginVertical: 8,
    borderRadius: 1,
  },

  // TARJETA DE PRECIO
  tripPriceDetailCard: {
  backgroundColor: "#FF69B4",
  borderRadius: 12,
  padding: 16,
  marginBottom: 8,
  alignItems: "center",
  shadowColor: "#FF69B4",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.2)",
  width: "85%",
  height: "-30%",
  alignSelf: "center",
},


  tripPriceDetailLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  tripPriceDetailAmount: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  tripVehicleType: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "capitalize",
    fontWeight: "600",
    textAlign: "center",
  },

  // BOTONES DE ACCIÓN
  tripActionButtons: {
    marginTop: 8,
  },

  // BOTÓN DE CANCELAR
  cancelTripButtonFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  cancelTripButtonText: {
    color: "#FF5722",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  // TIEMPO ESTIMADO
  estimatedTimeContainer: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },

  estimatedTimeText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },

  // ESTILOS DEPRECADOS MANTENIDOS PARA COMPATIBILIDAD
  cancelTripButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF5722",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  completeTripButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  completeTripButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // RESTO DE ESTILOS EXISTENTES DE LA APP
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    fontSize: 15,
  },

  inputFocused: {
    borderColor: "#FF1493",
    borderWidth: 2,
    shadowColor: "#FF1493",
    shadowOpacity: 0.3,
    backgroundColor: "#fff",
    elevation: 4,
  },

  inputWithKeyboard: {
    marginBottom: 8,
    shadowOpacity: 0.25,
    elevation: 6,
    backgroundColor: "#fff",
  },

  button: {
    width: "100%",
    backgroundColor: "#FF1493",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  avatarMenuContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    zIndex: 10,
  },

  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#B33F8D",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },

  avatarButtonContainer: {
    shadowColor: "#B33F8D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },

  searchContainer: {
    width: "100%",
    position: "relative",
  },

  vehicleSelectionContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },

  vehicleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  vehicleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  selectedVehicleOption: {
    backgroundColor: "#FF1493",
    borderColor: "#FF1493",
  },

  vehicleText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  selectedVehicleText: {
    color: "#fff",
  },

  priceContainer: {
    width: "100%",
    position: "relative",
  },

  priceEstimateText: {
    fontSize: 14,
    color: "#FF1493",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 5,
    backgroundColor: "#fff0f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffb6c1",
  },

  buttonDisabled: {
    backgroundColor: "#ffb6c1",
    shadowOpacity: 0.1,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 20,
  },

  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 21,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "#FF1493",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },

  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  modalScrollView: {
    flex: 1,
  },

  modalInput: {
    width: "100%",
    height: 55,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },

  modalInputFocused: {
    borderColor: "#FF1493",
    borderWidth: 2,
    backgroundColor: "#fff",
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  modalButton: {
    backgroundColor: "#FF1493",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  modalButtonDisabled: {
    backgroundColor: "#ffb6c1",
    shadowOpacity: 0.1,
  },

  pickerContainer: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },

  picker: {
    height: 55,
    width: "100%",
    color: "#333",
  },

  waitingContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  waitingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FF69B4",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  waitingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },

  cancelButton: {
    padding: 5,
  },

  waitingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },

  loadingIndicator: {
    marginBottom: 30,
  },

  waitingMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },

  waitingSubMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
  },

  cancelSearchButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cancelSearchButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },

  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  contraofertaCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  contraofertaDriverName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  contraofertaPlate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },

  contraofertaMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },

  contraofertaPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 30,
  },

  contraofertaButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },

  contraofertaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },

  acceptButton: {
    backgroundColor: "#FF69B4",
  },

  rejectButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  rejectButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;