# Orient - Interactive WW2 Timeline

An interactive web application displaying historical events from 1933-1946 on a Mapbox map of Europe with timeline navigation.

## Features

- **Interactive Timeline**: Navigate through 1933-1946 with 5 event markers per year (70 total timeline dots, with 1946 having only 1 dot)
- **Map Integration**: Mapbox GL JS v2.15.0 with custom style showing Europe
- **Event Display**: Events shown as 60×80px circles with images that scale to 80px on hover
- **Progressive Reveal**: Events appear progressively based on timeline position (by month: Jan-Mar, Jan-Jun, Jan-Sep, Jan-Dec, All year)
- **Animations**: Events fade in once with staggered timing (250ms delay, 600ms duration), stay visible when navigating back
- **Timeline Navigation**: Click arrows, timeline dots, or use keyboard (left/right arrows)
- **Idle Animation**: Subtle pulsing rings on navigation arrows after 2 seconds of inactivity
- **Help System**: Welcome overlay with Swedish instructions that appears on first load
- **Language Selector**: UI for Swedish/English language switching (functionality placeholder)
- **Event Details**: Click events to see full information in side panel
- **Year Context**: Info box showing historical context for each year (350 character limit)

## Color Scheme

- **Dark Blue**: #213159 (navigation buttons, event markers, backgrounds)
- **Cream**: #e2dcd5 (text, borders on non-overlay elements)
- **Yellow**: #e6b730 (timeline progress, active markers, CTA button)
- **White**: Overlays and text boxes backgrounds

## File Structure

```
E:\orient\
├── index.html          # Main HTML structure
├── styles.css          # All styling (~600 lines)
├── app.js              # JavaScript logic (~510 lines)
├── events.csv          # Historical event data (57 events, 1938-1946)
└── README.md           # This file
```

## Technical Details

### Configuration
- Viewport: 1920×1024px (desktop optimized)
- Starting year: 1938 (event index 25)
- Mapbox style: `mapbox://styles/epook/cmap6hwka006b01sc6nhmh0kv`
- Mapbox token: `pk.eyJ1IjoiZXBvb2siLCJhIjoiQjBxamU5RSJ9.srKOyc2kfn-OudQVdVXSxA`

### Key Components
1. **Timeline System**: 70 event markers (5 per year from 1933-1945, 1 for 1946)
2. **Event Loading**: CSV parsing with date extraction and sorting
3. **Animation Tracking**: Uses Set to prevent re-animation of events
4. **Camera Movement**: Dynamic fitBounds with 800ms duration, padding for UI elements
5. **Date Parsing**: Handles ISO format (YYYY-MM-DD) and Swedish month names

### CSV Format
```
Datum,Rubrik,Ingress,Bild-URL
1938-03-12,Event Title,Event Description,https://image-url.jpg
```

### Year Descriptions
Predefined descriptions for years 1933-1937 (years without events in CSV):
- 1933: Hitler's appointment as Reich Chancellor
- 1934: Consolidation of power, Night of the Long Knives
- 1935: Nuremberg Laws
- 1936: Berlin Olympics
- 1937: War preparations

## Setup

1. Place all files in a directory
2. Add `events.csv` with historical events
3. Start local server (required for CSV loading due to CORS):
   ```bash
   python -m http.server 8000
   ```
4. Open browser to `http://localhost:8000`

## Usage

### Navigation
- **Arrow Buttons**: Previous/Next events
- **Timeline Dots**: Click to jump to specific event
- **Keyboard**: Left/Right arrow keys, Escape to close panels
- **Event Markers**: Click on map to view details

### UI Elements
- **Year Display**: Top-left corner (30px margin)
- **Help (?)**: Top-right corner
- **Language (SV)**: Top-right corner with dropdown
- **Info Box**: Bottom-right (400px width, 15px font)
- **Event Panel**: Left side under year display
- **Timeline**: Bottom bar with progress and markers

## Development Notes

### Key Functions
- `loadEvents()`: Fetches and parses CSV, assigns random European coordinates
- `updateEventMarkers()`: Filters events by year/month, creates map markers with animations
- `updateTimeline()`: Updates progress bar, marker states, navigation buttons
- `parseEventDate()`: Parses various date formats for chronological sorting
- `resetIdleAnimation()`: Controls idle pulse animation on nav buttons

### Animation Details
- Event markers fade in: `opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)`
- Hover scale: Direct width/height change (60→80px) instead of transform
- Map animation: 800ms duration, `essential: true`, `linear: false`
- Idle pulse: 2.5s cycle, two overlapping rings with 1.25s offset

### Browser Compatibility
- Requires modern browser with ES6 support
- CSS `:has()` pseudo-class for conditional styling
- Mapbox GL JS v2.15.0

## Credits

Built with:
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) for mapping
- Vanilla JavaScript (no frameworks)
- Custom CSV parsing for historical event data
