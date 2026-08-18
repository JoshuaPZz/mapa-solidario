# 🇨🇴 Mapa Solidario Colombia

**Coordinación de ayuda humanitaria en tiempo real tras el terremoto del Chocó — Agosto 2026**

🌐 **Demo en vivo:** [mapa-solidario-kohl.vercel.app](https://mapa-solidario-kohl.vercel.app)

---

## ¿Qué es?

Mapa Solidario es una plataforma web colaborativa construida para responder a la emergencia generada por el terremoto de magnitud 7.4 que sacudió San José del Palmar, Chocó, el 10 de agosto de 2026.

Su propósito es simple: **centralizar en un solo lugar todos los puntos donde se puede dar o recibir ayuda**, y mantener esa información actualizada en tiempo real por las mismas personas que están en el terreno.

No requiere registro ni cuenta. Cualquier persona puede agregar un punto, actualizarlo, reportar su estado o subir fotos del lugar.

---

## Funcionalidades

| Función | Descripción |
|---|---|
| **Agregar puntos** | Cualquier usuario puede publicar un punto de acopio, voluntariado, banco de alimentos o fundación con dirección, fotos y contacto |
| **Actualizaciones en vivo** | Campo de bitácora por punto para que quienes están en el lugar dejen comentarios en tiempo real: qué falta, qué llegó, cambios de horario |
| **Ítems urgentes / necesarios** | Cada punto puede listar lo que necesita con urgencia (agua, cobijas, medicamentos) diferenciado por nivel de prioridad |
| **Mapa interactivo** | Vista de mapa con marcadores por estado (rojo = necesita apoyo, verde = cubierto). Popup con detalle completo al pulsar |
| **Filtros avanzados** | Filtrar por ciudad, tipo de apoyo, radio de distancia desde la ubicación del usuario y estado del punto |
| **Fotos del lugar** | Hasta 5 fotos por punto, comprimidas en cliente antes de subir. Carousel con lightbox en el detalle |
| **Navegación a Google Maps** | Botón directo de "Cómo llegar" en cada punto, usando coordenadas exactas o dirección |
| **Reportar como cubierto** | Sistema de reportes para marcar cuando un punto ya no necesita ayuda y redirigir el apoyo |
| **Editar y eliminar** | Cualquier usuario puede corregir información desactualizada o eliminar un punto |
| **Realtime** | Toda la información se sincroniza instantáneamente entre todos los usuarios conectados vía Supabase Realtime |

---

## Arquitectura

```
┌─────────────────────────────────────────┐
│              Next.js 15                 │
│         (App Router, SSR/CSR)           │
│                                         │
│  app/page.tsx          ← estado global  │
│  components/           ← UI components  │
│    FilterBar           ← barra superior │
│    FeedView            ← lista de cards │
│    PointCard           ← tarjeta punto  │
│    Map (Leaflet)       ← vista de mapa  │
│    PointPopup          ← panel en mapa  │
│    AddPointModal       ← crear / editar │
│    WelcomeScreen       ← landing        │
└───────────────┬─────────────────────────┘
                │
                │ supabase-js
                ▼
┌─────────────────────────────────────────┐
│               Supabase                  │
│                                         │
│  PostgreSQL                             │
│    puntos_ayuda        ← tabla principal│
│                                         │
│  Storage                                │
│    fotos-de-los-lugares ← bucket público│
│                                         │
│  Realtime                               │
│    postgres_changes    ← INSERT/UPDATE/ │
│                          DELETE en vivo │
└─────────────────────────────────────────┘
```

### Stack

- **Framework:** [Next.js 15](https://nextjs.org) con App Router
- **UI:** [Tailwind CSS](https://tailwindcss.com)
- **Mapa:** [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org)
- **Base de datos / Auth / Storage / Realtime:** [Supabase](https://supabase.com)
- **Fechas:** [date-fns](https://date-fns.org)
- **Deploy:** [Vercel](https://vercel.com)

### Modelo de datos — `puntos_ayuda`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Identificador único |
| `nombre` | text | Nombre del punto |
| `direccion` | text | Dirección |
| `ciudad` | text | Ciudad |
| `pais` | text | País |
| `lat` / `lng` | float | Coordenadas geográficas |
| `tipo_apoyo` | text[] | Tipos: acopio, voluntariado, donaciones, etc. |
| `items_urgentes` | text[] | Ítems que necesitan con urgencia |
| `items_necesarios` | text[] | Ítems que necesitan (menor prioridad) |
| `que_recibe` | text | Descripción de qué se necesita |
| `horario` | text | Horario de atención |
| `notas` | text | Bitácora de actualizaciones en vivo |
| `contacto` | text | Teléfono(s) de contacto |
| `instagram` | text | Perfil de Instagram |
| `link_inscripcion` | text | Link de WhatsApp o inscripción |
| `fotos` | text[] | Paths de fotos en Supabase Storage |
| `estado` | text | `necesita_apoyo` o `cubierto` |
| `reportes_cubierto` | int | Cantidad de reportes de estar cubierto |
| `creado_en` | timestamptz | Fecha de creación |
| `actualizado_en` | timestamptz | Última actualización |

---

## Correr localmente

```bash
# Clonar el repositorio
git clone <repo-url>
cd mapa-solidario

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Llenar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# Correr en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

---

## Decisiones de diseño

- **Sin autenticación:** La barrera de registro elimina usuarios en emergencias. Todo es anónimo e inmediato.
- **Compresión en cliente:** Las fotos se comprimen a máx. 1200px / JPEG 0.82 antes de subir, sin costo de servidor.
- **Realtime sobre polling:** Supabase Realtime con `postgres_changes` garantiza sincronización instantánea sin consultas periódicas.
- **Función RPC para reportes:** Los reportes de "cubierto" van por una función `reportar_punto_cubierto` en Supabase para evitar sabotaje directo por escritura.
- **Sin framework de estado externo:** React `useState` + `useCallback` es suficiente para la escala actual. Reducir dependencias reduce superficie de fallo en una emergencia.

---

## Equipo

Proyecto voluntario, sin fines de lucro, construido para ayudar en la emergencia del Chocó.

- **Joshua Prieto** — joshuaprieto8@gmail.com
- **Joan Orduz** — joaneorduzzz@gmail.com

Sugerencias, errores o si quieres contribuir: escríbenos directamente o abre un issue.
