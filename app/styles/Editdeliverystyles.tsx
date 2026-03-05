import { Platform, StyleSheet } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EEFF",
  },

  // ─── HEADER ────────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  saveButton: {
    padding: 4,
    minWidth: 36,
    alignItems: "center",
  },

  // ─── LOADING ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#7B2FBE",
    fontWeight: "500",
  },

  // ─── FORMULARIO ────────────────────────────────────────────────────────────
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Avatar
  photoSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EDE0F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#C9A7EB",
  },

  // Campos
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5A189A",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EEFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C9A7EB",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#3B0F5C",
  },

  // ─── OVERLAY GUARDANDO ─────────────────────────────────────────────────────
  savingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(91, 33, 182, 0.92)",
    paddingVertical: 16,
    alignItems: "center",
  },
  savingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
})

export default styles