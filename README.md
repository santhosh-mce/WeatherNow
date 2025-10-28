# Weather Now

**Small, fast weather lookup for outdoor people**

**Persona:** Jamie — an outdoor enthusiast who wants to check current conditions quickly for any city.

---

## Project overview

**Weather Now** is a lightweight web application that shows current weather conditions for any city using the Open‑Meteo API. It focuses on speed, clarity, and mobile‑friendly presentation so users like Jamie can get the information they need before heading outdoors.

Key goals:

* Fast current weather lookup by city name
* Clear, scannable UI (temperature, conditions, wind, precipitation)
* Minimal dependencies and no API key required (uses Open‑Meteo)
* Optional geocoding using Open‑Meteo's geocoding endpoint

---

## Features

* Search by city name (autocomplete / suggestion optional)
* Display current temperature, feels‑like, weather code/description, wind speed & direction, precipitation (if available), humidity, and local time
* Quick icon + color styling for instant glanceability
* Option to view metric or imperial units
* Responsive layout for mobile and desktop

---

## Tech stack (suggested)

* Frontend: React (Vite or Create React App) + Tailwind CSS
* Fetching: native `fetch` (or `axios` optional)
* APIs: Open‑Meteo (weather & geocoding)
* Optional: React Query for caching, localStorage for last searched city

---

## Why Open‑Meteo?

* No API key required for basic usage
* Free, well documented, supports current weather and hourly/daily forecasts
* Built‑in geocoding endpoint to convert city name → lat/lon

Open‑Meteo docs: [https://open-meteo.com/](https://open-meteo.com/) (used only for developer reference)

---

## API endpoints (examples)

### 1) Geocoding (city → lat/lon)

```
GET https://geocoding-api.open-meteo.com/v1/search?name={CITY_NAME}&count=5&language=en&format=json
```

Response includes `results` with `latitude`, `longitude`, `timezone` and `name`.

### 2) Current weather

```
GET https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current_weather=true&timezone={TZ}
```

Important query params:

* `current_weather=true` to return current temperature, windspeed, winddirection and weathercode
* `timezone` to return times in the city's local timezone
* Add `temperature_unit=fahrenheit` or `windspeed_unit=mph` if you prefer imperial units

---

## Quick start (frontend)

1. Clone the repo

```bash
git clone https://github.com/santhosh-mce/WeatherNow.git
cd weathernow
```

2. Install dependencies

```bash
npm install
```

3. Start the dev server

```bash
npm run dev
```

4. Open `http://localhost:5173` (or the Vite URL shown in your terminal)

> No API key is required to call Open‑Meteo from the browser. If you prefer to proxy requests through a minimal backend, see Advanced → Backend proxy.

---

## Example fetch code (React JS)

```js
const fetchWeather = async (selectedCity = city) => {
    if (!selectedCity.trim()) return;
    try {
      setError("");
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
      setCity(""); // clear input
    } catch {
      setError("Failed to fetch weather data!");
    } finally {
      setLoading(false);
    }
  };

```

---

## UI suggestions

* Header with search input and units toggle (°C / °F)
* Card showing: city name, local time, temperature (large), description, small row with wind / humidity / precipitation
* Use weather icons mapped from Open‑Meteo `weathercode` (documented on open-meteo site)
* Use subtle color background changes based on temperature or condition (cold = blue, hot = orange)


---

## Advanced: Optional backend proxy

If you prefer not to call Open‑Meteo directly from the client (for logging, caching, or rate control), include a minimal Express server with two endpoints:

* `/api/geocode?name=...` → proxies to Open‑Meteo geocoding
* `/api/current?lat=...&lon=...&tz=...` → proxies to Open‑Meteo forecast

This proxy can also allow server-side caching of frequent queries.

---

## Testing

* Unit test components that format and display weather values
* Mock fetch requests (msw or jest fetch mock) for geocoding and current weather responses

---

## Deployment

* Static hosting: Vercel, Netlify, StackBlitz, GitHub Pages (build app and deploy)
* If you add an Express proxy, deploy server on a small Node host (Heroku, Railway, Fly)

---

## Troubleshooting

* If the city search returns no results, try increasing `count` in the geocoding call or check spelling
* If `current_weather` is missing, verify lat/lon values and ensure you included `current_weather=true`

---

## Mapping of Open‑Meteo weathercodes

Refer to Open‑Meteo docs for the definitive mapping (clear, partly cloudy, fog, drizzle, rain, snow, thunderstorm, etc.) — use these to select icons and friendly strings.

---

## License

MIT © Jamie (Weather Now)

---

## Next steps / wishlist

* 48‑hour hourly forecast sparkline
* Prebuilt favorite locations list
* Offline caching and push notifications for severe weather

---

If you want, I can also generate a ready‑to‑paste React component (search + display) that uses the example fetch functions above. Just say which stack you prefer (Vite + React, Create React App, or plain HTML/JS).
