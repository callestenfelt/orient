// Mapbox Configuration
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBvb2siLCJhIjoiQjBxamU5RSJ9.srKOyc2kfn-OudQVdVXSxA';

// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/epook/cmap6hwka006b01sc6nhmh0kv',
    center: [15, 52], // Center on Europe
    zoom: 4
});

// Timeline Configuration
const START_YEAR = 1933;
const END_YEAR = 1946;
const EVENTS_PER_YEAR = 5;
const TOTAL_YEARS = END_YEAR - START_YEAR + 1;
const TOTAL_EVENTS = TOTAL_YEARS * EVENTS_PER_YEAR;

// Events from CSV (will be loaded)
let events = [];
let currentYear = START_YEAR;
let currentEventIndex = 25; // Start at 1938 (5 years * 5 events per year)
let mapMarkers = new Map(); // Map of eventId -> marker object
let animatedEvents = new Set(); // Track which events have been animated
let currentBordersYear = null; // Track currently loaded borders
let hoveredEventId = null; // Track currently hovered event for line/circle highlighting

// DOM Elements
const yearDisplay = document.getElementById('year-display');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const timelineMarkers = document.getElementById('timeline-markers');
const timelineProgress = document.getElementById('timeline-progress');
const eventPanel = document.getElementById('event-panel');
const closePanel = document.getElementById('close-panel');
const infoBox = document.getElementById('info-box');
const infoText = document.getElementById('info-text');

// Get coordinates based on event title and description
function getEventCoordinates(rubrik, ingress) {
    const coordinateMap = {
        // Swedish events - Stockholm
        'Sveriges utlännings­lag': [18.0686, 59.3293],
        'Barnkvoten': [18.0686, 59.3293],
        'Samlingsregeringen': [18.0686, 59.3293],
        'Räddnings­aktioner': [18.0686, 59.3293],

        // German events - Berlin
        'Namnlagen': [13.4050, 52.5200],
        'J-stämpeln': [13.4050, 52.5200],
        'Judiska företag förbjuds': [13.4050, 52.5200],
        'November­­pogromen': [13.4050, 52.5200],
        'Koncentrations­läger': [13.2633, 52.7667], // Sachsenhausen
        'Aktion T4 inleds': [13.4050, 52.5200],
        'Bofasta romer': [13.4050, 52.5200],
        'Den gula stjärnan': [13.4050, 52.5200],
        'Deportation av Nazitysklands judar': [13.4050, 52.5200],
        'Aktion T4 avslutas': [13.4050, 52.5200],
        'Wannsee­konferensen': [13.1644, 52.4344], // Wannsee
        'Attentat mot Hitler': [13.4050, 52.5200],
        'Förstör bevisen': [13.4050, 52.5200],
        'Tyskland kapitulerar': [13.4050, 52.5200],
        'Nürnberg­rättegång­arna': [11.0773, 49.4521], // Nuremberg

        // Austria
        'Anschluss': [16.3738, 48.2082], // Vienna

        // France
        'Evian­konferensen': [6.5894, 46.4011], // Évian-les-Bains
        'Frankrike kapitulerar': [2.3522, 48.8566], // Paris
        'Dagen D': [-0.5760, 49.3200], // Normandy

        // Czech Republic
        'Tjeckien invaderas': [14.4378, 50.0755], // Prague

        // Russia/Soviet Union
        'Molotov-Ribbentrop-pakten': [37.6173, 55.7558], // Moscow
        'Operation Barbarossa': [37.6173, 55.7558], // Moscow
        'Stalingrad': [44.5169, 48.7080], // Volgograd

        // Poland
        'Kriget börjar': [21.0122, 52.2297], // Warsaw
        'Getton': [21.0122, 52.2297], // Warsaw
        'Auschwitz I börjar byggas': [19.2034, 50.0347], // Oświęcim
        'Auschwitz II börjar byggas': [19.2034, 50.0347], // Oświęcim
        'Auschwitz-Birkenau befrias': [19.2034, 50.0347], // Oświęcim
        'Operation Reinhard': [22.0534, 52.6260], // Treblinka
        'De första judarna gasas ihjäl i Chełmno': [18.7290, 52.1456], // Chełmno
        'Deportation av och mord på romer': [19.2034, 50.0347], // Auschwitz
        'Aktion "Skördefesten"': [22.5667, 51.2500], // Lublin
        '"Aktion ""Skördefesten"""': [22.5667, 51.2500], // Lublin (CSV format)
        'Majdanek befrias': [22.6050, 51.2220], // Majdanek/Lublin
        'Pogromen i Kielce': [20.6286, 50.8703], // Kielce

        // Denmark
        'Danmark kapitulerar': [12.5683, 55.6761], // Copenhagen
        'De danska judarna räddas': [12.5683, 55.6761], // Copenhagen

        // Luxembourg
        'Luxemburg kapitulerar': [6.1296, 49.6116], // Luxembourg City

        // Netherlands
        'Nederländerna kapitulerar': [4.9041, 52.3676], // Amsterdam

        // Belgium
        'Belgien kapitulerar': [4.3517, 50.8503], // Brussels

        // Norway
        'Norge kapitulerar': [10.7522, 59.9139], // Oslo
        'Norska judar deporteras': [10.7522, 59.9139], // Oslo

        // Belarus
        'Massakern i Prypjat-träsken': [26.0951, 52.1229], // Pinsk

        // Ukraine
        'Massakern vid Kamjanets-Podilskyj': [26.5850, 48.6847],
        'Massakern vid Babyn Jar': [30.5234, 50.4501], // Kyiv

        // Latvia
        'Massakern vid Rumbula': [24.1052, 56.9496], // Riga

        // USA
        'Världskrig': [-157.9637, 21.3649], // Pearl Harbor
        'Förenta Nationerna': [-122.4194, 37.7749], // San Francisco

        // Egypt
        'Slaget vid El Alamein': [28.9550, 30.8170],

        // Italy
        'Invasionen av Sicilien': [13.3615, 38.1157], // Palermo
        'Italien kapitulerar': [12.4964, 41.9028], // Rome

        // Hungary
        'Deportation av Ungerns judar': [19.0402, 47.4979], // Budapest

        // UK
        'Internationell protest': [-0.1276, 51.5074], // London

        // Japan
        'Japan kapitulerar': [139.6917, 35.6895] // Tokyo
    };

    // Debug: log if coordinate not found
    const coords = coordinateMap[rubrik];
    if (!coords) {
        console.log('No coordinates found for:', rubrik);
    }

    // Return coordinates if found, otherwise return default Europe center
    return coords || [15, 52];
}

