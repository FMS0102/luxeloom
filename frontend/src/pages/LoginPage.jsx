import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import {USERS_API} from "../api/user";  

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // Cadastro público de usuário
        const res = await fetch(`${USERS_API}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) throw new Error("Falha ao cadastrar usuário");

        alert("Cadastro realizado com sucesso!");
        setIsRegister(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        // Login normal
        const data = await login(email, password);
        localStorage.setItem("accessToken", data.accessToken);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        isRegister
          ? "Erro ao cadastrar. Verifique os dados."
          : "Usuário ou senha inválidos"
      );
    }
  }

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap"
        rel="stylesheet"
      />

      <div style={styles.card}>
        <h1 style={styles.logo}>LUXELOOM</h1>
        <h2 style={styles.title}>{isRegister ? "Crie sua conta" : "Acesse sua conta"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            {isRegister ? "Cadastrar" : "Entrar"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>

        <p style={styles.toggle}>
          {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={styles.toggleBtn}
          >
            {isRegister ? "Fazer login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(180deg, #0d0d0d 0%, #181818 100%)",
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.02)",
    padding: "40px 32px",
    borderRadius: 16,
    width: "90%",
    maxWidth: 360,
    boxShadow: "0 0 25px rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
  },
  logo: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 32,
    letterSpacing: 2,
    color: "#fff",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: "#b3b3b3",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  button: {
    width: "100%",
    padding: 12,
    border: "none",
    borderRadius: 8,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.3) 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    marginTop: 10,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  error: {
    color: "#ef4444",
    marginTop: 8,
    fontSize: 13,
  },
  toggle: {
    marginTop: 20,
    fontSize: 13,
    color: "#bbb",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
    marginLeft: 6,
  },
};
