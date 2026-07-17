import pandas as pd
import json
import os

# CONFIGURATION
INPUT_FILE = "airports.csv"
OUTPUT_FILE = "airport_codes.json"

print("✈️  Building Global Airport Index...")

if not os.path.exists(INPUT_FILE):
    print(f"❌ Error: '{INPUT_FILE}' not found. Please download it first!")
    exit()

try:
    # 1. Load the raw data
    # We only care about: 'municipality' (City), 'iata_code' (ABC), 'type' (Size)
    df = pd.read_csv(INPUT_FILE)
    
    # 2. FILTER: We only want real airports, not helipads or closed ones
    # Keep only 'large_airport' and 'medium_airport'
    valid_types = ['large_airport', 'medium_airport']
    df = df[df['type'].isin(valid_types)]
    
    # Drop airports with no IATA code
    df = df.dropna(subset=['iata_code', 'municipality'])

    # 3. PRIORITIZE: If a city has 2 airports (e.g. London), prioritize the 'large_airport'
    # Sort by type (large comes before medium alphabetically? No. We map custom sort)
    df['type_rank'] = df['type'].map({'large_airport': 1, 'medium_airport': 2})
    df = df.sort_values('type_rank')

    # 4. BUILD DICTIONARY
    # Format: { "london": "LHR", "new york": "JFK", "paris": "CDG" ... }
    city_map = {}
    
    for _, row in df.iterrows():
        city = str(row['municipality']).lower().strip()
        code = row['iata_code']
        
        # Only add if not exists (Because we sorted by size, the Big Airport gets added first!)
        if city not in city_map:
            city_map[city] = code

    # 5. SAVE
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(city_map, f)

    print(f"✅ Success! Indexed {len(city_map)} cities.")
    print(f"   -> Saved to {OUTPUT_FILE}")
    print("   -> Example: 'London' maps to", city_map.get('london'))

except Exception as e:
    print(f"❌ Error: {e}")