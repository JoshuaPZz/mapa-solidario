# 🚀 Deploy — Mapa Solidario

## Requisitos previos
- Cuenta en [Supabase](https://supabase.com) (free tier)
- Cuenta en [Vercel](https://vercel.com) (free tier)
- Node.js 18+

---

## 1. Configurar Supabase

### Crear proyecto
1. Ve a [supabase.com](https://supabase.com) → New Project
2. Elige nombre, región: **South America (São Paulo)** para menor latencia
3. Guarda la contraseña de la base de datos

### Ejecutar el schema
1. En el dashboard de Supabase → **SQL Editor**
2. Pega el contenido de `supabase/schema.sql` → Run
3. Pega el contenido de `supabase/seed.sql` → Run

### Habilitar Realtime
1. Supabase Dashboard → **Database** → **Replication**
2. En "Source", activa la tabla `puntos_ayuda`
3. (O ya está incluido en el schema.sql: `alter publication supabase_realtime add table public.puntos_ayuda`)

### Obtener las credenciales
1. Supabase → **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Configurar variables de entorno locales

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Probar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 4. Deploy en Vercel

### Opción A: desde la CLI
```bash
npx vercel --prod
```
Sigue las instrucciones. Cuando pida variables de entorno, ingresa las dos de Supabase.

### Opción B: desde el dashboard
1. Ve a [vercel.com](https://vercel.com) → New Project
2. Importa el repositorio de GitHub
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## 5. Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase |

---

## Notas de seguridad

> **Decisión consciente:** Esta v1 no tiene autenticación. Cualquier persona puede agregar y actualizar puntos. Esto fue una decisión deliberada para maximizar la velocidad de adopción durante la emergencia de agosto 2026.
>
> **Para versiones futuras:** agregar Supabase Auth, limitar UPDATE a solo campos permitidos, y rate limiting por IP.

---

## Stack

| Tecnología | Propósito |
|-----------|-----------|
| Next.js 14 (App Router) | Frontend + API routes |
| Supabase | PostgreSQL + Realtime subscriptions |
| Leaflet + react-leaflet | Mapa interactivo (OpenStreetMap) |
| Nominatim API | Geocodificación gratis (sin API key) |
| Haversine (JS) | Cálculo de distancia sin PostGIS |
| Tailwind CSS | Estilos mobile-first |
| Vercel | Hosting frontend |
