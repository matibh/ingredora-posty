FROM python:3.11-slim

# Instalar dependencias del sistema necesarias para OpenCV, MoviePy y tipografías
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    fonts-liberation \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Configurar ImageMagick para permitir la lectura y escritura de texto (necesario para TextClip de MoviePy)
RUN sed -i 's/<policy domain="path" rights="none" pattern="@\*"/<!-- <policy domain="path" rights="none" pattern="@\*" -->/g' /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

# Copiar requerimientos e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del worker
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
