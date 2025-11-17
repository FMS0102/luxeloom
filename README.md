# 🛍️ Sistema de Controle de Vendas (SCV) - Luxeloom Ateliê

O **Sistema de Controle de Vendas (SCV) Luxeloom** é uma solução Full Stack desenvolvida para digitalizar e otimizar a gestão operacional da Luxeloom Ateliê, uma microempresa de produção e venda de itens personalizados em cetim.

## 💡 Problema e Solução

A empresa operava anteriormente com **registros manuais** (cadernos e anotações informais), o que resultava em:
1.  Baixa rastreabilidade de transações.
2.  Alta suscetibilidade a erros operacionais.
3.  Ausência de indicadores de desempenho (KPIs) para tomada de decisão.

O SCV foi projetado para substituir esse processo, oferecendo uma **plataforma centralizada** com segurança e precisão, promovendo a **escalabilidade e profissionalização** do negócio.

## 🚀 Funcionalidades Principais

* **Gestão de Inventário:** Cadastro e controle de produtos e categorias em tempo real.
* **Ponto de Venda (PDV):** Registro estruturado e ágil de todas as vendas realizadas.
* **Autenticação Segura:** Módulo de login com controle de acesso de usuários e permissões (vendedores/gestores).
* **Dashboards Analíticos:** Painéis de controle com indicadores (KPIs).

## ⚙️ Tecnologias Utilizadas (Stack Full Stack)

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot, Maven |
| **Frontend** | React |
| **Banco de Dados** | PostgreSQL |
| **Segurança** | JWT (Autenticação), Bcrypt (Criptografia) |
| **Infraestrutura** | Docker, AWS, NGINX |

## 🛠️ Como Executar o Projeto (Instruções Básicas)

Para executar o projeto localmente, você precisará ter o **Docker** e o **Docker Compose** instalados.

1.  **Clone o Repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd nome-do-projeto
    ```

2.  **Configurar Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto e configure as variáveis de acesso ao PostgreSQL e chaves JWT (conforme sua configuração).

3.  **Subir os Contêineres (Backend, Frontend e DB):**
    ```bash
    sudo docker-compose up --build -d
    ```
    * *O processo de build do Maven será executado dentro do contêiner Docker.*

4.  **Acessar a Aplicação:**
    * O Backend estará acessível em `http://localhost:8080`
    * O Frontend estará acessível em `http://localhost:3000`

## 🤝 Equipe

* Felipe Simões (Backend e Integração)
* Felipe Rezende Binda (Frontend, Testes e Documentação)
* Daniel Faustino (Frontend, Testes e Documentação)
* Vitor Lemos (Frontend, Testes e Documentação)