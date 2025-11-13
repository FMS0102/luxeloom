import React, { useState, useEffect } from "react"
import { findAllSales, registerSale, deleteSale } from "../api/sale"
import { findAllCategories } from "../api/category"
import { findAllProducts } from "../api/product"
import Pagination from "../components/Pagination"

// Mapeamento dos ENUMs do Backend para a UI.
const SALE_CHANNELS = [
  { id: 1, name: "SHOPEE", display: "Shopee" },
  { id: 2, name: "LOCAL", display: "Venda Local" },
  { id: 3, name: "INSTAGRAM", display: "Instagram" },
  { id: 4, name: "WHATSAPP", display: "WhatsApp" },
]

const INITIAL_FORM = {
  client: "",
  saleChannel: "",
  saleDate: new Date().toISOString().substring(0, 16),
  items: [],
}

const INITIAL_ITEM = {
  productId: "",
  quantity: 1,
}

// Função auxiliar para formatar preço no padrão BRL
const formatBRL = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function SalesPage() {
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [newItem, setNewItem] = useState(INITIAL_ITEM)
  const [error, setError] = useState(null)

  // Estados de Filtro
  const [filterClientName, setFilterClientName] = useState("")
  const [filterCategoryId, setFilterCategoryId] = useState("")

  useEffect(() => {
    fetchData()
  }, [filterClientName, filterCategoryId, currentPage])

  async function fetchCategoriesForFilters() {
    try {
      const data = await findAllCategories()
      if(data.content){
        setCategories(data.content)
      } else {
        setCategories([])
      }
    } catch (err) {
      console.error("Erro ao carregar categorias para filtro:", err)
    }
  }

  useEffect(() => {
    fetchCategoriesForFilters()
  },[])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const filters = {}
      if (filterClientName) filters.clientName = filterClientName
      if (filterCategoryId) filters.categoryId = filterCategoryId

      const data = await findAllSales(currentPage - 1, pageSize, filters)

      setSales(data.content || [])
      setTotalPages(data.page?.totalPages || 1)
      setCurrentPage((data.page?.number || 0) + 1)

      const productsData = await findAllProducts()
      setProducts(productsData.content || [])
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar dados. Verifique o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    // Garante que o saleChannel padrão seja o primeiro ID da lista, se existir, COMO STRING.
    const defaultChannelId =
      SALE_CHANNELS.length > 0 ? SALE_CHANNELS[0].id.toString() : ""
    setFormData({ ...INITIAL_FORM, saleChannel: defaultChannelId })
    setNewItem({ ...INITIAL_ITEM, quantity: 1 }) // Garante quantidade inicial 1
    setError(null)
    setIsModalOpen(true)
  }

  const handleOpenDetails = (sale) => {
    setSelectedSale(sale)
    setIsDetailModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        await deleteSale(id)
        alert("Venda deletada com sucesso!")
        fetchData()
      } catch (err) {
        setError("Erro ao deletar venda.")
        console.error(err)
      }
    }
  }

  // --- Lógica de Itens da Venda (CORRIGIDA) ---

  const handleAddItem = (e) => {
    e.preventDefault()

    const selectedProductId = newItem.productId
    const itemQuantity = Number(newItem.quantity || 0)

    if (!selectedProductId || itemQuantity <= 0) {
      setError("Selecione um produto e a quantidade deve ser maior que zero.")
      return
    }

    // Garantindo que id do produto seja comparado como número
    const product = products.find((p) => Number(p.id) === selectedProductId)
    if (!product) {
      setError("Produto selecionado é inválido.")
      return
    }

    const existingItemIndex = formData.items.findIndex(
      (item) => item.productId === selectedProductId
    )

    const itemToAdd = {
      productId: selectedProductId,
      quantity: itemQuantity,
      productName: product.name,
      price: product.price,
    }

    let updatedItems
    if (existingItemIndex !== -1) {
      updatedItems = formData.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + itemToAdd.quantity }
          : item
      )
    } else {
      updatedItems = [...formData.items, itemToAdd]
    }

    setFormData({ ...formData, items: updatedItems })
    setNewItem({ productId: "", quantity: 1 })
    setError(null)
  }

  const totalSale = formData.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  // Retorna o nome do canal (FindAll retorna a string ENUM)
  const getChannelDisplay = (enumName) =>
    SALE_CHANNELS.find((c) => c.name === enumName)?.display || "N/A"

  const getSaleTotal = (sale) => {
    if (sale.totalValue !== undefined) return sale.totalValue
    return 0
  }

  const handleRemoveItem = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.productId !== productId),
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (
      !formData.client ||
      !formData.saleChannel ||
      formData.items.length === 0
    ) {
      setError(
        "Preencha o cliente, canal de venda e adicione pelo menos um item."
      )
      return
    }

    const dataToSend = {
      client: formData.client,
      saleDate: new Date(formData.saleDate).toISOString(),
      saleChannel: parseInt(formData.saleChannel), // garante number
      items: formData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }

    try {
      await registerSale(dataToSend) // chamada à API
      alert("Venda registrada com sucesso!")

      setFormData(INITIAL_FORM)
      setNewItem(INITIAL_ITEM)
      setIsModalOpen(false)
      fetchData() // recarrega vendas
    } catch (err) {
      setError(`Falha ao registrar venda: ${err.message || "Erro de API."}`)
      console.error(err)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.icon}>💰</span>
          <h1 style={styles.title}>Histórico de Vendas</h1>
        </div>
        <button style={styles.addButton} onClick={handleOpenModal}>
          + Registrar Nova Venda
        </button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {/* Área de Filtros */}
      <div style={styles.filtersContainer}>
        <input
          style={styles.inputFilter}
          placeholder="Filtrar por Nome do Cliente..."
          value={filterClientName}
          onChange={(e) => setFilterClientName(e.target.value)}
        />
        <select
          style={styles.selectDarkFilter}
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">Todas as Categorias</option>
          {(Array.isArray(categories) ? categories : []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#ccc", textAlign: "center", marginTop: "40px" }}>
          Carregando vendas...
        </p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Data/Hora</th>
                <th style={styles.th}>Canal</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(sales) ? sales : []).map((sale) => (
                <tr key={sale.id} style={styles.tr}>
                  <td style={styles.td}>{sale.id}</td>
                  <td style={styles.td}>{sale.client}</td>
                  <td style={styles.td}>
                    {new Date(sale.saleDate).toLocaleString("pt-BR")}
                  </td>
                  <td style={styles.td}>
                    {getChannelDisplay(sale.saleChannel)}
                  </td>
                  <td style={styles.td}>{formatBRL(getSaleTotal(sale))}</td>
                  <td style={styles.tdAction}>
                    {/* Botão para ver detalhes */}
                    <button
                      style={styles.actionButtonDetails}
                      onClick={() => handleOpenDetails(sale)}
                    >
                      Ver Detalhes
                    </button>
                    <button
                      style={styles.actionButtonDelete}
                      onClick={() => handleDelete(sale.id)}
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

      {/* Modal de Registro de Vendas (POST) */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentWide}>
            <h2 style={styles.modalTitle}>Registrar Nova Venda</h2>
            <form onSubmit={handleFormSubmit} style={styles.modalForm}>
              {/* Informações Básicas da Venda */}
              <div style={styles.row}>
                <input
                  style={styles.input}
                  placeholder="Nome do Cliente"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  required
                />
                <select
                  style={styles.selectDark}
                  value={formData.saleChannel}
                  onChange={(e) =>
                    setFormData({ ...formData, saleChannel: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Canal de Venda
                  </option>
                  {SALE_CHANNELS.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.display}
                    </option>
                  ))}
                </select>
                <input
                  style={styles.input}
                  type="datetime-local"
                  value={formData.saleDate}
                  onChange={(e) =>
                    setFormData({ ...formData, saleDate: e.target.value })
                  }
                  required
                />
              </div>

              <hr style={styles.hr} />

              {/* Adicionar Itens à Venda */}
              <h3 style={styles.subTitle}>
                Itens da Venda ({formData.items.length})
              </h3>

              <div style={styles.rowItemAdd}>
                <select
                  style={styles.selectDarkItem}
                  value={newItem.productId || ""}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      productId: Number(e.target.value),
                    })
                  }
                >
                  <option value="" disabled>
                    Selecione o Produto
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatBRL(p.price)})
                    </option>
                  ))}
                </select>
                <input
                  style={styles.inputItem}
                  type="number"
                  min="1"
                  placeholder="Qtd."
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: Number(e.target.value) })
                  }
                  required
                />
                <button
                  type="button"
                  style={styles.addItemButton}
                  onClick={handleAddItem}
                >
                  + Adicionar
                </button>
              </div>

              {/* Lista de Itens Adicionados */}
              <div style={styles.itemsList}>
                {formData.items.length === 0 ? (
                  <p style={styles.emptyList}>Nenhum item adicionado.</p>
                ) : (
                  formData.items.map((item) => (
                    <div key={item.productId} style={styles.itemRow}>
                      <span style={styles.itemQuantity}>{item.quantity}x</span>
                      <span style={styles.itemName}>{item.productName}</span>
                      <span style={styles.itemPriceUnit}>
                        {formatBRL(item.price)} (Un.)
                      </span>
                      <span style={styles.itemTotal}>
                        {formatBRL(item.quantity * item.price)}
                      </span>
                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <h3 style={styles.totalDisplay}>
                Total da Venda: {formatBRL(totalSale)}
              </h3>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={formData.items.length === 0}
                >
                  Registrar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Detalhes da Venda (GET) */}
      {isDetailModalOpen && selectedSale && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentWide}>
            <h2 style={styles.modalTitle}>
              Detalhes da Venda #{selectedSale.id}
            </h2>

            <div style={styles.detailGroup}>
              <p>
                <strong>Cliente:</strong> {selectedSale.client}
              </p>
              <p>
                <strong>Canal:</strong>{" "}
                {getChannelDisplay(selectedSale.saleChannel)}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(selectedSale.saleDate).toLocaleString("pt-BR")}
              </p>
              <p>
                <strong>Valor Total:</strong>{" "}
                {formatBRL(selectedSale.totalValue)}
              </p>
            </div>

            <hr style={styles.hr} />

            <h3 style={styles.subTitle}>Produtos Comprados</h3>
            <div style={styles.itemsList}>
              {/* Cabeçalho da Lista de Detalhes */}
              <div style={styles.itemRowHeader}>
                <span style={styles.itemQuantity}>Qtd</span>
                <span style={styles.itemName}>Produto</span>
                <span style={styles.itemPriceUnit}>Preço Un.</span>
                <span style={styles.itemTotal}>Total Item</span>
              </div>
              {/* Itens da Venda */}
              {selectedSale.items &&
                selectedSale.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    style={styles.itemRow}
                  >
                    <span style={styles.itemQuantity}>{item.quantity}x</span>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemPriceUnit}>
                      {formatBRL(item.price)} {/* PREÇO UNITÁRIO ADICIONADO */}
                    </span>
                    <span style={styles.itemTotal}>
                      {formatBRL(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setIsDetailModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos
const styles = {
  // ... (Estilos page, header, icon, title, addButton, error, table, td, th, filtersContainer)
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
  filtersContainer: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
    padding: "15px 20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  inputFilter: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    flex: 1,
    boxSizing: "border-box",
  },
  selectDarkFilter: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#334155",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    flex: 1,
    boxSizing: "border-box",
    cursor: "pointer",
    maxWidth: 250,
  },
  // Tabela
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
  actionButtonDetails: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#FFFFF0",color: "#000",
    cursor: "pointer",
    fontSize: 12,
  },
  actionButtonDelete: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    background: "#585858",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  },
  // Modal
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
  modalContentWide: {
    background: "#1e293b",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 700,
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
    flex: 1,
  },
  selectDark: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#334155",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    flex: 1,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: 15,
    width: "100%",
  },
  hr: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    margin: "15px 0",
  },
  // Itens da Venda
  subTitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 10,
  },
  rowItemAdd: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  selectDarkItem: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#334155",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
    flex: 3,
  },
  inputItem: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    width: "100%",
    flex: 1,
    maxWidth: 100,
    textAlign: "center",
  },
  addItemButton: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    background: "#FFFFF0",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
  },
  itemsList: {
    maxHeight: 200,
    overflowY: "auto",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  emptyList: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 10,
  },
  // NOVO: Cabeçalho da Lista de Detalhes
  itemRowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    color: "#a1a1aa",
    fontWeight: 600,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 5,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px dotted rgba(255,255,255,0.05)",
  },
  itemQuantity: {
    fontWeight: 700,
    color: "#f8fafc",
    width: 40,
    textAlign: "right",
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  // NOVO: Estilo para Preço Unitário
  itemPriceUnit: {
    fontWeight: 500,
    color: "#94a3b8",
    width: 100,
    textAlign: "right",
    marginRight: 10,
    fontSize: 14,
  },
  itemTotal: {
    fontWeight: 600,
    color: "#4ade80",
    width: 100,
    textAlign: "right",
  },
  removeButton: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    marginLeft: 10,
  },
  totalDisplay: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f8fafc",
    textAlign: "right",
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  detailGroup: {
    marginBottom: 15,
    lineHeight: 1.6,
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
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
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
