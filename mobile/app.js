// Mapbox Configuration
mapboxgl.accessToken = 'pk.eyJ1IjoiZXBvb2siLCJhIjoiQjBxamU5RSJ9.srKOyc2kfn-OudQVdVXSxA';

// Global State
let currentEventIndex = 0;
let events = [];
let map = null;
let eventMarkers = [];
let isDragging = false;
let timelineRect = null;
let currentLanguage = 'sv';
let isShowingTerritoryInfo = false;
let translations = null;
let currentYear = 1938;
let isAnimating = false;

// Load translations
async function loadTranslations(lang) {
    const response = await fetch(`translations-${lang}.json`);
    translations = await response.json();
    return translations;
}

// Translation helper function
function t(key) {
    if (!translations) return key;
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
        value = value[k];
        if (value === undefined) return key;
    }
    return value;
}


// Helper function to get CSS variable values
function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Initialize Mapbox map
map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/epook/cmap6hwka006b01sc6nhmh0kv',
    center: [15, 52],
    zoom: 4
});
// Get coordinates based on event title
function getEventCoordinates(rubrik) {
    const coordinateMap = {
        'Sveriges utlännings­lag': [18.0686, 59.3293],
        'Barnkvoten': [18.0686, 59.3293],
        'Samlingsregeringen': [18.0686, 59.3293],
        'Räddnings­aktioner': [18.0686, 59.3293],
        'Namnlagen': [13.4050, 52.5200],
        'J-stämpeln': [13.4050, 52.5200],
        'Judiska företag förbjuds': [13.4050, 52.5200],
        'Novemberpogromen': [13.4050, 52.5200],
        'November­­pogromen': [13.4050, 52.5200],
        'Koncentrations­läger': [13.2633, 52.7667],
        'Aktion T4 inleds': [13.4050, 52.5200],
        'Bofasta romer': [13.4050, 52.5200],
        'Den gula stjärnan': [13.4050, 52.5200],
        'Deportation av Nazitysklands judar': [13.4050, 52.5200],
        'Aktion T4 avslutas': [13.4050, 52.5200],
        'Wannseekonferensen': [13.1644, 52.4344],
        'Wannsee­konferensen': [13.1644, 52.4344],
        'Attentat mot Hitler': [13.4050, 52.5200],
        'Tyskland kapitulerar': [13.4050, 52.5200],
        'Nürnbergrättegångarna': [11.0773, 49.4521],
        'Nürnberg­rättegång­arna': [11.0773, 49.4521],
        'Anschluss': [16.3738, 48.2082],
        'Eviankonferensen': [6.5894, 46.4011],
        'Evian­konferensen': [6.5894, 46.4011],
        'Frankrike kapitulerar': [2.3522, 48.8566],
        'Dagen D': [-0.5760, 49.3200],
        'Tjeckien invaderas': [14.4378, 50.0755],
        'Molotov-Ribbentrop-pakten': [37.6173, 55.7558],
        'Operation Barbarossa': [37.6173, 55.7558],
        'Stalingrad': [44.5169, 48.7080],
        'Kriget börjar': [21.0122, 52.2297],
        'Getton': [21.0122, 52.2297],
        'Auschwitz I börjar byggas': [19.2034, 50.0347],
        'Auschwitz II börjar byggas': [19.2034, 50.0347],
        'Auschwitz-Birkenau befrias': [19.2034, 50.0347],
        'Operation Reinhard': [22.0534, 52.6260],
        'De första judarna gasas ihjäl i Chełmno': [18.7290, 52.1456],
        'Deportation av och mord på romer': [19.2034, 50.0347],
        'Aktion "Skördefesten"': [22.5667, 51.2500],
        'Majdanek befrias': [22.6050, 51.2220],
        'Pogromen i Kielce': [20.6286, 50.8703],
        'Danmark kapitulerar': [12.5683, 55.6761],
        'De danska judarna räddas': [12.5683, 55.6761],
        'Luxemburg kapitulerar': [6.1296, 49.6116],
        'Nederländerna kapitulerar': [4.9041, 52.3676],
        'Belgien kapitulerar': [4.3517, 50.8503],
        'Norge kapitulerar': [10.7522, 59.9139],
        'Norska judar deporteras': [10.7522, 59.9139],
        'Massakern i Prypjat-träsken': [26.0951, 52.1229],
        'Massakern vid Kamjanets-Podilskyj': [26.5850, 48.6847],
        'Massakern vid Babyn Jar': [30.5234, 50.4501],
        'Massakern vid Rumbula': [24.1052, 56.9496],
        'Världskrig': [-157.9637, 21.3649],
        'Slaget vid El Alamein': [28.9550, 30.8170],
        'Invasionen av Sicilien': [13.3615, 38.1157],
        'Italien kapitulerar': [12.4964, 41.9028],
        'Deportation av Ungerns judar': [19.0402, 47.4979],
        'Internationell protest': [-0.1276, 51.5074],
        'Japan kapitulerar': [139.6917, 35.6895]
    };
    return coordinateMap[rubrik] || [15, 52];
}

// Parse date from various formats
function parseEventDate(dateString) {
    // Standard YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(dateString);
    }

    const monthMap = {
        'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5,
        'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11
    };

    const seasonMap = {
        'våren': { month: 2, day: 21 },      // Spring: March 21
        'vår': { month: 2, day: 21 },
        'sommaren': { month: 5, day: 21 },   // Summer: June 21
        'sommar': { month: 5, day: 21 },
        'hösten': { month: 8, day: 21 },     // Autumn: September 21
        'höst': { month: 8, day: 21 },
        'vintern': { month: 11, day: 21 },   // Winter: December 21
        'vinter': { month: 11, day: 21 }
    };

    // Normalize the string: remove extra spaces
    const normalized = dateString.trim().replace(/\s+/g, ' ');

    // Try month + year format with space (e.g., "januari 1938", "april 1940")
    const monthYearSpaceMatch = normalized.toLowerCase().match(/^([a-zåäö]+)\s+(\d{4})$/);
    if (monthYearSpaceMatch) {
        const monthOrSeason = monthYearSpaceMatch[1];
        const year = parseInt(monthYearSpaceMatch[2]);

        // Check if it's a month
        if (monthMap[monthOrSeason] !== undefined) {
            return new Date(year, monthMap[monthOrSeason], 15);
        }

        // Check if it's a season
        if (seasonMap[monthOrSeason]) {
            const { month, day } = seasonMap[monthOrSeason];
            return new Date(year, month, day);
        }
    }

    // Try month + year format without space (e.g., "augusti1941", "Hösten1940")
    const monthYearNoSpaceMatch = normalized.toLowerCase().match(/^([a-zåäö]+)(\d{4})$/);
    if (monthYearNoSpaceMatch) {
        const monthOrSeason = monthYearNoSpaceMatch[1];
        const year = parseInt(monthYearNoSpaceMatch[2]);

        // Check if it's a month
        if (monthMap[monthOrSeason] !== undefined) {
            return new Date(year, monthMap[monthOrSeason], 15);
        }

        // Check if it's a season
        if (seasonMap[monthOrSeason]) {
            const { month, day } = seasonMap[monthOrSeason];
            return new Date(year, month, day);
        }
    }

    // Default fallback
    return new Date(1938, 0, 1);
}

// Format date for display
function formatEventDate(dateString) {
    const date = parseEventDate(dateString);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const monthKeys = ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
                          'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
        const monthKey = monthKeys[date.getMonth()];
        return date.getFullYear() + ' ' + (translations ? t('ui.months.' + monthKey) : monthKey.toUpperCase());
    }
    // For other formats like "januari 1938", translate the month if possible
    const lowerDateString = dateString.toLowerCase();
    const monthMap = {
        'januari': 'januari', 'februari': 'februari', 'mars': 'mars', 'april': 'april',
        'maj': 'maj', 'juni': 'juni', 'juli': 'juli', 'augusti': 'augusti',
        'september': 'september', 'oktober': 'oktober', 'november': 'november', 'december': 'december'
    };
    for (const [swedishMonth, key] of Object.entries(monthMap)) {
        if (lowerDateString.includes(swedishMonth)) {
            const translatedMonth = translations ? t('ui.months.' + key) : swedishMonth.toUpperCase();
            return dateString.replace(new RegExp(swedishMonth, 'i'), translatedMonth);
        }
    }
    return dateString.toUpperCase();
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

