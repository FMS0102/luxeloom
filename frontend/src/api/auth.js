import { authFetch } from "./apiClient";
import BASE_URL from "./config";

export async function login(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Necessário para receber cookie httpOnly
    });
    if (!response.ok) throw new Error('Falha no login');
    return await response.json();
}


export async function fetchDashboard() {
    const response = await authFetch(`${BASE_URL}/api/sale/dashboard`, {
    });

    return await response.json();
}

export async function refreshToken() {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Falha na renovação do token');
    return await response.json();
}