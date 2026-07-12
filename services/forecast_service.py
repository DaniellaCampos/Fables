import json
import os
from datetime import date, timedelta
from urllib.parse import quote

import httpx

HOLIDAYS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "festividades_sv.json")
WEEKDAY_LABELS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
SUNNY_KEYWORDS = ["sunny", "clear", "partly cloudy"]
WEATHER_ES = {
    "sunny": "soleado",
    "clear": "despejado",
    "partly cloudy": "parcialmente nublado",
    "cloudy": "nublado",
    "overcast": "nublado",
    "mist": "con neblina",
    "fog": "con niebla",
    "patchy rain possible": "con probabilidad de lluvia",
    "patchy rain nearby": "con probabilidad de lluvia cerca",
    "light rain": "con lluvia ligera",
    "light rain shower": "con lluvia ligera",
    "moderate rain": "con lluvia moderada",
    "moderate or heavy rain shower": "con lluvia moderada a fuerte",
    "heavy rain": "con lluvia fuerte",
    "thundery outbreaks possible": "con posibles tormentas",
    "thundery outbreaks in nearby": "con tormentas cerca"
}


def _load_holidays() -> dict:
    """Devuelve un dict {"YYYY-MM-DD": nombre} para lookup O(1)."""
    try:
        with open(HOLIDAYS_PATH, "r", encoding="utf-8") as f:
            entries = json.load(f)
        return {entry["date"]: entry["name"] for entry in entries}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


async def geocode_location(location: str) -> tuple[float | None, float | None]:
    """Geocodifica un nombre de ubicación a latitud/longitud usando Open-Meteo search API."""
    url = "https://geocoding-api.open-meteo.com/v1/search"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"name": location, "count": 1, "format": "json"}, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            if results:
                return float(results[0]["latitude"]), float(results[0]["longitude"])
    except Exception as e:
        print(f"Error al geocodificar la ubicación '{location}': {e}")
    return None, None


def parse_wmo_code(code: int) -> tuple[str, bool, bool]:
    """
    Traduce el código del clima WMO de Open-Meteo a descripción en español y banderas
    para indicar si es despejado/soleado o lluvioso/tormentoso.
    Retorna (descripcion, es_despejado, es_lluvioso).
    """
    # 0, 1, 2 = Despejado / Mayormente despejado / Parcialmente nublado
    if code in (0, 1):
        return "despejado", True, False
    elif code == 2:
        return "parcialmente nublado", True, False
    elif code == 3:
        return "nublado", False, False
    elif code in (45, 48):
        return "con niebla", False, False
    # Drizzle / Rain / Showers / Thunderstorms
    elif code in (51, 53, 55, 56, 57):
        return "con llovizna", False, True
    elif code in (61, 63, 65, 66, 67):
        return "con lluvia", False, True
    elif code in (80, 81, 82):
        return "con lluvias y chubascos", False, True
    elif code in (95, 96, 99):
        return "con tormenta eléctrica", False, True
    else:
        return "nublado", False, False