// Load events from CSV
async function loadEvents() {
    const response = await fetch('events.csv');
    const text = await response.text();
    const lines = text.split('\n').slice(1);

    events = lines
        .filter(line => line.trim())
        .map(line => {
            const parts = parseCSVLine(line);
            const datum = parts[0];
            const rubrik_sv = parts[1];
            const rubrik_en = parts[2];
            const ingress_sv = parts[3] || '';
            const ingress_en = parts[4] || '';
            const caption_sv = parts[5] || '';
            const caption_en = parts[6] || '';
            const bildUrl = parts[7] || '';

            return {
                date: datum,
                parsedDate: parseEventDate(datum),
                title_sv: rubrik_sv,
                title_en: rubrik_en,
                description_sv: ingress_sv,
                description_en: ingress_en,
                caption_sv: caption_sv,
                caption_en: caption_en,
                imageUrl: bildUrl,
                coordinates: getEventCoordinates(rubrik_sv)
            };
        })
        .sort((a, b) => a.parsedDate - b.parsedDate);

    console.log(`Loaded ${events.length} events`);
    return events;
}

// Update GeoJSON borders based on date
async function updateBorders(date) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;

    let borderFile;
    if (month <= 4) {
        borderFile = 'geojson/April_30_' + year + '.geojson';
    } else if (month <= 8) {
        // Note: 1938-1939 use August_30, 1940+ use August_31
        if (year === 1938 || year === 1939) {
            borderFile = 'geojson/August_30_' + year + '.geojson';
        } else {
            borderFile = 'geojson/August_31_' + year + '.geojson';
        }
    } else {
        borderFile = 'geojson/December_31_' + year + '.geojson';
    }

    try {
        const response = await fetch(borderFile);
        const data = await response.json();

        // Remove CRS property - Mapbox GL JS only supports WGS84 and will ignore/reject custom CRS
        delete data.crs;

        if (map.getSource('borders')) {
            map.getSource('borders').setData(data);
        } else {
            // Add IDs to features for feature-state to work
            data.features.forEach((feature, index) => {
                feature.id = index;
            });

            map.addSource('borders', {
                type: 'geojson',
                data: data,
                generateId: true
            });

            map.addLayer({
                id: 'borders-fill',
                type: 'fill',
                source: 'borders',
                paint: {
                    'fill-color': [
                        'case',
                        ['==', ['get', 'Name'], 'Germany'], getCSSVariable('--map-germany'),
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'German-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'German Protectorate'],
                            ['==', ['get', 'Foreign_Po'], 'German, Italian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'German, Italian, Bulgarian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Axis and German-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Axis and German, Italian-occupied']
                        ], getCSSVariable('--map-germany-occ'),
                        ['==', ['get', 'Name'], 'Italy'], getCSSVariable('--map-italy'),
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'Italian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Italian Protectorate']
                        ], getCSSVariable('--map-italy-occ'),
                        ['==', ['get', 'Foreign_Po'], 'Axis'], getCSSVariable('--map-axis'),
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'Romanian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Bulgarian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Hungarian-occupied']
                        ], getCSSVariable('--map-axis-occ'),
                        'transparent'
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        [
                            'case',
                            ['==', ['get', 'Name'], 'Germany'], 0.6,
                            ['==', ['get', 'Name'], 'Italy'], 0.6,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'German-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'German Protectorate'],
                                ['==', ['get', 'Foreign_Po'], 'German, Italian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'German, Italian, Bulgarian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Axis and German-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Axis and German, Italian-occupied']
                            ], 0.5,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'Italian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Italian Protectorate']
                            ], 0.45,
                            ['==', ['get', 'Foreign_Po'], 'Axis'], 0.45,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'Romanian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Bulgarian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Hungarian-occupied']
                            ], 0.45,
                            0
                        ],
                        [
                            'case',
                            ['==', ['get', 'Name'], 'Germany'], 0.4,
                            ['==', ['get', 'Name'], 'Italy'], 0.4,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'German-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'German Protectorate'],
                                ['==', ['get', 'Foreign_Po'], 'German, Italian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'German, Italian, Bulgarian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Axis and German-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Axis and German, Italian-occupied']
                            ], 0.3,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'Italian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Italian Protectorate']
                            ], 0.25,
                            ['==', ['get', 'Foreign_Po'], 'Axis'], 0.25,
                            ['any',
                                ['==', ['get', 'Foreign_Po'], 'Romanian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Bulgarian-occupied'],
                                ['==', ['get', 'Foreign_Po'], 'Hungarian-occupied']
                            ], 0.25,
                            0
                        ]
                    ],
                    'fill-antialias': true
                }
            }, 'waterway-label');

            map.addLayer({
                id: 'borders-outline',
                type: 'line',
                source: 'borders',
                paint: {
                    'line-color': [
                        'case',
                        ['==', ['get', 'Name'], 'Germany'], '#D47B7B',
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'German-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'German Protectorate'],
                            ['==', ['get', 'Foreign_Po'], 'German, Italian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'German, Italian, Bulgarian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Axis and German-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Axis and German, Italian-occupied']
                        ], '#DB9797',
                        ['==', ['get', 'Name'], 'Italy'], '#55A17A',
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'Italian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Italian Protectorate']
                        ], '#7BB597',
                        ['==', ['get', 'Foreign_Po'], 'Axis'], '#CFB572',
                        ['any',
                            ['==', ['get', 'Foreign_Po'], 'Romanian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Bulgarian-occupied'],
                            ['==', ['get', 'Foreign_Po'], 'Hungarian-occupied']
                        ], '#DBCB9C',
                        '#444'
                    ],
                    'line-width': 1,
                    'line-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.8,
                        0
                    ]
                }
            }, 'waterway-label');

            // Set up territory interactivity after layers are added
            setupTerritoryInteractivity();
        }
    } catch (error) {
        console.log('Border file not found:', borderFile);
    }
}

// Load and display Sweden overlay
async function loadSwedenOverlay() {
    try {
        const response = await fetch('geojson/se.json');
        const data = await response.json();

        // Remove CRS property if it exists
        delete data.crs;

        if (map.getSource('sweden')) {
            map.getSource('sweden').setData(data);
        } else {
            map.addSource('sweden', {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: 'sweden-fill',
                type: 'fill',
                source: 'sweden',
                paint: {
                    'fill-color': getCSSVariable('--map-sweden'),
                    'fill-opacity': 0.4
                }
            }, 'waterway-label');

            map.addLayer({
                id: 'sweden-outline',
                type: 'line',
                source: 'sweden',
                paint: {
                    'line-color': '#6BA9C4',
                    'line-width': 1,
                    'line-opacity': 0
                }
            }, 'waterway-label');

            // Add hover and click interactivity for Sweden
            map.on('mouseenter', 'sweden-fill', () => {
                map.getCanvas().style.cursor = 'pointer';
                map.setPaintProperty('sweden-fill', 'fill-opacity', 0.6);
                map.setPaintProperty('sweden-outline', 'line-opacity', 0.8);
            });

            map.on('mouseleave', 'sweden-fill', () => {
                map.getCanvas().style.cursor = '';
                map.setPaintProperty('sweden-fill', 'fill-opacity', 0.4);
                map.setPaintProperty('sweden-outline', 'line-opacity', 0);
            });

            map.on('click', 'sweden-fill', () => {
                showTerritoryInfo('sweden');
            });
        }
    } catch (error) {
        console.log('Sweden GeoJSON file not found:', error);
    }
}

// Determine territory type from feature properties
function getTerritoryType(feature) {
    const name = feature.properties.Name;
    const foreignPo = feature.properties.Foreign_Po;

    if (name === 'Germany') {
        return 'germany';
    } else if (name === 'Italy') {
        return 'italy';
    } else if (foreignPo === 'German-occupied' ||
               foreignPo === 'German Protectorate' ||
               foreignPo === 'German, Italian-occupied' ||
               foreignPo === 'German, Italian, Bulgarian-occupied' ||
               foreignPo === 'Axis and German-occupied' ||
               foreignPo === 'Axis and German, Italian-occupied') {
        return 'germany-occ';
    } else if (foreignPo === 'Italian-occupied' ||
               foreignPo === 'Italian Protectorate') {
        return 'italy-occ';
    } else if (foreignPo === 'Axis') {
        return 'axis';
    } else if (foreignPo === 'Romanian-occupied' ||
               foreignPo === 'Bulgarian-occupied' ||
               foreignPo === 'Hungarian-occupied') {
        return 'axis-occ';
    }
    return null;
}

