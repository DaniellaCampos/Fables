import json
import os
from datetime import date, timedelta
from urllib.parse import quote

import httpx

HOLIDAYS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "holidays_2026.json")
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


async def _fetch_weather_by_date(location: str) -> dict:
    """
    Consulta wttr.in y devuelve un dict {"YYYY-MM-DD": "Sunny"} con la condición
    del mediodía por cada día que wttr.in provea (normalmente hoy + 2 días).
    Si la consulta falla, devuelve {} y el scoring sigue funcionando solo con
    feriados/día de la semana (degradación controlada, nunca revienta el endpoint).
    """
    url = f"https://wttr.in/{quote(location)}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"format": "j1"}, timeout=10.0)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"Error al conectar con wttr.in: {e}")
        return {}

    conditions_by_date = {}
    for day in data.get("weather", []):
        day_date = day.get("date")
        hourly = day.get("hourly", [])
        if not day_date or not hourly:
            continue
        midday = next((h for h in hourly if h.get("time") == "1200"), hourly[len(hourly) // 2])
        desc = midday.get("weatherDesc", [{}])[0].get("value", "").strip()
        conditions_by_date[day_date] = desc

    return conditions_by_date


def _score_day(day: date, weather_condition: str | None, holiday_name: str | None) -> dict:
    weekday_num = day.weekday()  # Lunes=0 ... Domingo=6
    weekday_label = WEEKDAY_LABELS_ES[weekday_num]
    is_friday_or_saturday = weekday_num in (4, 5)
    is_weekend = weekday_num in (5, 6)
    is_holiday = holiday_name is not None
    is_sunny = bool(weather_condition) and any(k in weather_condition.lower() for k in SUNNY_KEYWORDS)

    score = 0
    fragments = []

    if is_weekend and is_sunny:
        score += 2
        fragments.append("sol")

    if is_holiday:
        score += 3
        fragments.append(holiday_name)

    if is_friday_or_saturday:
        score += 1
        if not fragments:
            fragments.append(f"{weekday_label.lower()} de fin de semana")

    if not fragments:
        fragments.append("día regular, sin señales especiales")

    reason = " + ".join(fragments)

    if is_holiday:
        suggested_time_slot = "Todo el día"
    elif is_weekend and is_sunny:
        suggested_time_slot = "10:00 AM – 4:00 PM"
    elif is_friday_or_saturday:
        suggested_time_slot = "Tarde (3:00 PM – 7:00 PM)"
    else:
        suggested_time_slot = "Mañana (9:00 AM – 12:00 PM)"

    explanation_parts = []
    if weather_condition:
        weather_es = WEATHER_ES.get(weather_condition.lower(), weather_condition.lower())
        explanation_parts.append(f"el clima estará {weather_es}")
    if is_holiday:
        explanation_parts.append(f"coincide con {holiday_name}, una fecha con alta afluencia históricamente")
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
            "has_weather_data": weather_condition is not None
        },
        "source": "rules_v1"
    }


async def get_forecast(location: str, days_ahead: int = 7) -> list[dict]:
    """
    Genera un ranking de oportunidades para los próximos `days_ahead` días,
    combinando clima real (wttr.in) + feriados/festividades de El Salvador +
    reglas simples de scoring.

    Forma de cada item pensada para que un modelo predictivo real (v2) pueda
    reemplazar `_score_day` sin que el frontend tenga que cambiar: siempre que
    v2 devuelva date/score/reason/explanation/suggestedTimeSlot, el contrato
    se mantiene (signals/source quedan como metadata opcional de depuración).
    """
    holidays = _load_holidays()
    weather_by_date = await _fetch_weather_by_date(location)

    today = date.today()
    opportunities = []
    for offset in range(days_ahead):
        day = today + timedelta(days=offset)
        day_key = day.isoformat()
        opportunities.append(
            _score_day(
                day=day,
                weather_condition=weather_by_date.get(day_key),
                holiday_name=holidays.get(day_key)
            )
        )

    opportunities.sort(key=lambda o: o["score"], reverse=True)
    return opportunities
