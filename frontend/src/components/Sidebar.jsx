import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Atualiza o estado quando redimensiona a tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Botão hambúrguer só aparece no mobile */}
      {isMobile && (
        <button
          style={styles.menuButton}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(isMobile
            ? {
                position: "fixed",
                transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                boxShadow: isOpen ? "6px 0 16px rgba(0,0,0,0.5)" : "none",
              }
            : {
                position: "relative",
                transform: "none",
                boxShadow: "none",
              }),
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap"
          rel="stylesheet"
        />

        <h2 style={styles.logo}>LUXELOOM</h2>

        <nav style={styles.nav}>
          <NavLink to="/dashboard" style={styles.link}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/sales" style={styles.link}>
            💰 Vendas
          </NavLink>
          <NavLink to="/products" style={styles.link}>
            📦 Produtos
          </NavLink>
          <NavLink to="/categories" style={styles.link}>
            🏷 Categorias
          </NavLink>
          <NavLink to="/users" style={styles.link}>
            👤 Usuários
          </NavLink>
        </nav>

        <footer style={styles.footer}>
          <small style={styles.copy}>© 2025 LUXELOOM</small>
        </footer>
      </aside>

      {/* Overlay escuro só no mobile */}
      {isMobile && isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

const styles = {
  sidebar: {
    top: 0,
    left: 0,
    width: 240,
    height: "100%",
    position: "sticky", 
    background: "linear-gradient(180deg, #0d0d0d 0%, #181818 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "32px 20px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    color: "#fff",
    transition: "transform 0.3s ease-in-out",
    zIndex: 1000,
  },
  menuButton: {
    position: "fixed",
    top: 18,
    left: 20,
    fontSize: 24,
    color: "#fff",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "50%",
    width: 42,
    height: 42,
    cursor: "pointer",
    zIndex: 1100,
    transition: "background 0.2s ease",
  },
  logo: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 28,
    color: "#fff",
    letterSpacing: "2px",
    textAlign: "center",
    marginBottom: 40,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  link: {
    color: "#e5e5e5",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 15,
    transition: "all 0.25s ease",
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: 20,
  },
  copy: {
    color: "#777",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    zIndex: 900,
  },
};
