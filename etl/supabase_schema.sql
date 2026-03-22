-- ─────────────────────────────────────────────────────────────
-- indias-crime-ledger — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Create main table
CREATE TABLE crime_data (
  id         SERIAL PRIMARY KEY,
  state      TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  year       INT  NOT NULL,
  count      INT  NOT NULL
);

-- 2. Indexes for fast frontend queries
CREATE INDEX idx_crime_year       ON crime_data(year);
CREATE INDEX idx_crime_state      ON crime_data(state);
CREATE INDEX idx_crime_type       ON crime_data(crime_type);
CREATE INDEX idx_crime_year_state ON crime_data(year, state);

-- 3. Row Level Security (Supabase best practice)
ALTER TABLE crime_data ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read access (frontend needs this)
CREATE POLICY "Public read access"
  ON crime_data FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- Verification queries (run after CSV import):
-- ─────────────────────────────────────────────────────────────

-- Total rows (should be ~8030)
-- SELECT COUNT(*) FROM crime_data;

-- Years available
-- SELECT DISTINCT year FROM crime_data ORDER BY year;

-- States available
-- SELECT DISTINCT state FROM crime_data ORDER BY state;

-- Top 5 states by murder in 2023
-- SELECT state, count FROM crime_data
-- WHERE crime_type = 'Murder' AND year = 2023
-- ORDER BY count DESC LIMIT 5;

-- Crime totals by type for 2023
-- SELECT crime_type, SUM(count) as total
-- FROM crime_data WHERE year = 2023
-- GROUP BY crime_type ORDER BY total DESC;