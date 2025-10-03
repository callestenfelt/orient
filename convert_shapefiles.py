import geopandas as gpd
import os
from pathlib import Path

# Directories
shapefile_dir = Path("EuropeanBorders_WWII")
geojson_dir = Path("geojson")

# Create output directory
geojson_dir.mkdir(exist_ok=True)

# Get all .shp files
shapefiles = list(shapefile_dir.glob("*.shp"))

print(f"Found {len(shapefiles)} shapefiles to convert")

# Convert each shapefile
for i, shp_file in enumerate(shapefiles, 1):
    try:
        # Read shapefile
        gdf = gpd.read_file(shp_file)

        # Output filename
        output_file = geojson_dir / f"{shp_file.stem}.geojson"

        # Convert to GeoJSON
        gdf.to_file(output_file, driver="GeoJSON")

        print(f"[{i}/{len(shapefiles)}] Converted {shp_file.name}")

    except Exception as e:
        print(f"Error converting {shp_file.name}: {e}")

print(f"\nConversion complete! GeoJSON files saved to {geojson_dir}")