// Setup territory click and hover interactions
function setupTerritoryInteractivity() {
    // Add hover effect - only for territories in the legend
    let hoveredStateId = null;

    map.on('mousemove', 'borders-fill', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const territoryType = getTerritoryType(feature);

            // Only apply hover if this is a legend territory
            if (territoryType) {
                map.getCanvas().style.cursor = 'pointer';

                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'borders', id: hoveredStateId },
                        { hover: false }
                    );
                }
                hoveredStateId = feature.id;
                map.setFeatureState(
                    { source: 'borders', id: hoveredStateId },
                    { hover: true }
                );
            } else {
                map.getCanvas().style.cursor = '';
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'borders', id: hoveredStateId },
                        { hover: false }
                    );
                    hoveredStateId = null;
                }
            }
        }
    });

    map.on('mouseleave', 'borders-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'borders', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });

    // Handle territory clicks - only for legend territories
    map.on('click', 'borders-fill', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const territoryType = getTerritoryType(feature);

            if (territoryType && translations && translations.territories && translations.territories[territoryType]) {
                showTerritoryInfo(territoryType);
            }
        }
    });
}

// Show territory information in the content panel
function showTerritoryInfo(territoryType) {
    if (!translations) return;

    const info = translations.territories[territoryType];
    if (!info) return;

    isShowingTerritoryInfo = true;

    const contentEl = document.getElementById('event-content');
    const bgEl = document.getElementById('content-background');

    // Fade out
    contentEl.classList.add('fade-out');

    // Wait for fade out, then update content
    setTimeout(() => {
        document.getElementById('event-date-label').textContent = t('ui.legend.title');
        document.getElementById('event-title').textContent = info.title;

        // Add disclaimer to the text
        const textWithDisclaimer = info.text + '\n\n' + t('territories.disclaimer');
        document.getElementById('event-text').textContent = textWithDisclaimer;

        // Construct image path from territoryType
        const imageMap = {
            'germany': 'gfx/images/germany.webp',
            'germany-occ': 'gfx/images/germany_occ.webp',
            'italy': 'gfx/images/italy.webp',
            'italy-occ': 'gfx/images/italy_occ.webp',
            'axis': 'gfx/images/axis.webp',
            'axis-occ': 'gfx/images/axis_occ.webp',
            'sweden': 'gfx/images/27.-Roda-korset_tidslinje_evakuera-alla.webp'
        };
        const imagePath = imageMap[territoryType];

        document.getElementById('event-image').src = imagePath;
        document.getElementById('event-image-caption').textContent = info.imageCaption;

        bgEl.style.setProperty('--bg-image', 'url(' + imagePath + ')');

        // Fade in
        contentEl.classList.remove('fade-out');
    }, 300);
}

// Create event markers on map
function createEventMarkers() {
    eventMarkers.forEach(marker => marker.remove());
    eventMarkers = [];

    // Only add active marker (remove inactive markers)
    if (currentEventIndex >= 0 && currentEventIndex < events.length) {
        const event = events[currentEventIndex];
        const el = document.createElement('div');
        el.className = 'event-marker active';
        el.style.backgroundImage = 'url(' + event.imageUrl + ')';

        // Add label for active marker
        const label = document.createElement('div');
        label.className = 'event-marker-label';
        label.textContent = currentLanguage === 'sv' ? event.title_sv : event.title_en;
        el.appendChild(label);

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            goToEvent(currentEventIndex);
        });

        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        })
            .setLngLat(event.coordinates)
            .addTo(map);

        eventMarkers.push(marker);
    }
}

// Update event content panel
function updateEventContent(event, preventScroll = false, scrollY = 0) {
    const contentEl = document.getElementById('event-content');
    const bgEl = document.getElementById('content-background');

    // Fade out
    contentEl.classList.add('fade-out');

    // Wait for fade out, then update content
    setTimeout(() => {
        const title = currentLanguage === 'sv' ? event.title_sv : event.title_en;
        const description = currentLanguage === 'sv' ? event.description_sv : event.description_en;
        const caption = currentLanguage === 'sv' ? event.caption_sv : event.caption_en;

        document.getElementById('event-date-label').textContent = formatEventDate(event.date);
        document.getElementById('event-title').textContent = title;
        document.getElementById('event-text').textContent = description;
        document.getElementById('event-image').src = event.imageUrl;
        document.getElementById('event-image-caption').textContent = caption || (title + '. ' + t('imageCaption.default'));

        bgEl.style.setProperty('--bg-image', 'url(' + event.imageUrl + ')');
        document.getElementById('year-display').textContent = event.parsedDate.getFullYear();

        // Fade in
        contentEl.classList.remove('fade-out');

        // Restore scroll position on mobile after content updates
        if (preventScroll) {
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        }
    }, 300);
}

// Create year pill buttons (1933-1948)
function createYearPills() {
    const container = document.getElementById('timeline-year-pills');
    container.innerHTML = '';

    for (let year = 1933; year <= 1948; year++) {
        const pill = document.createElement('button');
        pill.className = 'timeline-year-pill';
        pill.textContent = year;
        pill.setAttribute('data-year', year);

        if (year === currentYear) {
            pill.classList.add('active');
        }

        pill.addEventListener('click', () => {
            if (year !== currentYear && !isAnimating) {
                // Find first event for this year
                const firstEventIndex = events.findIndex(event =>
                    event.parsedDate.getFullYear() === year
                );

                if (firstEventIndex !== -1) {
                    // If events exist for this year, switch year and then go to first event
                    switchToYear(year, false, false, firstEventIndex);
                } else {
                    // If no events, just switch year without showing handle
                    switchToYear(year, false, true);
                }
            }
        });

        container.appendChild(pill);
    }
}

// Create month labels for a specific year at a specific offset position
function createMonthLabelsForYear(container, year, offsetPercent) {
    const monthKeys = ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
                       'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

    monthKeys.forEach((monthKey, index) => {
        const label = document.createElement('div');
        label.className = 'timeline-month-label';
        label.textContent = translations ? t('ui.months.' + monthKey).toLowerCase() : monthKey;
        // Position with consistent spacing: 0%, 8.33%, 16.67%, ... 91.67%
        // This leaves 8.33% gap before next year, matching inter-month spacing
        const monthPosition = (index * (100 / 12));
        label.style.left = (offsetPercent + monthPosition) + '%';
        label.setAttribute('data-year', year);
        container.appendChild(label);
    });
}

// Create month labels for previous, current, and next years
function createMonthLabels() {
    const container = document.getElementById('timeline-month-labels');
    container.innerHTML = '';

    // Render previous year (at -100%)
    if (currentYear > 1933) {
        createMonthLabelsForYear(container, currentYear - 1, -100);
    }

    // Render current year (at 0%)
    createMonthLabelsForYear(container, currentYear, 0);

    // Render next year (at +100%)
    if (currentYear < 1948) {
        createMonthLabelsForYear(container, currentYear + 1, 100);
    }
}

// Create timeline year labels and ticks (deprecated - kept for compatibility)
function createTimelineYearLabels() {
    // This function is now replaced by createYearPills and createMonthLabels
    createYearPills();
    createMonthLabels();
}

// Calculate timeline position for a date within current year (0-100%)
function getTimelinePosition(date) {
    const eventYear = date.getFullYear();

    // Calculate position within the year (0 to 1)
    const yearStart = new Date(eventYear, 0, 1);
    const yearEnd = new Date(eventYear, 11, 31, 23, 59, 59);
    const yearProgress = (date - yearStart) / (yearEnd - yearStart);

    // Return position as percentage (0-100)
    return yearProgress * 100;
}

// Check if mobile view
function isMobileView() {
    return window.innerWidth <= 767;
}

