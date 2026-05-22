# Rain Risk Engine

Sistema de monitoreo y alerta temprana de riesgo por precipitaciones, construido sobre un pipeline ELT automatizado y un motor de lógica difusa para la evaluación del riesgo en tiempo real.

---

## El Problema

Las lluvias intensas generan situaciones de riesgo que muchas veces toman por sorpresa a las personas. Los datos meteorológicos existen y son públicos, pero no hay una forma sencilla de interpretarlos y traducirlos en un nivel de riesgo claro y accionable.

¿Cómo saber si la lluvia que está cayendo ahora representa un riesgo real? ¿Cuánta precipitación acumulada en las últimas horas es preocupante? ¿Qué papel juega la humedad del suelo en todo esto?

---

## La Solución

Rain Risk Engine extrae datos de precipitación y humedad cada 15 minutos desde la API pública de Open-Meteo, los transforma a través de un pipeline ELT por capas (Bronze → Silver → Gold), y los evalúa con un motor de lógica difusa que produce un nivel de riesgo: **Verde, Amarillo, Naranja o Rojo**.

El resultado se expone mediante una API REST y se visualiza en un dashboard web en tiempo real.

> 📸 **Imagen sugerida:** captura del dashboard mostrando el nivel de riesgo en NARANJA o ROJO para evidenciar el color y los datos en pantalla.

---

## Arquitectura

```
Open-Meteo API
      ↓
  [Airflow — cada 15 min]
  Extract → Bronze (PostgreSQL)
      ↓
  dbt Silver → limpieza y tipado
      ↓
  dbt Gold  → ventanas de tiempo (1h, 3h, 6h, 24h, 72h)
      ↓
  Motor Difuso → nivel de riesgo
      ↓
  [Backend FastAPI] → REST API
      ↓
  [Frontend React]  → Dashboard
```

![alt text](<Diagrama Arquitectura.gif>)

---

## Pipeline ELT — Airflow + PostgreSQL + dbt

El corazón del sistema es un DAG de **Apache Airflow** (`weather_pipeline`) que se ejecuta automáticamente cada 15 minutos y orquesta las siguientes tareas:

| Tarea | Descripción |
|---|---|
| `extract_transform_load_current` | Extrae clima actual de Open-Meteo → `bronze_weather_current` |
| `extract_transform_load_hourly` | Extrae datos horarios de Open-Meteo → `bronze_weather_hourly` |
| `dbt_deps` | Instala dependencias del proyecto dbt |
| `dbt_run_silver` | Transforma Bronze → Silver (limpieza, tipado, deduplicación) |
| `dbt_test_silver` | Valida calidad de datos en Silver |
| `dbt_run_gold` | Agrega Silver → Gold (ventanas de tiempo, features para el motor) |
| `dbt_test_gold` | Valida calidad de datos en Gold |
| `run_risk_engine` | Ejecuta el motor difuso y guarda el resultado en `alerts` |

### Capas de datos en PostgreSQL

| Tabla | Capa | Descripción |
|---|---|---|
| `bronze_weather_current` | Bronze | Snapshots del clima actual, uno cada 15 min |
| `bronze_weather_hourly` | Bronze | Datos horarios crudos con upsert por hora |
| `silver_weather_current` | Silver | Datos actuales limpios y tipados |
| `silver_weather_hourly` | Silver | Datos horarios limpios y deduplicados |
| `gold_risk_features_latest` | Gold | Features agregadas para el motor (1 fila) |
| `gold_precipitation_history` | Gold | Histórico horario de precipitación |
| `gold_daily_summary` | Gold | Resumen diario de precipitación |
| `alerts` | Resultado | Historial de evaluaciones del motor difuso |

![alt text](<Pipelina airflow.png>)

---

## Motor de Riesgo — Lógica Difusa

Ubicado en `airflow/plugins/risk_engine/`, el motor opera en **dos etapas** usando `scikit-fuzzy`.

### ¿Por qué lógica difusa y no ML?

