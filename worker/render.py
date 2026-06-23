import os
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, ColorClip

def render_video(input_path: str, output_path: str, template: str, overlay_text: str) -> None:
    """
    Carga el video, aplica el template con MoviePy y exporta el resultado.
    """
    try:
        # 1. Cargar el video original
        video = VideoFileClip(input_path)
        w, h = video.size
        
        clips = [video]

        if overlay_text:
            # Seleccionar template
            if template == "modern":
                # Texto en esquina superior derecha, color dorado
                txt_clip = TextClip(
                    overlay_text, 
                    fontsize=max(int(h/15), 30), 
                    color='gold', 
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=2,
                    method='caption',
                    size=(w * 0.8, None)
                )
                txt_clip = txt_clip.set_position(('right', 'top')).set_duration(video.duration).margin(top=40, right=40, opacity=0)
                clips.append(txt_clip)

            elif template == "cooling_break":
                # Overlay traslúcido azul en la parte inferior, texto blanco centrado
                overlay_height = int(h * 0.2)
                bg_clip = ColorClip(size=(w, overlay_height), color=(0, 100, 255))
                bg_clip = bg_clip.set_opacity(0.6).set_position(('center', 'bottom')).set_duration(video.duration)
                clips.append(bg_clip)

                txt_clip = TextClip(
                    overlay_text, 
                    fontsize=max(int(h/20), 20), 
                    color='white', 
                    font='Arial-Bold',
                    method='caption',
                    size=(w * 0.9, overlay_height)
                )
                txt_clip = txt_clip.set_position(('center', 'bottom')).set_duration(video.duration)
                clips.append(txt_clip)

            else:
                # Clásico por defecto: texto centrado, blanco, borde negro
                txt_clip = TextClip(
                    overlay_text, 
                    fontsize=max(int(h/12), 40), 
                    color='white', 
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=3,
                    method='caption',
                    align='center',
                    size=(w * 0.9, None)
                )
                txt_clip = txt_clip.set_position('center').set_duration(video.duration)
                clips.append(txt_clip)

        # 2. Componer y exportar
        final_video = CompositeVideoClip(clips)
        
        # Crear directorio destino si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Exportar
        final_video.write_videofile(
            output_path, 
            codec="libx264", 
            audio_codec="aac",
            fps=video.fps,
            preset="fast"
        )
        
        # Cerrar clips para liberar memoria
        video.close()
        final_video.close()
        
    except Exception as e:
        print(f"Error al renderizar el video: {str(e)}")
        raise