// Parse date to sort events chronologically
function parseEventDate(dateStr) {
    // Handle various date formats: "1938-01-01", "december 1938", "1938-03-12"
    const yearMatch = dateStr.match(/\d{4}/);
    if (!yearMatch) return new Date(0);

    const year = parseInt(yearMatch[0]);

    // Try to extract month
    const monthNames = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'may': 4,
        'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'oct': 9,
        'nov': 10, 'dec': 11, 'december': 11, 'januari': 0, 'februari': 1,
        'mars': 2, 'april': 3, 'juni': 5, 'juli': 6, 'augusti': 7,
        'september': 8, 'oktober': 9, 'november': 10
    };

    let month = 0;
    let day = 1;

    // Check for ISO date format (YYYY-MM-DD)
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        month = parseInt(isoMatch[2]) - 1;
        day = parseInt(isoMatch[3]);
    } else {
        // Check for month name
        const lowerDate = dateStr.toLowerCase();
        for (const [name, num] of Object.entries(monthNames)) {
            if (lowerDate.includes(name)) {
                month = num;
                break;
            }
        }
    }

    return new Date(year, month, day);
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Parse CSV and load events
async function loadEvents() {
    try {
        const response = await fetch('events.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');

        events = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const row = parseCSVLine(lines[i]);
            if (row.length < 3) continue;

            const datum = row[0];
            const rubrik = row[1];
            const ingress = row[2];
            const bildUrl = row[3] || '';

            // Extract year from date
            const yearMatch = datum.match(/\d{4}/);
            if (!yearMatch) continue;

            const year = parseInt(yearMatch[0]);

            if (year >= START_YEAR && year <= END_YEAR) {
                events.push({
                    year: year,
                    date: datum,
                    parsedDate: parseEventDate(datum),
                    title: rubrik,
                    description: ingress,
                    image: bildUrl,
                    coordinates: getEventCoordinates(rubrik, ingress)
                });
            }
        }

        console.log(`Loaded ${events.length} events`);
        updateEventMarkers();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Initialize timeline
function initTimeline() {
    timelineMarkers.innerHTML = '';

    // Create year markers
    for (let i = 0; i < TOTAL_YEARS; i++) {
        const year = START_YEAR + i;
        const position = (i / (TOTAL_YEARS - 1)) * 100;

        const yearMarker = document.createElement('div');
        yearMarker.className = 'year-marker';
        yearMarker.style.left = `${position}%`;
        yearMarker.innerHTML = `
            <div class="year-label">${year}</div>
            <div class="year-line"></div>
        `;
        timelineMarkers.appendChild(yearMarker);

        // Create event markers for this year
        // Only create 1 dot for the last year (1946), 5 dots for all other years
        const dotsForThisYear = (year === END_YEAR) ? 1 : EVENTS_PER_YEAR;
        
        for (let j = 0; j < dotsForThisYear; j++) {
            const eventPosition = position + (j / (TOTAL_YEARS - 1) / EVENTS_PER_YEAR) * 100;
            const globalIndex = i * EVENTS_PER_YEAR + j;

            const eventMarker = document.createElement('div');
            eventMarker.className = 'event-marker';
            eventMarker.style.left = `${eventPosition}%`;
            eventMarker.dataset.index = globalIndex;
            eventMarker.dataset.year = year;

            eventMarker.addEventListener('click', () => {
                goToEvent(globalIndex);
            });

            timelineMarkers.appendChild(eventMarker);
        }
    }

    updateTimeline();
}

// Update timeline display
function updateTimeline() {
    currentYear = START_YEAR + Math.floor(currentEventIndex / EVENTS_PER_YEAR);
    yearDisplay.textContent = currentYear;

    const progress = (currentEventIndex / (TOTAL_EVENTS - 1)) * 100;
    timelineProgress.style.width = `${progress}%`;

    // Update active marker and past markers
    document.querySelectorAll('.event-marker').forEach((marker, index) => {
        marker.classList.toggle('active', index === currentEventIndex);
        marker.classList.toggle('past', index < currentEventIndex);
    });

    // Update navigation buttons
    prevBtn.disabled = currentEventIndex === 0;
    nextBtn.disabled = currentEventIndex === TOTAL_EVENTS - 1;

    // Update info box with year context
    updateYearInfo();

    // Update historical borders overlay
    updateHistoricalBorders();

    // Update event markers on map
    updateEventMarkers();
}

// Year descriptions for years without events
const yearDescriptions = {
    1933: "Adolf Hitler utsågs till Tysklands rikskansler den 30 januari 1933. Nazistpartiet började omedelbart förfölja sina politiska motståndare och tyska judar. De första koncentrationslägren öppnades detta år.",
    1934: "Under 1934 konsoliderade Hitler sin makt i Tyskland. Natten mellan 30 juni och 1 juli, känd som 'de långa knivarna natt', lät Hitler mörda sina politiska rivaler inom SA-ledningen.",
    1935: "Nürnberglagarna antogs i september 1935, vilket officiellt gjorde tyska judar till andraklassmedborgare. Lagarna förbjöd äktenskap och sexuella relationer mellan judar och 'arier'.",
    1936: "De olympiska spelen hölls i Berlin 1936. Nazisterna använde evenemanget som propaganda för att visa upp ett 'modernt' Tyskland, medan förföljelsen av judar tillfälligt doldes.",
    1937: "Under 1937 intensifierades nazisternas förberedelser för krig. Den tyska ekonomin ställdes om för krigsproduktion och militären byggdes ut i strid mot Versaillesfördraget."
};

// Update year info box
function updateYearInfo() {
    // Get first event of the current year to show as year context
    const yearEvents = events.filter(e => e.year === currentYear);
    
    let text = '';
    
    if (yearEvents.length > 0) {
        // Sort by date and take the first event
        yearEvents.sort((a, b) => a.parsedDate - b.parsedDate);
        text = yearEvents[0].description;
    } else if (yearDescriptions[currentYear]) {
        // Use predefined description for years without events
        text = yearDescriptions[currentYear];
    }
    
    if (text) {
        // Limit to 350 characters
        if (text.length > 350) {
            text = text.substring(0, 350) + '...';
        }
        
        infoText.textContent = text;
        infoBox.classList.remove('hidden');
    } else {
        infoBox.classList.add('hidden');
    }
}

// Load and update historical borders based on current year
async function updateHistoricalBorders() {
    // Only load borders for years we have data (1938-1944)
    if (currentYear < 1938 || currentYear > 1944) {
        // Remove borders layer if outside range
        if (map.getLayer('borders-fill')) {
            map.removeLayer('borders-fill');
            map.removeLayer('borders-outline');
            map.removeSource('borders');
            currentBordersYear = null;
        }
        return;
    }

    // Don't reload if already showing this year
    if (currentBordersYear === currentYear) {
        return;
    }

    try {
        const geojsonFile = `geojson/December_31_${currentYear}.geojson`;
        console.log(`Loading borders for ${currentYear}...`);

        const response = await fetch(geojsonFile);
        const data = await response.json();

        // Remove existing layers if they exist
        if (map.getLayer('borders-fill')) {
            map.removeLayer('borders-fill');
            map.removeLayer('borders-outline');
            map.removeSource('borders');
        }

        // Add source
        map.addSource('borders', {
            type: 'geojson',
            data: data
        });

        // Add fill layer with opacity based on occupation status
        map.addLayer({
            id: 'borders-fill',
            type: 'fill',
            source: 'borders',
            paint: {
                'fill-color': '#8B0000', // Dark red
                'fill-opacity': [
                    'case',
                    // Check if Foreign_Po contains "German" or "occupied"
                    [
                        'any',
                        ['==', ['get', 'Foreign_Po'], 'German-occupied'],
                        ['==', ['get', 'Foreign_Po'], 'German Protectorate'],
                        ['==', ['get', 'Foreign_Po'], 'German, Italian-occupied'],
                        ['==', ['get', 'Foreign_Po'], 'German, Italian, Bulgarian-occupied'],
                        ['==', ['get', 'Foreign_Po'], 'Axis and German-occupied'],
                        ['==', ['get', 'Foreign_Po'], 'Axis and German, Italian-occupied']
                    ], 0.4,
                    ['==', ['get', 'Foreign_Po'], 'Italian-occupied'], 0.3,
                    ['==', ['get', 'Foreign_Po'], 'Italian Protectorate'], 0.25,
                    ['==', ['get', 'Foreign_Po'], 'Axis'], 0.25,
                    ['==', ['get', 'Foreign_Po'], 'Romanian-occupied'], 0.25,
                    0 // Transparent for non-occupied
                ]
            }
        }, 'waterway-label'); // Insert below labels

        // Add outline layer
        map.addLayer({
            id: 'borders-outline',
            type: 'line',
            source: 'borders',
            paint: {
                'line-color': '#444',
                'line-width': 0.5,
                'line-opacity': 0.3
            }
        }, 'waterway-label');

        currentBordersYear = currentYear;
        console.log(`Loaded borders for ${currentYear}`);

    } catch (error) {
        console.error(`Error loading borders for ${currentYear}:`, error);
    }
}

// Collision detection: find non-overlapping positions for markers
function resolveCollisions(filteredEvents) {
    const positions = [];
    const MIN_PIXEL_DISTANCE = 100; // Minimum distance between markers in pixels
    const zoom = map.getZoom();

    // Helper function to calculate pixel distance at current zoom
    function getPixelDistance(coord1, coord2) {
        const point1 = map.project(coord1);
        const point2 = map.project(coord2);
        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2)
        );
    }

    // Helper function to offset coordinates in pixel space and convert back to geo
    function offsetCoordinates(coords, pixelOffsetX, pixelOffsetY) {
        const point = map.project(coords);
        point.x += pixelOffsetX;
        point.y += pixelOffsetY;
        const newCoords = map.unproject(point);
        return [newCoords.lng, newCoords.lat];
    }

    filteredEvents.forEach((event, index) => {
        const originalCoords = event.coordinates;
        let adjustedCoords = [...originalCoords];
        let attempts = 0;
        const maxAttempts = 50;

        // Check collision with existing positions
        while (attempts < maxAttempts) {
            let hasCollision = false;

            for (const pos of positions) {
                const distance = getPixelDistance(adjustedCoords, pos.displayCoords);

                if (distance < MIN_PIXEL_DISTANCE) {
                    hasCollision = true;
                    break;
                }
            }

            if (!hasCollision) {
                break;
            }

            // Spiral out from original position in pixel space
            const angle = (attempts * 137.5) * (Math.PI / 180); // Golden angle
            const radius = MIN_PIXEL_DISTANCE * 0.7 * Math.sqrt(attempts + 1); // Increasing radius in pixels
            const offsetX = radius * Math.cos(angle);
            const offsetY = radius * Math.sin(angle);

            adjustedCoords = offsetCoordinates(originalCoords, offsetX, offsetY);

            attempts++;
        }

        positions.push({
            originalCoords: originalCoords,
            displayCoords: adjustedCoords,
            event: event
        });
    });

    return positions;
}

