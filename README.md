# 📒 indias-crime-ledger

> *"A nation that counts its crimes is a nation that refuses to ignore them."*

---

![Data Source](https://img.shields.io/badge/Data%20Source-NCRB%20Official-red?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20D3.js%20%2B%20Supabase-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Building-orange?style=for-the-badge)

---

## The Truth Nobody Visualizes

India files **millions of FIRs every year.**  
The government publishes the data — every year, openly, on ncrb.gov.in.  
Most people never see it.  
Most developers never touch it.

**This project changes that.**

`indias-crime-ledger` is an interactive choropleth heatmap of India — built on **official NCRB data (2018–2022)** — that lets anyone explore crime patterns across every state and Union Territory, by year, by crime type, no filters, no spin.

Because the first step to fixing a problem is **refusing to look away from it.**

---

## What This Is

- 🗺️ **An interactive SVG map of India** — every state colored by crime intensity
- 📅 **A year slider (2018–2022)** — watch how numbers shifted over 5 years
- 🔍 **Crime type filter** — murder, rape, kidnapping, cybercrime, theft — all of it
- 🏆 **State rankings** — safest to most dangerous, ranked by data, not opinion
- 💬 **Click any state** — get a full crime breakdown popup, no sugarcoating

---

## Why This Matters

Every number in this dataset is a real incident.  
A real FIR. A real victim. A real family.

India is not a dangerous country — but it has dangerous problems that deserve honest attention.  
This tool is not here to shame India.  
It is here to **hold a mirror up** — because that is what data is for.

Accountability is not anti-national. **Silence is.**

---

## Architecture

```
NCRB Official CSV (ncrb.gov.in)
           ↓
   Python ETL — Pandas
   • Clean messy state names
   • Normalize crime categories
   • Reshape for database
           ↓
      Supabase (PostgreSQL)
   • crime_data(state, type, year, count)
           ↓
   React + D3.js Frontend
   • Choropleth SVG Map
   • Year Slider
   • Crime Type Filter
   • State Popup
   • Top 5 Ranking Panel
```

---

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Data Source | NCRB 2018–2022 (CSV)    |
| ETL         | Python 3.10 + Pandas    |
| Database    | Supabase (PostgreSQL)   |
| Frontend    | React + D3.js           |
| Hosting     | Vercel                  |

---

## Get It Running

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase free account

### Step 1 — Get the Data

Go to [ncrb.gov.in](https://ncrb.gov.in) → Publications → Crime in India → Download state-wise tables (2018–2022). It's free. It's official. It's public.

### Step 2 — Run the ETL

```bash
cd etl
pip install pandas
python clean.py
```

### Step 3 — Setup Supabase

Create a new project at [supabase.com](https://supabase.com) and run:

```sql
CREATE TABLE crime_data (
  id         SERIAL PRIMARY KEY,
  state      TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  year       INT NOT NULL,
  count      INT NOT NULL
);
```

Add your keys to `frontend/.env`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

→ Open `http://localhost:5173`

---

## Data Source

**National Crime Records Bureau (NCRB)**  
Ministry of Home Affairs, Government of India  
🔗 https://ncrb.gov.in  
📅 2018 – 2022  
✅ Publicly available. Officially published. No scraping needed.

---

## Roadmap

- [x] Project architecture
- [ ] NCRB ETL pipeline
- [ ] Supabase schema + data upload
- [ ] D3.js choropleth map
- [ ] Year slider
- [ ] Crime type filter
- [ ] State popup breakdown
- [ ] Top 5 state ranking
- [ ] Mobile responsive
- [ ] Dark mode

---

<div align="center">

**Built with data. Built for accountability. Built for India.**

</div>
