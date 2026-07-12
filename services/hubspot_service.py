import os
import httpx

HUBSPOT_TOKEN = os.getenv("HUBSPOT_TOKEN")

def sync_brand_to_hubspot(profile: dict, email: str | None):
    """
    Sincroniza los datos del onboarding a HubSpot CRM de forma no bloqueante.
    Crea el contacto y, si ya existe (error 409), busca el ID de contacto
    y lo actualiza mediante un PATCH.
    """
    if not HUBSPOT_TOKEN:
        print("HubSpot sync skipped (no token)")
        return

    # Usar correo de la cuenta o placeholder si no viene
    target_email = email if email else "demo-placeholder@example.com"
    business_name = profile.get("name") or profile.get("nicho_negocio") or "Negocio Fables"

    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        "Authorization": f"Bearer {HUBSPOT_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "properties": {
            "email": target_email,
            "firstname": business_name,
            "company": business_name
        }
    }

    try:
        # 1. Intentar crear el contacto
        response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        
        if response.status_code in (200, 201):
            print(f"HubSpot: contacto creado con éxito para {target_email}")
            return
        
        # 2. Si ya existe (409 Conflict), buscar por email y actualizar con PATCH
        if response.status_code == 409:
            print(f"HubSpot: el contacto {target_email} ya existe. Buscando ID para actualizar...")
            
            search_url = "https://api.hubapi.com/crm/v3/objects/contacts/search"
            search_payload = {
                "filterGroups": [
                    {
                        "filters": [
                            {
                                "propertyName": "email",
                                "operator": "EQ",
                                "value": target_email
                            }
                        ]
                    }
                ]
            }
            
            search_response = httpx.post(search_url, headers=headers, json=search_payload, timeout=10.0)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            results = search_data.get("results", [])
            if results:
                contact_id = results[0]["id"]
                patch_url = f"https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}"
                
                # Actualizar el contacto existente
                patch_response = httpx.patch(patch_url, headers=headers, json=payload, timeout=10.0)
                patch_response.raise_for_status()
                print(f"HubSpot: contacto {target_email} actualizado con éxito (ID: {contact_id})")
            else:
                print(f"HubSpot: no se encontró el contacto en la búsqueda a pesar del error 409")
        else:
            print(f"HubSpot: error al crear contacto (status {response.status_code}): {response.text}")
            
    except Exception as e:
        print(f"HubSpot sync failed: {str(e)}")