// Set hover state for connection lines and circles
function setConnectionHoverState(eventId, isHovered) {
    if (!map.getSource('connection-lines')) {
        return;
    }

    // Update global hover state
    hoveredEventId = isHovered ? eventId : null;

    // Re-render layers by updating the data
    const currentData = map.getSource('connection-lines')._data;

    // Update hover property in all features
    currentData.features.forEach(feature => {
        if (feature.properties.eventId === eventId) {
            feature.properties.hover = isHovered;
            feature.properties.faded = false;
        } else {
            feature.properties.hover = false;
            feature.properties.faded = isHovered; // Fade out other lines/circles when something is hovered
        }
    });

    // Update the source data to trigger re-render
    map.getSource('connection-lines').setData(currentData);

    // Fade out/in other markers
    mapMarkers.forEach((marker, markerEventId) => {
        const el = marker.getElement();
        if (markerEventId === eventId) {
            // Keep hovered marker fully visible
            el.style.transition = 'opacity 1s ease';
            el.style.opacity = '1';
        } else {
            // Fade out other markers
            el.style.transition = 'opacity 1s ease';
            el.style.opacity = isHovered ? '0.15' : '1';
        }
    });
}

// Draw connection lines on map
function drawConnectionLines(positions) {
    // Remove existing connection layer if present
    if (map.getSource('connection-lines')) {
        map.removeLayer('connection-circles');
        map.removeLayer('connection-lines');
        map.removeSource('connection-lines');
    }

    // Create GeoJSON for lines and circles with event IDs
    const features = [];
    const circleFeatures = [];
    let featureId = 0;

    positions.forEach(pos => {
        // Only draw line if position was adjusted
        const [origLng, origLat] = pos.originalCoords;
        const [dispLng, dispLat] = pos.displayCoords;

        if (origLng !== dispLng || origLat !== dispLat) {
            const eventId = `${pos.event.year}-${pos.event.date}-${pos.event.title}`;

            // Line from display position to original position
            // Note: We'll use CSS to visually position the line under the marker
            features.push({
                type: 'Feature',
                id: featureId++,
                geometry: {
                    type: 'LineString',
                    coordinates: [pos.displayCoords, pos.originalCoords]
                },
                properties: {
                    eventId: eventId,
                    hover: false,
                    faded: false
                }
            });

            // Circle at original position
            circleFeatures.push({
                type: 'Feature',
                id: featureId++,
                geometry: {
                    type: 'Point',
                    coordinates: pos.originalCoords
                },
                properties: {
                    eventId: eventId,
                    hover: false,
                    faded: false
                }
            });
        }
    });

    if (features.length > 0) {
        // Add source with promoteId to use feature id for feature state
        map.addSource('connection-lines', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [...features, ...circleFeatures]
            },
            promoteId: 'id',
            lineMetrics: true  // Enable line-gradient support
        });

        // Add line layer (render below markers)
        map.addLayer({
            id: 'connection-lines',
            type: 'line',
            source: 'connection-lines',
            filter: ['==', ['geometry-type'], 'LineString'],
            paint: {
                'line-color': [
                    'case',
                    ['get', 'hover'],
                    '#213159',
                    '#ffffff'
                ],
                'line-width': [
                    'case',
                    ['get', 'hover'],
                    3,
                    2
                ],
                'line-offset': 0,
                'line-opacity': [
                    'case',
                    ['get', 'faded'],
                    0.1,
                    1
                ]
            }
        }, 'waterway-label');

        // Add circle layer (render below markers)
        map.addLayer({
            id: 'connection-circles',
            type: 'circle',
            source: 'connection-lines',
            filter: ['==', ['geometry-type'], 'Point'],
            paint: {
                'circle-radius': [
                    'case',
                    ['get', 'hover'],
                    5, // 10px diameter
                    4  // 8px diameter
                ],
                'circle-color': [
                    'case',
                    ['get', 'hover'],
                    '#213159', // Match label background color on hover
                    '#ffffff'
                ],
                'circle-opacity': [
                    'case',
                    ['get', 'faded'],
                    0.1, // Fade out non-hovered circles
                    0.8  // Normal opacity
                ],
                'circle-stroke-width': 1,
                'circle-stroke-color': [
                    'case',
                    ['get', 'hover'],
                    '#213159',
                    '#ffffff'
                ],
                'circle-stroke-opacity': [
                    'case',
                    ['get', 'faded'],
                    0.1, // Fade out stroke too
                    1    // Normal opacity
                ]
            }
        }, 'waterway-label');

        // Add transitions for smooth hover effect with delay
        // Delay of 450ms allows event marker to complete its animation first
        map.setPaintProperty('connection-lines', 'line-width-transition', {
            duration: 300,
            delay: 450
        });

        map.setPaintProperty('connection-lines', 'line-color-transition', {
            duration: 300,
            delay: 450
        });

        map.setPaintProperty('connection-lines', 'line-opacity-transition', {
            duration: 1000,
            delay: 450
        });

        map.setPaintProperty('connection-circles', 'circle-radius-transition', {
            duration: 300,
            delay: 450
        });

        map.setPaintProperty('connection-circles', 'circle-color-transition', {
            duration: 300,
            delay: 450
        });

        map.setPaintProperty('connection-circles', 'circle-stroke-color-transition', {
            duration: 300,
            delay: 450
        });

        map.setPaintProperty('connection-circles', 'circle-opacity-transition', {
            duration: 1000,
            delay: 450
        });

        map.setPaintProperty('connection-circles', 'circle-stroke-opacity-transition', {
            duration: 1000,
            delay: 450
        });
    }
}

