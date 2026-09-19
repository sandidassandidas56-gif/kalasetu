CREATE TABLE IF NOT EXISTS seller_profiles (
  id text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  "avatarUrl" text NOT NULL DEFAULT '',
  "shopName" text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  "sellerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  "imageUrl" text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT 'available',
  published boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON products ("sellerId");
CREATE INDEX IF NOT EXISTS products_published_idx ON products (published);
