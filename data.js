// NAGPUR AQI DATA - Real locations with monitoring points
const mockAQIData = [
    // High AQI (Avoid)
    { name: "Sadar Bazar", lat: 21.1458, lng: 79.0882, aqi: 210, category: "Very Unhealthy", quality: "Avoid" },
    { name: "Sitabuldi Fort Area", lat: 21.1614, lng: 79.1060, aqi: 185, category: "Unhealthy", quality: "Avoid" },
    { name: "Gandhibagh", lat: 21.1512, lng: 79.0960, aqi: 175, category: "Unhealthy", quality: "Avoid" },
    { name: "Dharampeth", lat: 21.1642, lng: 79.1022, aqi: 165, category: "Unhealthy", quality: "Avoid" },
    
    // Moderate AQI (Acceptable)
    { name: "Itwari", lat: 21.1472, lng: 79.0755, aqi: 112, category: "Unhealthy for Sensitive", quality: "With Precautions" },
    { name: "Ramdaspeth", lat: 21.1555, lng: 79.0892, aqi: 98, category: "Moderate", quality: "Safe" },
    { name: "Lakhanpal", lat: 21.1380, lng: 79.1150, aqi: 85, category: "Moderate", quality: "Safe" },
    { name: "Manish Nagar", lat: 21.1250, lng: 79.1200, aqi: 78, category: "Moderate", quality: "Safe" },
    
    // Good AQI (Recommended)
    { name: "Jaripatka", lat: 21.1200, lng: 79.0600, aqi: 65, category: "Moderate", quality: "Good" },
    { name: "Ambazari", lat: 21.0900, lng: 79.0850, aqi: 52, category: "Good", quality: "Excellent" },
    { name: "Futala Lake Area", lat: 21.0850, lng: 79.1050, aqi: 45, category: "Good", quality: "Excellent" },
    { name: "Ravi Nagar", lat: 21.1100, lng: 79.0400, aqi: 58, category: "Moderate", quality: "Good" },
    
    // Additional points
    { name: "Seminary Hills", lat: 21.1350, lng: 79.1300, aqi: 88, category: "Moderate", quality: "Safe" },
    { name: "Tuli Chakki", lat: 21.0800, lng: 79.0700, aqi: 42, category: "Good", quality: "Excellent" },
    { name: "Koradi", lat: 21.0600, lng: 79.1100, aqi: 68, category: "Moderate", quality: "Safe" },
];

const NAGPUR_CENTER = [21.1458, 79.0882];
const NAGPUR_ZOOM = 13;

function getAQIColor(aqi) {
    if (aqi <= 50) return "#2ecc71";
    if (aqi <= 100) return "#f1c40f";
    if (aqi <= 150) return "#e67e22";
    if (aqi <= 200) return "#e74c3c";
    if (aqi <= 300) return "#8b0000";
    return "#4a0080";
}

function getAQICategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

function getHealthAdvice(aqi) {
    if (aqi <= 50) return "✓ Excellent! Safe for all cyclists.";
    if (aqi <= 100) return "✓ Good! Most cyclists can ride safely.";
    if (aqi <= 150) return "⚠️ Wear mask. Sensitive groups should limit cycling.";
    if (aqi <= 200) return "⚠️ Wear N95 mask. Limit activity.";
    if (aqi <= 300) return "🚨 Avoid cycling. High pollution.";
    return "🚨 HAZARDOUS. Do NOT cycle.";
}

// Haversine distance formula (in kilometers)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// FIXED: Calculate AQI along the entire route
function calculateRouteAQI(coordinates) {
    console.log('🔬 Calculating AQI for route with', coordinates.length, 'waypoints');
    
    if (!coordinates || coordinates.length === 0) {
        console.warn('❌ No coordinates provided for AQI calculation');
        return { avgAQI: 0, nearestPoints: [] };
    }

    let nearestPoints = [];
    let aqiSum = 0;
    let pointCount = 0;

    // For each AQI monitoring point, find if it's close to the route
    mockAQIData.forEach(point => {
        let minDistance = Infinity;
        let closestOnRoute = null;

        // Find the closest point on the route to this AQI monitoring point
        coordinates.forEach(routeCoord => {
            const distance = calculateDistance(
                routeCoord[0], // lat
                routeCoord[1], // lng
                point.lat,
                point.lng
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestOnRoute = { lat: routeCoord[0], lng: routeCoord[1], distance };
            }
        });

        // If AQI point is within 2 km of the route, include it
        if (minDistance < 2) {
            nearestPoints.push({
                name: point.name,
                aqi: point.aqi,
                category: point.category,
                quality: point.quality,
                distance: minDistance
            });
            aqiSum += point.aqi;
            pointCount++;
            console.log(`✓ ${point.name}: ${point.aqi} AQI (${minDistance.toFixed(3)} km from route)`);
        }
    });

    // Calculate average AQI
    const avgAQI = pointCount > 0 ? aqiSum / pointCount : 0;

    console.log(`📊 Route AQI Analysis: ${pointCount} points found, Average AQI: ${avgAQI.toFixed(1)}`);

    // Sort by distance (closest first)
    nearestPoints.sort((a, b) => a.distance - b.distance);

    return { avgAQI, nearestPoints };
}

function isWithinNagpur(lat, lng) {
    return lat >= 21.0 && lat <= 21.25 && lng >= 78.95 && lng <= 79.25;
}

async function geocodeLocation(query) {
    if (!query || query.trim().length < 2) return null;

    try {
        const searchQuery = `${query}, Nagpur, India`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
            { headers: { 'Accept-Language': 'en' } }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const results = await response.json();
        
        if (!results || results.length === 0) return null;

        const validResults = results.filter(result => {
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            return isWithinNagpur(lat, lng);
        });

        return validResults.length > 0 ? validResults[0] : null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

function formatLocationResult(result) {
    const name = result.name || result.display_name.split(',')[0];
    return {
        name: name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
    };
}