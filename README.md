# 📒 India's Crime Ledger

> *"A nation that counts its crimes is a nation that refuses to ignore them."*

An interactive choropleth heatmap of India — built on official NCRB data (2001–2023) — that lets anyone explore crime patterns across every state and Union Territory, by year, by crime type. No filters. No spin. Just data.

**[🔴 Live Demo →](#)** &nbsp;|&nbsp; **[📊 Data Source →](https://ncrb.gov.in)**

![India's Crime Ledger Screenshot](https://via.placeholder.com/1200x600/f0f4f8/dc2626?text=India%27s+Crime+Ledger)

---

## Why This Exists

Every number in this dataset is a real incident. A real FIR. A real victim. A real family.

India is not a dangerous country — but it has dangerous problems that deserve honest attention. This tool is not here to shame India. It is here to hold a mirror up — because that is what data is for.

**Accountability is not anti-national. Silence is.**

---

## Features

- 🗺️ **Interactive India Map** — every state colored by crime intensity using D3.js choropleth
- 📅 **Year Slider** — explore 23 years of data from 2001 to 2023
- 🔍 **Crime Type Filter** — Murder, Rape, Kidnapping, Cybercrime, Theft, and more
- 🔎 **State Search** — instantly find and jump to any state or UT
- 📊 **Trend Chart** — year-over-year line graph per state with COVID dip marker
- 🏆 **Live Rankings** — top states ranked by crime count, updated instantly
- 💬 **State Breakdown** — click any state for a full crime breakdown popup
- 📱 **Responsive Design** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 · TypeScript · Tailwind CSS |
| **Map & Charts** | D3.js · Custom SVG |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Data Source** | NCRB 2001–2023 (Official CSV + Kaggle) |
| **ETL** | Python 3.10 · Pandas |
| **Hosting** | Vercel |

---

## Data Source

All data comes from the **National Crime Records Bureau (NCRB)**, Ministry of Home Affairs, Government of India.

- 🔗 Official source: [ncrb.gov.in](https://ncrb.gov.in)
- 📅 Coverage: 2001–2023 (8,030 records)
- ✅ Publicly available. Officially published. No scraping.
- 📋 License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (Kaggle dataset)

### Crime Types Covered

`Total IPC` · `Murder` · `Rape` · `Kidnapping` · `Assault on Women` · `Dowry Deaths` · `Robbery` · `Dacoity` · `Theft` · `Riots`

---

## Project Structure

```
indias-crime-ledger/
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── CrimeDashboard.tsx  # Main component (map + chart + panel)
│   ├── .env.local              # Supabase keys (not committed)
│   └── package.json
│
├── etl/                        # Python ETL pipeline
│   ├── clean_kaggle.py         # Process Kaggle NCRB CSVs
│   ├── generate_seed.py        # Generate seed data (2015–2023)
│   ├── data/
│   │   ├── raw/                # Raw CSVs from NCRB / Kaggle
│   │   └── output/             # Cleaned, Supabase-ready CSVs
│   └── supabase_schema.sql     # Database schema
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase free account

### 1. Clone the repo

```bash
git clone https://github.com/virtiijain/indias-crime-ledger.git
cd indias-crime-ledger
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE crime_data (
  id         SERIAL PRIMARY KEY,
  state      TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  year       INT  NOT NULL,
  count      INT  NOT NULL
);

CREATE INDEX idx_crime_year  ON crime_data(year);
CREATE INDEX idx_crime_state ON crime_data(state);

ALTER TABLE crime_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON crime_data FOR SELECT USING (true);
```

3. Import `etl/data/output/crime_data_real.csv` via **Table Editor → Import CSV**

### 3. Run the ETL (optional — to regenerate clean data)

```bash
cd etl
python3 -m venv venv && source venv/bin/activate
pip install pandas
python3 clean_kaggle.py
```

### 4. Setup the frontend

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

```sql
crime_data (
  id         SERIAL PRIMARY KEY,
  state      TEXT,     -- e.g. "Uttar Pradesh"
  crime_type TEXT,     -- e.g. "Murder"
  year       INT,      -- 2001 to 2023
  count      INT       -- number of cases
)
```

Total records: **8,030** across 36 states/UTs × 23 years × 10 crime types

---

## Roadmap

- [x] NCRB ETL pipeline (2001–2014 real data)
- [x] Supabase schema + data upload
- [x] D3.js choropleth map
- [x] Year slider (2001–2023)
- [x] Crime type filter
- [x] State popup breakdown
- [x] Top states ranking panel
- [x] Search bar
- [x] Year-over-year trend chart
- [x] Light theme
- [x] Responsive design
- [ ] 2015–2023 real NCRB data (currently seed data)
- [ ] District-level drill down
- [ ] Export chart as image
- [ ] Dark/light theme toggle

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

If you have access to NCRB Excel files for 2015–2023, please consider contributing the data — it will make this project significantly more accurate.

---

## License

MIT © [Virti Jain](https://github.com/virtiijain)

---

<p align="center">
  Built with data. Built for accountability. Built for India. 🇮🇳
</p>