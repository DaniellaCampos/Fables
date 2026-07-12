import os

import requests
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_API_KEY = os.environ["UNSPLASH_API_KEY"]


def get_image(query: str) -> str:
    response = requests.get(
        "https://api.unsplash.com/search/photos",
        params={"query": query},
        headers={"Authorization": f"Client-ID {UNSPLASH_API_KEY}"},
    )
    response.raise_for_status()

    data = response.json()
    return data["results"][0]["urls"]["regular"]
