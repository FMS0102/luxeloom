import { authFetch } from "./apiClient";
import BASE_URL from "./config";

const SALE_API = `${BASE_URL}/api/sale`;

export async function findAllSales(page = 0, size = 10, filters = {}) {
    const params = new URLSearchParams({ page, size });

    if (filters.clientName) params.append("clientName", filters.clientName);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);

    const res = await authFetch(`${BASE_URL}/api/sale?${params.toString()}`);
    if (!res.ok) throw new Error(`Erro ao buscar vendas: ${res.status}`);
    return await res.json();
}

export async function registerSale(saleData) {
    const res = await authFetch(SALE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
    });
    return await res.json();
}


export async function updateSale(id, updateData) {
    const res = await authFetch(`${SALE_API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    return await res.json();
}

export async function deleteSale(id) {
    const res = await authFetch(`${SALE_API}/${id}`, {
        method: 'DELETE',
    });

    if (res.status === 204 || res.status === 200) {
        return true;
    }
    throw new Error('Falha ao deletar venda.');
}