// Update event markers on map based on current year with animation
function updateEventMarkers() {
    // Get events for current year and sort by date
    const yearEvents = events
        .filter(e => e.year === currentYear)
        .sort((a, b) => a.parsedDate - b.parsedDate);

    // Determine which time period we're in (based on timeline position)
    const yearProgress = currentEventIndex % EVENTS_PER_YEAR;

    // Filter events based on timeline position - show events progressively
    // Split events into 5 groups based on their chronological order
    const eventsPerStep = Math.ceil(yearEvents.length / EVENTS_PER_YEAR);
    const startIndex = 0;
    const endIndex = (yearProgress + 1) * eventsPerStep;

    const filteredEvents = yearEvents.slice(startIndex, endIndex);

    console.log(`Showing ${filteredEvents.length} events for year ${currentYear}, period ${yearProgress}`);

    // Create set of event IDs that should be visible
    const visibleEventIds = new Set(filteredEvents.map(e => `${e.year}-${e.date}-${e.title}`));

    // Remove markers that are no longer visible
    for (const [eventId, marker] of mapMarkers.entries()) {
        if (!visibleEventIds.has(eventId)) {
            marker.remove();
            mapMarkers.delete(eventId);
        }
    }

    // If no events, reset to default Europe view
    if (filteredEvents.length === 0) {
        // Remove connection lines
        if (map.getSource('connection-lines')) {
            map.removeLayer('connection-circles');
            map.removeLayer('connection-lines');
            map.removeSource('connection-lines');
        }

        map.flyTo({
            center: [15, 52],
            zoom: 4,
            duration: 800,
            padding: {top: 5, bottom: 5, left: 5, right: 5},
            essential: true
        });
        return;
    }

    // Calculate bounds to fit all events with padding
    if (filteredEvents.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        filteredEvents.forEach(event => {
            bounds.extend(event.coordinates);
        });

        // Fit map to bounds with padding
        map.fitBounds(bounds, {
            padding: {top: 150, bottom: 200, left: 450, right: 450},
            duration: 800,
            maxZoom: 6,
            essential: true,
            linear: false
        });

        // Wait for map movement to finish, then resolve collisions
        map.once('moveend', () => {
            // Resolve collisions and get adjusted positions at final zoom level
            const positions = resolveCollisions(filteredEvents);

            // Draw connection lines
            drawConnectionLines(positions);

            // Create or update markers for each event
            positions.forEach((pos, index) => {
                const event = pos.event;
                const eventId = `${event.year}-${event.date}-${event.title}`;

                // Check if marker already exists
                if (mapMarkers.has(eventId)) {
                    // Update existing marker position
                    const existingMarker = mapMarkers.get(eventId);
                    existingMarker.setLngLat(pos.displayCoords);
                    // Note: Event listeners remain attached to existing markers
                } else {
                    // Create new marker
                    const el = document.createElement('div');
                    el.className = 'map-event-marker';

                    // Check if this event has been animated before
                    const hasBeenAnimated = animatedEvents.has(eventId);

                    // Set initial opacity based on animation state
                    el.style.opacity = hasBeenAnimated ? '1' : '0';

                    // Add image if available
                    if (event.image) {
                        const img = document.createElement('img');
                        img.src = event.image;
                        img.alt = event.title;
                        img.onerror = () => {
                            img.remove();
                        };
                        el.appendChild(img);
                    }

                    // Add label
                    const label = document.createElement('div');
                    label.className = 'event-label';
                    label.textContent = event.title;
                    el.appendChild(label);

                    // Click handler
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showEventPanel(event);
                    });

                    // Hover handlers to highlight connection lines/circles
                    el.addEventListener('mouseenter', () => {
                        setConnectionHoverState(eventId, true);
                    });

                    el.addEventListener('mouseleave', () => {
                        setConnectionHoverState(eventId, false);
                    });

                    const marker = new mapboxgl.Marker(el)
                        .setLngLat(pos.displayCoords)
                        .addTo(map);

                    mapMarkers.set(eventId, marker);

                    // Only animate if this is the first time showing this event
                    if (!hasBeenAnimated) {
                        const delay = index * 250;
                        setTimeout(() => {
                            el.style.transition = 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                            el.style.opacity = '1';
                        }, delay);

                        // Mark this event as animated
                        animatedEvents.add(eventId);
                    }
                }
            });
        });
    }
}

