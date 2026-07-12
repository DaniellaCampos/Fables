import json

import requests

url = "http://127.0.0.1:8000/api/closet/generate"
payload = {
    "niche": "boutique hotel",
    "location": "San Salvador",
    "idea": "weekend promotion",
}

response = requests.post(url, json=payload)

print(f"Status code: {response.status_code}")
print(json.dumps(response.json(), indent=2, ensure_ascii=True))
