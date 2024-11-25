import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Icon from "react-native-vector-icons/Ionicons";
import { GOOGLE_CLIENT_ID } from "@env";

// Confirmar que GOOGLE_CLIENT_ID se está cargando
console.log("Google Client ID:", GOOGLE_CLIENT_ID);

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Alternar entre inicio de sesión y registro
  const [message, setMessage] = useState(null); // Mensajes de éxito o error
  const [user, setUser] = useState(null); // Usuario autenticado

  // Configuración de Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (!id_token) {
        setMessage("No se recibió un token de ID válido.");
        return;
      }
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUser(userCredential.user);
          setMessage(`Inicio de sesión exitoso con Google: ${userCredential.user.email}`);
        })
        .catch((error) => {
          setMessage(`Error al iniciar sesión con Google: ${error.message}`);
        });
    }
  }, [response]);
  

  const handleAuth = async () => {
    try {
      if (isLogin) {
        console.log("Intentando iniciar sesión...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Inicio de sesión exitoso:", userCredential);
        setMessage(`Bienvenido: ${userCredential.user.email}`);
        setUser(userCredential.user);
      } else {
        console.log("Intentando registrar usuario...");
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Usuario registrado con éxito.");
        setMessage("Usuario registrado con éxito. Ahora puedes iniciar sesión.");
        setEmail("");
        setPassword("");
        setIsLogin(true); // Cambiar a modo de inicio de sesión tras registrar
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      const errorMessage = error.message.includes("auth/")
        ? error.message.split("auth/")[1].replace(/-/g, " ")
        : error.message;
      setMessage(`Error: ${errorMessage}`);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>¡Bienvenido, {user.displayName || user.email}!</Text>
          <Text style={styles.message}>Sesión iniciada correctamente.</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              console.log("Cerrando sesión...");
              auth.signOut().then(() => {
                setUser(null);
                console.log("Sesión cerrada.");
              });
            }}
          >
            <Icon name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>{isLogin ? "Inicia Sesión" : "Regístrate"} con Firebase</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Icon name={isLogin ? "log-in-outline" : "person-add-outline"} size={20} color="#fff" />
            <Text style={styles.authButtonText}>
              {isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              console.log("Iniciando sesión con Google...");
              promptAsync();
            }}
            disabled={!request}
          >
            <Icon name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Iniciar Sesión con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              console.log("Cambiando modo de autenticación...");
              setIsLogin(!isLogin);
            }}
          >
            <Text style={styles.toggleButtonText}>
              Cambiar a {isLogin ? "Registro" : "Inicio de Sesión"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  message: {
    marginBottom: 20,
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b5998",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  authButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db4437",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  googleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  toggleButton: {
    marginTop: 10,
  },
  toggleButtonText: {
    color: "#555",
    textDecorationLine: "underline",
  },
});