import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import axios from 'axios';
import Icons from './icons';
import { database } from './firebase';
import { ref, set, push, onValue } from 'firebase/database';

function App() {
  const [originCoords, setOriginCoords] = useState([17.4065, 78.4772]);
  const [destinationCoords, setDestinationCoords] = useState([17.3850, 78.4867]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [lang, setLang] = useState('en-IN');
  const [userLocation, setUserLocation] = useState([17.4065, 78.4772]);
  const [hazards, setHazards] = useState([]);
  const [hazardType, setHazardType] = useState('Accident');
  const [ecoMode, setEcoMode] = useState(false);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  const speakDirection = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang;
    window.speechSynthesis.speak(msg);
  };

  const reportHazard = () => {
    const newHazardRef = push(ref(database, 'hazards'));
    const hazard = {
      id: newHazardRef.key,
      type: hazardType,
      location: [
        userLocation[0] + (Math.random() - 0.5) * 0.01,
        userLocation[1] + (Math.random() - 0.5) * 0.01,
      ],
      timestamp: Date.now(),
    };
    set(newHazardRef, hazard);
    speakDirection(`${hazardType} reported ahead`);
  };

  const fetchRoute = async (origin, destination) => {
    const body = {
      coordinates: [
        [origin[1], origin[0]],       // [lng, lat]
        [destination[1], destination[0]]
      ],
    };

    try {
      const response = await axios.post('http://localhost:4000/api/route', body);
      const coords = response.data.features[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]    // convert to [lat, lng] for Leaflet
      );
      setRouteCoords(coords);
    } catch (error) {
      console.error('❌ Error fetching route:', error.response?.data || error.message);
    }
  };

  const geocode = async (placeName) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: placeName,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        alert(`Location not found: ${placeName}`);
        return null;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const updateRouteFromInputs = async () => {
    const origin = await geocode(originInput);
    const destination = await geocode(destinationInput);

    if (origin && destination) {
      setOriginCoords(origin);
      setDestinationCoords(destination);
      setUserLocation(origin);
      speakDirection('Route updated based on input');
      fetchRoute(origin, destination);
    }
  };

  useEffect(() => {
    fetchRoute(originCoords, destinationCoords);
  }, []);

  useEffect(() => {
    const hazardRef = ref(database, 'hazards');
    onValue(hazardRef, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.values(data) : [];
      setHazards(loaded);
    });
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <h2 style={{ margin: '10px' }}>Smart Routing App</h2>

      <div style={{ margin: '10px' }}>
        <input
          type="text"
          placeholder="Enter origin (e.g., Hyderabad)"
          value={originInput}
          onChange={(e) => setOriginInput(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Enter destination (e.g., Secunderabad)"
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        />
        <button
          onClick={updateRouteFromInputs}
          style={{
            padding: '8px 12px',
            background: 'purple',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Set Route
        </button>
      </div>

      <button
        onClick={() => speakDirection('Navigation has started')}
        style={{
          margin: '10px',
          padding: '8px 12px',
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Speak in English
      </button>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        style={{ margin: '10px', padding: '8px' }}
      >
        <option value="en-IN">English</option>
        <option value="hi-IN">Hindi</option>
        <option value="te-IN">Telugu</option>
        <option value="ta-IN">Tamil</option>
        <option value="kn-IN">Kannada</option>
        <option value="ml-IN">Malayalam</option>
      </select>

      <button
        onClick={() => setEcoMode((prev) => !prev)}
        style={{
          margin: '10px',
          padding: '8px 12px',
          background: ecoMode ? 'green' : 'gray',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Eco Mode: {ecoMode ? 'On' : 'Off'}
      </button>

      <select
        value={hazardType}
        onChange={(e) => setHazardType(e.target.value)}
        style={{ margin: '10px', padding: '8px' }}
      >
        <option>Accident</option>
        <option>Roadblock</option>
        <option>Pothole</option>
        <option>Flood</option>
      </select>

      <button
        onClick={reportHazard}
        style={{
          margin: '10px',
          padding: '8px 12px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Report Hazard
      </button>

      <div style={{ height: '80vh', width: '100%' }}>
        <MapContainer center={originCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={originCoords}><Popup>Origin</Popup></Marker>
          <Marker position={destinationCoords}><Popup>Destination</Popup></Marker>
          <Marker position={userLocation}><Popup>You are here</Popup></Marker>
          <Polyline positions={routeCoords} color={ecoMode ? 'green' : 'blue'} />
          {hazards.map((hazard) => (
            <Marker
              key={hazard.id}
              position={hazard.location}
              icon={Icons[hazard.type] || Icons['Accident']}
            >
              <Popup>{hazard.type}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
