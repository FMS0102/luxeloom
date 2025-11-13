import React, { useState, useEffect } from "react"
import {
  findAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product"
import { findAllCategories } from "../api/category"
import Pagination from "../components/Pagination"

const AVAILABLE_COLORS = [
  { value: "PRETO", label: "Preto" },
  { value: "BRANCO", label: "Branco" },
  { value: "CINZA", label: "Cinza" },
  { value: "MARFIM", label: "Marfim" },
  { value: "CHAMPANHE", label: "Champanhe" },
]

// Função auxiliar para formatar preço no padrão BRL
const formatBRL = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Função auxiliar para converter BRL para número limpo
const parseBRL = (value) => {
  if (typeof value === "number") return value
  if (!value) return 0
  // Remove R$, pontos (milhares) e substitui vírgula (decimal) por ponto
  return parseFloat(value.replace(/[R$\s.]/g, "").replace(",", "."))
}

const INITIAL_FORM = {
  id: null,
  name: "",
  description: "",
  color: AVAILABLE_COLORS[0].value, // Valor inicial para o dropdown de cores
  categoryId: "",
  price: 0.0,
  quantityStock: 0,
}

export default function ProductsPage() {
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Usaremos priceText para manter a formatação BRL na UI
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [priceText, setPriceText] = useState(formatBRL(0))

  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [currentPage])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      // o currentPage do front começa em 1, então subtrai 1
      const data = await findAllProducts(currentPage - 1, pageSize)

      if (data.content) {
        setProducts(data.content)
        setTotalPages(data.page?.totalPages || 1)
      } else {
        setProducts([])
        setTotalPages(1)
      }

      const categoriesData = await findAllCategories()
      setCategories(categoriesData.content || [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar dados. Verifique o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    // Preenche o formulário para edição
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || "",
      color: product.color || AVAILABLE_COLORS[0].value,
      categoryId: product.categoryId,
      price: product.price,
      quantityStock: product.quantityStock,
    })
    // Define o campo de texto do preço no formato BRL
    setPriceText(formatBRL(product.price))
    setIsModalOpen(true)
  }

  const handleOpenModal = () => {
    setFormData(INITIAL_FORM)
    setPriceText(formatBRL(0)) // Limpa o preço formatado
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deleteProduct(id)
        alert("Produto deletado com sucesso!")
        fetchData()
      } catch (err) {
        setError("Erro ao deletar produto.")
        console.error(err)
      }
    }
  }

  const handlePriceChange = (e) => {
    const rawValue = e.target.value
    // Permite apenas dígitos, ponto e vírgula
    const cleanValue = rawValue.replace(/[^\d.,]/g, "")

    // Converte o valor para o formato numérico americano para o state
    const parsedValue = parseBRL(cleanValue)

    // Atualiza o texto formatado (ex: R$ 1.234,50) para a exibição no campo
    // Se o campo estiver vazio, mantém o texto vazio ou 'R$ 0,00'
    setPriceText(cleanValue ? formatBRL(parsedValue) : "")

    // Armazena o valor numérico (1234.50) no formData para envio à API
    setFormData({ ...formData, price: parsedValue })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Converte dados para o formato de envio
    const dataToSend = {
      ...formData,
      // Garante que o preço e estoque são números
      price: parseFloat(formData.price),
      quantityStock: parseInt(formData.quantityStock),
      categoryId: parseInt(formData.categoryId),
    }

    // Validação básica
    if (isNaN(dataToSend.price) || dataToSend.price <= 0) {
      setError("O preço deve ser um valor monetário válido.")
      return
    }
    if (isNaN(dataToSend.quantityStock) || dataToSend.quantityStock < 0) {
      setError(
        "A quantidade em estoque deve ser um número inteiro não negativo."
      )
      return
    }
    if (!dataToSend.categoryId) {
      setError("A categoria deve ser selecionada.")
      return
    }

    try {
      if (formData.id) {
        await updateProduct(formData.id, dataToSend)
        alert("Produto atualizado com sucesso!")
      } else {
        await createProduct(dataToSend)
        alert("Produto criado com sucesso!")
      }

      setFormData(INITIAL_FORM)
      setPriceText(formatBRL(0))
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      setError(`Falha na operação: ${err.message || "Erro de API."}`)
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.icon}>📦</span>
          <h1 style={styles.title}>Gerenciamento de Produtos</h1>
        </div>
        <button style={styles.addButton} onClick={handleOpenModal}>
          + Adicionar Novo Produto
        </button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ color: "#ccc", textAlign: "center", marginTop: "40px" }}>
          Carregando produtos e categorias...
        </p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Cor</th>
                <th style={styles.th}>Preço</th>
                <th style={styles.th}>Estoque</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={styles.tr}>
                  <td style={styles.td}>{product.id}</td>
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>{product.color}</td>
                  <td style={styles.td}>{formatBRL(product.price)}</td>
                  {/* Formato BRL na tabela */}
                  <td style={styles.td}>{product.quantityStock}</td>
                  <td style={styles.td}>
                    {categories.find((c) => c.id === product.categoryId)
                      ?.name || "N/A"}
                  </td>
                  <td style={styles.tdAction}>
                    <button
                      style={styles.actionButtonEdit}
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </button>
                    <button
                      style={styles.actionButtonDelete}
                      onClick={() => handleDelete(product.id)}
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
              {formData.id ? "Editar Produto" : "Criar Novo Produto"}
            </h2>
            <form onSubmit={handleFormSubmit} style={styles.modalForm}>
              <input
                style={styles.input}
                placeholder="Nome do Produto (Ex: Robe de Cetim Preto)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <textarea
                style={styles.input}
                placeholder="Descrição (Ex: Toque suave e luxuoso...)"
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
              <div style={styles.row}>
                {/* DROP DOWN DE CORES */}
                <select
                  style={styles.selectDark}
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Selecione a Cor
                  </option>
                  {AVAILABLE_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* CAMPO PREÇO FORMATADO EM BRL */}
                <input
                  style={styles.input}
                  placeholder="Preço (R$ X.XXX,XX)"
                  // Usa priceText para exibição formatada
                  value={priceText}
                  onChange={handlePriceChange}
                  onBlur={() => setPriceText(formatBRL(formData.price))} // Volta para BRL total ao perder foco
                  onFocus={() =>
                    setPriceText(
                      formData.price > 0 ? formData.price.toString() : ""
                    )
                  } // Limpa formatação ao focar
                  required
                />
              </div>
              <div style={styles.row}>
                {/* CAMPO QUANTIDADE EM ESTOQUE MELHOR IDENTIFICADO */}
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Quantidade em Estoque"
                  value={formData.quantityStock}
                  onChange={(e) =>
                    setFormData({ ...formData, quantityStock: e.target.value })
                  }
                  required
                />

                {/* DROP DOWN DE CATEGORIAS ESCURO */}
                <select
                  style={styles.selectDark}
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Selecione a Categoria
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.submitButton}>
                  {formData.id ? "Salvar Produto" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos
const styles = {
  // ... (Estilos page, header, icon, title, addButton, error) ...
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
    background: "#FFFFF0",
    color: "#000",
    cursor: "pointer",
    fontSize: 12,
  },
  actionButtonDelete: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#535353",
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
    maxWidth: 600,
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
    // Estilo base para inputs de texto e números
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%", // Para funcionar no flex
    boxSizing: "border-box",
  },
  // NOVO ESTILO PARA SELECTS (dropdowns)
  selectDark: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#334155", // Fundo mais escuro para garantir contraste
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: 15,
    width: "100%",
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