// Show event panel
function showEventPanel(event) {
    const eventImage = document.getElementById('event-image');

    if (event.image) {
        eventImage.src = event.image;
        eventImage.style.display = 'block';
    } else {
        eventImage.style.display = 'none';
    }

    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-date').textContent = event.date;
    document.getElementById('event-description').textContent = event.description;

    eventPanel.classList.remove('hidden');
}

// Hide event panel
function hideEventPanel() {
    eventPanel.classList.add('hidden');
}

// Navigate to specific event
function goToEvent(index) {
    currentEventIndex = index;
    updateTimeline();
    resetIdleAnimation();
}

// Idle animation for navigation buttons
let idleTimer = null;

function startIdleAnimation() {
    if (!prevBtn.disabled) prevBtn.classList.add('idle');
    if (!nextBtn.disabled) nextBtn.classList.add('idle');
}

function resetIdleAnimation() {
    prevBtn.classList.remove('idle');
    nextBtn.classList.remove('idle');

    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdleAnimation, 2000);
}

// Navigation
prevBtn.addEventListener('click', () => {
    if (currentEventIndex > 0) {
        goToEvent(currentEventIndex - 1);
        resetIdleAnimation();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentEventIndex < TOTAL_EVENTS - 1) {
        goToEvent(currentEventIndex + 1);
        resetIdleAnimation();
    }
});

