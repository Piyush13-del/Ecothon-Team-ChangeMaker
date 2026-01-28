# AQI Map Visualization

This project visualizes street-level Air Quality Index (AQI) data on an interactive map using Leaflet.js. The application displays AQI values for various street locations, allowing users to understand air quality in their area.

## Project Structure

```
aqi-map-visualization
├── src
│   ├── index.html          # Main HTML file for the application
│   ├── styles
│   │   └── style.css      # CSS styles for the application
│   ├── scripts
│   │   ├── map.js         # JavaScript for map initialization and interaction
│   │   ├── aqi.js         # JavaScript for handling AQI data
│   │   └── utils.js       # Utility functions for data processing
│   └── data
│       └── sample-aqi.json # Sample AQI data in JSON format
├── README.md              # Project documentation
└── .gitignore             # Files and directories to ignore in version control
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd aqi-map-visualization
   ```

2. **Open the project**:
   Open `src/index.html` in your preferred web browser.

3. **Dependencies**:
   This project uses Leaflet.js for map functionality. Ensure you have an internet connection to load the Leaflet.js CDN.

## Functionality

- The application displays a full-page map centered on a specific city area.
- Markers are placed on the map representing different street locations with their corresponding AQI values.
- Clicking on a marker shows a popup with the street name, AQI value, and category.
- The AQI values are color-coded according to established AQI categories for easy visualization.

## Running the Project

Simply open `src/index.html` in a web browser to view the map and interact with the AQI data. No additional setup is required. 

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or new features!