La lógica difusa permite modelar el conocimiento experto de forma explícita y transparente, sin necesidad de datos de entrenamiento etiquetados. Las reglas son interpretables: "si la precipitación de la última hora es alta Y la humedad es elevada, el riesgo es naranja". Esto es ideal para un dominio donde la causalidad es conocida pero los umbrales son graduales.

### Etapa 1 — Nivel de Lluvia (0 a 1)

**Entradas:**
- `precip_1h` — precipitación última hora (mm)
- `precip_3h` — precipitación últimas 3 horas (mm)
- `intensidad_actual` — intensidad de lluvia actual (mm/h)

**Salida:** `nivel_lluvia` entre 0 y 1, clasificado en: *bajo, medio, alto*

### Etapa 2 — Score de Riesgo (0 a 100)

**Entradas:**
- `nivel_lluvia` — resultado de la etapa 1
- `humidity_avg_6h` — humedad promedio últimas 6 horas (%)

**Salida:** `riesgo_score` y `nivel_riesgo`

| Score | Nivel |
|---|---|
| 0 – 25 | 🟢 VERDE |
| 25 – 50 | 🟡 AMARILLO |
| 50 – 75 | 🟠 NARANJA |
| 75 – 100 | 🔴 ROJO |

---

## Backend — FastAPI

API REST construida con **FastAPI** y **SQLAlchemy**, siguiendo arquitectura en capas: `Controller → Service → Repository`.

| Endpoint | Descripción |
|---|---|
| `GET /api/risk/current` | Último nivel de riesgo calculado |
| `GET /api/risk/history` | Historial de evaluaciones |
| `GET /api/precipitation/current` | Precipitación y humedad actuales |
| `GET /api/precipitation/history` | Histórico horario de precipitación |

**Ejemplo — `/api/risk/current`:**
```json
{
  "nivel_riesgo": "NARANJA",
  "riesgo_score": 61.4,
  "nivel_lluvia": 0.73,
  "evaluated_at": "2026-05-22T19:56:46+00:00"
}
```

**Ejemplo — `/api/precipitation/current`:**
```json
{
  "precipitation_1h": 18.0,
  "precipitation_3h": 35.0,
  "humidity_avg_6h": 85.0,
  "trend_1h": "subiendo",
  "as_of_time": "2026-05-22T19:56:46+00:00"
}
```

![alt text](<docs back.png>)

---

## Frontend — React

Dashboard web construido con **React** que muestra:

- Nivel de riesgo actual con indicador visual por color
- Score numérico del riesgo
- Precipitación acumulada por ventanas de tiempo
- Gráfico histórico del riesgo score

![alt text](<Front precipitación.png>)

![alt text](<Front riesgo.png>)

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Orquestación | Apache Airflow 2.9 |
| Base de datos | PostgreSQL 15 |
| Transformación | dbt-core |
| Motor de riesgo | scikit-fuzzy, Python |
| Backend | FastAPI, SQLAlchemy |
| Frontend | React, Recharts |
| Contenedores | Docker, Docker Compose |
| Fuente de datos | Open-Meteo API |

---

## Cómo correr el proyecto

### Requisitos
- Docker Desktop
- Git

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/jeriveraa23/rain-risk-engine.git
cd rain-risk-engine
```

**2. Crear el archivo `.env`**
```bash
cp .env.example .env
```
Abre `.env` y completa las variables con los valores.

**3. Levantar los contenedores**
```bash
docker-compose up --build
```

**4. Acceder a los servicios**

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/docs |
| Airflow UI | http://localhost:8080 |

**5. Activar el DAG**

Entra a `http://localhost:8080` con usuario `admin` y contraseña `admin`, busca el DAG `weather_pipeline` y actívalo. El pipeline correrá automáticamente cada 15 minutos.

**6. Detener los contenedores**
```bash
docker-compose down
```

**Reinicio total (borra todos los datos):**
```bash
docker-compose down -v
docker-compose up --build
```
