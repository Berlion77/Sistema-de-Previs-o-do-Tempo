// components/weather-card.js — Componente de card de clima
const WeatherCard = (() => {

  const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };

  function getIcon(code) {
    return weatherIcons[code] || '🌡️';
  }

  function formatTime(unix) {
    return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(unix) {
    return new Date(unix * 1000).toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
  }

  function renderCurrent(data, t, isFav) {
    const icon     = getIcon(data.weather[0].icon);
    const temp     = Math.round(data.main.temp);
    const feels    = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const wind     = data.wind.speed;
    const pressure = data.main.pressure;
    const vis      = data.visibility ? (data.visibility / 1000).toFixed(1) : '--';
    const sunrise  = formatTime(data.sys.sunrise);
    const sunset   = formatTime(data.sys.sunset);
    const desc     = data.weather[0].description;

    const favBtn = isFav
      ? `<button class="btn-fav active" onclick="App.removeFav()" title="${t.removeFavorite}">♥</button>`
      : `<button class="btn-fav" onclick="App.addFav()" title="${t.addFavorite}">♡</button>`;

    return `
      <div class="weather-card current-card" id="current-card">
        <div class="card-header">
          <div>
            <h2 class="city-name">${data.name} <span class="country">${data.sys.country}</span></h2>
            <p class="weather-desc">${desc}</p>
          </div>
          <div class="card-actions">
            ${favBtn}
            <button class="btn-alert" onclick="App.showAlertModal()" title="${t.addAlert}">🔔</button>
          </div>
        </div>
        <div class="temp-display">
          <span class="weather-icon-big">${icon}</span>
          <span class="temp-big">${temp}°C</span>
        </div>
        <div class="weather-stats">
          <div class="stat"><span class="stat-label">${t.feelsLike}</span><span class="stat-val">${feels}°C</span></div>
          <div class="stat"><span class="stat-label">${t.humidity}</span><span class="stat-val">${humidity}%</span></div>
          <div class="stat"><span class="stat-label">${t.wind}</span><span class="stat-val">${wind} ${t.ms}</span></div>
          <div class="stat"><span class="stat-label">${t.pressure}</span><span class="stat-val">${pressure} ${t.hPa}</span></div>
          <div class="stat"><span class="stat-label">${t.visibility}</span><span class="stat-val">${vis} ${t.km}</span></div>
          <div class="stat"><span class="stat-label">${t.sunrise}</span><span class="stat-val">${sunrise}</span></div>
          <div class="stat"><span class="stat-label">${t.sunset}</span><span class="stat-val">${sunset}</span></div>
        </div>
      </div>`;
  }

  function renderForecast(data, t) {
    // Agrupar por dia (pegar o item do meio do dia)
    const days = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) days[date] = item;
    });

    const dayCards = Object.entries(days).slice(0, 5).map(([date, item]) => {
      const icon  = getIcon(item.weather[0].icon);
      const high  = Math.round(item.main.temp_max);
      const low   = Math.round(item.main.temp_min);
      const label = formatDate(item.dt);
      return `
        <div class="forecast-day">
          <span class="forecast-label">${label}</span>
          <span class="forecast-icon">${icon}</span>
          <span class="forecast-temp">${high}° <span class="low">${low}°</span></span>
          <span class="forecast-desc">${item.weather[0].description}</span>
        </div>`;
    }).join('');

    return `
      <div class="weather-card forecast-card">
        <h3 class="forecast-title">${t.fiveDayForecast}</h3>
        <div class="forecast-grid">${dayCards}</div>
      </div>`;
  }

  return { renderCurrent, renderForecast, getIcon };
})();
