import { authFetch } from "./apiClient";
import BASE_URL from "./config";

const PRODUCT_API = `${BASE_URL}/api/product`;

export async function findAllProducts(page = 0, size = 10) {
    const res = await authFetch(`${PRODUCT_API}?page=${page}&size=${size}`);
    if (!res.ok) {
        throw new Error(`Erro ao buscar produtos: ${res.status}`);
    }
    return await res.json();
}

export async function createProduct(productData) {
    const res = await authFetch(PRODUCT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    return await res.json();
}

export async function updateProduct(id, productData) {
    const res = await authFetch(`${PRODUCT_API}/${id}`, {
        method: 'PATCH', // Usando PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    return await res.json();
}

export async function deleteProduct(id) {
    const res = await authFetch(`${PRODUCT_API}/${id}`, {
        method: 'DELETE',
    });

    if (res.status === 204 || res.status === 200) {
        return true;
    }
    throw new Error('Falha ao deletar produto.');
}