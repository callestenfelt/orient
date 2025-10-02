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
let mapMarkers = [];
let animatedEvents = new Set(); // Track which events have been animated

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

// Random coordinates within Europe bounds
function getRandomEuropeCoordinates() {
    const minLng = -10;
    const maxLng = 40;
    const minLat = 35;
    const maxLat = 70;

    const lng = minLng + Math.random() * (maxLng - minLng);
    const lat = minLat + Math.random() * (maxLat - minLat);

    return [lng, lat];
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
                    coordinates: getRandomEuropeCoordinates()
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

// Update event markers on map based on current year with animation
function updateEventMarkers() {
    // Clear existing markers
    mapMarkers.forEach(marker => marker.remove());
    mapMarkers = [];

    // Get events for current year and sort by date
    const yearEvents = events
        .filter(e => e.year === currentYear)
        .sort((a, b) => a.parsedDate - b.parsedDate);

    // Determine which time period we're in (based on timeline position)
    const yearProgress = currentEventIndex % EVENTS_PER_YEAR;
    
    // Filter events based on timeline position
    // 0 = Jan-Mar, 1 = Apr-Jun, 2 = Jul-Sep, 3 = Oct-Dec, 4 = All year
    const filteredEvents = yearEvents.filter(event => {
        const month = event.parsedDate.getMonth(); // 0-11
        
        if (yearProgress === 0) return month >= 0 && month <= 2;   // Jan-Mar
        if (yearProgress === 1) return month >= 0 && month <= 5;   // Jan-Jun
        if (yearProgress === 2) return month >= 0 && month <= 8;   // Jan-Sep
        if (yearProgress === 3) return month >= 0 && month <= 11;  // Jan-Dec
        if (yearProgress === 4) return true;                       // All year
        
        return true;
    });

    console.log(`Showing ${filteredEvents.length} events for year ${currentYear}, period ${yearProgress}`);

    // If no events, reset to default Europe view
    if (filteredEvents.length === 0) {
        map.flyTo({
            center: [15, 52],
            zoom: 4,
            duration: 800,
            padding: {top: 5, bottom: 5, left: 5, right: 5},
            essential: true
        });
        return;
    }

    // Create markers for each event with staggered animation
    filteredEvents.forEach((event, index) => {
        const el = document.createElement('div');
        el.className = 'map-event-marker';
        
        // Create unique ID for this event
        const eventId = `${event.year}-${event.date}-${event.title}`;
        
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

        const marker = new mapboxgl.Marker(el)
            .setLngLat(event.coordinates)
            .addTo(map);

        mapMarkers.push(marker);

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
    });

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
        
        // Here you would implement language switching logic
        console.log('Language changed to:', lang);
    });
});
