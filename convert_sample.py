import geopandas as gpd
from pathlib import Path

# Test with just a few files
shapefile_dir = Path("EuropeanBorders_WWII")
geojson_dir = Path("geojson")
geojson_dir.mkdir(exist_ok=True)

# Convert just 3 sample files
test_files = [
    "December_31_1938.shp",
    "December_31_1941.shp",
    "December_31_1944.shp"
]

for shp_name in test_files:
    shp_file = shapefile_dir / shp_name
    if shp_file.exists():
        print(f"Converting {shp_name}...")
        gdf = gpd.read_file(shp_file)

        # Show info
        print(f"  Columns: {list(gdf.columns)}")
        print(f"  Features: {len(gdf)}")
        if len(gdf) > 0:
            print(f"  Sample properties: {dict(gdf.iloc[0])}")

        # Save GeoJSON
        output_file = geojson_dir / f"{shp_file.stem}.geojson"
        gdf.to_file(output_file, driver="GeoJSON")
        print(f"  Saved to {output_file}\n")

print("Sample conversion complete!")
