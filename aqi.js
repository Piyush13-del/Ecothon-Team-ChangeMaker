// Mock AQI data for streets in India
const mockAQIData = [
    // Delhi area
    { name: "MG Road, Delhi", lat: 28.6139, lng: 77.2090, aqi: 185, category: "Unhealthy" },
    { name: "Rajpath, Delhi", lat: 28.6132, lng: 77.1994, aqi: 156, category: "Unhealthy for Sensitive Groups" },
    { name: "Connaught Place, Delhi", lat: 28.6329, lng: 77.1197, aqi: 142, category: "Unhealthy for Sensitive Groups" },
    { name: "Chandni Chowk, Delhi", lat: 28.6505, lng: 77.2303, aqi: 210, category: "Very Unhealthy" },
    { name: "Khan Market, Delhi", lat: 28.5675, lng: 77.2319, aqi: 95, category: "Moderate" },
    
    // Bangalore area
    { name: "MG Road, Bangalore", lat: 12.9352, lng: 77.6245, aqi: 78, category: "Moderate" },
    { name: "Brigade Road, Bangalore", lat: 12.9716, lng: 77.6412, aqi: 65, category: "Moderate" },
    { name: "Whitefield, Bangalore", lat: 12.9698, lng: 77.7499, aqi: 52, category: "Good" },
    
    // Mumbai area
    { name: "Marine Drive, Mumbai", lat: 18.9432, lng: 72.8236, aqi: 88, category: "Moderate" },
    { name: "Bandra-Worli Sea Link, Mumbai", lat: 19.0176, lng: 72.8298, aqi: 92, category: "Moderate" },
    
    // Kolkata area
    { name: "Park Street, Kolkata", lat: 22.5629, lng: 88.3663, aqi: 125, category: "Unhealthy for Sensitive Groups" },
];

// Get AQI color based on value
function getAQIColor(aqi) {
    if (aqi <= 50) return "#2ecc71"; // Green
    if (aqi <= 100) return "#f1c40f"; // Yellow
    if (aqi <= 150) return "#e67e22"; // Orange
    if (aqi <= 200) return "#e74c3c"; // Red
    if (aqi <= 300) return "#8b0000"; // Dark Red
    return "#4a0080"; // Purple
}

// Get AQI category
function getAQICategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

// Get health advice based on AQI
function getHealthAdvice(aqi) {
    if (aqi <= 50) return "Great! Safe for all cyclists.";
    if (aqi <= 100) return "Acceptable. Most cyclists can ride.";
    if (aqi <= 150) return "⚠️ Sensitive groups should limit cycling.";
    if (aqi <= 200) return "⚠️ Wear N95 mask. Limit activity.";
    if (aqi <= 300) return "🚨 Avoid cycling. Stay indoors.";
    return "🚨 HAZARDOUS. Do NOT cycle.";
}

// Calculate average AQI along a route
function calculateRouteAQI(waypoints) {
    let totalAQI = 0;
    let nearestPoints = [];

    waypoints.forEach(waypoint => {
        let nearest = null;
        let minDistance = Infinity;

        mockAQIData.forEach(point => {
            const distance = calculateDistance(
                waypoint.lat,
                waypoint.lng,
                point.lat,
                point.lng
            );

            if (distance < minDistance && distance < 2) {
                minDistance = distance;
                nearest = point;
            }
        });

        if (nearest) {
            nearestPoints.push(nearest);
            totalAQI += nearest.aqi;
        }
    });

    const avgAQI = nearestPoints.length > 0 ? totalAQI / nearestPoints.length : 0;
    return { avgAQI, nearestPoints };
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}