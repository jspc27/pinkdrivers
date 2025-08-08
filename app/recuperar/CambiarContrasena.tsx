import { Feather, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import React, { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

export default function CambiarContrasena() {
  const router = useRouter()
  const [telefono, setTelefono] = useState("")
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null)
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null)

  // Validaciones simples
  const phoneValid = useMemo(() => telefono.replace(/\D/g, "").length >= 10, [telefono])
  const passValid = useMemo(() => nuevaContrasena.length >= 6, [nuevaContrasena])
  const formValid = phoneValid && passValid

  const onTelefonoChange = (t: string) => {
    // Solo dígitos
    const digits = t.replace(/\D/g, "")
    setTelefono(digits)
    if (digits.length === 0) setErrorTelefono("Ingresa tu número de teléfono.")
    else if (digits.length < 10) setErrorTelefono("El teléfono debe tener al menos 10 dígitos.")
    else setErrorTelefono(null)
  }

  const onContrasenaChange = (t: string) => {
    setNuevaContrasena(t)
    if (t.length === 0) setErrorContrasena("Ingresa una nueva contraseña.")
    else if (t.length < 6) setErrorContrasena("La contraseña debe tener al menos 6 caracteres.")
    else setErrorContrasena(null)
  }

  const cambiarContrasena = async () => {
    if (!formValid) {
      if (!phoneValid) setErrorTelefono("El teléfono debe tener al menos 10 dígitos.")
      if (!passValid) setErrorContrasena("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    try {
      setCargando(true)
      const res = await fetch("https://www.pinkdrivers.com/api-rest/index.php?action=cambiar_contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, nuevaClave: nuevaContrasena }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        Alert.alert("Contraseña actualizada", "Ahora puedes iniciar sesión", [
          {
            text: "Ir al login",
            onPress: () => router.replace("/"),
          },
        ])
      } else {
        Alert.alert("Error", data?.message || "No se pudo cambiar la contraseña.")
      }
    } catch (error) {
      Alert.alert("Error", "Algo salió mal. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <LinearGradient
      colors={["#ffe4ef", "#ffd1ea", "#ffb3db"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
              <Text style={styles.title}>Cambiar contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa el teléfono registrado y establece tu nueva contraseña para acceder nuevamente.
              </Text>
            </View>

            {/* Tarjeta del formulario */}
            <View style={styles.card} accessibilityLabel="Formulario para cambiar contraseña" accessible>
              {/* Teléfono */}
              <Text style={styles.label}>Teléfono registrado</Text>
              <View style={[styles.inputContainer, errorTelefono ? styles.inputError : undefined]}>
                <Feather name="phone" size={20} color="#ec4899" style={styles.inputIcon} />
                <TextInput
                  value={telefono}
                  onChangeText={onTelefonoChange}
                  placeholder="Ej: 3111234567"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={15}
                  style={styles.input}
                  accessibilityLabel="Campo de teléfono"
                  textContentType="telephoneNumber"
                  returnKeyType="next"
                />
              </View>
              {errorTelefono ? <Text style={styles.errorText}>{errorTelefono}</Text> : null}

              {/* Contraseña */}
              <Text style={[styles.label, { marginTop: 16 }]}>Nueva contraseña</Text>
              <View style={[styles.inputContainer, errorContrasena ? styles.inputError : undefined]}>
                <Feather name="lock" size={20} color="#ec4899" style={styles.inputIcon} />
                <TextInput
                  value={nuevaContrasena}
                  onChangeText={onContrasenaChange}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!mostrarContrasena}
                  style={styles.input}
                  accessibilityLabel="Campo de nueva contraseña"
                  textContentType="newPassword"
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setMostrarContrasena((s) => !s)}
                  accessibilityRole="button"
                  accessibilityLabel={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  hitSlop={8}
                >
                  <Ionicons name={mostrarContrasena ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                </Pressable>
              </View>
              {errorContrasena ? <Text style={styles.errorText}>{errorContrasena}</Text> : null}

              {/* Botón */}
              <Pressable
                onPress={cambiarContrasena}
                disabled={cargando || !formValid}
                style={({ pressed }) => [
                  styles.button,
                  !formValid || cargando ? styles.buttonDisabled : undefined,
                  pressed ? { transform: [{ scale: 0.98 }] } : undefined,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cambiar contraseña"
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Cambiar contraseña</Text>
                )}
              </Pressable>

              {/* Nota de ayuda */}
              <View style={styles.helperRow}>
                <Feather name="info" size={14} color="#a1a1aa" />
                <Text style={styles.helperText}>Usa una contraseña segura que recuerdes fácilmente.</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#ec4899",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#334155", marginTop: 6, lineHeight: 20 },
  card: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#fce7f3",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 16,
    paddingVertical: 4,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff1f2",
  },
  errorText: { color: "#ef4444", marginTop: 6, fontSize: 12 },
  button: {
    marginTop: 20,
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  helperRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helperText: { color: "#a1a1aa", fontSize: 12 },
})