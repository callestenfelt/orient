import geopandas as gpd
from pathlib import Path

# Directories
shapefile_dir = Path("EuropeanBorders_WWII")
geojson_dir = Path("geojson")

# Test with the December files for each year (we don't need all months)
december_files = [
    "December_31_1938.shp",
    "December_31_1939.shp",
    "December_31_1940.shp",
    "December_31_1941.shp",
    "December_31_1942.shp",
    "December_31_1943.shp",
    "December_31_1944.shp"
]

print("Converting shapefiles to WGS84 GeoJSON...")

for shp_name in december_files:
    shp_file = shapefile_dir / shp_name
    if shp_file.exists():
        print(f"\nProcessing {shp_name}...")

        # Read shapefile
        gdf = gpd.read_file(shp_file)
        print(f"  Original CRS: {gdf.crs}")
        print(f"  Features: {len(gdf)}")

        # Reproject to WGS84 (EPSG:4326) - required for Mapbox
        gdf_wgs84 = gdf.to_crs(epsg=4326)
        print(f"  Reprojected to: {gdf_wgs84.crs}")

        # Check bounds after reprojection
        bounds = gdf_wgs84.total_bounds
        print(f"  WGS84 bounds: {bounds}")

        # Save as GeoJSON
        output_file = geojson_dir / f"{shp_file.stem}.geojson"
        gdf_wgs84.to_file(output_file, driver="GeoJSON")
        print(f"  OK Saved to {output_file}")

print("\nConversion complete!")
