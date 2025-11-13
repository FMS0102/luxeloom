import React, { useState, useEffect } from "react"
import { findAllUsers, createUser, updateUser, deleteUser } from "../api/user"

const INITIAL_FORM = {
  id: null,
  name: "",
  email: "",
  password: "",
  role: "USER",
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await findAllUsers()
      // Assumindo que a resposta é um array de objetos de usuário
      setUsers(data)
    } catch (err) {
      setError("Erro ao carregar usuários. Verifique o servidor.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    // Abre o modal preenchendo o formulário para edição
    setFormData({
      name: user.name,
      email: user.email,
      // Não carregamos a senha por segurança
      password: "",
      role: user.role,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (email) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await deleteUser(email)
        alert("Usuário deletado com sucesso!")
        fetchUsers() // Recarrega a lista
      } catch (err) {
        setError("Erro ao deletar usuário.")
        console.error(err)
      }
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const dataToSend = { ...formData }
    // Remove a senha se estiver vazia e estiver editando
    if (formData.id && !dataToSend.password) {
      delete dataToSend.password
    }

    try {
      if (formData.id) {
        // EDIÇÃO (PUT/PATCH)
        await updateUser(formData.id, dataToSend)
        alert("Usuário atualizado com sucesso!")
      } else {
        // CRIAÇÃO (POST)
        if (!dataToSend.password) {
          setError("A senha é obrigatória para novos usuários.")
          return
        }
        await createUser(dataToSend)
        alert("Usuário criado com sucesso!")
      }

      // Limpa e fecha
      setFormData(INITIAL_FORM)
      setIsModalOpen(false)
      fetchUsers()
    } catch (err) {
      setError(`Falha na operação: ${err.message || "Erro de API."}`)
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.icon}>👤</span>
          <h1 style={styles.title}>Gerenciamento de Usuários</h1>
        </div>
        <button
          style={styles.addButton}
          onClick={() => {
            setFormData(INITIAL_FORM)
            setIsModalOpen(true)
          }}
        >
          + Adicionar Novo Usuário
        </button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ color: "#ccc", textAlign: "center", marginTop: "40px" }}>
          Carregando usuários...
        </p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Função</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* REMOVENDO A VALIDAÇÃO EXTRA NO MAP - FOCO APENAS NO LAYOUT */}
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.role || "USER"}</td>
                  <td style={styles.tdAction}>
                    <button
                      style={styles.actionButtonEdit}
                      onClick={() => handleEdit(user)}
                    >
                      Editar
                    </button>
                    <button
                      style={styles.actionButtonDelete}
                      onClick={() => handleDelete(user.id)}
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

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>
              {formData.id ? "Editar Usuário" : "Criar Novo Usuário"}
            </h2>
            <form onSubmit={handleFormSubmit} style={styles.modalForm}>
              {/* CAMPO NOME */}
              <input
                style={styles.input}
                placeholder="Nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              {/* CAMPO EMAIL */}
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              {/* CAMPO SENHA */}
              <input
                style={styles.input}
                type="password"
                placeholder={
                  formData.id
                    ? "Nova Senha (deixe em branco para manter)"
                    : "Senha"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!formData.id}
              />
              {/* CAMPO FUNÇÃO (ROLE) - AGORA USANDO styles.selectDark */}
              <select
                style={styles.selectDark} // <--- Estilo Dark Aplicado
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
              >
                <option value="USER">Usuário (USER)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
              </select>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.submitButton}>
                  {formData.id ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos baseados nos layouts anteriores (DashboardPage, LoginPage)
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
    background: "#3b82f6", // Azul para edição
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },
  actionButtonDelete: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#ef4444", // Vermelho para deletar
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
  // Estilo base para Inputs de texto/senha/email
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  // NOVO ESTILO PARA SELECTS (dropdowns)
  selectDark: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#334155", // Fundo escuro para contraste
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
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
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
}
