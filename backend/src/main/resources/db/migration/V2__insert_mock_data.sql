-- Necessário para usar lógica procedural e variáveis em um único bloco de script.

DO $$
DECLARE
    -- Variáveis de controle e Mocks essenciais
    ADMIN_ROLE_ID BIGINT := 1;
    BASIC_ROLE_ID BIGINT := 2;
    ADMIN_UUID UUID := '00000000-0000-0000-0000-000000000001';
    MOCK_PASSWORD_HASH VARCHAR(72) := '$2a$10$tJ9.3QWwJ4S2Gg0wP2vW3uVvC1.eB4iT.R.yQp7iL5X8Z7J8K9L';

    -- Arrays de dados para randomização
    CATEGORY_NAMES VARCHAR[] := ARRAY['Toucas', 'Fronhas', 'Robes', 'Máscaras de Dormir', 'Acessórios de Cabelo', 'Conjuntos de Pijama', 'Kits Promocionais', 'Lingerie de Cetim'];
    PRODUCT_ADJECTIVES VARCHAR[] := ARRAY['Luxuosa', 'Ajustável', 'Dupla Face', 'Clássica', 'Premium', 'Antifrizz', 'Longa', 'Curta'];
    PRODUCT_NAMES_BASE VARCHAR[] := ARRAY['Touca', 'Fronha', 'Robe', 'Máscara', 'Pijama', 'Kit'];
    PRODUCT_COLORS VARCHAR[] := ARRAY['Preto', 'Branco', 'Rosa Bebê', 'Vinho', 'Azul Marinho', 'Verde Militar', 'Champanhe', 'Marsala', 'Dourado', 'Prata'];
    CLIENT_NAMES VARCHAR[] := ARRAY['Ana', 'Beatriz', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Júlia', 'Kátia', 'Luiz', 'Marina', 'Nuno', 'Olívia', 'Pedro', 'Quésia', 'Rafael', 'Sofia', 'Thiago'];
    SALE_CHANNELS VARCHAR[] := ARRAY['SHOPEE', 'LOCAL', 'INSTAGRAM', 'WHATSAPP'];

    -- Variáveis para loop
    i INT;
    rand_category_id BIGINT;
    rand_user_id UUID;
    rand_product_id BIGINT;
    rand_sale_id BIGINT;
    current_sale_date TIMESTAMP WITH TIME ZONE;
    item_quantity INT;
    item_price NUMERIC(10,2);
    sub_total_calc NUMERIC(10,2);

    -- Coleções de IDs
    category_ids BIGINT[];
    user_ids UUID[];
    product_ids BIGINT[];
    sale_ids BIGINT[];

BEGIN

--------------------------------------------------------------------------------
-- 2. CATEGORIAS (tb_categories)
--------------------------------------------------------------------------------

FOR i IN 1..array_length(CATEGORY_NAMES, 1) LOOP
    INSERT INTO tb_categories (name) VALUES (CATEGORY_NAMES[i])
    RETURNING id INTO rand_category_id;
    category_ids := array_append(category_ids, rand_category_id);
END LOOP;

--------------------------------------------------------------------------------
-- 3. USUÁRIOS (tb_users) - 20 Usuários
--------------------------------------------------------------------------------

-- Usuário Admin (ID 1) e Mock Básico (ID 2)
INSERT INTO tb_users (user_id, enabled, created_at, updated_at, password, email, name)
VALUES
(ADMIN_UUID, TRUE, NOW() - INTERVAL '6 month', NOW(), MOCK_PASSWORD_HASH, 'admin.master@mock.com', 'System Admin'),
('00000000-0000-0000-0000-000000000002', TRUE, NOW() - INTERVAL '5 month', NOW(), MOCK_PASSWORD_HASH, 'user.basic@mock.com', 'Basic User');

user_ids := ARRAY[ADMIN_UUID, '00000000-0000-0000-0000-000000000002'];

-- Loop para 18 usuários adicionais
FOR i IN 3..20 LOOP
    rand_user_id := gen_random_uuid();
    INSERT INTO tb_users (user_id, enabled, created_at, updated_at, password, email, name)
    VALUES
    (
        rand_user_id,
        TRUE,
        NOW() - (i || ' day')::INTERVAL,
        NOW(),
        MOCK_PASSWORD_HASH,
        'user' || i || '@test.com',
        CLIENT_NAMES[1 + mod(i, 20)] || ' ' || i
    );
    user_ids := array_append(user_ids, rand_user_id);
END LOOP;

--------------------------------------------------------------------------------
-- 4. RELACIONAMENTO DE ROLES (tb_users_roles)
--------------------------------------------------------------------------------

-- CORRIGIDO: Referencia user_id, não 'id'.
INSERT INTO tb_users_roles (user_id, role_id)
SELECT user_id, BASIC_ROLE_ID FROM tb_users WHERE user_id <> ADMIN_UUID;
INSERT INTO tb_users_roles (user_id, role_id)
VALUES (ADMIN_UUID, ADMIN_ROLE_ID);


--------------------------------------------------------------------------------
-- 5. PRODUTOS (tb_products) - 100 Produtos
--------------------------------------------------------------------------------

FOR i IN 1..100 LOOP
    rand_category_id := category_ids[1 + mod(i, array_length(category_ids, 1))];
    INSERT INTO tb_products (category_id, name, description, color, price, quantity_stock, created_at, updated_at)
    VALUES
    (
        rand_category_id,
        PRODUCT_ADJECTIVES[1 + mod(i, array_length(PRODUCT_ADJECTIVES, 1))] || ' ' || PRODUCT_NAMES_BASE[1 + mod(i, array_length(PRODUCT_NAMES_BASE, 1))] || ' ' || i,
        'Descrição detalhada do produto ' || i || '. Item essencial de cetim.',
        PRODUCT_COLORS[1 + mod(i, array_length(PRODUCT_COLORS, 1))],
        -- CORREÇÃO APLICADA AQUI: Adicionado ::NUMERIC
        ROUND(((random() * 100) + 15)::NUMERIC, 2), -- Preço entre 15 e 115
        FLOOR(random() * 200) + 10,     -- Estoque entre 10 e 210
        NOW() - (i || ' day')::INTERVAL,
        NOW()
    )
    RETURNING product_id INTO rand_product_id;
    product_ids := array_append(product_ids, rand_product_id);
END LOOP;

--------------------------------------------------------------------------------
-- 6. VENDAS (tb_sales) - 200 Vendas (Janeiro 2025 até Agora)
--------------------------------------------------------------------------------

-- Define o início do intervalo para 1º de Janeiro de 2025
DECLARE
    START_DATE DATE := DATE '2025-01-01';
    -- Calcula o número total de dias entre a data de início e a data atual (hoje)
    TOTAL_DAYS INT := (NOW()::DATE - START_DATE);
BEGIN

FOR i IN 1..200 LOOP
    -- Gera um número aleatório de dias dentro do período (0 até TOTAL_DAYS)
    DECLARE
        RANDOM_DAYS INT := FLOOR(random() * TOTAL_DAYS);
    BEGIN
        -- Calcula a data de venda adicionando os dias aleatórios à data de início
        current_sale_date := START_DATE + (RANDOM_DAYS || ' day')::INTERVAL;

        INSERT INTO tb_sales (sale_date, sale_channel, client, total_value)
        VALUES
        (
            current_sale_date,
            SALE_CHANNELS[1 + mod(i, array_length(SALE_CHANNELS, 1))],
            CLIENT_NAMES[1 + mod(i, 20)] || ' (Venda ' || i || ')',
            0.00 -- Valor inicial
        )
        RETURNING sale_id INTO rand_sale_id;
        sale_ids := array_append(sale_ids, rand_sale_id);
    END;
END LOOP;

-- Reassumindo as variáveis globais para a próxima seção (7)
END;

--------------------------------------------------------------------------------
-- 7. ITENS DE VENDA (tb_sale_items) - 300 Itens totais
--------------------------------------------------------------------------------

FOR i IN 1..300 LOOP
    rand_sale_id := sale_ids[1 + mod(i, array_length(sale_ids, 1))];
    rand_product_id := product_ids[1 + mod(i, array_length(product_ids, 1))];

    -- Removi o bloco DECLARE/BEGIN/END interno, movendo as variáveis para o DECLARE principal
    item_quantity := FLOOR(random() * 5) + 1; -- Quantidade entre 1 e 5
    item_price := (SELECT price FROM tb_products WHERE product_id = rand_product_id);
    sub_total_calc := item_price * item_quantity;

    INSERT INTO tb_sale_items (sale_id, product_id, quantity, unit_at_price, sub_total)
    VALUES
    (
        rand_sale_id,
        rand_product_id,
        item_quantity,
        item_price,
        sub_total_calc
    );

    -- Atualiza o valor total da venda
    UPDATE tb_sales
    SET total_value = total_value + sub_total_calc
    WHERE sale_id = rand_sale_id;
END LOOP;

--------------------------------------------------------------------------------
-- 8. TOKENS (tb_tokens) - Mock de alguns tokens ativos
--------------------------------------------------------------------------------

INSERT INTO tb_tokens (user_id, token, expiry_date)
VALUES
(
    ADMIN_UUID,
    'mock_admin_token_abcdef123456',
    NOW() + INTERVAL '1 hour'
),
(
    '00000000-0000-0000-0000-000000000002',
    'mock_basic_token_fedcba654321',
    NOW() + INTERVAL '1 day'
);

END;
$$;