// Create timeline markers for a specific year at a specific offset position
function createTimelineMarkersForYear(container, year, offsetPercent, containerWidth) {
    // Filter events for this year
    const yearEvents = [];
    events.forEach((event, index) => {
        const eventYear = event.parsedDate.getFullYear();
        if (eventYear === year) {
            yearEvents.push({ event, index });
        }
    });

    // On mobile, spread events evenly; on desktop, use date-based positioning
    if (isMobileView()) {
        // Mobile: Even spacing
        yearEvents.forEach((item, i) => {
            const evenPosition = (i / Math.max(1, yearEvents.length - 1)) * 100;
            const position = yearEvents.length === 1 ? 50 : evenPosition;

            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = (offsetPercent + position) + '%';
            marker.setAttribute('data-year', year);

            if (item.index === currentEventIndex) {
                marker.classList.add('active');
            }

            marker.addEventListener('click', () => {
                goToEvent(item.index);
            });

            container.appendChild(marker);
        });
    } else {
        // Desktop: Date-based positioning with collision detection
        const minDistance = 8;
        const markerPositions = [];

        yearEvents.forEach((item, i) => {
            let adjustedPosition = getTimelinePosition(item.event.parsedDate);
            const pixelPosition = (adjustedPosition / 100) * containerWidth;

            // Check against previous markers
            for (let j = 0; j < markerPositions.length; j++) {
                const prevPixelPos = (markerPositions[j] / 100) * containerWidth;
                if (Math.abs(pixelPosition - prevPixelPos) < minDistance) {
                    const newPixelPos = prevPixelPos + minDistance;
                    adjustedPosition = (newPixelPos / containerWidth) * 100;
                }
            }

            markerPositions.push(adjustedPosition);

            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = (offsetPercent + adjustedPosition) + '%';
            marker.setAttribute('data-year', year);

            if (item.index === currentEventIndex) {
                marker.classList.add('active');
            }

            marker.addEventListener('click', () => {
                goToEvent(item.index);
            });

            container.appendChild(marker);
        });
    }
}

// Create timeline markers for previous, current, and next years
function createTimelineMarkers() {
    const container = document.getElementById('timeline-markers');
    container.innerHTML = '';

    const containerWidth = container.offsetWidth || 1000; // Fallback width
    const allYears = Array.from(new Set(events.map(e => e.parsedDate.getFullYear()))).sort((a, b) => a - b);
    const currentYearIndex = allYears.indexOf(currentYear);

    // Only render adjacent years if current year has events
    if (currentYearIndex !== -1) {
        // Render previous year (at -100%)
        if (currentYearIndex > 0) {
            createTimelineMarkersForYear(container, allYears[currentYearIndex - 1], -100, containerWidth);
        }

        // Render current year (at 0%)
        createTimelineMarkersForYear(container, currentYear, 0, containerWidth);

        // Render next year (at +100%)
        if (currentYearIndex < allYears.length - 1) {
            createTimelineMarkersForYear(container, allYears[currentYearIndex + 1], 100, containerWidth);
        }
    }
    // If current year has no events, don't render any markers
}

// Update timeline handle position
function updateTimelineHandle() {
    const handle = document.getElementById('timeline-handle');
    handle.classList.add('animating');
    const position = getTimelinePosition(events[currentEventIndex].parsedDate);
    handle.style.left = position + '%';
}

// Switch to a different year with animation
function switchToYear(year, skipAnimation = false, hideHandle = false, targetEventIndex = null) {
    const oldYear = currentYear;
    currentYear = year;
    const handle = document.getElementById('timeline-handle');

    // Update pill active states
    document.querySelectorAll('.timeline-year-pill').forEach(pill => {
        if (parseInt(pill.getAttribute('data-year')) === year) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

    if (!skipAnimation && oldYear !== year) {
        // Simple approach: just hide handle during entire year switch
        isAnimating = true;
        const markersContainer = document.getElementById('timeline-markers');
        const monthLabelsContainer = document.getElementById('timeline-month-labels');
        const direction = year > oldYear ? -100 : 100;

        // Immediately hide handle
        handle.style.visibility = 'hidden';

        // Animate timeline
        markersContainer.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        monthLabelsContainer.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        markersContainer.style.transform = `translateX(${direction}%)`;
        monthLabelsContainer.style.transform = `translateX(${direction}%)`;

        setTimeout(() => {
            // Reset timeline
            markersContainer.style.transition = 'none';
            monthLabelsContainer.style.transition = 'none';
            markersContainer.style.transform = 'translateX(0)';
            monthLabelsContainer.style.transform = 'translateX(0)';

            // Re-render
            createTimelineMarkers();
            createMonthLabels();

            // If target event specified, go to that event with drop animation
            if (targetEventIndex !== null) {
                currentEventIndex = targetEventIndex;
                const event = events[targetEventIndex];

                // Update event content and map
                updateEventContent(event);
                updateBorders(event.parsedDate);
                createEventMarkers();
                createTimelineYearLabels();

                // Position handle
                handle.classList.remove('animating'); // Remove transition to prevent horizontal animation
                const position = getTimelinePosition(event.parsedDate);
                handle.style.left = position + '%';

                // Drop in handle
                setTimeout(() => {
                    handle.style.visibility = 'visible';
                    handle.classList.add('drop-in');

                    setTimeout(() => {
                        handle.classList.remove('drop-in');
                        isAnimating = false;
                    }, 320);
                }, 0);

                // Animate map
                map.flyTo({
                    center: event.coordinates,
                    zoom: 5,
                    duration: 2000,
                    easing: function(t) {
                        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    }
                });

                // Update navigation buttons
                updateNavigationButtons();
            } else if (!hideHandle && events[currentEventIndex]) {
                // Position and show handle if not hiding it
                handle.classList.remove('animating'); // Remove transition to prevent horizontal animation
                const position = getTimelinePosition(events[currentEventIndex].parsedDate);
                handle.style.left = position + '%';

                // Drop in immediately
                setTimeout(() => {
                    handle.style.visibility = 'visible';
                    handle.classList.add('drop-in');

                    setTimeout(() => {
                        handle.classList.remove('drop-in');
                        isAnimating = false;
                    }, 320);
                }, 0);
            } else {
                // Keep handle hidden
                isAnimating = false;
            }
        }, 1200);
    } else {
        // No animation, just update content
        createTimelineMarkers();
        createMonthLabels();
        if (!hideHandle) {
            updateTimelineHandle();
        }
    }
}

// Go to specific event
function goToEvent(index, withYearSwitch = false, initialDrop = false) {
    currentEventIndex = index;
    const event = events[index];
    const eventYear = event.parsedDate.getFullYear();

    // On mobile, prevent auto-scroll during content update
    const scrollY = window.scrollY || window.pageYOffset;
    const preventScroll = window.innerWidth <= 767;

    // Switch year if needed
    if (eventYear !== currentYear) {
        switchToYear(eventYear, !withYearSwitch);
    } else {
        // Update markers for current year
        createTimelineMarkers();
    }

    updateEventContent(event, preventScroll, scrollY);
    updateBorders(event.parsedDate);
    createEventMarkers();
    createTimelineYearLabels();
    if (eventYear === currentYear) {
        if (initialDrop) {
            // Trigger drop-in animation for initial load
            const handle = document.getElementById('timeline-handle');
            const position = getTimelinePosition(event.parsedDate);
            handle.style.left = position + '%';

            setTimeout(() => {
                handle.style.visibility = 'visible';
                handle.classList.add('drop-in');

                setTimeout(() => {
                    handle.classList.remove('drop-in');
                }, 320);
            }, 0);
        } else {
            updateTimelineHandle();
        }
    }

    // Calculate distance-based duration for smoother long transitions
    const currentCenter = map.getCenter();
    const targetCenter = event.coordinates;

    // Calculate distance using Haversine formula approximation
    const lat1 = currentCenter.lat * Math.PI / 180;
    const lat2 = targetCenter[1] * Math.PI / 180;
    const lng1 = currentCenter.lng * Math.PI / 180;
    const lng2 = targetCenter[0] * Math.PI / 180;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = c * 6371; // Earth radius in km

    // Scale duration based on distance: min 2s, max 8s for very long distances
    // Short distances (< 500km): 2-3 seconds
    // Medium distances (500-2000km): 3-5 seconds
    // Long distances (> 2000km): 5-8 seconds
    const minDuration = 2000;
    const maxDuration = 8000;
    const duration = Math.min(maxDuration, minDuration + (distance / 500) * 1000);

    map.flyTo({
        center: event.coordinates,
        zoom: 5,
        duration: duration,
        easing: function(t) {
            // Smoother easing function (ease-in-out cubic)
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    });

    // Update navigation button states
    updateNavigationButtons();
}
// Convert timeline position (0-100%) to a date within current year
function getDateFromTimelinePosition(percent) {
    const yearProgress = percent / 100;

    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
    const yearDuration = yearEnd - yearStart;

    return new Date(yearStart.getTime() + (yearDuration * yearProgress));
}

// Timeline dragging functionality with touch support
function initTimelineDragging() {
    const handle = document.getElementById('timeline-handle');
    const timeline = document.getElementById('timeline');
    const tooltip = document.getElementById('timeline-tooltip');
    let animationFrameId = null;

    // Helper function to get client position from mouse or touch event
    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    // Helper function to handle drag movement
    function handleDragMove(clientX) {
        if (!isDragging) return;

        // Use requestAnimationFrame for smooth updates
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(() => {
            // Recalculate timeline rect on each move for accuracy
            const timelineRect = timeline.getBoundingClientRect();
            const x = clientX - timelineRect.left;
            const percent = Math.max(0, Math.min(1, x / timelineRect.width)) * 100;

            const currentTime = getDateFromTimelinePosition(percent);

            // Only consider events from current year
            let nearestIndex = 0;
            let nearestDiff = Infinity;
            let markerIndex = 0;
            events.forEach((event, index) => {
                if (event.parsedDate.getFullYear() === currentYear) {
                    const diff = Math.abs(event.parsedDate.getTime() - currentTime.getTime());
                    if (diff < nearestDiff) {
                        nearestDiff = diff;
                        nearestIndex = index;
                    }
                }
            });

            handle.style.left = percent + '%';

            const event = events[nearestIndex];
            document.getElementById('tooltip-date').textContent = formatEventDate(event.date);
            document.getElementById('tooltip-title').textContent = currentLanguage === 'sv' ? event.title_sv : event.title_en;

            // Update marker active states
            const markers = document.querySelectorAll('.timeline-marker');
            let currentYearMarkerIndex = 0;
            events.forEach((evt, idx) => {
                if (evt.parsedDate.getFullYear() === currentYear) {
                    if (markers[currentYearMarkerIndex]) {
                        markers[currentYearMarkerIndex].classList.toggle('active', idx === nearestIndex);
                    }
                    currentYearMarkerIndex++;
                }
            });
        });
    }

    // Helper function to handle drag end
    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        tooltip.classList.add('hidden');

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const handleLeft = parseFloat(handle.style.left);
        const currentTime = getDateFromTimelinePosition(handleLeft);

        // Only consider events from current year
        let nearestIndex = 0;
        let nearestDiff = Infinity;
        events.forEach((event, index) => {
            if (event.parsedDate.getFullYear() === currentYear) {
                const diff = Math.abs(event.parsedDate.getTime() - currentTime.getTime());
                if (diff < nearestDiff) {
                    nearestDiff = diff;
                    nearestIndex = index;
                }
            }
        });

        goToEvent(nearestIndex);
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        handle.classList.remove('animating');
        tooltip.classList.remove('hidden');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        handleDragMove(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        handleDragEnd();
    });

    // Touch events
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        handle.classList.remove('animating');
        tooltip.classList.remove('hidden');
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches && e.touches.length > 0) {
            handleDragMove(e.touches[0].clientX);
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        handleDragEnd();
    });

    document.addEventListener('touchcancel', () => {
        handleDragEnd();
    });
}

