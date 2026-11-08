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

USER_PROMPT = "Dame tres opciones de copy turistico corto para promocionar un destino de playa."

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_PROMPT},
    ],
    response_format={"type": "json_object"},
)

content = response.choices[0].message.content
data = json.loads(content)

print(json.dumps(data, indent=2, ensure_ascii=False))
