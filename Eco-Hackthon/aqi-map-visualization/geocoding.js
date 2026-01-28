// filepath: d:\Eco-Hackthon\aqi-map-visualization\src\scripts\geocoding.js

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

const INDIA_BOUNDS = {
    north: 35.5,
    south: 8.0,
    east: 97.5,
    west: 68.0
};

// Check if coordinates are within India
function isWithinIndia(lat, lng) {
    return lat >= INDIA_BOUNDS.south && 
           lat <= INDIA_BOUNDS.north && 
           lng >= INDIA_BOUNDS.west && 
           lng <= INDIA_BOUNDS.east;
}

// Geocode a location using Nominatim API
async function geocodeLocation(query) {
    if (!query || query.trim().length < 2) return null;

    try {
        const searchQuery = query.includes('India') ? query : `${query}, India`;
        
        const response = await fetch(
            `${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`,
            { timeout: 5000 }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const results = await response.json();
        
        if (!results || results.length === 0) return null;

        // Filter results to ensure they're within India
        const validResults = results.filter(result => {
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            return isWithinIndia(lat, lng);
        });

        return validResults.length > 0 ? validResults[0] : null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Format location result for display
function formatLocationResult(result) {
    const name = result.name || result.display_name.split(',')[0];
    const region = result.address?.state || result.address?.county || '';
    
    return {
        name: name,
        region: region,
        fullName: `${name}${region ? ', ' + region : ''}, India`,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
    };
}