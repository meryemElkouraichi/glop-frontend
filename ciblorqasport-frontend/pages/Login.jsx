import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("spectator");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }

    login({ username, role });

    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "athlete":
        navigate("/athlete");
        break;
      case "referee":
        navigate("/referee");
        break;
      case "volunteer":
        navigate("/volunteer");
        break;
      case "spectator":
      default:
        navigate("/spectator");
        break;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CiblOrgaSport - Connexion</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <label style={styles.label}>Nom d'utilisateur</label>
        <input
          type="text"
          placeholder="Entrez votre nom"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Rôle</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="spectator">Spectateur / Spectatrice</option>
          <option value="athlete">Athlète</option>
          <option value="referee">Commissaire sportif</option>
          <option value="volunteer">Volontaire</option>
          <option value="admin">Administrateur</option>
        </select>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "30px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
  },
  select: {
    padding: "8px",
    fontSize: "16px",
  },
  button: {
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
};
