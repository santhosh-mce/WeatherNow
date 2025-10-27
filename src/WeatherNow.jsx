import React, { useState } from "react";

function WeatherNow() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 👈 new state

  const fetchWeather = async () => {
    try {
      setError("");
      setWeather(null);
      setLoading(true); // 👈 show loading

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found!");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData.current_weather, name, country });
    } catch {
      setError("Failed to fetch weather data!");
    } finally {
      setLoading(false); // 👈 hide loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">🌦️ Weather Now</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="border p-2 rounded w-64"
        />
        <button
          onClick={fetchWeather}
          disabled={!city || loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center mt-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Weather Card */}
      {weather && !loading && (
        <div className="bg-white p-6 rounded shadow-md w-80 text-center mt-4">
          <h2 className="text-2xl font-semibold">
            {weather.name}, {weather.country}
          </h2>
          <p className="text-lg mt-2">🌡️ {weather.temperature}°C</p>
          <p>💨 {weather.windspeed} km/h</p>
          <p>🧭 Direction: {weather.winddirection}°</p>
          <p className="text-gray-500 mt-2 text-sm">{weather.time}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherNow;
