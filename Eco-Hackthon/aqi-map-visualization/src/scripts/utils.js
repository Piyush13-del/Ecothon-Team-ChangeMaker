// Utility functions for the AQI route finder

// Format AQI value with category
function formatAQI(aqi) {
    return {
        value: aqi,
        category: getAQICategory(aqi),
        color: getAQIColor(aqi),
        healthMessage: getHealthAdvice(aqi)
    };
}

// Get cycling health advice based on AQI
function getHealthAdvice(aqi) {
    if (aqi <= 50) return "Great air quality! Safe for all cyclists.";
    if (aqi <= 100) return "Acceptable. Most cyclists can ride safely.";
    if (aqi <= 150) return "⚠️ Sensitive groups should limit cycling.";
    if (aqi <= 200) return "⚠️ Wear N95 mask. Limit outdoor activity.";
    if (aqi <= 300) return "🚨 Avoid cycling. Stay indoors if possible.";
    return "🚨 HAZARDOUS. Do NOT cycle outdoors.";
}

// Log route information
function logRouteInfo(source, destination, avgAQI) {
    console.log(`
        Route Information:
        From: ${source}
        To: ${destination}
        Average AQI: ${avgAQI}
        Recommendation: ${getHealthAdvice(avgAQI)}
    `);
}