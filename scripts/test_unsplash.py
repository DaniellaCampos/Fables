import os

import requests
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_API_KEY = os.environ["UNSPLASH_API_KEY"]

response = requests.get(
    "https://api.unsplash.com/search/photos",
    params={"query": "El Salvador beach"},
    headers={"Authorization": f"Client-ID {UNSPLASH_API_KEY}"},
)
response.raise_for_status()

data = response.json()
image_url = data["results"][0]["urls"]["regular"]

print(image_url)
