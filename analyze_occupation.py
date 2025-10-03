import geopandas as gpd
from pathlib import Path

# Check a few key dates
test_files = [
    "geojson/December_31_1939.geojson",  # Before major invasions
    "geojson/December_31_1941.geojson",  # Height of expansion
    "geojson/December_31_1944.geojson",  # Beginning of collapse
]

for geojson_file in test_files:
    print(f"\n=== {Path(geojson_file).stem} ===")
    gdf = gpd.read_file(geojson_file)

    # Get unique occupation statuses
    foreign_powers = gdf['Foreign_Po'].dropna().unique()
    print(f"Occupation types found:")
    for fp in sorted(foreign_powers):
        count = len(gdf[gdf['Foreign_Po'] == fp])
        print(f"  - {fp}: {count} territories")

    # Show German-occupied territories
    german_occupied = gdf[gdf['Foreign_Po'].str.contains('German', na=False, case=False)]
    if len(german_occupied) > 0:
        print(f"\nGerman-occupied territories ({len(german_occupied)}):")
        for _, row in german_occupied.iterrows():
            print(f"  - {row['Name']}: {row['Foreign_Po']}")