// Idle detection for navigation button pulse animation
function initIdleDetection() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const exploreBtn = document.getElementById('explore-timeline-btn');
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    const scrollDownBtn = document.getElementById('scroll-down-btn');
    let idleTimer = null;
    const IDLE_DELAY = 3000; // 3 seconds

    function resetIdle() {
        // Remove idle class from buttons
        prevBtn.classList.remove('idle');
        nextBtn.classList.remove('idle');
        if (exploreBtn) {
            exploreBtn.classList.remove('idle');
        }
        scrollUpBtn.classList.remove('idle');
        scrollDownBtn.classList.remove('idle');

        // Clear existing timer
        if (idleTimer) {
            clearTimeout(idleTimer);
        }

        // Set new timer to add idle class after delay
        idleTimer = setTimeout(() => {
            // Check if any overlay is open - if so, don't add idle animations
            const infoOverlay = document.getElementById('info-overlay');
            const imageOverlay = document.getElementById('image-overlay');
            const isAnyOverlayOpen = (infoOverlay && !infoOverlay.classList.contains('hidden')) ||
                                     (imageOverlay && !imageOverlay.classList.contains('hidden'));

            if (isAnyOverlayOpen) {
                // Don't add idle animations when overlays are open
                return;
            }

            // Only add idle animations when no overlay is open
            prevBtn.classList.add('idle');
            nextBtn.classList.add('idle');
            if (exploreBtn) {
                exploreBtn.classList.add('idle');
            }
            scrollUpBtn.classList.add('idle');
            scrollDownBtn.classList.add('idle');
        }, IDLE_DELAY);
    }

    // Listen to all user interaction events
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, resetIdle, { passive: true });
    });

    // Start idle timer on load
    resetIdle();
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (currentEventIndex === 0) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }

    if (currentEventIndex === events.length - 1) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}

// Navigation buttons
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentEventIndex > 0) {
        goToEvent(currentEventIndex - 1, true);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentEventIndex < events.length - 1) {
        goToEvent(currentEventIndex + 1, true);
    }
});

// Zoom controls
document.getElementById('zoom-in').addEventListener('click', () => {
    map.zoomIn();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    map.zoomOut();
});

// Handle missing images gracefully (suppress console errors for missing sprite images)
map.on('styleimagemissing', (e) => {
    // Create a minimal placeholder image to prevent errors
    const width = 64;
    const height = 64;
    const data = new Uint8Array(width * height * 4);

    // Fill with transparent pixels
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 0; // A (transparent)
    }

    map.addImage(e.id, { width, height, data });
});

// Mobile legend toggle functionality
function initMobileLegendToggle() {
    const toggleBtn = document.getElementById('legend-toggle');
    const legend = document.getElementById('map-legend');

    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 767;
    }

    // Update legend visibility based on screen size
    function updateLegendDisplay() {
        if (isMobile()) {
            toggleBtn.style.display = 'block';
            legend.classList.add('collapsed');
        } else {
            toggleBtn.style.display = 'none';
            legend.classList.remove('collapsed');
        }
    }

    // Toggle legend on button click
    toggleBtn.addEventListener('click', () => {
        legend.classList.toggle('collapsed');
    });

    // Close legend when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobile() &&
            !legend.contains(e.target) &&
            !toggleBtn.contains(e.target) &&
            !legend.classList.contains('collapsed')) {
            legend.classList.add('collapsed');
        }
    });

    // Update on window resize
    window.addEventListener('resize', updateLegendDisplay);

    // Initial setup
    updateLegendDisplay();
}

// Re-render timeline markers on window resize (mobile vs desktop)
window.addEventListener('resize', () => {
    createTimelineMarkers();
});

// Mobile hamburger menu setup
function initMobileHamburgerMenu() {
    const hamburgerMenu = document.getElementById('content-top-controls');

    if (!hamburgerMenu) return;

    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 767;
    }

    // Update hamburger menu visibility based on screen size
    function updateHamburgerDisplay() {
        const mobile = isMobile();

        if (mobile) {
            hamburgerMenu.classList.add('mobile-menu', 'show');
        } else {
            hamburgerMenu.classList.remove('mobile-menu', 'show');
        }
    }

    // Update on window resize
    window.addEventListener('resize', updateHamburgerDisplay);

    // Initial setup
    updateHamburgerDisplay();
}

