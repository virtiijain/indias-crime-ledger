"""
clean_kaggle.py — ETL for indias-crime-ledger
==============================================
Input  : Kaggle NCRB CSVs (district-wise, 2001-2014)
         Place in: etl/data/raw/
Output : crime_data_real.csv → Upload to Supabase

Usage:
    cd etl
    python3 -m venv venv && source venv/bin/activate
    pip install pandas
    python3 clean_kaggle.py
"""

import csv, os

# ── CONFIG ────────────────────────────────────────────────────────────────
INPUT_FILES = [
    "data/raw/01_District_wise_crimes_committed_IPC_2001_2012.csv",
    "data/raw/01_District_wise_crimes_committed_IPC_2013.csv",
    "data/raw/01_District_wise_crimes_committed_IPC_2014.csv",
]
OUTPUT_FILE = "data/output/crime_data_real.csv"
YEAR_RANGE  = range(2001, 2015)

# ── STATE NAME NORMALIZER ─────────────────────────────────────────────────
STATE_ALIASES = {
    "A & N ISLANDS":         "Andaman & Nicobar Islands",
    "ANDAMAN AND NICOBAR":   "Andaman & Nicobar Islands",
    "D & N HAVELI":          "Dadra & Nagar Haveli and Daman & Diu",
    "DAMAN & DIU":           "Dadra & Nagar Haveli and Daman & Diu",
    "JAMMU & KASHMIR":       "Jammu & Kashmir",
    "J & K":                 "Jammu & Kashmir",
    "NCT OF DELHI":          "Delhi",
    "DELHI":                 "Delhi",
    "ORISSA":                "Odisha",
    "PONDICHERRY":           "Puducherry",
    "UTTARANCHAL":           "Uttarakhand",
    "ANDHRA PRADESH":        "Andhra Pradesh",
    "ARUNACHAL PRADESH":     "Arunachal Pradesh",
    "ASSAM":                 "Assam",
    "BIHAR":                 "Bihar",
    "CHHATTISGARH":          "Chhattisgarh",
    "GOA":                   "Goa",
    "GUJARAT":               "Gujarat",
    "HARYANA":               "Haryana",
    "HIMACHAL PRADESH":      "Himachal Pradesh",
    "JHARKHAND":             "Jharkhand",
    "KARNATAKA":             "Karnataka",
    "KERALA":                "Kerala",
    "MADHYA PRADESH":        "Madhya Pradesh",
    "MAHARASHTRA":           "Maharashtra",
    "MANIPUR":               "Manipur",
    "MEGHALAYA":             "Meghalaya",
    "MIZORAM":               "Mizoram",
    "NAGALAND":              "Nagaland",
    "ODISHA":                "Odisha",
    "PUNJAB":                "Punjab",
    "RAJASTHAN":             "Rajasthan",
    "SIKKIM":                "Sikkim",
    "TAMIL NADU":            "Tamil Nadu",
    "TELANGANA":             "Telangana",
    "TRIPURA":               "Tripura",
    "UTTAR PRADESH":         "Uttar Pradesh",
    "UTTARAKHAND":           "Uttarakhand",
    "WEST BENGAL":           "West Bengal",
    "CHANDIGARH":            "Chandigarh",
    "LAKSHADWEEP":           "Lakshadweep",
    "PUDUCHERRY":            "Puducherry",
}

def normalize_state(raw):
    return STATE_ALIASES.get(raw.strip().upper(), raw.strip().title())

def safe_int(val):
    try:
        return int(str(val).strip().replace(',', ''))
    except:
        return 0

def find_col(headers, *candidates):
    hl = [h.lower().strip() for h in headers]
    for c in candidates:
        for i, h in enumerate(hl):
            if c.lower() in h:
                return headers[i]
    return None

# ── PROCESS ───────────────────────────────────────────────────────────────
state_year_crime = {}

for filepath in INPUT_FILES:
    if not os.path.exists(filepath):
        print(f"⚠️  Not found: {filepath} — skipping")
        continue

    print(f"📂 Processing: {filepath}")
    with open(filepath, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames

        col_state   = find_col(headers, 'state/ut', 'states/uts', 'state')
        col_year    = find_col(headers, 'year')
        col_murder  = find_col(headers, 'murder')
        col_rape    = find_col(headers, 'rape')
        col_kidnap  = find_col(headers, 'kidnapping & abduction_total', 'kidnapping & abduction', 'kidnapping')
        col_dacoity = find_col(headers, 'dacoity')
        col_robbery = find_col(headers, 'robbery')
        col_theft   = find_col(headers, 'theft')
        col_riots   = find_col(headers, 'riots')
        col_dowry   = find_col(headers, 'dowry deaths')
        col_assault = find_col(headers, 'assault on women')
        col_total   = find_col(headers, 'total ipc crimes', 'total cognizable ipc')

        crime_col_map = {
            "Murder":           col_murder,
            "Rape":             col_rape,
            "Kidnapping":       col_kidnap,
            "Dacoity":          col_dacoity,
            "Robbery":          col_robbery,
            "Theft":            col_theft,
            "Riots":            col_riots,
            "Dowry Deaths":     col_dowry,
            "Assault on Women": col_assault,
            "Total IPC":        col_total,
        }

        for row in reader:
            state = normalize_state(row.get(col_state, '') or '')
            try:
                year = int(str(row.get(col_year, '')).strip())
            except:
                continue
            if year not in YEAR_RANGE or not state:
                continue

            for crime_type, col in crime_col_map.items():
                if not col:
                    continue
                count = safe_int(row.get(col, 0))
                key = (state, year, crime_type)
                state_year_crime[key] = state_year_crime.get(key, 0) + count

# Fix duplicate state names
STATE_FIX = {
    'A&N Islands':  'Andaman & Nicobar Islands',
    'D&N Haveli':   'Dadra & Nagar Haveli and Daman & Diu',
    'Delhi Ut':     'Delhi',
}
fixed = {}
for (state, year, crime), count in state_year_crime.items():
    state = STATE_FIX.get(state, state)
    key = (state, year, crime)
    fixed[key] = fixed.get(key, 0) + count

# ── WRITE OUTPUT ──────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
rows_written = 0

with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['state', 'crime_type', 'year', 'count'])
    writer.writeheader()
    for (state, year, crime_type), count in sorted(fixed.items()):
        writer.writerow({'state': state, 'crime_type': crime_type, 'year': year, 'count': count})
        rows_written += 1

print(f"\n✅ Done!")
print(f"   Rows written : {rows_written}")
print(f"   Output file  : {OUTPUT_FILE}")
print(f"\n→ Upload {OUTPUT_FILE} to Supabase: Table Editor → crime_data → Import CSV")