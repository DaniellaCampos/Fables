import requests

response = requests.get("https://wttr.in/El_Salvador?format=j1")
response.raise_for_status()

data = response.json()
weather_desc = data["current_condition"][0]["weatherDesc"][0]["value"].lower()

print(f"Condicion actual: {weather_desc}")

if any(word in weather_desc for word in ["sunny", "clear", "partly cloudy"]):
    print("🌤️ TREND ALERT: High probability of demand for outdoor tourism. Generate adventure copy.")
elif any(word in weather_desc for word in ["rain", "showers"]):
    print("🌧️ ALERTA DE TENDENCIA: Pronostico de lluvia. Se sugiere promocionar espacios techados o comida caliente.")
else:
    print("Sin alerta de tendencia para esta condicion climatica.")