// Initialize when map is loaded
map.on('load', async () => {
    // Load translations first
    await loadTranslations(currentLanguage);

    // Update button text with translation
    const languageSpan = document.querySelector('#language-btn span');
    languageSpan.textContent = t('ui.buttons.language');

    // Update all UI texts
    updateUITexts();

    // Load Sweden overlay
    await loadSwedenOverlay();

    await loadEvents();

    // Set current year to first event's year
    if (events.length > 0) {
        currentYear = events[0].parsedDate.getFullYear();
    }

    createTimelineYearLabels();
    createTimelineMarkers();
    initTimelineDragging();
    initIdleDetection();
    initMobileLegendToggle(); // Initialize mobile legend toggle

    // Hide handle initially, then drop it in
    const handle = document.getElementById('timeline-handle');
    handle.style.visibility = 'hidden';

    goToEvent(0, false, true); // Pass true for initial drop animation

    // Fade out loading screen after everything is loaded
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');

        // Show mobile hamburger menu after loading completes
        setTimeout(() => {
            initMobileHamburgerMenu();
        }, 300); // Wait for loading screen fade animation
    }, 500);
});

// Update legend labels based on current language
function updateLegendLabels() {
    document.querySelectorAll('.legend-label').forEach(label => {
        const text = currentLanguage === 'sv' ? label.getAttribute('data-sv') : label.getAttribute('data-en');
        if (text) {
            label.textContent = text;
        }
    });
}

// Update all UI texts
function updateUITexts() {
    if (!translations) return;

    // Update toggle switch labels
    const toggleLabelOff = document.querySelector('.toggle-label-off');
    const toggleLabelOn = document.querySelector('.toggle-label-on');
    if (toggleLabelOff) {
        toggleLabelOff.textContent = t('ui.buttons.audioOff');
    }
    if (toggleLabelOn) {
        toggleLabelOn.textContent = t('ui.buttons.audioOn');
    }

    // Update information button text
    const helpBtnSpan = document.querySelector('#help-btn span');
    if (helpBtnSpan) {
        helpBtnSpan.textContent = t('ui.buttons.information');
    }

    // Update legend toggle button text
    const legendToggleSpan = document.querySelector('#legend-toggle span');
    if (legendToggleSpan) {
        const text = currentLanguage === 'sv' ? legendToggleSpan.getAttribute('data-sv') : legendToggleSpan.getAttribute('data-en');
        if (text) {
            legendToggleSpan.textContent = text;
        }
    }

    // Update info overlay content
    updateInfoOverlayTexts();
}

// Update info overlay texts
function updateInfoOverlayTexts() {
    if (!translations) return;

    document.getElementById('info-title').textContent = t('infoOverlay.title');

    const columns = document.querySelectorAll('.info-column');
    if (columns[0]) {
        columns[0].querySelector('h2').textContent = t('infoOverlay.purposeTitle');
        const paragraphs = columns[0].querySelectorAll('p');
        paragraphs[0].textContent = t('infoOverlay.purposeText1');
        paragraphs[1].textContent = t('infoOverlay.purposeText2');
        const exploreBtn = columns[0].querySelector('#explore-timeline-btn span');
        if (exploreBtn) exploreBtn.textContent = t('infoOverlay.exploreButton');
    }

    if (columns[1]) {
        columns[1].querySelector('h2').textContent = t('infoOverlay.featuresTitle');
        const features = columns[1].querySelectorAll('.info-features li > span');
        if (features[0]) features[0].textContent = t('infoOverlay.feature1');
        if (features[1]) features[1].textContent = t('infoOverlay.feature2');
        if (features[2]) features[2].textContent = t('infoOverlay.feature3');
        if (features[3]) features[3].textContent = t('infoOverlay.feature4');
        if (features[4]) features[4].textContent = t('infoOverlay.feature5');

        // Update demo legend label
        const demoLegendLabel = columns[1].querySelector('.demo-legend-label');
        if (demoLegendLabel) {
            const text = currentLanguage === 'sv' ? demoLegendLabel.getAttribute('data-sv') : demoLegendLabel.getAttribute('data-en');
            demoLegendLabel.textContent = text;
        }
    }

    if (columns[2]) {
        columns[2].querySelector('h2').textContent = t('infoOverlay.creditsTitle');
        const creditsP = columns[2].querySelectorAll('.credits');
        if (creditsP[0]) {
            creditsP[0].innerHTML = `<strong>${t('infoOverlay.creditsLabel')}</strong> ${t('infoOverlay.creditsText')} <a href="http://www.stanford.edu/group/spatialhistory/" target="_blank" rel="noopener">The Spatial History Project</a>`;
        }
        if (creditsP[1]) {
            creditsP[1].innerHTML = `<strong>${t('infoOverlay.swedenMapLabel')}</strong> ${t('infoOverlay.swedenMapText')} <a href="https://simplemaps.com/gis/country/se#all" target="_blank" rel="noopener">SimpleMaps</a>. <a href="https://creativecommons.org/licenses/by/4.0/#ref-appropriate-credit" target="_blank" rel="noopener">CC BY 4.0 License</a>`;
        }
    }
}

// Language switching
async function switchLanguage() {
    currentLanguage = currentLanguage === 'sv' ? 'en' : 'sv';

    // Load new translations
    await loadTranslations(currentLanguage);

    // Update button text
    const languageSpan = document.querySelector('#language-btn span');
    languageSpan.textContent = t('ui.buttons.language');

    // Update legend labels
    updateLegendLabels();

    // Update all UI texts
    updateUITexts();

    // Update current event content with new language
    if (events.length > 0) {
        const event = events[currentEventIndex];
        if (isShowingTerritoryInfo) {
            // If showing territory info, we need to find which territory was shown
            // For now, just refresh the event content
            updateEventContent(event);
            isShowingTerritoryInfo = false;
        } else {
            updateEventContent(event);
        }
        // Update event markers to use new language
        createEventMarkers();
    }

    // Update map style with language-specific version
    const styleUrl = currentLanguage === 'sv'
        ? 'mapbox://styles/mapbox/light-v11?language=sv'
        : 'mapbox://styles/mapbox/light-v11';

    // Store current map state
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const currentBearing = map.getBearing();
    const currentPitch = map.getPitch();

    // Change style and restore state
    map.once('styledata', () => {
        // Re-add Sweden overlay
        loadSwedenOverlay();
        // Re-add borders after style loads
        if (events.length > 0) {
            updateBorders(events[currentEventIndex].parsedDate);
        }
        // Recreate event markers
        createEventMarkers();
    });

    map.setStyle(styleUrl);
    map.setCenter(currentCenter);
    map.setZoom(currentZoom);
    map.setBearing(currentBearing);
    map.setPitch(currentPitch);

    console.log('Language switched to:', currentLanguage);
}

// Language button
document.getElementById('language-btn').addEventListener('click', switchLanguage);

// Legend item click handlers
document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => {
        const territoryType = item.getAttribute('data-territory');
        if (territoryType) {
            showTerritoryInfo(territoryType);
        }
    });
});

