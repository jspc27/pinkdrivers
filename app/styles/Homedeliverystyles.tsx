import { Dimensions, Platform, StyleSheet } from "react-native"

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ─── HEADER ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 45 : 25,
    paddingBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(91, 33, 182, 0.1)",
  },
  profileIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDE0F5",
    borderWidth: 2,
    borderColor: "#7B2FBE",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B0F5C",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#7B2FBE",
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

  // ─── LISTA ─────────────────────────────────────────────────────────────────
  requestsList: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },

  // ─── TARJETA DE SOLICITUD ──────────────────────────────────────────────────
  deliveryRequestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#7B2FBE",
  },

  // Header de la tarjeta
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE0F5",
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: 6,
  },
  clientIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EDE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B0F5C",
  },

  // Badge frágil
  fragileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E67E22",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
    gap: 3,
  },
  fragileBadgeSmallText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Badge negociación
  negotiationBadge: {
    backgroundColor: "#9B59B6",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  negotiationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // ─── UBICACIONES ───────────────────────────────────────────────────────────
  locationsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE0F5",
  },
  locationsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C3FC5",
    marginRight: 8,
    marginTop: 4,
  },
  destinationDot: {
    backgroundColor: "#9B59B6",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: "#6C3FC5",
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  locationLabel2: {
    fontSize: 10,
    color: "#9B59B6",
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B0F5C",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  locationNeighborhood: {
    fontSize: 11,
    color: "#9B8BAF",
  },
  locationArrow: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  referencePoint: {
    fontSize: 11,
    color: "#9B8BAF",
    marginTop: 2,
    flexWrap: "wrap",
  },
  referenceLabel: {
    color: "#7B2FBE",
    fontWeight: "600",
  },

  // ─── PRECIO Y NEGOCIACIÓN ──────────────────────────────────────────────────
  priceMainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE0F5",
  },
  priceLeftSection: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7B2FBE",
  },
  priceNegotiationContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  originalPrice: {
    fontSize: 14,
    color: "#B0A0C0",
    textDecorationLine: "line-through",
  },
  counterOfferPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6C3FC5",
  },
  negotiateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#7B2FBE",
    backgroundColor: "#F8F0FF",
  },
  negotiateButtonText: {
    fontSize: 13,
    color: "#7B2FBE",
    fontWeight: "600",
  },
  priceEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceInput: {
    borderWidth: 1.5,
    borderColor: "#C9A7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    width: 90,
    textAlign: "center",
    backgroundColor: "#F8F0FF",
    color: "#3B0F5C",
  },
  submitPriceButton: {
    backgroundColor: "#7B2FBE",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPriceButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#C9A7EB",
    borderRadius: 8,
  },
  waitingResponse: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0E6FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C9A7EB",
    gap: 4,
  },
  waitingResponseText: {
    fontSize: 12,
    color: "#7B2FBE",
    fontWeight: "500",
  },

  // ─── BOTONES ACCIÓN ────────────────────────────────────────────────────────
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#C9A7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9B8BAF",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#7B2FBE",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  acceptButtonDisabled: {
    backgroundColor: "#D4B8E0",
  },
  acceptButtonTextDisabled: {
    color: "#9B8BAF",
  },

  // ─── PEDIDO ACEPTADO ───────────────────────────────────────────────────────
  acceptedDeliveryContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  acceptedDeliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  acceptedDeliveryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B0F5C",
  },
  deliveryStatusBadge: {
    backgroundColor: "#6C3FC5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveryStatusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Tarjeta cliente aceptado
  clientDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  clientIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EDE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#7B2FBE",
  },
  clientDetailInfo: {
    flex: 1,
  },
  clientNameLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B0F5C",
    marginBottom: 6,
  },
  fragileBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E67E22",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  fragileBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contactButtonsLarge: {
    flexDirection: "row",
    gap: 8,
  },
  whatsappButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  callButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7B2FBE",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // Ruta detallada
  routeDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 2,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routePointDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#6C3FC5",
    marginRight: 16,
    marginTop: 4,
  },
  destinationDotLarge: {
    backgroundColor: "#9B59B6",
  },
  routePointInfo: {
    flex: 1,
  },
  routePointLabel: {
    fontSize: 12,
    color: "#7B2FBE",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routePointAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B0F5C",
    marginBottom: 4,
  },
  routePointNeighborhood: {
    fontSize: 13,
    color: "#9B8BAF",
  },
  routePointReference: {
    fontSize: 12,
    color: "#9B8BAF",
    marginTop: 4,
    flexWrap: "wrap",
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#C9A7EB",
    marginLeft: 6,
    marginVertical: 6,
  },

  // Precio acordado
  priceDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    marginHorizontal: 2,
    alignItems: "center",
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  priceDetailLabel: {
    fontSize: 14,
    color: "#9B8BAF",
    marginBottom: 6,
  },
  priceDetailAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7B2FBE",
  },

  // Botones de acción del pedido aceptado
  deliveryActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  cancelDeliveryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#C0392B",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  cancelDeliveryButtonText: {
    color: "#C0392B",
    fontSize: 16,
    fontWeight: "600",
  },
  completeDeliveryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C3FC5",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  completeDeliveryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // ─── ESTADOS VACÍOS ────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7B2FBE",
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9B8BAF",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#7B2FBE",
    marginTop: 12,
    textAlign: "center",
  },
  inactiveStateSubtext: {
    fontSize: 14,
    color: "#9B8BAF",
    marginTop: 6,
    textAlign: "center",
  },

  // ─── FOOTER ────────────────────────────────────────────────────────────────
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
    borderRadius: 12,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B0F5C",
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
    borderRadius: 12,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  updateLocationText: {
    fontSize: 14,
    color: "#7B2FBE",
    fontWeight: "500",
  },
})

export default styles