# Riftbound Collection Tracker & Deck Builder

Una aplicación integral (Web & Desktop con Electron) diseñada para jugadores y coleccionistas del juego de cartas coleccionables **Riftbound TCG**. Permite gestionar colecciones, consultar el catálogo completo de cartas actualizado en tiempo real, construir y validar mazos competitivos y comparar estrategias.

---

## ⚡ Características Principales

* **Catálogo Completo y Actualizado (RiftHunt API):**  
  Acceso a más de 1.650 cartas oficiales con metadatos completos e imágenes en alta resolución del CDN oficial de Riot Games. Incluye la expansión más reciente **Radiance (`RAD`)**, junto a *Vendetta*, *Unleashed*, *Spiritforged*, *Origins*, *Proving Grounds*, promocionales de juego organizado y cartas de juez.
* **Gestión de Colección:**  
  Lleva el control detallado de copias normales y foil que posees, con porcentaje de completitud por expansión, filtros avanzados por dominios, tipo, coste de energía y rareza.
* **Deck Builder Avanzado:**  
  * Creación y edición intuitiva de mazos con validación automática de reglas oficiales (mazo principal de 40 cartas, leyenda, campeón coincidente, hasta 10 cartas en banquillo/sideboard, runas y campos de batalla).
  * Curva de coste de energía interactiva y distribución de tipos y dominios en tiempo real.
  * Reordenación de mazos por posición y marcado de favoritos.
  * Vista previa rápida del progreso de cartas poseídas vs requeridas en cada mazo.
* **Deck Comparator (Comparador de Mazos):**  
  Compara dos mazos cara a cara para identificar cartas compartidas, exclusivas de cada versión y crear combinaciones optimizadas.
* **Importación y Exportación:**  
  Importa y exporta colecciones masivas mediante archivos `.csv` o códigos de mazo estándar.
* **Sincronización Inteligente de Datos:**  
  Sincronización en segundos con el catálogo bulk de **RiftHunt** preservando el 100% de la integridad de tu colección y mazos gracias a migraciones automáticas y claves foráneas en cascada.
* **Modo Escritorio y Web:**  
  Empaquetado listo para ejecutarse como aplicación de escritorio nativa mediante **Electron** o en navegador mediante **Vite + React**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express, `pg` (node-postgres), CORS |
| **Base de Datos** | PostgreSQL (alojada en [Supabase](https://supabase.com/)) |
| **Escritorio** | Electron 28, Concurrently, Electron-builder |
| **Fuente de Datos** | [RiftHunt API](https://rifthunt.com) (`api.rifthunt.com`) |

---

## 📁 Estructura del Repositorio

```text
RIFTBOUND/
├── backend/                  # Servidor API REST y scripts de base de datos
│   ├── db.js                 # Conexión al pool de PostgreSQL (Supabase)
│   ├── schema.sql            # Definición completa del esquema SQL (cards, collection, decks, deck_cards)
│   ├── seed.js               # Ingesta masiva optimizada desde RiftHunt API
│   ├── server.js             # Endpoints Express (/api/cards, /api/collection, /api/decks, etc.)
│   └── package.json          # Dependencias del backend
├── frontend/                 # Interfaz de usuario SPA
│   ├── src/
│   │   ├── components/       # Componentes React (DeckManager, CardDetailModal, DeckComparator, etc.)
│   │   ├── App.jsx           # Catálogo principal, filtros y vistas
│   │   └── index.css         # Estilos globales con Tailwind CSS
│   ├── package.json          # Dependencias del frontend
│   └── vite.config.js        # Configuración del bundler Vite
├── main.cjs                  # Proceso principal de Electron (modo escritorio)
├── INICIAR.bat               # Acceso directo para iniciar la app en Windows
├── riftbard.ico              # Icono de la aplicación (RiftBard)
└── package.json              # Orquestador del proyecto y scripts de ejecución
```

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
* [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada).
* Instancia de base de datos PostgreSQL (por ejemplo, un proyecto gratuito en [Supabase](https://supabase.com/)).

### 2. Clonar el repositorio
```bash
git clone https://github.com/XDavider/RiftboundDB.git
cd RiftboundDB
```

### 3. Instalar dependencias
Instala las dependencias en la raíz, en el frontend y en el backend:
```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 4. Configurar Variables de Entorno
Crea un archivo llamado `.env` dentro de la carpeta `backend/` con tus credenciales de base de datos y puerto:
```env
DATABASE_URL="postgresql://usuario:password@host:puerto/postgres"
PORT=3001
```

### 5. Poblar la Base de Datos Inicial
Para descargar e insertar el catálogo completo de cartas actualizado:
```bash
cd backend
npm run seed
cd ..
```

---

## 💻 Ejecución del Proyecto

### Opción A (Recomendada en Windows):
Haz doble clic sobre el archivo **`INICIAR.bat`** en la raíz del proyecto. Este comando iniciará el backend, el servidor de desarrollo de Vite y abrirá la ventana de escritorio de Electron automáticamente.

### Opción B (Desde la terminal):
```bash
npm run dev
```

### Opción C (Servicios individuales sin Electron):
* **Backend:** `npm run start:backend` (Escuchando en `http://localhost:3001`)
* **Frontend:** `npm run start:frontend` (Disponible en `http://localhost:5173`)

---

## 📦 Compilación para Producción (Instalador .exe)

Para generar el ejecutable instalador de Windows (NSIS):
```bash
npm run build
```
El instalador resultante se generará en la carpeta `dist-electron/`.

---

## 📄 Licencia

Este proyecto es una herramienta comunitaria de código abierto desarrollada para fans y jugadores de Riftbound TCG.