closePanel.addEventListener('click', hideEventPanel);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevBtn.click();
        resetIdleAnimation();
    } else if (e.key === 'ArrowRight') {
        nextBtn.click();
        resetIdleAnimation();
    } else if (e.key === 'Escape') {
        hideEventPanel();
    }
});

// Initialize when map is loaded
map.on('load', () => {
    console.log('Map loaded');

    // Check what language fields are available in the map style
    checkAvailableLanguages();

    // Set initial language to Swedish
    setMapLanguage('sv');

    initTimeline();
    loadEvents();
    // Show help overlay on first load
    helpOverlay.classList.remove('hidden');
    // Start idle animation after 2 seconds
    idleTimer = setTimeout(startIdleAnimation, 2000);
});

// Error handling
map.on('error', (e) => {
    console.error('Map error:', e);
});

// Function to check what language fields are available in the map style
function checkAvailableLanguages() {
    const style = map.getStyle();
    const layers = style.layers;
    const availableFields = new Set();

    console.log('=== Checking available language fields ===');

    // Find a layer with text fields to inspect
    layers.forEach(layer => {
        if (layer.layout && layer.layout['text-field']) {
            const textField = layer.layout['text-field'];

            // Log the layer and its text field structure
            if (layer.id.includes('label') || layer.id.includes('place')) {
                console.log(`Layer: ${layer.id}`);
                console.log('Text field:', textField);
            }

            // Try to extract field names from expressions
            if (Array.isArray(textField)) {
                const fieldStr = JSON.stringify(textField);
                const nameFields = fieldStr.match(/name_[a-z]{2}/g);
                if (nameFields) {
                    nameFields.forEach(field => availableFields.add(field));
                }
            }
        }
    });

    console.log('Available language fields detected:', Array.from(availableFields));
    console.log('Swedish (name_sv) available:', availableFields.has('name_sv'));
    console.log('English (name_en) available:', availableFields.has('name_en'));
    console.log('==========================================');

    return Array.from(availableFields);
}

