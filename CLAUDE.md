# Claude Development Guide for Orient Project

## Development Guidelines

### 🚀 ALWAYS START THE DEVELOPMENT SERVER FIRST
**When starting work on this project:**
- Run: `cd E:\orient && python -m http.server 8000`
- Access at: http://localhost:8000
- This should be done at the beginning of every work session

### 🌍 BILINGUAL REQUIREMENT: Always Add Both Swedish and English Text
**When adding ANY text content to the project:**
- **ALWAYS add translations in BOTH Swedish (SV) and English (EN)**
- Update both `translations-sv.json` AND `translations-en.json`
- If adding event data, update `events.csv` with both `_SV` and `_EN` columns
- If adding UI text, add to both translation files under appropriate keys
- Use the `t()` helper function in JavaScript to retrieve translated text
- Test language switching to verify both languages display correctly
- Default language is Swedish (`sv`), but all features must work in both languages

**Translation file structure:**
- `translations-sv.json` - Swedish translations
- `translations-en.json` - English translations
- Use dot notation for nested keys: `t('ui.buttons.listen')`
- Event CSV columns: `Datum,Rubrik_SV,Rubrik_EN,Ingress_SV,Ingress_EN,BildCaption_SV,BildCaption_EN,Bild-URL`

### ⚠️ CRITICAL: Always Check for Annotations in Screenshots
**When the user provides screenshots:**
- **ALWAYS carefully examine images for red measurement annotations** (distances in pixels marked with arrows and red number labels like "30", "18", "10")
- These annotations contain exact spacing, padding, margin, and sizing specifications
- Use these precise measurements instead of making assumptions or estimating
- If measurements are visible in the screenshot, apply them exactly as shown
- Common annotation patterns: padding (top/right/bottom/left), gaps between elements, icon sizes

## Important File Locations

### Icon Assets (SVG)
**Location:** `E:\orient\gfx`

Available icons:
- `angle.svg` - Arrow/angle icon
- `globe.svg` - Globe/language icon
- `info.svg` - Information icon
- `listen.svg` - Listen/audio icon
- `minus.svg` - Minus/zoom out icon
- `plus.svg` - Plus/zoom in icon
- `pointer.svg` - Pointer/marker icon

### Design Reference Screenshots
**Location:** `E:\orient\claude_guiding_graphics`

Reference images with measurements and specifications:
- `bg.png` - Background reference
- `distances.png` - Distance/spacing measurements
- `draggable_handle.png` - Draggable handle design
- `map_legend.png` - Map legend specifications
- `mapnavigation.png` - Map navigation design
- `step_button.png` - Step button design
- `storymode.png` - Story mode panel design

## Project Structure

Main files:
- `index.html` - Main HTML file
- `app.js` - Main application JavaScript
- `styles.css` - Main stylesheet

## Current Branch
`alternative-version`

## Development Server
Run from project root: `python -m http.server 8000`
Access at: http://localhost:8000

## Design Specifications (from reference images)

### Map Legend (map_legend.png)
- Background: White with rounded corners
- Padding: 11px 10px 11px 10px
- Font size: 13px, Regular
- Colors:
  - Germany: `#ECC8B8`
  - Germany - Occupied: `#CCE9DA`
  - Italy: `#99D3B5`
  - Italy - occupied: `#B8E5D3`
  - Other Axis: `#F5DDDB` (beige/cream)
  - Other axis - occupied: `#CCE9DA`
- Checkbox dots: 14px x 14px, 60px wide, corner radius 6px
- Shadow: `#000000` 8% opacity, 0, 2, 24, 0

### Map Navigation (mapnavigation.png)
- Zoom buttons: 50px x 50px
- Background color: `#D09F12` (yellow/gold) and `#E6B730`
- Corner radius: 6px
- Padding: 10px 0px 10px 0px
- Icons: minus and plus (centered)
- Icon color: Dark blue/navy

### Timeline & Navigation
- Timeline dots: Yellow/gold color `#D09F12`
- Navigation arrows: Yellow/gold circular buttons `#E6B730` (60px x 60px)
- Arrow icons: 15px x 24px (do not distort aspect ratio)
- Background: Light/white

### Story Mode Panel (storymode.png)
- Date header: "1946 JUNI" format
- Title: "NOVEMBERPOGROMEN" in large white text
- Background: Dark navy blue `#1F2A44` with radial gradient to `#192238`
- Background image: 10% opacity overlay, full height (auto 100%), centered, no-repeat
- Photo frame: White border around historical photos
- Listen button: "LYSSNA PÅ INNEHÅLLET" with icon prefix
  - Background: `#1F2A44`
  - Border: none
  - Border radius: 6px
  - Padding: 30px (top) 30px (right) 18px (bottom) 30px (left)
  - Icon: 20px x 20px
  - Gap between icon and text: 10px

### Event Markers
- Small black dots on map
- Circular photo badges at event locations
- Location name below marker (e.g., "Pogromen i Kielce")
