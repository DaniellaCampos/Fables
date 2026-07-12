import requests
from dotenv import load_dotenv

load_dotenv()


def get_alert(location: str) -> str | None:
    response = requests.get(f"https://wttr.in/{location}?format=j1")
    response.raise_for_status()

    data = response.json()
    weather_desc = data["current_condition"][0]["weatherDesc"][0]["value"].lower()

    if any(word in weather_desc for word in ["sunny", "clear", "partly cloudy"]):
        return "🌤️ TREND ALERT: High probability of demand for outdoor tourism. Generate adventure copy."
    elif any(word in weather_desc for word in ["rain", "showers"]):
        return "🌧️ ALERTA DE TENDENCIA: Pronostico de lluvia. Se sugiere promocionar espacios techados o comida caliente."

    return None
