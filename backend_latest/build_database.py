import pandas as pd
import numpy as np
import os

# --- CONFIGURATION ---
FILES = ["raw_data1.csv", "raw_data2.csv"] # We scan these files
OUTPUT_FILE = "tourism_dataset.csv"

all_data = []

print("🏗️  Building Master Database from Renamed Files...")

for filename in FILES:
    if not os.path.exists(filename):
        print(f"❌ Error: {filename} not found. Please check the backend folder.")
        continue

    try:
        print(f"   -> Analyzing {filename}...")
        
        # Try reading (handling possible encoding issues)
        try:
            df = pd.read_csv(filename, encoding='utf-8')
        except:
            df = pd.read_csv(filename, encoding='latin1')

        # =========================================================
        # DETECT: Is this the UNESCO Dataset?
        # =========================================================
        if 'states_name_en' in df.columns:
            print("      ✅ Detected: UNESCO Heritage Sites")
            
            clean_df = pd.DataFrame()
            clean_df['destination'] = df['name_en']
            clean_df['country'] = df['states_name_en']
            # Create rich tags
            clean_df['tags'] = df['category'] + " " + df['region_en'] + " Historic Landmark World Heritage"
            
            # Clean description (remove HTML like <em>)
            clean_df['description'] = df['short_description_en'].astype(str).str.replace(r'<[^>]*>', '', regex=True)
            
            # Stats
            clean_df['rating'] = np.random.uniform(4.5, 5.0, size=len(clean_df)).round(1)
            clean_df['popularity'] = np.random.randint(50, 95, size=len(clean_df))
            clean_df['price_level'] = np.random.randint(1, 4, size=len(clean_df))
            
            all_data.append(clean_df)

        # =========================================================
        # DETECT: Is this the CITIES Dataset?
        # =========================================================
        elif 'budget_level' in df.columns or 'city' in df.columns:
            print("      ✅ Detected: Worldwide Travel Cities")
            
            clean_df = pd.DataFrame()
            # Handle column names (lowercase 'city' in your file)
            col_city = 'city' if 'city' in df.columns else 'City'
            col_country = 'country' if 'country' in df.columns else 'Country'
            
            clean_df['destination'] = df[col_city]
            clean_df['country'] = df[col_country]
            
            # Intelligent Tagging based on scores
            def get_city_tags(row):
                tags = ["City Trip"]
                if row.get('nature', 0) > 3: tags.append("Nature Landscape")
                if row.get('culture', 0) > 3: tags.append("Culture History Art")
                if row.get('adventure', 0) > 3: tags.append("Adventure Hiking")
                if row.get('beaches', 0) > 3: tags.append("Beach Sea Tropical")
                if row.get('nightlife', 0) > 3: tags.append("Nightlife Party")
                return " ".join(tags)

            clean_df['tags'] = df.apply(get_city_tags, axis=1)
            clean_df['description'] = df.get('short_description', "Explore " + clean_df['destination'])
            
            # Map Budget Level to Price ($$$)
            budget_map = {'Budget': 1, 'Mid-range': 3, 'Luxury': 5}
            if 'budget_level' in df.columns:
                clean_df['price_level'] = df['budget_level'].map(budget_map).fillna(3).astype(int)
            else:
                clean_df['price_level'] = 3

            # Stats
            clean_df['rating'] = np.random.uniform(3.5, 5.0, size=len(clean_df)).round(1)
            clean_df['popularity'] = np.random.randint(60, 100, size=len(clean_df))
            
            all_data.append(clean_df)

        else:
            print("      ⚠️ Unknown file format. Skipping.")
            print(f"      (Columns found: {list(df.columns)[:5]}...)")

    except Exception as e:
        print(f"❌ Error reading {filename}: {e}")

# =========================================================
# MERGE AND SAVE
# =========================================================
if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Shuffle the data
    final_df = final_df.sample(frac=1).reset_index(drop=True)
    
    # Final cleanup
    final_df = final_df.dropna(subset=['destination'])
    
    final_df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 SUCCESS! Master Database built with {len(final_df)} locations.")
    print(f"   -> Saved to: {OUTPUT_FILE}")
else:
    print("\n❌ Failed. No valid data was processed.")