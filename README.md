# Orient - Interactive WW2 Timeline

An interactive web application displaying historical events from World War II (1938-1946) on an interactive map of Europe with a year-tabbed timeline navigation system.

## Live Demos

- **Main Version**: [https://callestenfelt.github.io/orient/](https://callestenfelt.github.io/orient/)
- **Tabs Version**: [https://callestenfelt.github.io/orient/tabs/](https://callestenfelt.github.io/orient/tabs/) (Year-tabbed timeline)
- **Map Version**: [https://callestenfelt.github.io/orient/map/](https://callestenfelt.github.io/orient/map/)

## Features

- **Year-Tabbed Timeline**: Navigate through 1933-1948 with interactive year tabs
- **Interactive Map**: Mapbox GL JS displaying historical European borders that change over time
- **Dynamic Borders**: Historical border GeoJSON files showing territorial changes throughout the war
- **Territory Information**: Click on countries to view detailed information about their role in WWII
- **Event Markers**: Visual markers on the map showing event locations with collision detection
- **Bilingual Support**: Full Swedish and English language support
- **Event Display**: Rich event content with images, descriptions, and historical context
- **Smooth Animations**: Fluid year transitions with "ruler sliding" effect
- **Sweden Overlay**: Interactive Sweden border overlay with historical context
- **Image Gallery**: Full-screen image viewing with captions

## Color Scheme

### Map Legend Colors
- **Germany**: `#ECB8B8` / Occupied: `#F5DBDB`
- **Italy**: `#99D3B5` / Occupied: `#CCE9DA`
- **Axis Powers**: `#E8D8AD` / Occupied: `#F5EFDE`
- **Sweden**: `#ADD6E8`

### UI Colors
- **Dark Blue**: `#192238` (Primary UI elements, text)
- **Yellow**: `#F7C843` (Navigation buttons, active states)
- **White**: `#FFFFFF` (Backgrounds, overlays)
- **Beige**: `#EFEDEA` (Timeline background)

## File Structure

```
E:\orient\
├── index.html              # Main HTML structure
├── styles.css              # All styling
├── app.js                  # JavaScript logic with year-based timeline
├── events.csv              # Historical event data (58 events, 1938-1946)
├── translations-sv.json    # Swedish translations
├── translations-en.json    # English translations
├── geojson/               # Historical border data by month
│   ├── se.json            # Sweden border overlay
│   └── [Monthly GeoJSON files for 1938-1945]
└── gfx/                   # Icons and event images
    ├── images/            # Historical photographs
    └── [UI icons]
```

## Technical Details

### Configuration
- Viewport: Responsive design optimized for desktop
- Starting year: 1938
- Mapbox style: Language-aware (Swedish/English map labels)
- Mapbox token: `pk.eyJ1IjoiZXBvb2siLCJhIjoiQjBxamU5RSJ9.srKOyc2kfn-OudQVdVXSxA`

### Key Features Implementation

#### Year-Tabbed Timeline
- Year pills (1933-1948) function as tabs
- Only events from selected year are displayed
- Smooth slide animations when switching years (1.8s duration)
- Month labels show temporal context within each year

#### Event Collision Detection
- Minimum 8px spacing between timeline markers
- Automatic position adjustment for overlapping events
- Maintains chronological order while preventing visual overlap

#### Map Integration
- Dynamic border loading based on event date
- Distance-based camera transitions (2-8 seconds)
- Territory hover effects with opacity changes
- Sweden overlay with interactive click functionality

#### Smooth Dragging
- RequestAnimationFrame optimization for 60fps updates
- Conditional CSS transitions (disabled during drag, enabled for programmatic movement)
- Real-time tooltip updates while dragging

### CSV Format
```
Datum,Rubrik SV,Rubrik EN,Ingress SV,Ingress EN,Bildtext SV,Bildtext EN,Bild-URL
1938-03-12,Swedish Title,English Title,SV Description,EN Description,SV Caption,EN Caption,image.webp
```

## Setup

### Local Development
1. Clone the repository
2. Start a local server (required for CSV/GeoJSON loading):
   ```bash
   python -m http.server 8000
   # or
   php -S localhost:8000
   ```
3. Open browser to `http://localhost:8000`

### Deployment
The project is deployed via GitHub Pages from the `gh-pages` branch:
- Root: Main version
- `/tabs/`: Year-tabbed version
- `/map/`: Alternative map version

## Usage

### Navigation
- **Year Pills**: Click to switch between years (1933-1948)
- **Arrow Buttons**: Navigate between events chronologically
- **Timeline Handle**: Drag to scrub through events within the current year
- **Event Markers**: Click timeline dots to jump to specific events
- **Map Territories**: Click countries to view historical information

### Language Switching
- Click the globe icon (top-right) to toggle between Swedish and English
- Changes map labels, UI text, and event content

### Information Dialog
- Click "Information" button for help and credits
- View image sources with full attribution
- Explore timeline features and navigation tips

## Browser Compatibility

- Requires modern browser with ES6+ support
- Mapbox GL JS v2.15.0
- CSS Grid and Flexbox
- CSS custom properties (variables)

## Data Sources and Credits

### Historical Borders
European Borders 1938-1945 dataset from Stanford University.
Copyright 2014 Stanford University. All rights reserved.
[The Spatial History Project](http://www.stanford.edu/group/spatialhistory/)

### Sweden Border Data
GIS data from SimpleMaps, licensed under CC BY 4.0.
[SimpleMaps Sweden Data](https://simplemaps.com/gis/country/se#all)
[CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/)

### Technology Stack
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) for interactive mapping
- Vanilla JavaScript (no frameworks)
- Custom CSV/GeoJSON parsing
- Pure CSS animations and transitions

### Images
Historical photographs from various archives including:
- Bundesarchiv (German Federal Archive)
- Svenska Museet för Intelsen (Swedish Museum of the Intelsen)
- National Archives
- See "Image Sources" in the Information dialog for complete attribution

## Development Notes

### Key Functions
- `loadEvents()`: Fetches and parses CSV data with bilingual support
- `switchToYear()`: Handles year tab switching with animations
- `createTimelineMarkers()`: Generates event markers with collision detection
- `updateBorders()`: Loads appropriate historical border GeoJSON
- `loadSwedenOverlay()`: Adds Sweden border with interactive features
- `initTimelineDragging()`: Optimized dragging with requestAnimationFrame

### Animation System
- Year transitions: 1.8s with cubic-bezier easing
- Map flyTo: Distance-based duration (2-8 seconds)
- Timeline markers: Slide animations with 50/50 keyframe split
- Hover effects: Animated underlines with scaleX transforms

## License

This project includes data from multiple sources with varying licenses. See individual credits above for specific licensing information.

## Contributing

This is a historical education project. Contributions for historical accuracy, additional translations, or technical improvements are welcome.
