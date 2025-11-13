import { refreshToken } from "./auth"; // Importe a função de refresh

// Variável para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false; 
// Array de requisições pendentes que esperam o novo token
let failedQueue = []; 

// Função para processar a fila de requisições pendentes
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");
    let headers = options.headers || {};

    // 1. Tenta a requisição original
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                'Authorization': token ? `Bearer ${token}` : '',
            },
            credentials: 'include'
        });

        // 2. Verifica se a autenticação falhou (Token expirado/inválido)
        if (res.status === 401) {
            // Se já estiver em processo de refresh, adiciona a requisição à fila
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Tenta a requisição novamente com o novo token
                    return authFetch(url, options); 
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            // Inicia o processo de refresh
            isRefreshing = true;

            try {
                // 3. Chama a função refreshToken
                const refreshData = await refreshToken();
                const newAccessToken = refreshData.accessToken;
                
                // 4. Salva o novo Access Token e processa a fila
                localStorage.setItem("accessToken", newAccessToken);
                isRefreshing = false;
                processQueue(null, newAccessToken); 

                // Tenta a requisição original novamente
                return authFetch(url, options);

            } catch (refreshErr) {
                // 5. Se o Refresh Token falhar (401/403):
                isRefreshing = false;
                processQueue(refreshErr, null);
                
                // Redireciona para o login e limpa os tokens
                localStorage.removeItem("accessToken");
                // Note: O Refresh Token deve ser limpo pelo servidor (via cookie invalidado)
                window.location = '/login'; 
                
                // Rejeita a requisição falha
                return Promise.reject("Sessão expirada. Faça login novamente.");
            }
        }
        
        // 6. Resposta OK ou outro erro HTTP
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Erro HTTP ${res.status}: ${errorText || 'Erro desconhecido'}`);
        }

        return res;

    } catch (error) {
        return Promise.reject(error);
    }
}