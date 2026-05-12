-- Store enum values as strings so Hibernate binds JPQL enum parameters
-- consistently and schema startup does not depend on PostgreSQL native enum
-- parameter casts.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE producer_profiles DROP CONSTRAINT IF EXISTS producer_profiles_approval_status_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_delivery_type_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_type_check;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_status_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE users
    ALTER COLUMN role DROP DEFAULT,
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE producer_profiles
    ALTER COLUMN approval_status DROP DEFAULT;

ALTER TABLE products
    ALTER COLUMN delivery_type DROP DEFAULT;

ALTER TABLE orders
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE order_items
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE payments
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(30) USING role::text,
    ALTER COLUMN status TYPE VARCHAR(30) USING status::text;

ALTER TABLE producer_profiles
    ALTER COLUMN approval_status TYPE VARCHAR(30) USING approval_status::text;

ALTER TABLE products
    ALTER COLUMN delivery_type TYPE VARCHAR(30) USING delivery_type::text;

ALTER TABLE orders
    ALTER COLUMN status TYPE VARCHAR(30) USING status::text,
    ALTER COLUMN delivery_type TYPE VARCHAR(30) USING delivery_type::text;

ALTER TABLE order_items
    ALTER COLUMN status TYPE VARCHAR(30) USING status::text;

ALTER TABLE payments
    ALTER COLUMN status TYPE VARCHAR(30) USING status::text;

ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'CONSUMER',
    ALTER COLUMN status SET DEFAULT 'ACTIVE';

ALTER TABLE producer_profiles
    ALTER COLUMN approval_status SET DEFAULT 'PENDING_APPROVAL';

ALTER TABLE products
    ALTER COLUMN delivery_type SET DEFAULT 'BOTH';

ALTER TABLE orders
    ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE order_items
    ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE payments
    ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE users
    ADD CONSTRAINT users_role_check
        CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PRODUCER', 'CONSUMER')),
    ADD CONSTRAINT users_status_check
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'BANNED'));

ALTER TABLE producer_profiles
    ADD CONSTRAINT producer_profiles_approval_status_check
        CHECK (approval_status IN ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'BANNED'));

ALTER TABLE products
    ADD CONSTRAINT products_delivery_type_check
        CHECK (delivery_type IN ('PICKUP', 'SHIPPING', 'BOTH'));

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
        CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),
    ADD CONSTRAINT orders_delivery_type_check
        CHECK (delivery_type IN ('PICKUP', 'SHIPPING', 'BOTH'));

ALTER TABLE order_items
    ADD CONSTRAINT order_items_status_check
        CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'));

ALTER TABLE payments
    ADD CONSTRAINT payments_status_check
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS account_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS delivery_type;
