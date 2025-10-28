import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiDayFog,
  WiSnow,
  WiThunderstorm,
  WiNightClear,
  WiShowers,
} from "react-icons/wi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function WeatherNow() {
  const [city, setCity] = useState("Chennai");
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState({ lat: 13.0827, lon: 80.2707 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getWeatherIcon = (code) => {
    if (code === 0) return <WiDaySunny className="text-8xl text-yellow-400" />;
    if ([1, 2, 3].includes(code))
      return <WiCloudy className="text-8xl text-gray-500" />;
    if ([45, 48].includes(code))
      return <WiDayFog className="text-8xl text-gray-400" />;
    if ([51, 53, 55, 56, 57].includes(code))
      return <WiShowers className="text-8xl text-blue-400" />;
    if ([61, 63, 65, 66, 67].includes(code))
      return <WiRain className="text-8xl text-blue-500" />;
    if ([71, 73, 75, 77].includes(code))
      return <WiSnow className="text-8xl text-blue-300" />;
    if ([80, 81, 82].includes(code))
      return <WiShowers className="text-8xl text-blue-600" />;
    if ([95, 96, 99].includes(code))
      return <WiThunderstorm className="text-8xl text-yellow-600" />;
    return <WiNightClear className="text-8xl text-indigo-400" />;
  };

  const formatDateTime = (isoString) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  };

  const fetchWeather = async (selectedCity = city) => {
    try {
      setError("");
      setWeather(null);
      setLoading(true);

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${selectedCity}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found!");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      setCoords({ lat: latitude, lon: longitude });

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData.current_weather, name, country });
      setCity("");
    } catch {
      setError("Failed to fetch weather data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Chennai");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-200 to-blue-400 p-6">
      <h1 className="text-4xl font-bold mb-8 text-white drop-shadow-lg">
        🌦️ Weather Now
      </h1>

      {/* Input and Button */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="border p-3 rounded-lg w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => fetchWeather(city)}
          disabled={!city || loading}
          className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="text-red-700 bg-red-100 px-4 py-2 rounded-lg shadow">
          {error}
        </p>
      )}

     

      {/* Weather & Map Section */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8 w-full max-w-6xl justify-center items-stretch">
        {/* Weather Card */}
        
          <div className="flex-1 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center flex flex-col justify-center">
          {weather && !loading ? (
            <>
            <h2 className="text-4xl font-semibold text-gray-800">
              {weather.name}, {weather.country}
            </h2>
            <div className="flex flex-col items-center mt-4">
              {getWeatherIcon(weather.weathercode)}
              <p className="text-5xl font-bold mt-3 text-blue-700">
                {weather.temperature}°C
              </p>
              <p className="text-gray-600 mt-1 text-2xl">
                💨 {weather.windspeed} km/h | 🧭 {weather.winddirection}°
              </p>

              <div className="mt-3 text-gray-500 text-xl">
                {(() => {
                  const { date, time } = formatDateTime(weather.time);
                  return (
                    <>
                      <p>{date}</p>
                      <p>{time}</p>
                    </>
                  );
                })()}
              </div>
            </div>
            </>
         
        ) : (
          <div className="flex items-center justify-center mt-6">
            <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
         </div>

        {/* Map Section */}
        {coords && (
          <div className="flex-1 h-[400px] rounded-2xl overflow-hidden shadow-lg">
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {weather && (
                <Marker position={[coords.lat, coords.lon]}>
                  <Popup>
                    <strong>{weather.name}</strong> <br />
                    🌡️ {weather.temperature}°C <br />
                    💨 {weather.windspeed} km/h
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherNow;
