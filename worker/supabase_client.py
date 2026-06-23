import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    """
    Crea y retorna un cliente de Supabase usando las credenciales
    definidas en las variables de entorno.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError("Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")

    return create_client(supabase_url, supabase_key)

def download_video_from_storage(client: Client, path: str, local_path: str) -> None:
    """
    Descarga un archivo desde el bucket de Supabase Storage.
    """
    # El bucket que usamos se asume como "videos"
    bucket_name = "videos"
    
    # Asegurar que el directorio destino existe
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    with open(local_path, 'wb') as f:
        res = client.storage.from_(bucket_name).download(path)
        f.write(res)

def upload_video_to_storage(client: Client, local_path: str, destination_path: str) -> str:
    """
    Sube un video renderizado al bucket de Supabase Storage y retorna la URL pública.
    """
    bucket_name = "videos"
    
    with open(local_path, 'rb') as f:
        # Usamos upsert para sobreescribir si ya existe, útil durante desarrollo o reintentos
        client.storage.from_(bucket_name).upload(
            destination_path, 
            f, 
            {"content-type": "video/mp4", "upsert": "true"}
        )
        
    # Obtener y devolver la URL pública
    public_url = client.storage.from_(bucket_name).get_public_url(destination_path)
    return public_url
