import { Dimensions, Platform, StyleSheet } from "react-native";
import { rf, rs, rw } from "../utils/responsive";

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
  fontWeight: "700",      
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
  fontSize: 12,
  color: "#5C3D8F",       
  fontWeight: "500",
  marginTop: 1,
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
    paddingVertical: rs(8),
    paddingHorizontal: rs(4),
  },
  acceptedDeliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(16),
    paddingHorizontal: rs(4),
    flexWrap: "wrap",
    gap: rs(8),
  },
  acceptedDeliveryTitle: {
    fontSize: rf(20),          
    fontWeight: "bold",
    color: "#3B0F5C",
    flexShrink: 1,
  },
  deliveryStatusBadge: {
    backgroundColor: "#6C3FC5",
    paddingHorizontal: rs(10),
    paddingVertical: rs(5),
    borderRadius: rs(20),
    flexShrink: 1,
  },
  deliveryStatusText: {
    color: "#fff",
    fontSize: rf(11),          
    fontWeight: "600",
  },

  // Tarjeta cliente aceptado
  clientDetailCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(14),
    marginBottom: rs(10),
    marginHorizontal: rs(2),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  clientIconLarge: {
    width: rw(56),            
    height: rw(56),
    borderRadius: rw(28),
    backgroundColor: "#EDE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(12),
    borderWidth: 2,
    borderColor: "#7B2FBE",
  },
  clientDetailInfo: {
    flex: 1,
  },
  clientNameLarge: {
    fontSize: rf(18),
    fontWeight: "bold",
    color: "#3B0F5C",
    marginBottom: rs(6),
  },
  fragileBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E67E22",
    paddingVertical: rs(3),
    paddingHorizontal: rs(10),
    borderRadius: rs(10),
    gap: rs(4),
    alignSelf: "flex-start",
    marginBottom: rs(8),
  },
  fragileBadgeText: {
    color: "#fff",
    fontSize: rf(11),
    fontWeight: "bold",
  },
  contactButtonsLarge: {
    flexDirection: "row",
    gap: rs(8),
    flexWrap: "wrap",          
  },
  whatsappButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    gap: rs(5),
    flex: 1,           
  },
  callButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7B2FBE",
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    gap: rs(5),
    flex: 1,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: rf(12),
    fontWeight: "600",
  },

  // Ruta detallada
  routeDetailCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(14),
    marginBottom: rs(10),
    marginHorizontal: rs(2),
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
    width: rs(12),
    height: rs(12),
    borderRadius: rs(6),
    backgroundColor: "#6C3FC5",
    marginRight: rs(14),
    marginTop: rs(4),
  },
  destinationDotLarge: {
    backgroundColor: "#9B59B6",
  },
  routePointInfo: {
    flex: 1,
  },
  routePointLabel: {
    fontSize: rf(10),
    color: "#7B2FBE",
    fontWeight: "700",
    marginBottom: rs(3),
    letterSpacing: 0.5,
  },
  routePointAddress: {
    fontSize: rf(15),
    fontWeight: "600",
    color: "#3B0F5C",
    marginBottom: rs(3),
  },
  routePointNeighborhood: {
    fontSize: rf(12),
    color: "#9B8BAF",
  },
  routePointReference: {
    fontSize: rf(11),
    color: "#9B8BAF",
    marginTop: rs(4),
    flexWrap: "wrap",
  },
  routeLine: {
    width: 2,
    height: rs(24),
    backgroundColor: "#C9A7EB",
    marginLeft: rs(5),
    marginVertical: rs(5),
  },

  // Precio acordado
  priceDetailCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(16),
    marginBottom: rs(14),
    marginHorizontal: rs(2),
    alignItems: "center",
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  priceDetailLabel: {
    fontSize: rf(13),
    color: "#9B8BAF",
    marginBottom: rs(4),
  },
  priceDetailAmount: {
    fontSize: rf(28),          
    fontWeight: "bold",
    color: "#7B2FBE",
  },

  // Botones de acción del pedido aceptado
  deliveryActionButtons: {
    flexDirection: "row",
    gap: rs(10),
    marginTop: rs(4),
    paddingHorizontal: rs(2),
  },
  cancelDeliveryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#C0392B",
    paddingVertical: rs(14),
    borderRadius: rs(12),
    gap: rs(6),
  },
  cancelDeliveryButtonText: {
    color: "#C0392B",
    fontSize: rf(14),
    fontWeight: "600",
  },
  completeDeliveryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C3FC5",
    paddingVertical: rs(14),
    borderRadius: rs(12),
    gap: rs(6),
  },
  completeDeliveryButtonText: {
    color: "#fff",
    fontSize: rf(14),
    fontWeight: "600",
  },

  // ─── REFERENCIA Y NOTAS (pedido aceptado) ──────────────────────────────────
  referencePill: {
    marginLeft: rs(26),
    marginTop: rs(6),
    marginBottom: rs(6),
    backgroundColor: "#F5F0FF",
    borderRadius: rs(8),
    padding: rs(8),
    borderLeftWidth: 3,
    borderLeftColor: "#C9A7EB",
  },
  referencePillText: {
    fontSize: rf(11),
    color: "#9B8BAF",
    flexWrap: "wrap",
  },
  referencePillLabel: {
    fontWeight: "600",
    color: "#7B2FBE",
  },
  // ─── ESTADOS VACÍOS ────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(32),
  },
  emptyStateText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#7B2FBE",
    marginTop: rs(12),
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: rf(13),
    color: "#9B8BAF",
    marginTop: rs(6),
    textAlign: "center",
  },
  inactiveState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(32),
  },
  inactiveStateText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#7B2FBE",
    marginTop: rs(12),
    textAlign: "center",
  },
  inactiveStateSubtext: {
    fontSize: rf(13),
    color: "#9B8BAF",
    marginTop: rs(6),
    textAlign: "center",
  },

  // ─── FOOTER ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    paddingBottom: Platform.OS === "ios" ? rs(30) : rs(20),
  },
  footerContent: {
    gap: rs(12),
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
    borderRadius: rs(12),
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusText: {
    fontSize: rf(15),
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
    gap: rs(6),
    backgroundColor: "#fff",
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
    borderRadius: rs(12),
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  updateLocationText: {
    fontSize: rf(13),
    color: "#7B2FBE",
    fontWeight: "500",
  },
  // ─── NOTAS EN TARJETA DE SOLICITUD ────────────────────────────────────────
  notasCardBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#F0E6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderLeftWidth: 3,
    borderLeftColor: "#7B2FBE",
  },
  notasCardText: {
    fontSize: 12,
    color: "#3B0F5C",
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 17,
  },
  notasCardLabel: {
    fontWeight: "700",
    color: "#7B2FBE",
  },
})

export default styles