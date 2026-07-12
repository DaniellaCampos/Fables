import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = (
    "Eres un redactor de marketing turistico. Cuando el usuario te pida copys, "
    "responde EXCLUSIVAMENTE con un JSON valido, sin texto adicional, con la "
    "siguiente forma: "
    '{"opciones": ["copy 1", "copy 2", "copy 3"]}'
)


def generate_copies(niche: str, location: str, idea: str) -> dict:
    user_prompt = (
        f"Dame tres opciones de copy turistico corto para el nicho '{niche}', "
        f"ubicado en '{location}', basado en la siguiente idea: '{idea}'."
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
