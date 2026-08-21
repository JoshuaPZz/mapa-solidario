<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Realtime%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

# 🗺️ Mapa Solidario — Plataforma Comunitaria en Tiempo Real

> **Plataforma web geoespacial y colaborativa en tiempo real** para el registro, mapeo y coordinación de puntos de ayuda humanitaria, centros de acopio y voluntariado durante situaciones de emergencia.

---

## 📌 Descripción General

**Mapa Solidario** es una solución de respuesta rápida diseñada para conectar a ciudadanos, comunidades y organizaciones humanitarias. Permite visualizar sobre un mapa interactivo las necesidades críticas en distintas zonas (alimentos, refugio, atención médica, donaciones, voluntariado) y actualizar en tiempo real el estado de cada punto de apoyo.

### 🌟 Características Principales

- 📍 **Mapa Interactivo con Geolocalización:** Renderizado de puntos de ayuda utilizando Leaflet y OpenStreetMap con marcadores dinámicos y clustering.
- ⚡ **Actualizaciones en Tiempo Real (Realtime):** Integración nativa con **Supabase Realtime (WebSockets)** para reflejar nuevos puntos o cambios de estado instantáneamente sin recargar la página.
- 🏷️ **Categorización Multifacética:** Clasificación de ayuda por etiquetas (`Alimentos`, `Medicamentos`, `Refugio`, `Ropa`, `Voluntariado`, `Apoyo Psicológico`).
- 📊 **Gestión de Estados:** Indicador visual de estado (`necesita_apoyo` vs. `cubierto`) para evitar la saturación de recursos en centros de acopio.
- 📱 **Diseño Mobile-First:** Interfaz optimizada con Tailwind CSS para acceso fluido desde smartphones en zonas de emergencia.
- 🔒 **Persistencia Segura en PostgreSQL:** Modelo de datos optimizado con índices espaciales, triggers automáticos de auditoría y Row Level Security (RLS).

---

## 🏛️ Arquitectura del Sistema

```text
┌──────────────────────────────────────────────────────────┐
│                   Cliente Web (Browser)                  │
│       Next.js 16 (App Router) + React 19 + Tailwind      │
└──────────────┬────────────────────────────▲──────────────┘
               │ HTTP / CRUD                │ WebSocket Realtime
               ▼                            │ (Postgres Changes)
┌───────────────────────────────────────────┴──────────────┐
│                    Supabase Backend                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │             PostgreSQL 15 (puntos_ayuda)           │  │
│  │   - Índices: ciudad, estado, lat/lng, creado_en    │  │
│  │   - Row Level Security (RLS) habilitado            │  │
│  │   - Triggers PL/pgSQL para updated_at automático   │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │        Supabase Realtime Publication Layer         │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Renderizado del lado del servidor (SSR) y componentes cliente |
| **Librería UI** | React 19 | Arquitectura modular de componentes interactivos |
| **Lenguaje** | TypeScript 5 | Tipado estático de entidades de dominio y contratos de API |
| **Mapas & GIS** | Leaflet / React-Leaflet | Visualización de mapas vectoriales y capas OpenStreetMap |
| **Base de Datos** | Supabase (PostgreSQL 15) | Persistencia relacional, índices espaciales y suscripciones Realtime |
| **Estilos** | Tailwind CSS | Sistema de diseño responsivo y optimizado con utilidades CSS |
| **Utilidades** | date-fns | Formateo y manipulación localizada de marcas de tiempo |

---

## 🗄️ Modelo de Datos (PostgreSQL)

```sql
create table public.puntos_ayuda (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  direccion        text not null,
  ciudad           text not null default 'Bogotá',
  pais             text not null default 'Colombia',
  lat              double precision,
  lng              double precision,
  tipo_apoyo       text[] not null default '{}',
  que_recibe       text,
  estado           text not null default 'necesita_apoyo' check (estado in ('necesita_apoyo', 'cubierto')),
  contacto         text,
  link_inscripcion text,
  horario          text,
  notas            text,
  instagram        text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** 18.x o superior
- **npm**, **pnpm** o **yarn**
- Cuenta en **Supabase**

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JoshuaPZz/mapa-solidario.git
   cd mapa-solidario
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Configura tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```

4. **Ejecutar schema en Supabase:**
   En el SQL Editor de tu dashboard de Supabase, ejecuta los scripts:
   - `supabase/schema.sql` (creación de tabla, índices, RLS y realtime)
   - `supabase/seed.sql` (datos iniciales de prueba)

5. **Iniciar en entorno de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📄 Licencia

Este proyecto fue desarrollado como una iniciativa de código abierto para asistencia comunitaria y solidaria.
