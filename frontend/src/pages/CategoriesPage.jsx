import React, { useState, useEffect } from "react"
import {
  findAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/category"
import Pagination from "../components/Pagination"
const INITIAL_FORM = { id: null, name: "" }

export default function CategoriesPage() {
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [currentPage])

  async function fetchCategories() {
    setLoading(true)
    setError(null)
    try {
      const data = await findAllCategories(currentPage - 1, pageSize)

      if (data.content) {
        setCategories(data.content)
        setTotalPages(data.page?.totalPages || 1)
      } else {
        setCategories([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar dados. Verifique o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    // Abre o modal preenchendo o formulário para edição
    setFormData({
      id: category.id,
      name: category.name,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Tem certeza que deseja deletar esta categoria? Esta ação pode afetar produtos associados."
      )
    ) {
      try {
        await deleteCategory(id)
        alert("Categoria deletada com sucesso!")
        fetchCategories() // Recarrega a lista
      } catch (err) {
        setError("Erro ao deletar categoria.")
        console.error(err)
      }
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError("O nome da categoria não pode ser vazio.")
      return
    }

    try {
      if (formData.id) {
        // EDIÇÃO (PUT)
        await updateCategory(formData.id, formData.name)
        alert("Categoria atualizada com sucesso!")
      } else {
        // CRIAÇÃO (POST)
        await createCategory(formData.name)
        alert("Categoria criada com sucesso!")
      }

      // Limpa e fecha
      setFormData(INITIAL_FORM)
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      setError(`Falha na operação: ${err.message || "Erro de API."}`)
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.icon}>🏷️</span>
          <h1 style={styles.title}>Gerenciamento de Categorias</h1>
        </div>
        <button
          style={styles.addButton}
          onClick={() => {
            setFormData(INITIAL_FORM)
            setIsModalOpen(true)
          }}
        >
          + Adicionar Nova Categoria
        </button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ color: "#ccc", textAlign: "center", marginTop: "40px" }}>
          Carregando categorias...
        </p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nome da Categoria</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} style={styles.tr}>
                  <td style={styles.td}>{category.id}</td>
                  <td style={styles.td}>{category.name}</td>
                  <td style={styles.tdAction}>
                    <button
                      style={styles.actionButtonEdit}
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>
                    <button
                      style={styles.actionButtonDelete}
                      onClick={() => handleDelete(category.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>
              {formData.id ? "Editar Categoria" : "Criar Nova Categoria"}
            </h2>
            <form onSubmit={handleFormSubmit} style={styles.modalForm}>
              <input
                style={styles.input}
                placeholder="Nome da Categoria (Ex: Toucas de Cetim)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.submitButton}>
                  {formData.id ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos mantidos do padrão LUXELOOM (Preto e Branco/Dark Mode)
const styles = {
  page: {
    background: "linear-gradient(180deg, #0b0b0b 0%, #141414 100%)",
    color: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "40px 24px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: 20,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 24,
    color: "#9ca3af",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  addButton: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg, #1f2937 0%, #374151 100%)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": { opacity: 0.9 },
  },
  error: {
    backgroundColor: "#ef444430",
    color: "#fca5a5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
    border: "1px solid #ef4444",
  },

  // Estilos da Tabela
  tableContainer: {
    overflowX: "auto",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "15px 12px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: 600,
  },
  tr: {
    transition: "background-color 0.2s ease",
    ":hover": { backgroundColor: "rgba(255,255,255,0.02)" },
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: 14,
    color: "#e5e5e5",
    whiteSpace: "nowrap",
  },
  tdAction: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    gap: 8,
    whiteSpace: "nowrap",
  },
  actionButtonEdit: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#FFFFF0", // Azul para edição
    color: "#000",
    cursor: "pointer",
    fontSize: 12,
  },
  actionButtonDelete: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#535353", // Vermelho para deletar
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },

  // Estilos do Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#1e293b",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: "#f8fafc",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: 10,
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  modalActions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "1px solid #475569",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    background: "#FFFFF0",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
  },
}
