export default function (weatherData) {
  const { temperature, humidity, precipitation, wind } = weatherData;

  // Check temperature
  if (temperature < 0 || temperature > 40) {
    return false; // Fırlatma sıcaklık aralığının dışında
  }

  // Check humidity
  if (humidity > 0.8) {
    return false; // Yüksek nem seviyesi
  }

  // Check precipitation
  if (
    precipitation.rain ||
    precipitation.snow ||
    precipitation.sleet ||
    precipitation.hail
  ) {
    return false; // Yağış var
  }

  // Check wind speed
  if (wind.speed > 20) {
    return false; // Yüksek rüzgar hızı
  }

  return true; // Tüm kriterler sağlanıyorsa fırlatılabilir
}
