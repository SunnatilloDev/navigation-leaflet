import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

function Routing({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
}

function MapComponent({ start, end }) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '90vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {start && end && <Routing start={start} end={end} />}
    </MapContainer>
  );
}

export default function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  const geocodeLocation = async (location) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${location}`,
    );
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startCoords = await geocodeLocation(startInput);
    const endCoords = await geocodeLocation(endInput);

    if (startCoords && endCoords) {
      setStart(startCoords);
      setEnd(endCoords);
    } else {
      alert('Could not find one or both locations. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          placeholder="From location"
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          value={endInput}
          onChange={(e) => setEndInput(e.target.value)}
          placeholder="To location"
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Show Route</button>
      </form>

      <MapComponent start={start} end={end} />
    </div>
  );
}
