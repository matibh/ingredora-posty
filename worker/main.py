import os
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from supabase_client import get_supabase_client, download_video_from_storage, upload_video_to_storage
from render import render_video

app = FastAPI(title="Posty Render Worker")

class JobRequest(BaseModel):
    job_id: str

def render_and_upload(job_id: str):
    """
    Función en segundo plano que procesa el video.
    """
    client = get_supabase_client()
    
    # 1. Obtener el job de Supabase
    response = client.table("jobs").select("*").eq("id", job_id).execute()
    if not response.data:
        print(f"Error: Job {job_id} no encontrado en la base de datos.")
        return
        
    job = response.data[0]
    
    # Rutas temporales locales
    input_path = f"/tmp/input_{job_id}.mp4"
    output_path = f"/tmp/output_{job_id}.mp4"
    
    try:
        # 2. Cambiar estado a processing
        client.table("jobs").update({"status": "processing"}).eq("id", job_id).execute()
        
        # 3. Descargar el video original
        download_video_from_storage(client, job["input_video_path"], input_path)
        
        # 4. Renderizar el video
        render_video(
            input_path=input_path,
            output_path=output_path,
            template=job.get("template", "classic"),
            overlay_text=job.get("overlay_text", "")
        )
        
        # 5. Subir el video renderizado
        destination_path = f"rendered/{job['user_id']}/{job_id}.mp4"
        public_url = upload_video_to_storage(client, output_path, destination_path)
        
        # 6. Actualizar el job con status done y URL
        client.table("jobs").update({
            "status": "done",
            "output_video_url": public_url
        }).eq("id", job_id).execute()
        
        print(f"Job {job_id} procesado con éxito. URL: {public_url}")
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error procesando job {job_id}: {error_msg}")
        # Actualizar job con error
        client.table("jobs").update({
            "status": "error",
            "error_message": error_msg
        }).eq("id", job_id).execute()
        
    finally:
        # 7. Limpiar archivos temporales
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except:
                pass
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass

@app.get("/health")
def health_check():
    """
    Endpoint para verificación de salud.
    """
    return {"status": "ok"}

@app.post("/process_job")
def process_job(request: JobRequest, background_tasks: BackgroundTasks):
    """
    Endpoint principal que recibe el job_id y lo encola para procesamiento.
    """
    job_id = request.job_id
    
    if not job_id:
        raise HTTPException(status_code=400, detail="Se requiere un job_id")
        
    # Encolar la tarea
    background_tasks.add_task(render_and_upload, job_id)
    
    # Responder inmediatamente
    return {"status": "processing", "job_id": job_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080)
