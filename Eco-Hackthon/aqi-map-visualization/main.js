// Global state
let map = null;
let sourceMarker = null;
let destMarker = null;
let routeLine = null;
let sourceCoords = null;
let destCoords = null;
let sourceName = '';
let destName = '';
let currentRouteCoordinates = [];
let routeSteps = [];
let isRoutingInProgress = false;

// ==================== MAP INITIALIZATION ====================
function initMap() {
    console.log('🗺️ Initializing map...');
    
    // Create map instance with Nagpur-focused view
    map = L.map('map', {
        center: NAGPUR_CENTER,
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
        minZoom: 12,
        maxZoom: 18
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(map);

    // Force map to recalculate size
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Add AQI markers
    addAQIMarkers();

    // Attach event listeners
    attachEventListeners();

    console.log('✓ Map initialized successfully');
}

// ==================== ADD AQI MARKERS ====================
function addAQIMarkers() {
    console.log('📍 Adding AQI markers...');
    
    mockAQIData.forEach(point => {
        const color = getAQIColor(point.aqi);
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);

        marker.bindPopup(`
            <div style="font-size: 13px; font-weight: 600;">
                <strong>${point.name}</strong><br>
                AQI: <strong style="color: ${color}; font-size: 15px;">${point.aqi}</strong><br>
                ${point.category}<br>
                ● ${point.quality}
            </div>
        `, { maxWidth: 220 });
    });

    console.log(`✓ ${mockAQIData.length} markers added`);
}

// ==================== EVENT LISTENERS ====================
function attachEventListeners() {
    const sourceInput = document.getElementById('source-input');
    const destInput = document.getElementById('destination-input');
    const findBtn = document.getElementById('find-route-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Source input events
    sourceInput.addEventListener('blur', () => {
        handleSourceSearch();
    });
    sourceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSourceSearch();
        }
    });

    // Destination input events
    destInput.addEventListener('blur', () => {
        handleDestSearch();
    });
    destInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleDestSearch();
        }
    });

    // Button events
    findBtn.addEventListener('click', findRoute);
    clearBtn.addEventListener('click', clearAll);

    // Quick route buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const source = e.target.getAttribute('data-source');
            const dest = e.target.getAttribute('data-dest');
            setQuickRoute(source, dest);
        });
    });

    console.log('✓ Event listeners attached');
}

// ==================== LOCATION SEARCH ====================
async function handleSourceSearch() {
    const input = document.getElementById('source-input').value.trim();
    if (!input) return;

    console.log('🔍 Searching source:', input);
    showLoading('source');
    clearError('source');

    try {
        const result = await geocodeLocation(input);
        hideLoading('source');

        if (result) {
            const formatted = formatLocationResult(result);
            sourceCoords = [formatted.lat, formatted.lng];
            sourceName = formatted.name;
            
            placeSourceMarker(formatted.lat, formatted.lng, formatted.name);
            showSelected('source', formatted.name);
            showCoordinates('source', formatted.lat, formatted.lng);
            updateFindRouteButton();
            
            console.log('✓ Source found:', formatted.name);
        } else {
            showError('source', '❌ Not found in Nagpur');
            sourceCoords = null;
            sourceName = '';
            clearSelected('source');
            updateFindRouteButton();
        }
    } catch (error) {
        hideLoading('source');
        showError('source', '❌ Error searching location');
        console.error('Source search error:', error);
    }
}

async function handleDestSearch() {
    const input = document.getElementById('destination-input').value.trim();
    if (!input) return;

    console.log('🔍 Searching destination:', input);
    showLoading('destination');
    clearError('destination');

    try {
        const result = await geocodeLocation(input);
        hideLoading('destination');

        if (result) {
            const formatted = formatLocationResult(result);
            destCoords = [formatted.lat, formatted.lng];
            destName = formatted.name;
            
            placeDestMarker(formatted.lat, formatted.lng, formatted.name);
            showSelected('destination', formatted.name);
            showCoordinates('destination', formatted.lat, formatted.lng);
            updateFindRouteButton();
            
            console.log('✓ Destination found:', formatted.name);
        } else {
            showError('destination', '❌ Not found in Nagpur');
            destCoords = null;
            destName = '';
            clearSelected('destination');
            updateFindRouteButton();
        }
    } catch (error) {
        hideLoading('destination');
        showError('destination', '❌ Error searching location');
        console.error('Destination search error:', error);
    }
}

