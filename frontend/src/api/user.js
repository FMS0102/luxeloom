import { authFetch } from "./apiClient";
import BASE_URL from "./config";

export const USERS_API = `${BASE_URL}/api/users`;

export async function getMe() {
    const res = await authFetch(`${USERS_API}/me`);
    return await res.json();
}

export async function findAllUsers() {
    const res = await authFetch(USERS_API);
    return await res.json();
}

export async function createUser(userData) {
    const res = await authFetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await res.json();
}

export async function updateUser(id, userData) {
    const res = await authFetch(`${USERS_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return await res.json();
}


export async function deleteUser(id) {
    const res = await authFetch(`${USERS_API}/${id}`, {
        method: 'DELETE',
    });
    if (res.status === 204 || res.status === 200) {
        return true;
    }
    throw new Error('Falha ao deletar usuário.');
}