// Image sources data
const imageSources = {
    '1938': [
        'Inledning. Foto: Bundesarchiv (101I-317-0015-34A).',
        'Sveriges utlänningslag. Foto: Bundesarchiv (183-E01073).',
        'Anschluss. Foto: Bundesarchiv (101III-Pleisser-005-20).',
        'Walters affär vandaliseras. Foto: Centrum Judaicum, Berlin.',
        'Eviankonferensen. Foto: World Jewish Congress.',
        'Namnlagen. Foto: SMF/SHM (SMF_DIG60190) detalj.',
        'Införlivandet av Sudetenland. Foto: Bundesarchiv (146-1970-050-41).',
        'J-passen. Foto: SMF/SHM (SMF_DIG60191).',
        'Novemberpogromerna. Foto: Bundesarchiv (146-1970-061-65).',
        'Eva möter SS. Foto: Bundesarchiv (121-1346) beskuren.',
        'Walter är arresterad. Foto: Bundesarchiv. (101III-Duerr-056-12A), SMF/SHM (SMF115_00007).',
        'Koncentrationsläger. Foto: Bundesarchiv (183-78612-0002).',
        'Walters affär öppnar igen. Foto: SMF/SHM (SMF_DIG60195).',
        'Barnkvoten. Foto: Stockholms stadsmuseum (SSMAB000328S-1).',
        'Judiska företag förbjuds. Foto: Bundesarchiv (BA-146-1977-061-18).'
    ],
    '1939': [
        'Evas storebror reser till Sverige. Foto: Privat ägo.',
        'Einar Börjesson erbjuder Evas mamma arbete och bostad. Foto: Riksarkivet.',
        'Eva och Elsbeth reser till Munkfors. Foto: Nordiska museets arkiv.',
        'Lilo kommer till Sverige. Foto: Bohusläns museum (UMFA53464_0844).',
        'Walter får resa. Foto: Bundesarchiv (235-20).',
        'Walter arbetar. Foto: Sörmlands museum (SLM_M027554).',
        'Kiwa är sju år. Foto: Polens nationalbibliotek (69712784).',
        'Kriget börjar. Foto: Yad vashem (138GO2).',
        'Evas pappa flyr till Bryssel. Foto: Yad vashem (14146755).',
        'Hannas familj mördas. Foto: Bundesarchiv (R 165 Bild-244-46).',
        'Bofasta romer. Foto: Bundesarchiv (146-1987-115-51).',
        'Lilli kommer till Sverige. Foto: SMF/SHM (SMF_DIG60191)',
        'Samlingsregeringen. Foto: Nationalencyklopedin.'
    ],
    '1940': [
        'Soldaterna tar med sig Hanna. Foto: Bundesarchiv (R 165 Bild-244-42).',
        'Evas storebror kommer till Munkfors. Foto: Värmlands museum (609-15-782).',
        'Danmark kapitulerar. Foto: Bundesarchiv (101I-753-0001N-08).',
        'Kiwa i gettot. Foto: Bundesarchiv (101I-138-1083-23).',
        'Luxemburg kapitulerar Foto: Bundesarchiv (183-L11297).',
        'Evas pappa flyr till Frankrike. Foto: Yad vashem (14146755).',
        'Nederländerna kapitulerar Foto: Bundesarchiv (146-1969-125-75).',
        'Belgien kapitulerar. Foto: Kungl. Biblioteket (Aftonbladet 40-05-28).',
        'Frankrike kapitulerar. Foto: Bundesarchiv (183-L05325).',
        'Getton skapas. Foto: Yad vashem (27AO6).',
        'Kiwa smiter ut. Foto: Bundesarchiv (101I-134-0782-13) beskuren.',
        'Lilos pappa skriver. Foto: SMF/SHM (SMF089_00397).'
    ],
    '1941': [
        'Norge kapitulerar. Foto: Bundesarchiv (183-L03683).',
        'Anfall mot Sovjet. Foto: Bundesarchiv (101I-136-0882-13).',
        'Massakern i Prypjatträsken. (Ingen bild.)',
        'Massakern vid Kamjanets-Podilsky. (Ingen bild).',
        'E-Aktion avslutas. Foto: Bundesarchiv (152-04-12).',
        'Den gula stjärnan. Foto: Bundesarchiv (116-484-086).',
        'Massakern vid Babyn Jar. (Ingen bild.)',
        'Walter vädjar. Foto: SMF/SHM (SMF115_00029).',
        'Deportation av Tysklands judar. Foto: Bundesarchiv (137-056925).',
        'Massakern vid Rumbula. (Ingen bild.)',
        'Världskrig. Foto: Kungl. Biblioteket (Dagens Nyheter 41-12-08).',
        'Lilli förlorar sina pengar. Foto: SMF/SHM (SMF_DIG60191).'
    ],
    '1942': [
        'Wannseekonferensen. Foto: Bundesarchiv (152-50-10).',
        'Lilo blir statslös. Foto: Riksarkivet.',
        'Lilli blir statslös. Foto: SMF/SHM (SMF_DIG60191).',
        'Walter fyller år. Foto: SMF/SHM (SMF_DIG60190).',
        'Eva blir statslös. Foto: Riksarkivet.',
        'Walters svärföräldrar. Foto: Bundesarchiv (183-S69235).',
        'Lilo får jobb. Foto: Göteborgs konstförlag 1946.',
        'Kiwa kommer undan. Foto: Bundesarchiv (146-1977-058-01A).',
        'Walter går vidare. Foto: Bohusläns museum (UMFA53316_0007).',
        'Walters far är död. Foto: SMF/SHM (SMF115_00011).',
        'Slaget vid El Alamein. Foto: IWM, Chetwyn, No 1 Army Film & Photographic Unit.',
        'Lilos föräldrar. Foto: SMF/SHM © Bildupphovsrätt i Sverige (SMF_DIG63707).',
        'Deportation av romer. Foto: Bundesarchiv (R 165 Bild-244-47).',
        'Lilos farmor. Foto: Bundesarchiv (162 Bild-00422).',
        'Evas pappa är försvunnen. Foto: Bundesarchiv (101I-027-1477-21).',
        'Internationell protest. Foto: Bundesarchiv (B 162 Bild-07254).'
    ],
    '1943': [
        'Stalingrad. Foto: Bundesarchiv (116-168-618).',
        'Lilo byter jobb. Foto: Göteborgs stadsmuseum (GhmD:45560).',
        'Elsbeth söker. Foto: Järnvägsmuseet (JvmKCAC08673).',
        'Hannas syster. Foto: Bundesarchiv (183-74237-004).',
        'Invasionen av Sicilien. Foto: National Archives (SC180476_NA).',
        'Italien kapitulerar. Foto: Bundesarchiv (101I-311-0940-35).',
        'Kiwa förs i väg. Foto: Bundesarchiv (101I-027-1477-11).',
        'Kiwa i Auschwitz. Foto: Bundesarchiv (183-E0317-0007-001).',
        'De danska judarna räddas. Foto: Kungl. biblioteket (Dagens Nyheter 43-10-04).',
        'Kiwa gömmer sig. Foto: Bundesarchiv (146-2007-0077).'
    ],
    '1944': [
        'Deportation av Ungerns judar. Foto: Bundesarchiv (BA-183-N0827-318).',
        'Lilos farmor dör. Foto: Bundesarchiv (B 162 Bild-01199).',
        'Dagen D. Foto: Public Relations Division/SHAEF (D_Day_111-ADC-1319).',
        'Hanna ska dö. Foto: Bundesarchiv (183-B25445).',
        'Majdanek befrias. Foto: Deutsche Fotothek (df_pk_0000125_003).',
        'Attentat mot Hitler. Foto: Bundesarchiv (146-1970-097-76).',
        'Kiwa förflyttas. Foto: Bundesarchiv (146-1984-020-17).'
    ],
    '1945': [
        'Kiwa förflyttas igen. Foto: Yad vashem (3845_2).',
        'Auschwitz-Birkenau befrias. Foto: Bundesarchiv (285 Bild-04413).',
        '"Förstör bevisen." Foto: Bundesarchiv (BA-183-R69919).',
        'Kiwa förflyttas en sista gång. Foto: Landsberg am Lech stadsarkiv.',
        'Hanna Befrias. Foto Nordiska museet (NMA.0035382).',
        'Räddningsaktioner. Foto: Nordiska museet (NMA.0035384).',
        'Kiwas befrielse. Foto: Bundesarchiv (N 1578 Bild-0179).',
        'Tyskland kapitulerar. Foto: Bundesarchiv (183-R77793).',
        'Lilo blir husfru. Foto: Bohusläns museum (UMFA55582_1203)',
        'Kiwa återvänder. Foto: Polska nationalarkivet.',
        'Japan kapitulerar. Foto: Naval Historical Center, Lt. Stephen E. Korpanty.',
        'Förenta Nationerna. Foto: National Archives.',
        'Nürnbergrättegångarna. Foto: Bundesarchiv (183-V01032-3).'
    ],
    '1946': [
        'Kiwa hittar sin bror. Foto: Bundesarchiv (N 1578 Bild-0180).',
        'Pogromen i Kielce. Foto: Institute for National Remembrance.',
        'Gottfrieds sista hälsning. Foto: SMF/SHM (SMFMD009-00007).',
        'Hanna i Sverige. Foto: SMF/SHM (SSMF094475S).',
        'Walter och Lilli stannar. Foto: Riksarkivet.'
    ],
    '1947': [
        'Kiwas bror kommer till Sverige. Foto: Örebro läns museum (OLM_1938581D_1).'
    ]
};

