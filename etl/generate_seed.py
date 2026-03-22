"""
generate_seed.py — Seed data generator for 2015–2023
=====================================================
Generates realistic crime data for 2015–2023 based on:
  - Real 2014 NCRB baseline values per state
  - Actual NCRB trends (COVID dip 2020, rising assault reporting, etc.)
  - ±12% random variance to simulate real data

Usage:
    python3 generate_seed.py

Output:
    data/output/crime_2015_2023.csv
    → Upload to Supabase (INSERT INTO crime_data)

NOTE: Replace with real NCRB data when available at ncrb.gov.in
"""

import csv, random, os

random.seed(99)

# Real 2014 state totals (approximate from Kaggle NCRB data)
BASELINE_2014 = {
    "Uttar Pradesh": 480950, "Maharashtra": 452000, "Madhya Pradesh": 420000,
    "Rajasthan": 390000, "Tamil Nadu": 370000, "Kerala": 350000,
    "Karnataka": 330000, "West Bengal": 310000, "Andhra Pradesh": 290000,
    "Gujarat": 280000, "Bihar": 270000, "Odisha": 220000,
    "Telangana": 200000, "Jharkhand": 180000, "Chhattisgarh": 170000,
    "Haryana": 165000, "Punjab": 140000, "Assam": 135000,
    "Delhi": 350000, "Jammu & Kashmir": 65000, "Uttarakhand": 75000,
    "Himachal Pradesh": 42000, "Goa": 28000, "Chandigarh": 22000,
    "Manipur": 18000, "Meghalaya": 16000, "Tripura": 20000,
    "Nagaland": 12000, "Mizoram": 10000, "Arunachal Pradesh": 11000,
    "Sikkim": 5000, "Ladakh": 4000, "Lakshadweep": 500,
    "Andaman & Nicobar Islands": 3500,
    "Dadra & Nagar Haveli and Daman & Diu": 4200,
    "Puducherry": 8000,
}

# Crime type proportions of Total IPC
CRIME_PROPORTIONS = {
    "Murder": 0.010, "Rape": 0.016, "Kidnapping": 0.022,
    "Assault on Women": 0.028, "Dowry Deaths": 0.006,
    "Robbery": 0.008, "Dacoity": 0.003, "Theft": 0.180,
    "Riots": 0.012,
}

def year_growth(year, crime_type):
    """
    Growth multipliers based on real NCRB trends:
    - General crime: ~3.8% YoY growth
    - COVID 2020: ~28% drop across all crimes
    - Rape/Assault: higher growth due to increased reporting post-2012
    - Dacoity/Robbery: declining trend
    """
    base = year - 2014
    covid = 0.72 if year == 2020 else 1.0

    rates = {
        "Murder": 0.008, "Rape": 0.055, "Kidnapping": 0.045,
        "Assault on Women": 0.062, "Dowry Deaths": 0.012,
        "Robbery": 0.015, "Dacoity": 0.010, "Theft": 0.025,
        "Riots": 0.020, "Total IPC": 0.038,
    }
    growth = 1 + (base * rates.get(crime_type, 0.038))
    return growth * covid

rows = []
for state, base_total in BASELINE_2014.items():
    for year in range(2015, 2024):
        # Total IPC
        total = int(base_total * year_growth(year, "Total IPC") * random.uniform(0.94, 1.06))
        rows.append({"state": state, "crime_type": "Total IPC", "year": year, "count": total})

        # Individual crime types
        for crime, prop in CRIME_PROPORTIONS.items():
            count = int(base_total * prop * year_growth(year, crime) * random.uniform(0.88, 1.12))
            rows.append({"state": state, "crime_type": crime, "year": year, "count": max(1, count)})

os.makedirs("data/output", exist_ok=True)
OUTPUT = "data/output/crime_2015_2023.csv"

with open(OUTPUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["state", "crime_type", "year", "count"])
    w.writeheader()
    w.writerows(rows)

print(f"✅ Generated {len(rows):,} rows → {OUTPUT}")
print(f"\nNext step — run this in Supabase SQL Editor:")
print("""
  -- After importing crime_2015_2023.csv as table '2015-2023':
  INSERT INTO crime_data (state, crime_type, year, count)
  SELECT state, crime_type, year, count FROM "2015-2023";
  DROP TABLE "2015-2023";
""")