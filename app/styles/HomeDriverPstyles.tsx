import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    map: {
        flex: 1,
    },
    menuButton: {
        position: "absolute",
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 12,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 6,
    },
    sidebar: {
        position: "absolute",
        top: 0,
        left: -300, // Hidden initially
        width: 280,
        height: "100%",
        backgroundColor: "#fff",
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderRightWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 0 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 10,
    },
    closeButton: {
        position: "absolute",
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 15,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 10,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 11,
    },
    mapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.15)',
        zIndex: 5,
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
        borderColor: "#FFE4F3",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    avatarButtonContainer: {
        shadowColor: "#FFE4F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9,
    },
    
    // Nuevos estilos para la vista de la conductora
    driverFooter: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#FFE4F3",
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 35 : 25,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 10,
        zIndex: 5,
    },
    footerContent: {
        width: "100%",
        alignItems: "center",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 15,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
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
    driverLocationText: {
        fontSize: 14,
        color: "#444",
        textAlign: "center",
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    driverStatusInfo: {
        fontSize: 15,
        fontWeight: "500",
        textAlign: "center",
    },
    
   
    
   // Estilos para el nuevo diseño de solicitud
rideRequestContainer: {
  position: 'absolute',
  bottom: 200,
  left: 20,
  right: 20,
  backgroundColor: '#fff',
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 6,
},
rideRequestHeader: {
        marginBottom: 12,
    },

headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 12, // Cambiar de 16 a 12
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},

rideRequestTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
},

priceContainer: {
  alignItems: 'flex-end',
},

//precio
priceAmount: {
  fontSize: 30,
  fontWeight: 'bold',
  color: '#ff69B4',
},

priceLabel: {
  fontSize: 12,
  color: '#666',
  marginTop: -2,
},

passengerSection: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 12, // Cambiar de 16 a 12
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},

passengerInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},

passengerAvatar: {
  width: 44,
  height: 44,
  borderRadius: 22,
  marginRight: 12,
},

passengerName: {
  fontSize: 16,
  fontWeight: '500',
  color: '#333',
},

contactActions: {
  flexDirection: 'row',
  gap: 12,
},

whatsappButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#f8f8f8',
},

callButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#f8f8f8',
},

routeSection: {
  paddingHorizontal: 20,
  paddingVertical: 12, // Cambiar de 16 a 12
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},

routeContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

routeIndicator: {
  alignItems: 'center',
  marginRight: 16,
  paddingTop: 8,
},

pickupDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#4CAF50',
},

routeLine: {
  width: 2,
  height: 30, // Cambiar de 40 a 30
  backgroundColor: '#ddd',
  marginVertical: 4,
},



destinationDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#ff69B4',
},

locationTexts: {
  flex: 1,
},

locationItem: {
  marginBottom: 14, // Cambiar de 20 a 14
},

locationLabel: {
  fontSize: 12,
  color: '#666',
  marginBottom: 4,
},

locationAddress: {
  fontSize: 14,
  color: '#333',
  fontWeight: '400',
},

tripInfoSection: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingVertical: 10, // Cambiar de 12 a 10
  gap: 24,
},

tripInfoItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

tripInfoText: {
  fontSize: 14,
  color: '#666',
},

actionButtonsContainer: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingVertical: 12, // Cambiar de 16 a 12
  gap: 12,
},

declineButton: {
  flex: 1,
  paddingVertical: 12, // Cambiar de 14 a 12
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  alignItems: 'center',
},

declineButtonText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#666',
},

acceptButton: {
  flex: 1,
  paddingVertical: 12, // Cambiar de 14 a 12
  borderRadius: 8,
  backgroundColor: '#ff69B4',
  alignItems: 'center',
},

acceptButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#fff',
},
});

export default styles;