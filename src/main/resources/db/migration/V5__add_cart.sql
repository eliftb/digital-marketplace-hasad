-- ============================================================
-- V5: Alışveriş Sepeti (Cart & CartItem)
-- ============================================================

CREATE TABLE IF NOT EXISTS carts
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON carts (user_id);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart_items
(
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT        NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_id BIGINT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity   INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)   -- aynı ürün sepette bir kez
);

CREATE INDEX idx_cart_items_cart_id    ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);
