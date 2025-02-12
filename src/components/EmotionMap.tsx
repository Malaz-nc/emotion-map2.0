import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import FileUpload from './FileUpload';
import Legend from './Legend';
import VoxCroftLogo from './VoxCroftLogo';
import type { ProcessedLocation } from '../utils/dataProcessing';

const emotionColors = {
  Anger: '#ff0000',
  Sadness: '#0000ff',
  Joy: '#ffff00',
  Fear: '#800080',
  Anticipation: '#ffa500',
  default: '#808080'
};

// Basemap configuration
const basemapLayers = {
  OpenStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  Terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenTopoMap contributors'
  },
  Dark: {
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CartoDB'
  }
};

// Stats Panel Component
const StatsPanel = ({ locations }: { locations: ProcessedLocation[] }) => {
  const stats = {
    totalArticles: locations.length,
    countriesCount: new Set(locations.map(l => l.country)).size,
    emotionBreakdown: locations.reduce((acc, loc) => {
      acc[loc.emotion] = (acc[loc.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageConfidence: locations.length ? 
      locations.reduce((sum, loc) => sum + parseFloat(loc.emotionPercentage || '0'), 0) / locations.length : 0
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 1000,
      backgroundColor: 'black',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '250px'
    }}>
      <h3 style={{ marginBottom: '10px', borderBottom: '2px solid #444' }}>Statistics</h3>
      <p style={{ marginBottom: '5px' }}><strong>Total Articles:</strong> {stats.totalArticles}</p>
      <p style={{ marginBottom: '5px' }}><strong>Countries:</strong> {stats.countriesCount}</p>
      <p style={{ marginBottom: '5px' }}><strong>Avg Confidence:</strong> {stats.averageConfidence.toFixed(1)}%</p>
      <div style={{ marginTop: '5px' }}>
        <h4 style={{ marginBottom: '5px' }}>Emotion Breakdown:</h4>
        {Object.entries(stats.emotionBreakdown).map(([emotion, count]) => (
          <p key={emotion} style={{ 
            fontSize: '0.9em',
            marginBottom: '3px',
            color: emotionColors[emotion as keyof typeof emotionColors]
          }}>
            {emotion}: {count} articles
          </p>
        ))}
      </div>
    </div>
  );
};

const EmotionMap = () => {
  const [locations, setLocations] = useState<ProcessedLocation[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  // New state for basemap selection
  const [selectedBasemap, setSelectedBasemap] = useState<keyof typeof basemapLayers>('Dark');

  const uniqueCountries = [...new Set(locations.map(loc => loc.country))].sort();

  const getCircleStyle = (emotion: string, intensity: string, percentage: string = '100') => {
    const baseRadius = showHeatMap 
      ? parseInt(percentage) / 10 + 5
      : intensity === 'High' ? 12 : intensity === 'Medium' ? 8 : 6;
    
    return {
      radius: baseRadius,
      fillColor: emotionColors[emotion as keyof typeof emotionColors] || emotionColors.default,
      color: '#000',
      weight: 1,
      opacity: showHeatMap ? parseFloat(percentage) / 100 : 1,
      fillOpacity: showHeatMap ? parseFloat(percentage) / 100 : 0.7
    };
  };

  const filteredLocations = locations.filter(location => 
    (selectedEmotion === null || location.emotion === selectedEmotion) &&
    (selectedCountry === null || location.country === selectedCountry) &&
    (searchTerm === '' || 
      location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.country.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!dateRange.start || location.date >= new Date(dateRange.start)) &&
    (!dateRange.end || location.date <= new Date(dateRange.end))
  );

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <VoxCroftLogo />
      
      <FileUpload onDataProcessed={setLocations} />
      <Legend />
      <StatsPanel locations={filteredLocations} />
      
      {/* Basemap Selector - Centered at top */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ 
          fontSize: '0.9em', 
          color: '#333',
          marginRight: '5px'
        }}>
          Map Style:
        </span>
        <select 
          value={selectedBasemap}
          onChange={(e) => setSelectedBasemap(e.target.value as keyof typeof basemapLayers)}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          {Object.keys(basemapLayers).map((layer) => (
            <option key={layer} value={layer}>{layer}</option>
          ))}
        </select>
      </div>

      {/* Emotion Filters - At top center */}
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setSelectedEmotion(null)}
          style={{
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid #ccc',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        {Object.keys(emotionColors).map(emotion => (
          emotion !== 'default' && (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: `1px solid ${emotionColors[emotion as keyof typeof emotionColors]}`,
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {emotion}
            </button>
          )
        ))}
      </div>

      {/* Controls Panel - At bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '250px'
      }}>
        {/* Country Filter */}
        <select 
          onChange={(e) => setSelectedCountry(e.target.value || null)}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          <option value="">All Countries</option>
          {uniqueCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
          }}
        />

        {/* Date Range */}
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
          }}
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black'
          }}
        />

        {/* Heat Map Toggle */}
        <button
          onClick={() => setShowHeatMap(!showHeatMap)}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          {showHeatMap ? 'Hide Heat Map' : 'Show Heat Map'}
        </button>
      </div>

      <MapContainer
        center={[0, 20]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dynamic TileLayer based on selected basemap */}
        <TileLayer
          key={selectedBasemap} // Key helps force re-render
          url={basemapLayers[selectedBasemap].url}
          attribution={basemapLayers[selectedBasemap].attribution}
        />
        {filteredLocations.map((location, index) => (
          <CircleMarker
            key={index}
            center={[location.lat, location.lng]}
            {...getCircleStyle(location.emotion, location.intensity, location.emotionPercentage)}
          >
            <Popup>
              <div style={{ 
                padding: '10px',
                maxWidth: '300px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                <h3 style={{ 
                  borderBottom: '2px solid #eee', 
                  paddingBottom: '5px', 
                  marginBottom: '10px',
                  color: emotionColors[location.emotion as keyof typeof emotionColors]
                }}>
                  {location.emotion} - {location.intensity} Intensity
                </h3>
                
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ 
                    fontSize: '0.9em', 
                    color: '#666',
                    marginBottom: '5px' 
                  }}>
                    <strong>Country:</strong> {location.country}
                  </p>
                  <p style={{ 
                    fontSize: '0.9em', 
                    color: '#666',
                    marginBottom: '5px' 
                  }}>
                    <strong>Emotion Confidence:</strong> {location.emotionPercentage}%
                  </p>
                  <p style={{ 
                    fontSize: '0.9em', 
                    color: '#666',
                    marginBottom: '5px' 
                  }}>
                    <strong>Published:</strong> {location.date.toLocaleDateString()}
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ marginBottom: '5px' }}>Article Content</h4>
                  <p style={{ lineHeight: '1.4' }}>{location.description}</p>
                </div>

                <div style={{
                  borderTop: '1px solid #eee',
                  paddingTop: '10px',
                  fontSize: '0.9em'
                }}>
                  <p><strong>Location:</strong> {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EmotionMap;