-- ========================================================
-- RIFTBOUND DATABASE SCHEMA (PostgreSQL / Supabase)
-- ========================================================

-- Tabla de Cartas
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set_name VARCHAR(100),
    card_type VARCHAR(100),
    energy_cost INTEGER,
    element VARCHAR(50),
    rarity VARCHAR(50),
    ability_text TEXT,
    image_url TEXT,
    card_code VARCHAR(100),
    tags TEXT
);

-- Tabla de Colección de Usuario
CREATE TABLE IF NOT EXISTS user_collection (
    card_id VARCHAR(255) PRIMARY KEY REFERENCES cards(id) ON UPDATE CASCADE ON DELETE CASCADE,
    normal_count INTEGER DEFAULT 0,
    foil_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Mazos
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    legend_id VARCHAR(255) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE SET NULL,
    champion_id VARCHAR(255) REFERENCES cards(id) ON UPDATE CASCADE ON DELETE SET NULL,
    favorite BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Cartas por Mazo
CREATE TABLE IF NOT EXISTS deck_cards (
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id VARCHAR(255) NOT NULL REFERENCES cards(id) ON UPDATE CASCADE ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (deck_id, card_id, section)
);