// ==================== MARKER PLACEMENT ====================
function placeSourceMarker(lat, lng, name) {
    if (sourceMarker) {
        map.removeLayer(sourceMarker);
    }

    sourceMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="%2327ae60"/><circle cx="16" cy="16" r="5" fill="white"/></svg>',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        })
    }).addTo(map);

    sourceMarker.bindPopup(`<strong>🟢 START: ${name}</strong>`);
    sourceMarker.openPopup();
}

function placeDestMarker(lat, lng, name) {
    if (destMarker) {
        map.removeLayer(destMarker);
    }

    destMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="%23e74c3c"/><circle cx="16" cy="16" r="5" fill="white"/></svg>',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        })
    }).addTo(map);

    destMarker.bindPopup(`<strong>🔴 END: ${name}</strong>`);
    destMarker.openPopup();
}

// ==================== ROUTE FINDING WITH REAL ROADS ====================
function updateFindRouteButton() {
    const btn = document.getElementById('find-route-btn');
    if (sourceCoords && destCoords) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

async function findRoute() {
    if (!sourceCoords || !destCoords) {
        console.warn('❌ Source or destination missing');
        return;
    }

    if (isRoutingInProgress) {
        console.warn('⏳ Routing already in progress...');
        return;
    }

    console.log('🛣️ Fetching real route from', sourceName, 'to', destName);
    
    isRoutingInProgress = true;
    document.getElementById('find-route-btn').disabled = true;
    showLoadingMessage('⏳ Calculating route...');

    try {
        // Use OSRM routing service
        const route = await fetchOSRMRoute(sourceCoords, destCoords);
        
        if (route && route.geometry) {
            drawRoute(route);
            analyzeRoute(route);
            isRoutingInProgress = false;
            document.getElementById('find-route-btn').disabled = false;
            console.log('✓ Route fetched and displayed');
        } else {
            throw new Error('No route geometry received');
        }
    } catch (error) {
        console.error('❌ Routing error:', error);
        showError('source', '❌ Unable to calculate route. Try other locations.');
        isRoutingInProgress = false;
        document.getElementById('find-route-btn').disabled = false;
    }
}

// ==================== OSRM ROUTING SERVICE ====================
async function fetchOSRMRoute(source, dest) {
    const url = `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${dest[1]},${dest[0]}?overview=full&steps=true&geometries=geojson`;
    
    console.log('📡 Requesting route from OSRM:', url);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`OSRM API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No routes found from OSRM');
        }

        const route = data.routes[0];
        console.log('✓ Route received from OSRM:', route);

        return {
            geometry: route.geometry.coordinates,
            distance: route.distance,
            duration: route.duration,
            legs: route.legs,
            steps: route.legs ? route.legs.flatMap(leg => leg.steps) : []
        };
    } catch (error) {
        console.error('OSRM fetch error:', error);
        throw error;
    }
}

// ==================== DRAW ROUTE ON MAP ====================
function drawRoute(route) {
    console.log('🎨 Drawing route on map...');
    
    // Remove old route
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    // Convert OSRM coordinates to Leaflet format [lat, lng]
    const coordinates = route.geometry.map(coord => [coord[1], coord[0]]);
    currentRouteCoordinates = coordinates;
    routeSteps = route.steps || [];

    // Draw polyline with smooth styling
    routeLine = L.polyline(coordinates, {
        color: '#667eea',
        weight: 7,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'route-line'
    }).addTo(map);

    // Add route line shadow for better visibility
    const shadowLine = L.polyline(coordinates, {
        color: '#000',
        weight: 9,
        opacity: 0.12,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    // Fit map bounds to route with padding
    const bounds = routeLine.getBounds();
    map.fitBounds(bounds, { padding: [120, 120], maxZoom: 15 });

    console.log('✓ Route drawn with', coordinates.length, 'waypoints');
}

// ==================== ANALYZE ROUTE FOR AQI ====================
function analyzeRoute(route) {
    console.log('📊 Analyzing route for AQI...');

    // Use route coordinates for AQI analysis
    const { avgAQI, nearestPoints } = calculateRouteAQI(currentRouteCoordinates);
    
    console.log('Route AQI Result:', { avgAQI, pointCount: nearestPoints.length });

    // Calculate distance and duration from OSRM response
    const distance = (route.distance / 1000).toFixed(2);
    const duration = Math.round(route.duration / 60);

    console.log(`Route: ${distance}km, ${duration}min, avg AQI: ${avgAQI.toFixed(1)}`);

    // Determine quality
    let qualityText = '';
    let qualityClass = '';
    let advice = '';

    if (avgAQI === 0) {
        // No AQI data on route
        qualityText = '📊 No AQI data on route';
        qualityClass = 'neutral';
        advice = '⚠️ AQI data not available for this route.';
    } else if (avgAQI <= 60) {
        qualityText = '🌟 EXCELLENT - Very Safe';
        qualityClass = 'excellent';
        advice = getHealthAdvice(avgAQI);
    } else if (avgAQI <= 100) {
        qualityText = '✓ GOOD - Safe Route';
        qualityClass = 'good';
        advice = getHealthAdvice(avgAQI);
    } else if (avgAQI <= 150) {
        qualityText = '⚠️ MODERATE - Wear Mask';
        qualityClass = 'moderate';
        advice = getHealthAdvice(avgAQI);
    } else {
        qualityText = '🚨 POOR - High Pollution';
        qualityClass = 'poor';
        advice = getHealthAdvice(avgAQI);
    }

    // Show route info
    let infoHTML = `<strong>🛣️ Route Analysis</strong><br>`;
    infoHTML += `<div class="route-quality ${qualityClass}">${qualityText}</div>`;
    infoHTML += `<div style="margin-top: 8px; font-size: 14px;">`;
    if (avgAQI > 0) {
        infoHTML += `AQI Score: <strong>${avgAQI.toFixed(0)}</strong><br>`;
    }
    infoHTML += `${advice}`;
    infoHTML += `</div>`;

    const routeInfo = document.getElementById('route-info');
    routeInfo.innerHTML = infoHTML;
    routeInfo.classList.add('active');

    // Show route details
    let detailsHTML = `<strong>📊 Journey Stats</strong><br>`;
    detailsHTML += `🚴 Distance: <strong>${distance} km</strong><br>`;
    detailsHTML += `⏱️ Duration: <strong>~${duration} mins</strong><br>`;
    detailsHTML += `📍 Waypoints: <strong>${currentRouteCoordinates.length}</strong><br><br>`;

    // Show turn-by-turn instructions
    if (routeSteps && routeSteps.length > 0) {
        detailsHTML += `<strong>🗺️ Turn-by-Turn</strong><br>`;
        routeSteps.slice(0, 5).forEach((step, idx) => {
            const instruction = parseOSRMInstruction(step);
            if (instruction) {
                detailsHTML += `<div class="route-step">${idx + 1}. ${instruction}</div>`;
            }
        });
        if (routeSteps.length > 5) {
            detailsHTML += `<div class="route-step">... and ${routeSteps.length - 5} more turns</div>`;
        }
    }

    // Show AQI points on route
    detailsHTML += `<br><strong>🏭 AQI Points on Route</strong><br>`;
    if (nearestPoints.length > 0) {
        detailsHTML += `<strong style="color: #667eea; font-size: 13px;">${nearestPoints.length} monitoring points detected</strong><br>`;
        nearestPoints.slice(0, 8).forEach((point, idx) => {
            const badge = point.aqi <= 50 ? 'good' : 
                         point.aqi <= 100 ? 'moderate' : 
                         point.aqi <= 150 ? 'warning' : 'danger';
            const distanceText = (point.distance * 1000).toFixed(0); // convert to meters
            detailsHTML += `<div class="route-waypoint">${idx + 1}. ${point.name}<span class="aqi-badge ${badge}">${point.aqi}</span> <span style="font-size: 11px; color: #999;">(${distanceText}m)</span></div>`;
        });
        if (nearestPoints.length > 8) {
            detailsHTML += `<div class="route-step"><em>... and ${nearestPoints.length - 8} more points</em></div>`;
        }
    } else {
        detailsHTML += `<em>⚠️ No AQI monitoring points within 2km of this route</em>`;
    }

    const routeDetails = document.getElementById('route-details');
    routeDetails.innerHTML = detailsHTML;
    routeDetails.classList.add('active');

    // Display coordinates
    displayRouteCoordinates();
}

// ==================== PARSE OSRM INSTRUCTIONS ====================
function parseOSRMInstruction(step) {
    try {
        const maneuver = step.maneuver;
        const distance = (step.distance / 1000).toFixed(2);
        const name = step.name || 'Unnamed road';

        let instruction = '';
        
        if (maneuver) {
            const type = maneuver.type;
            const modifier = maneuver.modifier || '';

            switch (type) {
                case 'turn':
                    instruction = modifier.includes('left') ? `↙️ Turn left` : `↗️ Turn right`;
                    break;
                case 'merge':
                    instruction = `→ Merge ${modifier}`;
                    break;
                case 'on_ramp':
                    instruction = `↗️ Take on ramp`;
                    break;
                case 'off_ramp':
                    instruction = `↘️ Take off ramp`;
                    break;
                case 'roundabout':
                    instruction = `⭕ Enter roundabout`;
                    break;
                case 'continue':
                    instruction = `→ Continue`;
                    break;
                case 'arrive':
                    instruction = `✓ Arrive at destination`;
                    break;
                default:
                    instruction = `→ ${type}`;
            }

            instruction += ` on ${name} (${distance} km)`;
        } else {
            instruction = `→ Continue on ${name} (${distance} km)`;
        }

        return instruction;
    } catch (e) {
        console.warn('Error parsing instruction:', e);
        return null;
    }
}

// ==================== DISPLAY COORDINATES ====================
function displayRouteCoordinates() {
    const tracker = document.getElementById('coord-tracker');
    const coordsList = document.getElementById('route-coords-list');
    
    let html = `<div class="coord-item"><span class="coord-step">START: ${sourceName}</span><span class="coord-value">${sourceCoords[0].toFixed(5)}, ${sourceCoords[1].toFixed(5)}</span></div>`;
    
    const step = Math.max(1, Math.floor(currentRouteCoordinates.length / 8));
    for (let i = step; i < currentRouteCoordinates.length; i += step) {
        const coord = currentRouteCoordinates[i];
        html += `<div class="coord-item"><span class="coord-step">Step ${Math.floor(i / step)}:</span><span class="coord-value">${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}</span></div>`;
    }
    
    html += `<div class="coord-item"><span class="coord-step">END: ${destName}</span><span class="coord-value">${destCoords[0].toFixed(5)}, ${destCoords[1].toFixed(5)}</span></div>`;
    
    coordsList.innerHTML = html;
    tracker.classList.add('active');
}

// ==================== CLEAR ALL ====================
function clearAll() {
    console.log('🔄 Clearing all...');
    
    if (sourceMarker) map.removeLayer(sourceMarker);
    if (destMarker) map.removeLayer(destMarker);
    if (routeLine) map.removeLayer(routeLine);

    sourceMarker = null;
    destMarker = null;
    routeLine = null;
    sourceCoords = null;
    destCoords = null;
    sourceName = '';
    destName = '';
    currentRouteCoordinates = [];
    routeSteps = [];
    isRoutingInProgress = false;

    document.getElementById('source-input').value = '';
    document.getElementById('destination-input').value = '';

    clearError('source');
    clearError('destination');
    clearSelected('source');
    clearSelected('destination');
    document.getElementById('source-coords').classList.remove('active');
    document.getElementById('destination-coords').classList.remove('active');
    document.getElementById('route-info').classList.remove('active');
    document.getElementById('route-details').classList.remove('active');
    document.getElementById('coord-tracker').classList.remove('active');

    map.setView(NAGPUR_CENTER, 14);
    updateFindRouteButton();
    
    console.log('✓ All cleared');
}

// ==================== QUICK ROUTES ====================
function setQuickRoute(source, destination) {
    console.log('⚡ Setting quick route:', source, '->', destination);
    document.getElementById('source-input').value = source;
    document.getElementById('destination-input').value = destination;
    
    handleSourceSearch();
    setTimeout(() => {
        handleDestSearch();
    }, 300);
}

// ==================== UTILITY FUNCTIONS ====================
function showCoordinates(type, lat, lng) {
    const elem = document.getElementById(`${type}-coords`);
    elem.textContent = `📌 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    elem.classList.add('active');
}

function showLoading(type) {
    const elem = document.getElementById(`${type}-loading`);
    if (elem) elem.classList.add('active');
}

function hideLoading(type) {
    const elem = document.getElementById(`${type}-loading`);
    if (elem) elem.classList.remove('active');
}

function showLoadingMessage(message) {
    const routeInfo = document.getElementById('route-info');
    routeInfo.innerHTML = `<strong>${message}</strong>`;
    routeInfo.classList.add('active');
}

function showError(type, message) {
    const elem = document.getElementById(`${type}-error`);
    if (elem) {
        elem.textContent = message;
        elem.classList.add('active');
    }
}

function clearError(type) {
    const elem = document.getElementById(`${type}-error`);
    if (elem) elem.classList.remove('active');
}

function showSelected(type, name) {
    const elem = document.getElementById(`${type}-selected`);
    if (elem) {
        elem.textContent = `✓ ${name}`;
        elem.classList.add('active');
    }
}

function clearSelected(type) {
    const elem = document.getElementById(`${type}-selected`);
    if (elem) elem.classList.remove('active');
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, starting map init...');
    initMap();
});
