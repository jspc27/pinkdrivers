import { Dimensions, Platform, StyleSheet } from "react-native"

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  // ... (all existing styles)
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

  // UPDATED STYLES FOR ACCEPTED TRIP VIEW - DiDi Style
  acceptedTripContainer: {
    flex: 1,
    paddingVertical: 20,
  },

  acceptedTripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 5,
  },

  acceptedTripTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },

  tripStatusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tripStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  driverDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  driverDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },

  driverNameLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  // NEW STYLES FOR VEHICLE INFO
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

  callDriverButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF69B4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  callDriverButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  tripRouteDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  tripRoutePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  tripRoutePointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginRight: 16,
    marginTop: 4,
  },

  tripDestinationDot: {
    backgroundColor: "#FF69B4",
  },

  tripRoutePointInfo: {
    flex: 1,
  },

  tripRoutePointLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },

  tripRoutePointAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  tripRoutePointNeighborhood: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },

  tripRouteReference: {
    fontSize: 12,
    color: "#FF69B4",
    fontStyle: "italic",
  },

  tripRouteLine: {
    width: 2,
    height: 30,
    backgroundColor: "#ddd",
    marginLeft: 5,
    marginVertical: 10,
  },

  tripPriceDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  tripPriceDetailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },

  tripPriceDetailAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 8,
  },

  tripVehicleType: {
    fontSize: 14,
    color: "#888",
    textTransform: "capitalize",
  },

  tripActionButtons: {
    marginTop: 10,
  },

  // UPDATED: Single cancel button that takes full width
  cancelTripButtonFull: {
    width: "100%",
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

  cancelTripButtonText: {
    color: "#FF5722",
    fontSize: 16,
    fontWeight: "600",
  },

  // Keep existing styles for backward compatibility
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

  // ... (rest of existing styles)
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

  
})

export default styles
