// The two cities (latitude/longitude)
const CITIES = [
  { name: "Hawler (Erbil)", ku: "هەولێر", lat: 36.1912, lon: 44.0094 },
  { name: "Sulaymaniyah", ku: "سلێمانی", lat: 35.5613, lon: 45.4373 },
];

// Weather codes from Open-Meteo -> icon + text
const CODES = {
  0: ["☀️", "Clear sky"], 1: ["🌤️", "Mainly clear"], 2: ["⛅", "Partly cloudy"], 3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"], 48: ["🌫️", "Fog"],
  51: ["🌦️", "Light drizzle"], 53: ["🌦️", "Drizzle"], 55: ["🌧️", "Heavy drizzle"],
  61: ["🌦️", "Light rain"], 63: ["🌧️", "Rain"], 65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"], 67: ["🌧️", "Freezing rain"],
  71: ["🌨️", "Light snow"], 73: ["🌨️", "Snow"], 75: ["❄️", "Heavy snow"], 77: ["❄️", "Snow grains"],
  80: ["🌦️", "Rain showers"], 81: ["🌧️", "Rain showers"], 82: ["⛈️", "Violent showers"],
  85: ["🌨️", "Snow showers"], 86: ["❄️", "Snow showers"],
  95: ["⛈️", "Thunderstorm"], 96: ["⛈️", "Thunderstorm + hail"], 99: ["⛈️", "Thunderstorm + hail"],
};
const codeInfo = (c, isDay = 1) => {
  const [icon, text] = CODES[c] || ["🌡️", "Unknown"];
  return [c === 0 && !isDay ? "🌙" : icon, text];
};

// Build the API link for one city
function apiUrl(city) {
  return "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=Asia%2FBaghdad&forecast_days=7";
}

// Make the HTML card for one city
function cityCard(city, data) {
  const c = data.current;
  const [icon, text] = codeInfo(c.weather_code, c.is_day);

  const days = data.daily.time.map((date, i) => {
    const label = i === 0 ? "Today" : new Date(date).toLocaleDateString("en", { weekday: "short" });
    const [dIcon] = codeInfo(data.daily.weather_code[i]);
    return `<div class="day">
      ${label}
      <div class="d-icon">${dIcon}</div>
      ${Math.round(data.daily.temperature_2m_max[i])}°
      <div class="lo">${Math.round(data.daily.temperature_2m_min[i])}°</div>
    </div>`;
  }).join("");

  return `<section class="card">
    <div class="city-name">${city.name}</div>
    <div class="city-ku">${city.ku}</div>
    <div class="now">
      <div class="icon">${icon}</div>
      <div>
        <div class="temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="desc">${text}</div>
      </div>
    </div>
    <div class="details">
      <div>Feels like<b>${Math.round(c.apparent_temperature)}°</b></div>
      <div>Humidity<b>${c.relative_humidity_2m}%</b></div>
      <div>Wind<b>${Math.round(c.wind_speed_10m)} km/h</b></div>
    </div>
    <div class="forecast">${days}</div>
  </section>`;
}

// Get the data for both cities and show it
async function loadWeather() {
  const box = document.getElementById("cities");
  const updated = document.getElementById("updated");
  updated.textContent = "Loading…";

  try {
    const results = await Promise.all(
      CITIES.map(city => fetch(apiUrl(city)).then(r => {
        if (!r.ok) throw new Error("API error " + r.status);
        return r.json();
      }))
    );
    box.innerHTML = results.map((data, i) => cityCard(CITIES[i], data)).join("");
    updated.textContent = "Updated " + new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    box.innerHTML = `<div class="error">Could not load weather. Check your internet and press Refresh.</div>`;
    updated.textContent = "";
    console.error(err);
  }
}

document.getElementById("refresh").addEventListener("click", loadWeather);
loadWeather();
setInterval(loadWeather, 10 * 60 * 1000); // auto-refresh every 10 minutes