// Populate image sources
function populateImageSources() {
    const container = document.getElementById('image-sources-columns');
    container.innerHTML = '';

    // Define column distribution: which years go in which column
    const columnYears = [
        ['1938', '1939', '1940'],      // Column 1
        ['1941', '1942', '1943'],      // Column 2
        ['1944', '1945', '1946', '1947'] // Column 3
    ];

    columnYears.forEach(yearsInColumn => {
        const column = document.createElement('div');

        yearsInColumn.forEach(year => {
            if (imageSources[year]) {
                // Create a wrapper for year and its sources to keep them together
                const yearSection = document.createElement('div');
                yearSection.className = 'image-source-year-section';

                const yearDiv = document.createElement('div');
                yearDiv.className = 'image-source-year';
                yearDiv.textContent = year;
                yearSection.appendChild(yearDiv);

                imageSources[year].forEach(source => {
                    const sourceDiv = document.createElement('div');
                    sourceDiv.textContent = source;
                    yearSection.appendChild(sourceDiv);
                });

                column.appendChild(yearSection);
            }
        });

        container.appendChild(column);
    });
}

// Helper function to remove all idle classes
function removeAllIdleClasses() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const exploreBtn = document.getElementById('explore-timeline-btn');
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    const scrollDownBtn = document.getElementById('scroll-down-btn');

    if (prevBtn) prevBtn.classList.remove('idle');
    if (nextBtn) nextBtn.classList.remove('idle');
    if (exploreBtn) exploreBtn.classList.remove('idle');
    if (scrollUpBtn) scrollUpBtn.classList.remove('idle');
    if (scrollDownBtn) scrollDownBtn.classList.remove('idle');
}

// Information overlay handlers
document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('info-overlay').classList.remove('hidden');
    showMainInfo();
    removeAllIdleClasses(); // Remove idle animations when overlay opens
});

document.getElementById('close-info-btn').addEventListener('click', () => {
    document.getElementById('info-overlay').classList.add('hidden');
});

document.getElementById('close-info-btn-main').addEventListener('click', () => {
    document.getElementById('info-overlay').classList.add('hidden');
});

// Close overlay when clicking outside the content
document.getElementById('info-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'info-overlay') {
        document.getElementById('info-overlay').classList.add('hidden');
    }
});

// Show/hide info sections
function showMainInfo() {
    document.getElementById('info-main-content').classList.remove('hidden');
    document.getElementById('info-image-sources').classList.add('hidden');
    document.getElementById('back-to-info-btn').classList.add('hidden');
}

function showImageSources() {
    document.getElementById('info-main-content').classList.add('hidden');
    document.getElementById('info-image-sources').classList.remove('hidden');
    document.getElementById('back-to-info-btn').classList.remove('hidden');

    // Remove all idle animations when switching to Bildkällor
    removeAllIdleClasses();

    populateImageSources();
    // Update scroll buttons after a short delay to ensure content is rendered
    setTimeout(updateScrollButtons, 100);
}

// Image sources link handler
document.getElementById('show-image-sources-link').addEventListener('click', (e) => {
    e.preventDefault();
    showImageSources();
});

// Back button handler
document.getElementById('back-to-info-btn').addEventListener('click', () => {
    showMainInfo();
});

// Scroll step buttons for image sources
const infoContent = document.getElementById('info-content');
const scrollUpBtn = document.getElementById('scroll-up-btn');
const scrollDownBtn = document.getElementById('scroll-down-btn');
const SCROLL_STEP = 300; // pixels to scroll

scrollUpBtn.addEventListener('click', () => {
    infoContent.scrollBy({
        top: -SCROLL_STEP,
        behavior: 'smooth'
    });
});

scrollDownBtn.addEventListener('click', () => {
    infoContent.scrollBy({
        top: SCROLL_STEP,
        behavior: 'smooth'
    });
});

// Update scroll button states based on scroll position
function updateScrollButtons() {
    const atTop = infoContent.scrollTop === 0;
    const atBottom = infoContent.scrollTop + infoContent.clientHeight >= infoContent.scrollHeight - 1;

    if (atTop) {
        scrollUpBtn.classList.add('disabled');
    } else {
        scrollUpBtn.classList.remove('disabled');
    }

    if (atBottom) {
        scrollDownBtn.classList.add('disabled');
    } else {
        scrollDownBtn.classList.remove('disabled');
    }
}

infoContent.addEventListener('scroll', updateScrollButtons);

// Explore timeline button handler
document.getElementById('explore-timeline-btn').addEventListener('click', () => {
    document.getElementById('info-overlay').classList.add('hidden');
});

// Image overlay handlers
document.getElementById('event-image-container').addEventListener('click', (e) => {
    const imageSrc = document.getElementById('event-image').src;
    const imageCaption = document.getElementById('event-image-caption').textContent;
    const imageOverlay = document.getElementById('image-overlay');
    const imageOverlayContent = document.getElementById('image-overlay-content');
    const clickedImage = document.getElementById('event-image');

    // Get the position and size of the clicked image
    const rect = clickedImage.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const imageCenterX = rect.left + rect.width / 2;
    const imageCenterY = rect.top + rect.height / 2;

    // Calculate offset from viewport center to image center
    const offsetX = imageCenterX - viewportCenterX;
    const offsetY = imageCenterY - viewportCenterY;

    // Calculate initial scale based on clicked image size vs overlay size
    // Estimate overlay will be roughly 80vw wide, so scale accordingly
    const estimatedOverlayWidth = window.innerWidth * 0.8;
    const initialScale = Math.min(rect.width / estimatedOverlayWidth, 0.3);

    document.getElementById('overlay-image').src = imageSrc;
    document.getElementById('overlay-image-caption').textContent = imageCaption;

    // Set initial position and scale using CSS custom properties
    imageOverlayContent.style.setProperty('--start-x', `${offsetX}px`);
    imageOverlayContent.style.setProperty('--start-y', `${offsetY}px`);
    imageOverlayContent.style.setProperty('--start-scale', initialScale);

    // Remove scale-in class first (in case it's still there from previous)
    imageOverlayContent.classList.remove('scale-in');

    // Hide close button initially
    const closeBtn = document.getElementById('close-image-btn');
    closeBtn.classList.remove('visible');

    // Remove hidden class and trigger reflow
    imageOverlay.classList.remove('hidden');
    void imageOverlayContent.offsetWidth; // Force reflow

    // Trigger scale animation after a brief delay
    setTimeout(() => {
        imageOverlayContent.classList.add('scale-in');

        // Fade in close button after scale animation completes (400ms)
        setTimeout(() => {
            closeBtn.classList.add('visible');
        }, 400);
    }, 10);
});

document.getElementById('close-image-btn').addEventListener('click', () => {
    const imageOverlay = document.getElementById('image-overlay');
    const imageOverlayContent = document.getElementById('image-overlay-content');
    const closeBtn = document.getElementById('close-image-btn');

    // Hide close button immediately
    closeBtn.classList.remove('visible');

    // Remove scale-in class to trigger reverse animation
    imageOverlayContent.classList.remove('scale-in');

    // Also fade out the background by removing the inline style
    imageOverlay.style.background = 'rgba(0, 0, 0, 0)';

    // Wait for animation to complete (400ms) before hiding
    setTimeout(() => {
        imageOverlay.classList.add('hidden');
        imageOverlay.style.background = ''; // Reset for next time
    }, 400);
});

// Close image overlay when clicking on the background
document.getElementById('image-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'image-overlay') {
        const imageOverlay = document.getElementById('image-overlay');
        const imageOverlayContent = document.getElementById('image-overlay-content');
        const closeBtn = document.getElementById('close-image-btn');

        // Hide close button immediately
        closeBtn.classList.remove('visible');

        // Remove scale-in class to trigger reverse animation
        imageOverlayContent.classList.remove('scale-in');

        // Also fade out the background
        imageOverlay.style.background = 'rgba(0, 0, 0, 0)';

        // Wait for animation to complete (400ms) before hiding
        setTimeout(() => {
            imageOverlay.classList.add('hidden');
            imageOverlay.style.background = ''; // Reset for next time
        }, 400);
    }
});