// Swedish translations for geographic names
const swedishTranslations = {
    // Countries
    'Germany': 'Tyskland',
    'Poland': 'Polen',
    'France': 'Frankrike',
    'United Kingdom': 'Storbritannien',
    'Italy': 'Italien',
    'Spain': 'Spanien',
    'Portugal': 'Portugal',
    'Netherlands': 'Nederländerna',
    'Belgium': 'Belgien',
    'Luxembourg': 'Luxemburg',
    'Switzerland': 'Schweiz',
    'Austria': 'Österrike',
    'Czechoslovakia': 'Tjeckoslovakien',
    'Hungary': 'Ungern',
    'Romania': 'Rumänien',
    'Yugoslavia': 'Jugoslavien',
    'Bulgaria': 'Bulgarien',
    'Greece': 'Grekland',
    'Albania': 'Albanien',
    'Norway': 'Norge',
    'Sweden': 'Sverige',
    'Finland': 'Finland',
    'Denmark': 'Danmark',
    'Estonia': 'Estland',
    'Latvia': 'Lettland',
    'Lithuania': 'Litauen',
    'Soviet Union': 'Sovjetunionen',
    'Russia': 'Ryssland',
    'Ukraine': 'Ukraina',
    'Belarus': 'Vitryssland',
    'Turkey': 'Turkiet',
    'Ireland': 'Irland',
    'Iceland': 'Island',

    // Oceans and Seas
    'Atlantic Ocean': 'Atlanten',
    'North Sea': 'Nordsjön',
    'Baltic Sea': 'Östersjön',
    'Mediterranean Sea': 'Medelhavet',
    'Black Sea': 'Svarta havet',
    'Adriatic Sea': 'Adriatiska havet',
    'Aegean Sea': 'Egeiska havet',
    'Norwegian Sea': 'Norska havet',
    'Barents Sea': 'Barents hav',

    // Cities
    'Berlin': 'Berlin',
    'Warsaw': 'Warszawa',
    'Paris': 'Paris',
    'London': 'London',
    'Rome': 'Rom',
    'Vienna': 'Wien',
    'Prague': 'Prag',
    'Budapest': 'Budapest',
    'Moscow': 'Moskva',
    'Copenhagen': 'Köpenhamn',
    'Oslo': 'Oslo',
    'Stockholm': 'Stockholm',
    'Helsinki': 'Helsingfors',
    'Athens': 'Aten',
    'Brussels': 'Bryssel',
    'Amsterdam': 'Amsterdam',
    'Lisbon': 'Lissabon',
    'Madrid': 'Madrid'
};

