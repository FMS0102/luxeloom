import { authFetch } from "./apiClient";
import BASE_URL from "./config";

const CATEGORIES_API = `${BASE_URL}/api/categories`;

export async function findAllCategories(page = 0, size = 10) {
    const params = new URLSearchParams({ page, size });

    const res = await authFetch(`${BASE_URL}/api/categories?${params.toString()}`);
    if (!res.ok) throw new Error(`Erro ao buscar categorias: ${res.status}`);
    return await res.json();
}

export async function createCategory(name) {
    const res = await authFetch(CATEGORIES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return await res.json();
}


export async function updateCategory(id, name) {
    const res = await authFetch(`${CATEGORIES_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return await res.json();
}

export async function deleteCategory(id) {
    const res = await authFetch(`${CATEGORIES_API}/${id}`, {
        method: 'DELETE',
    });
    if (res.status === 204 || res.status === 200) {
        return true;
    }
    throw new Error('Falha ao deletar categoria.');
}