async def _fetch_weather_open_meteo(lat: float, lon: float) -> dict:
    """
    Consulta Open-Meteo Forecast API para obtener el pronóstico de 16 días.
    Retorna un dict estructurado por fecha YYYY-MM-DD.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "weather_code,precipitation_sum,precipitation_probability_max,temperature_2m_max",
        "timezone": "auto",
        "forecast_days": 16
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()

    daily = data.get("daily", {})
    times = daily.get("time", [])
    weather_codes = daily.get("weather_code", [])
    precip_probs = daily.get("precipitation_probability_max", [])
    temp_maxes = daily.get("temperature_2m_max", [])

    weather_by_date = {}
    for i in range(len(times)):
        day_date = times[i]
        code = weather_codes[i] if i < len(weather_codes) else 0
        precip_prob = precip_probs[i] if i < len(precip_probs) else 0.0
        temp_max = temp_maxes[i] if i < len(temp_maxes) else None

        desc, is_sunny, is_rain_code = parse_wmo_code(code)
        # Considerar lluvioso si el código es de lluvia o la probabilidad supera el 60%
        is_rainy = is_rain_code or (precip_prob is not None and precip_prob > 60)

        weather_by_date[day_date] = {
            "is_sunny": is_sunny,
            "is_rainy": is_rainy,
            "condition_desc": desc,
            "temp_max": temp_max,
            "precip_prob": precip_prob
        }

    return weather_by_date


async def _fetch_weather_wttr_in(location: str) -> dict:
    """
    Consulta wttr.in (usado como fallback secundario si Open-Meteo falla).
    """
    url = f"https://wttr.in/{quote(location)}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"format": "j1"}, timeout=10.0)
            response.raise_for_status()
            data = response.json()
    except Exception:
        return {}

    weather_by_date = {}
    for day in data.get("weather", []):
        day_date = day.get("date")
        hourly = day.get("hourly", [])
        if not day_date or not hourly:
            continue
        midday = next((h for h in hourly if h.get("time") == "1200"), hourly[len(hourly) // 2])
        desc = midday.get("weatherDesc", [{}])[0].get("value", "").strip()

        is_sunny = any(k in desc.lower() for k in SUNNY_KEYWORDS)
        is_rainy = any(k in desc.lower() for k in ["rain", "shower", "thunderstorm", "drizzle"])
        precip_prob = float(midday.get("chanceofrain", 0)) if midday.get("chanceofrain") else None

        weather_by_date[day_date] = {
            "is_sunny": is_sunny,
            "is_rainy": is_rainy or (precip_prob is not None and precip_prob > 60),
            "condition_desc": WEATHER_ES.get(desc.lower(), desc.lower()),
            "temp_max": float(day.get("maxtempC", 0)) if day.get("maxtempC") else None,
            "precip_prob": precip_prob
        }

    return weather_by_date


def _score_day(day: date, weather_info: dict | None, holiday_name: str | None, nicho_negocio: str | None = None) -> dict:
    weekday_num = day.weekday()  # Lunes=0 ... Domingo=6
    weekday_label = WEEKDAY_LABELS_ES[weekday_num]
    is_friday_or_saturday = weekday_num in (4, 5)
    is_weekend = weekday_num in (5, 6)
    is_holiday = holiday_name is not None

    is_sunny = weather_info.get("is_sunny", False) if weather_info else False
    is_rainy = weather_info.get("is_rainy", False) if weather_info else False
    weather_condition = weather_info.get("condition_desc") if weather_info else None

    score = 0
    fragments = []

    # 1. Evento o Feriado (Gran peso)
    if is_holiday:
        score += 3
        fragments.append(holiday_name)

    # 2. Clima (Bonos por Sol, Penalizaciones por Lluvia según Nicho)
    if weather_info:
        if is_sunny:
            score += 2
            fragments.append(f"Clima {weather_condition}")
        elif is_rainy:
            # Penalización por lluvia adaptada al nicho
            if nicho_negocio in ("Paseos en lancha", "Tour guiado"):
                score -= 3
                fragments.append(f"Lluvia ({weather_condition}) - Riesgo para Actividad Exterior")
            elif nicho_negocio == "Hospedaje":
                score -= 1
                fragments.append(f"Lluvia ({weather_condition}) - Limitación Exterior")
            elif nicho_negocio in ("Restaurante", "Artesanías"):
                # Actividades de interior no se penalizan, se promueve plan interior
                fragments.append(f"Lluvia ({weather_condition}) - Plan Interior Sugerido")
            else:
                score -= 1
                fragments.append(f"Lluvia ({weather_condition})")

    # 3. Fin de semana recurrente (Soporte turismo)
    if is_friday_or_saturday:
        score += 1
        fragments.append(f"Fin de semana ({weekday_label})")

    # Limitar el score para que no sea menor que cero
    score = max(0, score)

    if not fragments:
        fragments.append("Día regular")

    reason = " + ".join(fragments)

    # Determinar horario recomendado según el tipo de oportunidad
    if is_holiday:
        suggested_time_slot = "Todo el día"
    elif is_sunny:
        suggested_time_slot = "10:00 AM – 4:00 PM"
    elif is_friday_or_saturday:
        suggested_time_slot = "Tarde (3:00 PM – 7:00 PM)"
    else:
        suggested_time_slot = "Mañana (9:00 AM – 12:00 PM)"

    # Explicación adaptada
    explanation_parts = []
    if is_holiday:
        explanation_parts.append(f"coincide con {holiday_name}")
    if weather_condition:
        if is_rainy:
            if nicho_negocio in ("Paseos en lancha", "Tour guiado"):
                explanation_parts.append(f"se espera clima {weather_condition}, desaconsejando paseos por seguridad")
            elif nicho_negocio in ("Restaurante", "Artesanías"):
                explanation_parts.append(f"se espera clima {weather_condition}, ideal para atraer clientes con planes de interior")
            else:
                explanation_parts.append(f"habrá clima {weather_condition}")
        else:
            explanation_parts.append(f"se espera clima {weather_condition}")
    if is_friday_or_saturday:
        explanation_parts.append("es fin de semana, ideal para captar flujo turístico")

    if not explanation_parts:
        explanation_parts.append("es un buen momento para mantener presencia constante en redes")
    explanation = f"Este {weekday_label.lower()} " + " y ".join(explanation_parts) + "."

    return {
        "date": day.isoformat(),
        "weekday": weekday_label,
        "score": score,
        "reason": reason,
        "explanation": explanation,
        "suggestedTimeSlot": suggested_time_slot,
        "signals": {
            "is_weekend": is_weekend,
            "is_friday_or_saturday": is_friday_or_saturday,
            "is_holiday": is_holiday,
            "holiday_name": holiday_name,
            "weather_condition": weather_condition,
            "has_weather_data": weather_info is not None,
            "is_rainy": is_rainy
        },
        "source": "rules_v1"
    }


async def get_forecast(
    location: str,
    days_ahead: int = 90,
    nicho_negocio: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None
) -> list[dict]:
    """
    Evolución a pronóstico extendido:
    - Usa Open-Meteo como primera fuente (16 días de clima).
    - Cae hacia wttr.in en caso de falla (3 días de clima).
    - Degrada hacia events-only si ambas fallan.
    - Aplica penalizaciones según el tipo de servicio del negocio ante lluvias.
    """
    holidays = _load_holidays()
    
    # 1. Resolver coordenadas
    lat, lon = latitude, longitude
    if (lat is None or lon is None) and location:
        lat, lon = await geocode_location(location)

    # 2. Intentar clima con Open-Meteo (16 días)
    weather_by_date = {}
    if lat is not None and lon is not None:
        try:
            weather_by_date = await _fetch_weather_open_meteo(lat, lon)
        except Exception as e:
            print(f"Falla de Open-Meteo, intentando fallback wttr.in: {e}")

    # 3. Fallback: wttr.in (3 días)
    if not weather_by_date and location:
        try:
            weather_by_date = await _fetch_weather_wttr_in(location)
        except Exception as e:
            print(f"Falla de wttr.in fallback: {e}")

    # 4. Generación y scoring del radar
    today = date.today()
    opportunities = []
    for offset in range(days_ahead):
        day = today + timedelta(days=offset)
        day_key = day.isoformat()
        opportunities.append(
            _score_day(
                day=day,
                weather_info=weather_by_date.get(day_key),
                holiday_name=holidays.get(day_key),
                nicho_negocio=nicho_negocio
            )
        )

    # Ordenar por score descendente
    opportunities.sort(key=lambda o: o["score"], reverse=True)
    return opportunities
