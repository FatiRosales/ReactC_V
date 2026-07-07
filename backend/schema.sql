

-- Catálogo interno de acciones con precio fijo (lo que ves en "Cotizar")
CREATE TABLE IF NOT EXISTS catalogo (
    iid SERIAL PRIMARY KEY,
    simbolo VARCHAR(10) UNIQUE NOT NULL,
    Nombre VARCHAR(120) NOT NULL,
    precio NUMERIC(18,4) NOT NULL CHECK (precio >= 0),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portafolios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY,
    portafolio_id INTEGEER NOT NULL REFERENCES portafolios(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('compra', 'venta')),
    simbolo VARCHAR(10) NOT NULL,
    cantidad NUMERIC(18,4) NOT NULL CHECK (cantidad > 0),
    precio NUMERIC(18,4) NOT NULL CHECK (precio >= 0),
    -- Solo se llenan en ventas: precio de compra promedio usado como referencia
    -- y la ganancia/pérdida resultante de esa venta puntual.
    precio_compra_ref NUMERIC(18,4),
    ganancia_perdida NUMERIC(18,4),
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existía de una versión anterior, agrega las columnas nuevas:
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS precio_compra_ref NUMERIC(18,4);
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS ganancia_perdida NUMERIC(18,4);

CREATE INDEX IF NOT EXISTS idx_transacciones_portafolio ON transacciones(portafolio_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_simbolo ON transacciones(simbolo);
    ('META', 'Meta Platforms', 312.10)
ON CONFLICT (simbolo) DO NOTHING;

