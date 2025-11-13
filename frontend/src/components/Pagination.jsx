import React from "react"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div style={styles.paginationContainer}>
      <button
        style={styles.paginationButton}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      <span style={styles.paginationInfo}>
        Página {currentPage} de {totalPages}
      </span>

      <button
        style={styles.paginationButton}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Próxima
      </button>
    </div>
  )
}

// Mesmos estilos que combinam com a página
const styles = {
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  paginationButton: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "linear-gradient(90deg, #1f2937 0%, #374151 100%)",
    color: "#f1f5f9",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  paginationInfo: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
  },
}
