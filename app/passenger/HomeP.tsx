import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StatusBar, Image, TextInput, Alert, ScrollView, ActivityIndicator, Modal } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/HomePstyles";
import { ExternalPathString, RelativePathString, router, UnknownInputParams } from "expo-router";

const HomeP = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [ubicacion, setUbicacion] = useState("");
    const [destino, setDestino] = useState("");
    const [destinoSuggestions, setDestinoSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [region, setRegion] = useState({
        latitude: 3.4516, // Coordenadas de Cali
        longitude: -76.5319,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [selectedVehicle, setSelectedVehicle] = useState("carro"); // Default to car
    const [showVehicleSelection, setShowVehicleSelection] = useState(false);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
    const [destinoCoords, setDestinoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isDriverModalVisible, setIsDriverModalVisible] = useState(false);
    
    // Animation references
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const suggestionsAnimation = useRef(new Animated.Value(0)).current;
    const vehicleSelectionAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const obtenerUbicacion = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación");
                return;
            }
            
            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 200000,
                    distanceInterval: 50,
                },
                async (location) => {
                    const { latitude, longitude } = location.coords;
                    setRegion((prev) => ({ ...prev, latitude, longitude }));
                    await obtenerDireccion(latitude, longitude);
                }
            );
        };

        const obtenerDireccion = async (lat: number, lng: number) => {
            try {
                let response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, 
                    {
                        headers: {
                            'User-Agent': 'UberGirl (prietojari27@gmail.com)'
                        }
                    }
                );
        
                const textResponse = await response.text();
                console.log(textResponse); 
        
                let data = JSON.parse(textResponse);
                console.log(data);
        
                if (data.address) {
                    setUbicacion(data.address.road || "Ubicación no encontrada");
                } else {
                    setUbicacion("Ubicación no encontrada");
                }
            } catch (error) {
                console.error("Error al obtener la dirección:", error);
                setUbicacion("Error al obtener ubicación");
            }
        };
        
        obtenerUbicacion();
    }, []);

    // Animation for menu appearance
    useEffect(() => {
        Animated.timing(menuAnimation, {
            toValue: menuVisible ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [menuVisible]);

    // Animation for suggestions appearance
    useEffect(() => {
        Animated.timing(suggestionsAnimation, {
            toValue: showSuggestions ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showSuggestions]);

    // Animation for vehicle selection appearance
    useEffect(() => {
        Animated.timing(vehicleSelectionAnimation, {
            toValue: showVehicleSelection ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showVehicleSelection]);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const navigateTo = (screen: string | { pathname: RelativePathString; params?: UnknownInputParams; } | { pathname: ExternalPathString; params?: UnknownInputParams; } | { pathname: `/_sitemap`; params?: UnknownInputParams; } | { pathname: `${"/(tabs)"}/explore` | `/explore`; params?: UnknownInputParams; } | { pathname: `${"/(tabs)"}` | `/`; params?: UnknownInputParams; } | { pathname: `/passenger/EditProfileP`; params?: UnknownInputParams; } | { pathname: `/passenger/HomeP`; params?: UnknownInputParams; } | { pathname: `/passenger/ProfileP`; params?: UnknownInputParams; } | { pathname: `/passenger/RegisterP`; params?: UnknownInputParams; } | { pathname: `/passenger/TripsP`; params?: UnknownInputParams; } | { pathname: `/styles /EditPStyles`; params?: UnknownInputParams; } | { pathname: `/styles /HomePStyles`; params?: UnknownInputParams; } | { pathname: `/styles /IndexStyles`; params?: UnknownInputParams; } | { pathname: `/styles /LoginPStyles`; params?: UnknownInputParams; } | { pathname: `/styles /ProfilePStyles`; params?: UnknownInputParams; } | { pathname: `/styles /RegisterPStyles`; params?: UnknownInputParams; } | { pathname: `/styles /TripsPStyles`; params?: UnknownInputParams; }) => {
        closeMenu();
        router.push(screen as RelativePathString | ExternalPathString | "/_sitemap" | "/(tabs)" | "/(tabs)/explore" | "/explore" | "/" | "/passenger/EditProfileP" | "/passenger/HomeP" | "/passenger/ProfileP" | "/passenger/RegisterP" | "/passenger/TripsP");
    };

    // Search for address suggestions
    const searchDestinoSuggestions = async (text: string) => {
        setDestino(text);
    
        if (text.length > 2) {
            setIsSearching(true);
            setShowSuggestions(true);
    
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&location=3.4516,-76.5319&radius=50000&strictbounds=true&key=AIzaSyB2OJc4ACBmYRNyILaTTCGJicbApIU-cqE`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
    
                const data = await response.json();
    
                // Verificar si la respuesta contiene predicciones
                if (data.status === "OK" && Array.isArray(data.predictions)) {
                    const suggestions = data.predictions.map((item: { description: string; place_id: string }) => ({
                        display_name: item.description,
                        place_id: item.place_id,
                    }));
                    setDestinoSuggestions(suggestions);
                } else {
                    console.error("La respuesta de la API no contiene predicciones:", data);
                    setDestinoSuggestions([]);
                }
            } catch (error) {
                console.error("Error al buscar sugerencias:", error);
                setDestinoSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setShowSuggestions(false);
            setDestinoSuggestions([]);
        }
    };

    // Select a suggestion
    interface Suggestion {
        display_name: string;
        place_id: string;
        lat: number;
        lon: number;
    }
    
    const selectSuggestion = async (suggestion: { display_name: string; place_id: string }) => {
        setDestino(suggestion.display_name);
        setShowSuggestions(false);
    
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=AIzaSyB2OJc4ACBmYRNyILaTTCGJicbApIU-cqE`
            );
    
            const data = await response.json();
    
            if (data.status === "OK" && data.result.geometry) {
                const { lat, lng } = data.result.geometry.location;
                setDestinoCoords({ latitude: lat, longitude: lng });
    
                // Ajustar el mapa para mostrar el destino
                const newRegion = {
                    latitude: (region.latitude + lat) / 2,
                    longitude: (region.longitude + lng) / 2,
                    latitudeDelta: Math.abs(region.latitude - lat) * 2 + 0.05,
                    longitudeDelta: Math.abs(region.longitude - lng) * 2 + 0.05,
                };
    
                setRegion(newRegion);
                calculateRoute(lat, lng);
                setShowVehicleSelection(true);
            } else {
                console.error("No se pudieron obtener las coordenadas del lugar:", data);
            }
        } catch (error) {
            console.error("Error al obtener detalles del lugar:", error);
        }
    };

    // Calculate route between current position and destination
    const calculateRoute = async (destLat: number, destLon: number) => {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${region.longitude},${region.latitude};${destLon},${destLat}?overview=full&geometries=geojson`
            );
            
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                // Get the coordinates of the route
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map((coord: any[]) => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                
                setRouteCoordinates(coords);
                
                // Calculate distance in kilometers
                const distanceInMeters = route.distance;
                const distanceInKm = distanceInMeters / 1000;
                setRouteDistance(distanceInKm);
                
                // Calculate price based on vehicle type and distance
                calculatePrice(distanceInKm);
            }
        } catch (error) {
            console.error("Error al calcular la ruta:", error);
        }
    };

    // Calculate price based on vehicle type and distance
    const calculatePrice = (distance: number | null) => {
        let basePrice = 3500; // Tarifa mínima hasta 2.6 km
        let pricePerKm;
        
        if (selectedVehicle === "carro") {
            pricePerKm = 1700; // Costo por km adicional para carro
        } else {
            pricePerKm = 1300; // Costo por km adicional para moto y motocarro
        }
        
        let totalPrice;
        
        if (distance !== null && distance <= 2.6) {
            totalPrice = basePrice;
        } else {
            if (distance !== null) {
                const additionalDistance = distance - 2.6;
                totalPrice = basePrice + (additionalDistance * pricePerKm);
            } else {
                totalPrice = basePrice; // Default to base price if distance is null
            }
        }
        
        setPriceEstimate(Math.round(totalPrice));
    };

    // Select vehicle type
    const selectVehicle = (vehicleType: React.SetStateAction<string>) => {
        setSelectedVehicle(vehicleType);
        calculatePrice(routeDistance);
    };

     // Información de la conductora (para pruebas)
     const driverInfo = {
        name: "Laura Gómez",
        vehicleModel: "Toyota Corolla",
        vehicleColor: "Rojo",
        licensePlate: "ABC-123",
        profilePicture: "https://i.pravatar.cc/150?img=47", // Imagen de prueba
    };

    const openDriverModal = () => {
        setIsDriverModalVisible(true);
    };

    const closeDriverModal = () => {
        setIsDriverModalVisible(false);
    };


    return (
        <LinearGradient colors={['#CF5BA9', '#B33F8D']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
             {/* Botón para probar la ventana emergente */}
             <TouchableOpacity
                style={styles.testButton}
                onPress={openDriverModal}
            >
                <Text style={styles.testButtonText}>Probar ventana de conductora</Text>
            </TouchableOpacity>

            {/* Modal de información de la conductora */}
            <Modal
                visible={isDriverModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeDriverModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.driverModalContainer}>
                        {/* Foto de perfil */}
                        <Image
                            source={{ uri: driverInfo.profilePicture }}
                            style={styles.driverProfilePicture}
                        />

                        {/* Información de la conductora */}
                        <Text style={styles.driverName}>{driverInfo.name}</Text>
                        <Text style={styles.driverVehicle}>
                            {driverInfo.vehicleModel} - {driverInfo.vehicleColor}
                        </Text>
                        <Text style={styles.driverLicensePlate}>
                            Placa: {driverInfo.licensePlate}
                        </Text>

                        {/* Botón para cerrar */}
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={closeDriverModal}
                        >
                            <Text style={styles.closeModalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Mapa como fondo */}
            <View style={styles.mapContainer}>
                <MapView style={styles.map} region={region}>
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                    {destinoCoords && (
                        <Marker 
                            coordinate={destinoCoords}
                            pinColor="#FF1493"
                        />
                    )}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={4}
                            strokeColor="#FF1493"
                        />
                    )}
                </MapView>
            </View>
            
            
            {/* Overlay to close menu when clicking outside */}
            {menuVisible && (
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    activeOpacity={1} 
                    onPress={closeMenu}
                />
            )}
            
            {/* Avatar y menú desplegable mejorado */}
            <View style={styles.avatarMenuContainer}>
                <TouchableOpacity 
                    onPress={() => navigateTo("/passenger/ProfileP")}
                    style={styles.avatarButtonContainer}
                    activeOpacity={0.8}
                >
                    <Image 
                        source={{ uri: "https://i.pravatar.cc/150?img=47" }} 
                        style={styles.avatarSmall} 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TextInput
                    style={styles.input}
                    placeholder="Ubicación actual"
                    placeholderTextColor="#666"
                    value={ubicacion}
                    editable={false}
                />
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="¿A dónde quieres ir?"
                        placeholderTextColor="#666"
                        value={destino}
                        onChangeText={searchDestinoSuggestions}
                        onFocus={() => destino.length > 2 && setShowSuggestions(true)}
                    />
                    {isSearching && (
                        <ActivityIndicator 
                            style={styles.searchingIndicator} 
                            color="#FF1493" 
                            size="small" 
                        />
                    )}
                </View>
                
                {/* Destination suggestions */}
                {showSuggestions && (
                    <Animated.View 
                        style={[
                            styles.suggestionsContainer,
                            {
                                opacity: suggestionsAnimation,
                                transform: [{ translateY: suggestionsAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [10, 0]
                                })}]
                            }
                        ]}
                    >
                        <ScrollView style={styles.suggestionsList}>
                            {destinoSuggestions.length > 0 ? (
                                destinoSuggestions.map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.suggestionItem}
                                        onPress={() => selectSuggestion(suggestion)}
                                    >
                                        <Text style={styles.suggestionText} numberOfLines={1}>
                                            {suggestion.display_name}
                                        </Text>
                                        <Text style={styles.suggestionSubtext} numberOfLines={1}>
                                            {suggestion.display_name.split(',').slice(1, 3).join(', ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : isSearching ? (
                                <View style={styles.noSuggestionsContainer}>
                                    <ActivityIndicator color="#FF1493" />
                                    <Text style={styles.noSuggestionsText}>Buscando direcciones...</Text>
                                </View>
                            ) : (
                                <View style={styles.noSuggestionsContainer}>
                                    <Text style={styles.noSuggestionsText}>No se encontraron direcciones</Text>
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                )}
                
                {/* Vehicle selection and price */}
                {showVehicleSelection && (
                    <Animated.View 
                        style={[
                            styles.vehicleSelectionContainer,
                            {
                                opacity: vehicleSelectionAnimation,
                                transform: [{ translateY: vehicleSelectionAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [10, 0]
                                })}]
                            }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Elige tu vehículo</Text>
                        <View style={styles.vehicleOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.vehicleOption,
                                    selectedVehicle === "moto" && styles.selectedVehicleOption
                                ]}
                                onPress={() => selectVehicle("moto")}
                            >
                                <FontAwesome5 
                                    name="motorcycle" 
                                    size={28} 
                                    color={selectedVehicle === "moto" ? "#fff" : "#333"} 
                                />
                                <Text 
                                    style={[
                                        styles.vehicleText,
                                        selectedVehicle === "moto" && styles.selectedVehicleText
                                    ]}
                                >
                                    Moto
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[
                                    styles.vehicleOption,
                                    selectedVehicle === "carro" && styles.selectedVehicleOption
                                ]}
                                onPress={() => selectVehicle("carro")}
                            >
                                <FontAwesome 
                                    name="car" 
                                    size={28} 
                                    color={selectedVehicle === "carro" ? "#fff" : "#333"} 
                                />
                                <Text 
                                    style={[
                                        styles.vehicleText,
                                        selectedVehicle === "carro" && styles.selectedVehicleText
                                    ]}
                                >
                                    Carro
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[
                                    styles.vehicleOption,
                                    selectedVehicle === "motocarro" && styles.selectedVehicleOption
                                ]}
                                onPress={() => selectVehicle("motocarro")}
                            >
                                <FontAwesome 
                                    name="truck" 
                                    size={28} 
                                    color={selectedVehicle === "motocarro" ? "#fff" : "#333"} 
                                />
                                <Text 
                                    style={[
                                        styles.vehicleText,
                                        selectedVehicle === "motocarro" && styles.selectedVehicleText
                                    ]}
                                >
                                    Motocarro
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        {priceEstimate && (
                            <View style={styles.priceEstimateContainer}>
                                <Text style={styles.priceEstimateLabel}>Precio estimado:</Text>
                                <Text style={styles.priceEstimateValue}>
                                    ${priceEstimate.toLocaleString('es-CO')} COP
                                </Text>
                                {routeDistance && (
                                    <Text style={styles.distanceText}>
                                        Distancia: {routeDistance.toFixed(1)} km
                                    </Text>
                                )}
                            </View>
                        )}
                    </Animated.View>
                )}
                
                <TouchableOpacity 
                    style={[
                        styles.button, 
                        (!destinoCoords || !selectedVehicle) && styles.buttonDisabled
                    ]}
                    disabled={!destinoCoords || !selectedVehicle}
                >
                    <Text style={styles.buttonText}>Confirmar viaje</Text>
                </TouchableOpacity>
            </View>
           
        </LinearGradient>
    );
};

export default HomeP;