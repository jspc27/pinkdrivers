import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EEFF",
  },

  // ─── HEADER ────────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EDE0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  // ─── CONTENIDO ─────────────────────────────────────────────────────────────
  profileContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ─── SECCIÓN INFO ──────────────────────────────────────────────────────────
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B0F5C",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE0F5",
    gap: 14,
  },
  infoText: {
    fontSize: 15,
    color: "#555",
    flex: 1,
  },

  // ─── OPCIONES ──────────────────────────────────────────────────────────────
  optionsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#3B0F5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE0F5",
  },
  optionText: {
    fontSize: 15,
    color: "#3B0F5C",
    fontWeight: "500",
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 15,
    color: "#7B2FBE",
    fontWeight: "600",
  },
});

export default styles;