// Function to change map language
function setMapLanguage(lang) {
    const style = map.getStyle();
    const layers = style.layers;

    let updatedCount = 0;

    layers.forEach(layer => {
        if (layer.layout && layer.layout['text-field']) {
            const textField = layer.layout['text-field'];

            // Check if this is a name field
            let isNameField = false;

            if (typeof textField === 'string' && textField.includes('name')) {
                isNameField = true;
            } else if (Array.isArray(textField)) {
                const hasNameField = JSON.stringify(textField).includes('name');
                if (hasNameField) {
                    isNameField = true;
                }
            }

            if (isNameField) {
                try {
                    if (lang === 'sv') {
                        // For Swedish, use case expression to translate from English
                        const caseExpression = ['case'];

                        // Add translations
                        Object.entries(swedishTranslations).forEach(([english, swedish]) => {
                            caseExpression.push(['==', ['get', 'name_en'], english]);
                            caseExpression.push(swedish);
                        });

                        // Fallback to name_en if no translation found
                        caseExpression.push(['get', 'name_en']);

                        map.setLayoutProperty(layer.id, 'text-field', caseExpression);
                    } else {
                        // For English, use name_en
                        map.setLayoutProperty(layer.id, 'text-field', ['get', 'name_en']);
                    }
                    updatedCount++;
                } catch (error) {
                    console.warn(`Could not update language for layer ${layer.id}:`, error);
                }
            }
        }
    });

    console.log(`Map language changed to: ${lang} (${updatedCount} layers updated)`);
}

// Help and Language Controls
const helpBtn = document.getElementById('help-btn');
const helpOverlay = document.getElementById('help-overlay');
const closeHelp = document.getElementById('close-help');
const startExploringBtn = document.getElementById('start-exploring-btn');
const languageBtn = document.getElementById('language-btn');
const languageMenu = document.getElementById('language-menu');

// Help button
helpBtn.addEventListener('click', () => {
    helpOverlay.classList.remove('hidden');
});

closeHelp.addEventListener('click', () => {
    helpOverlay.classList.add('hidden');
});

// Start exploring button
startExploringBtn.addEventListener('click', () => {
    helpOverlay.classList.add('hidden');
});

// Close help when clicking outside
helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) {
        helpOverlay.classList.add('hidden');
    }
});

// Language selector
languageBtn.addEventListener('click', () => {
    languageMenu.classList.toggle('hidden');
});

// Close language menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#language-selector')) {
        languageMenu.classList.add('hidden');
    }
});

// Language option selection
document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        
        // Update selected state
        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Update button text
        languageBtn.textContent = lang.toUpperCase();
        
        // Close menu
        languageMenu.classList.add('hidden');
        
        // Change map language
        setMapLanguage(lang);
    });
});
