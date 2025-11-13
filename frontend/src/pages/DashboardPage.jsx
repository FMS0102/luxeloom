import React, { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import { fetchDashboard } from "../api/auth"
import { authFetch } from "../api/apiClient"

// URL para buscar o usuário logado
const ME_API_URL = "http://localhost:8080/api/users/me"
// URL para buscar os dados do dashboard
//const DASHBOARD_API_URL = "http://localhost:8080/api/sale/dashboard"

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "Usuário"
  ) // Novo estado para o nome do usuário
  const channelChartRef = useRef(null)
  const revenueChartRef = useRef(null)
  const channelChartInstance = useRef(null)
  const revenueChartInstance = useRef(null)

  // 1. Busca dos dados do Dashboard e do Usuário
  useEffect(() => {
    // Função para buscar dados da API do USUÁRIO (ME_API_URL)
    const fetchUserData = async () => {
      try {
        // Usa authFetch para a rota protegida
        const res = await authFetch(ME_API_URL)
        const user = await res.json()

        if (user && user.name) {
          setUserName(user.name.split(" ")[0] || "Usuário")
        }
      } catch (err) {
        // O erro aqui será tratado pelo authFetch (se for 401/refresh fail, já redireciona)
        console.error(`Erro ao buscar ${ME_API_URL}:`, err)
      }
    }

    // Busca o nome do usuário
    fetchUserData()

    // Busca os dados do dashboard usando a função wrapper
    fetchDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Erro no dashboard:", err)
      })
  }, [])

  // 2. Lógica para renderizar os gráficos (não alterada)
  useEffect(() => {
    if (!data) return
    if (channelChartInstance.current) channelChartInstance.current.destroy()
    if (revenueChartInstance.current) revenueChartInstance.current.destroy()

    // --- Gráfico de canais
    const ctx1 = channelChartRef.current.getContext("2d")
    channelChartInstance.current = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: data.salesByChannel.map((s) => s.channel),
        datasets: [
          {
            label: "Vendas por canal",
            data: data.salesByChannel.map((s) => s.count),
            backgroundColor: ["#ffffffcc", "#9ca3af", "#4b5563", "#111827"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#d1d5db", font: { size: 13 } },
          },
        },
      },
    })

    // --- Gráfico de receita mensal
    const ctx2 = revenueChartRef.current.getContext("2d")
    const revSorted = data.revenueByMonth
      .slice()
      .sort((a, b) => a.year - b.year || a.month - b.month)

    revenueChartInstance.current = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: revSorted.map((r) =>
          new Date(r.year, r.month - 1).toLocaleString("pt-BR", {
            month: "short",
            year: "numeric",
          })
        ),
        datasets: [
          {
            label: "Receita (R$)",
            data: revSorted.map((r) => r.revenue),
            backgroundColor: "rgba(255,255,255,0.25)",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: { color: "#d1d5db" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          x: {
            ticks: { color: "#d1d5db" },
            grid: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    })

    return () => {
      if (channelChartInstance.current) channelChartInstance.current.destroy()
      if (revenueChartInstance.current) revenueChartInstance.current.destroy()
    }
  }, [data])

  if (!data)
    return (
      <p style={{ color: "#ccc", textAlign: "center", marginTop: "40px" }}>
        Carregando...
      </p>
    )

  const formatBRL = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const last = data.revenueByMonth[data.revenueByMonth.length - 1]
  const lastLabel = last
    ? new Date(last.year, last.month - 1, 1).toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "—"

  return (
    <div style={styles.page}>
      {/* <link> da fonte Cinzel Decorative REMOVIDO */}
      <header style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            {/* O ícone 📊 permanece para manter o layout */}
            <span style={styles.icon}>📊</span>
            {/* Título com saudação dinâmica */}
            <h1 style={styles.title}>Bem-vindo de volta, {userName}</h1>
          </div>
          {/* Subtítulo atualizado com a frase de desempenho */}
          <p style={styles.subtitle}>
            Aqui está o desempenho mais recente (Atualizado em {lastLabel})
          </p>
        </div>
      </header>

      <div style={styles.metrics}>
        <MetricCard label="Total de vendas" value={data.totalSalesCount} />
        <MetricCard
          label="Receita total"
          value={formatBRL(data.totalRevenue)}
        />
        <MetricCard label="Canais ativos" value={data.salesByChannel.length} />
        <MetricCard
          label="Categorias"
          value={Object.keys(data.itemsSoldByCategory).length}
        />
      </div>

      <div style={styles.charts}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Vendas por canal</h3>
          <canvas ref={channelChartRef}></canvas>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Itens por categoria</h3>
          <div>
            {Object.entries(data.itemsSoldByCategory).map(([cat, qty]) => (
              <div key={cat} style={styles.categoryItem}>
                <span>{cat}</span>
                <strong>{qty}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cardFull}>
          <h3 style={styles.cardTitle}>Receita mensal</h3>
          <canvas ref={revenueChartRef}></canvas>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  )
}

// Estilos atualizados para remover a referência a 'Cinzel Decorative' do título
const styles = {
  page: {
    background: "linear-gradient(180deg, #0b0b0b 0%, #141414 100%)",
    color: "#f1f5f9",
    minHeight: "100vh",
    // Inter já é a fonte padrão do sistema
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "40px 24px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  logo: {
    // ESTILO LOGO ANTIGO, MANTIDO POR SEGURANÇA, MAS NÃO É USADO MAIS
    // fontFamily: "'Cinzel Decorative', serif",
    fontSize: 30,
    color: "#fff",
    margin: 0,
  },
  subtitle: {
    color: "#a1a1aa",
    marginTop: 6, // Ajuste para 6px para dar mais espaço
    fontSize: 14,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    margin: "30px 0",
  },
  metricCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "20px 22px",
    backdropFilter: "blur(6px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  metricLabel: { fontSize: 13, color: "#9ca3af" },
  metricValue: { fontSize: 22, fontWeight: 600, marginTop: 6 },
  charts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    // 💡 ADICIONE ISSO: Altura máxima para limitar o tamanho
    maxHeight: 400, // Exemplo: Limita a altura do card. Ajuste conforme necessário.
    // E é uma boa prática para containers de gráfico:
    position: "relative",
  },

  // --- Estilo para o card grande (Receita mensal) ---
  cardFull: {
    gridColumn: "1 / -1",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    // 💡 ADICIONE ISSO: Limite a altura do card FULL também
    maxHeight: 450, // Exemplo: Um pouco mais alto que o card padrão
    position: "relative",
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 16,
    color: "#f8fafc",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: 8,
  },
  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px dashed rgba(255,255,255,0.05)",
    color: "#e5e5e5",
  },

  // Novos/Atualizados estilos do Header
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
    // Fonte Cinzel Decorative REMOVIDA daqui, usando Inter padrão
    fontFamily: "inherit",
    fontSize: 28, // Um pouco maior para manter o destaque sem a fonte decorativa
    fontWeight: 700, // Deixando mais negrito
    color: "#fff",
    margin: 0,
  },
}
