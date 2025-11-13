import React from "react"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  // Se não houver token, redireciona.
  // Se o token for inválido, o authFetch irá capturar e, se o refresh falhar,
  // limpar o token e forçar o redirecionamento via window.location = '/login' (no apiClient.js).
  const token = localStorage.getItem("accessToken")
  return token ? children : <Navigate to="/login" />
}
