let map;
let sourceMarker;
let destMarker;
let routePolyline;
let sourceCoords = null;
let destCoords = null;
let sourceName = '';
let destName = '';

const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;
const INDIA_BOUNDS = [
    [8.0, 68.0],    // Southwest
    [35.5, 97.5]    // Northeast
];

// Initialize map
function initMap() {
    console.log('Initializing map...');
    
    // Create map instance
    map = L.map('map', {
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        maxBounds: INDIA_BOUNDS,
        maxBoundsViscosity: 1.0
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 4
    }).addTo(map);

    // Add AQI markers
    addAQIMarkers();

    // Attach event listeners
    attachEventListeners();

    console.log('Map initialized successfully');
}

// Add AQI markers from mock data
function addAQIMarkers() {
    mockAQIData.forEach(point => {
        const color = getAQIColor(point.aqi);
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 7,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);

        marker.bindPopup(`
            <div>
                <strong>${point.name}</strong><br>
                AQI: ${point.aqi}<br>
                Category: ${point.category}
            </div>
        `);
    });
}

// Attach event listeners to buttons and inputs
function attachEventListeners() {
    const sourceInput = document.getElementById('source-input');
    const destInput = document.getElementById('destination-input');
    const findRouteBtn = document.getElementById('find-route-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Source input on Enter
    sourceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSourceSearch();
        }
    });

    sourceInput.addEventListener('blur', handleSourceSearch);

    // Destination input on Enter
    destInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDestSearch();
        }
    });

    destInput.addEventListener('blur', handleDestSearch);

    // Find route button
    findRouteBtn.addEventListener('click', findRoute);

    // Clear button
    clearBtn.addEventListener('click', clearAll);
}

// Handle source search
async function handleSourceSearch() {
    const input = document.getElementById('source-input').value.trim();
    if (!input) return;

    showLoading('source');
    clearError('source');

    const result = await geocodeLocation(input);
    hideLoading('source');

    if (result) {
        const formatted = formatLocationResult(result);
        sourceCoords = [formatted.lat, formatted.lng];
        sourceName = formatted.name;
        
        placeSourceMarker(formatted.lat, formatted.lng, formatted.name);
        showSelected('source', formatted.name);
        updateFindRouteButton();
    } else {
        showError('source', 'Location not found in India. Please try another place.');
        sourceCoords = null;
        sourceName = '';
        clearSelected('source');
        updateFindRouteButton();
    }
}

// Handle destination search
async function handleDestSearch() {
    const input = document.getElementById('destination-input').value.trim();
    if (!input) return;

    showLoading('destination');
    clearError('destination');

    const result = await geocodeLocation(input);
    hideLoading('destination');

    if (result) {
        const formatted = formatLocationResult(result);
        destCoords = [formatted.lat, formatted.lng];
        destName = formatted.name;
        
        placeDestMarker(formatted.lat, formatted.lng, formatted.name);
        showSelected('destination', formatted.name);
        updateFindRouteButton();
    } else {
        showError('destination', 'Location not found in India. Please try another place.');
        destCoords = null;
        destName = '';
        clearSelected('destination');
        updateFindRouteButton();
    }
}

// Place source marker
function placeSourceMarker(lat, lng, name) {
    if (sourceMarker) {
        map.removeLayer(sourceMarker);
    }

    sourceMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="%2327ae60"/><circle cx="16" cy="16" r="8" fill="white" opacity="0.3"/></svg>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    }).addTo(map);

    sourceMarker.bindPopup(`<strong>Source: ${name}</strong>`).openPopup();
}

// Place destination marker
function placeDestMarker(lat, lng, name) {
    if (destMarker) {
        map.removeLayer(destMarker);
    }

    destMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="%23e74c3c"/><circle cx="16" cy="16" r="8" fill="white" opacity="0.3"/></svg>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    }).addTo(map);

    destMarker.bindPopup(`<strong>Destination: ${name}</strong>`).openPopup();
}

// Update find route button state
function updateFindRouteButton() {
    const btn = document.getElementById('find-route-btn');
    if (sourceCoords && destCoords) {
        btn.disabled = false;
        btn.textContent = 'Find AQI-Aware Route';
    } else {
        btn.disabled = true;
        btn.textContent = 'Select source and destination';
    }
}

// Find and draw route
function findRoute() {
    if (!sourceCoords || !destCoords) {
        showError('source', 'Please set both source and destination');
        return;
    }

    console.log('Finding route from', sourceCoords, 'to', destCoords);

    // Remove previous route
    if (routePolyline) {
        map.removeLayer(routePolyline);
    }

    // Draw simple polyline
    routePolyline = L.polyline([
        [sourceCoords[0], sourceCoords[1]],
        [destCoords[0], destCoords[1]]
    ], {
        color: '#3498db',
        weight: 5,
        opacity: 0.8,
        dashArray: '5, 5'
    }).addTo(map);

    // Fit map to bounds
    const group = new L.featureGroup([sourceMarker, destMarker, routePolyline]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    // Calculate and show AQI info
    const waypoints = generateWaypointsAlongRoute(sourceCoords, destCoords);
    const { avgAQI, nearestPoints } = calculateRouteAQI(waypoints);

    let infoHTML = `<strong>Route AQI Summary</strong><br>`;
    infoHTML += `Average AQI: <strong>${avgAQI.toFixed(1)}</strong><br>`;
    infoHTML += `Category: <strong>${getAQICategory(avgAQI)}</strong><br>`;
    infoHTML += `💡 ${getHealthAdvice(avgAQI)}<br><br>`;
    
    if (nearestPoints.length > 0) {
        infoHTML += `<strong>Nearby Points:</strong><br>`;
        nearestPoints.forEach(point => {
            infoHTML += `• ${point.name}: AQI ${point.aqi}<br>`;
        });
    } else {
        infoHTML += `<em>No AQI monitoring points nearby</em>`;
    }

    const routeInfo = document.getElementById('route-info');
    routeInfo.innerHTML = infoHTML;
    routeInfo.classList.add('active');
}

// Clear all
function clearAll() {
    console.log('Clearing all...');

    // Clear markers
    if (sourceMarker) map.removeLayer(sourceMarker);
    if (destMarker) map.removeLayer(destMarker);
    if (routePolyline) map.removeLayer(routePolyline);

    // Clear inputs
    document.getElementById('source-input').value = '';
    document.getElementById('destination-input').value = '';

    // Clear state
    sourceCoords = null;
    destCoords = null;
    sourceName = '';
    destName = '';

    // Clear UI
    clearError('source');
    clearError('destination');
    clearSelected('source');
    clearSelected('destination');
    document.getElementById('route-info').classList.remove('active');

    // Reset map
    map.setView(INDIA_CENTER, INDIA_ZOOM);
    updateFindRouteButton();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    initMap();
});