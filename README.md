<p align="center">
  <img src="riftbard.png" width="130" alt="RiftBard Meep Logo" />
</p>

<h1 align="center">RiftBard - Caretaker's Vault & TCG Deck Builder</h1>

<p align="center">
  <strong>La plataforma definitiva para coleccionistas y constructores de mazos de Riftbound TCG.</strong><br>
  Disponible como aplicación de escritorio nativa (Windows con Electron) y aplicación web responsive (React + Vite en Vercel).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Electron-28-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#-galer%C3%ADa-visual">Galería Visual</a> •
  <a href="#-caracter%C3%ADsticas-principales">Características</a> •
  <a href="#-gu%C3%ADa-de-instalaci%C3%B3n-local-paso-a-paso">Instalación Local</a> •
  <a href="#-configuraci%C3%B3n-de-supabase-base-de-datos">Supabase</a> •
  <a href="#-variables-de-entorno">Variables de Entorno</a> •
  <a href="#-despliegue-en-vercel-y-github">Despliegue Vercel</a> •
  <a href="#-compilaci%C3%B3n-desktop-exe">Compilar .EXE</a>
</p>

---

## 📸 Galería Visual

### 🖥️ Modo Escritorio / PC (Interfaz Panorámica)

#### 1. Catálogo Completo y Resumen de Colección
> Visualización en cuadrícula responsiva con estadísticas de cartas normales y foil, barra de búsqueda en vivo y distintivo celestial de Meep.
<p align="center">
  <img src="docs/screenshots/pc-catalog.png" width="100%" alt="Catálogo RiftBard PC" />
</p>

#### 2. Panel Lateral de Filtros Multicriterio
> Filtrado exhaustivo por rarezas, tipos de carta, dominios elementales, coste de energía, expansiones oficiales (*Radiance*, *Vendetta*, *Origins*, etc.) y ordenación personalizada.
<p align="center">
  <img src="docs/screenshots/pc-filters.png" width="100%" alt="Filtros Avanzados PC" />
</p>

#### 3. Gestor de Mazos (Deck Manager)
> Vista general de mazos guardados, cartas que los componen, acceso directo para crear, importar desde código/CSV y comparar estrategias.
<p align="center">
  <img src="docs/screenshots/pc-deck-manager.png" width="100%" alt="Gestor de Mazos PC" />
</p>

#### 4. Constructor y Editor de Mazos (Deck Builder)
> Validación de reglas de torneo (40 cartas principales, Leyenda, Campeón coincidente, Runas, Banquillo) y curva de coste de energía interactiva en tiempo real.
<p align="center">
  <img src="docs/screenshots/pc-deck-builder.png" width="100%" alt="Deck Builder PC" />
</p>

---

### 📱 Modo Móvil (Diseño Responsive & PWA Web)

<p align="center">
  <img src="docs/screenshots/mobile-deck-manager.jpg" width="180" alt="Gestor de Mazos Móvil" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-catalog.jpg" width="180" alt="Catálogo Móvil" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-filters.jpg" width="180" alt="Filtros Móviles" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-vault-lock.jpg" width="180" alt="Bóveda Protegida Móvil" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-card-detail.jpg" width="180" alt="Detalle de Carta y Precios Cardmarket" />
  &nbsp;&nbsp;
</p>
<p align="center">
  <em>(De izq. a der.: Pantalla de Bóveda Protegida • Catálogo y Navegación Móvil • Cajón de Filtros • Lista de Mazos • Visualizacion del mazo)</em>
</p>

---

## ⚡ Características Principales

* 🔒 **Bóveda Protegida (Caretaker's Vault Security):**
  * Pantalla de acceso custodiada con PIN o contraseña maestra.
  * Autenticación HMAC criptográfica basada en tokens de sesión seguros con expiración automática.
  * Sin contraseñas genéricas ni fallbacks inseguros.
* 📖 **Catálogo Oficial +1.650 Cartas (RiftHunt API & CDN):**
  * Sincronización completa con imágenes en alta resolución de Riot Games y metadatos actualizados.
  * Expansión **Radiance (`RAD`)** incorporada junto a *Vendetta*, *Unleashed*, *Spiritforged*, *Origins*, cartas promocionales y cartas de juez.
* 💎 **Gestión de Colección Detallada:**
  * Control independiente de unidades **Normales** y **Foil**.
  * Porcentaje de completitud general y desglosado por expansión.
  * Consulta en vivo de precios promedio del mercado europeo vía **Cardmarket**.
* ⚔️ **Constructor de Mazos Competitivo (Deck Builder):**
  * Reglas oficiales de Riftbound TCG automáticas (40 cartas mazo principal, leyenda, campeón coincidente, hasta 10 en sideboard, runas y campos de batalla).
  * Curva de maná interactiva, conteo por dominios y tipos.
  * Comparador visual cara a cara entre dos mazos para analizar diferencias estratégicas.
  * Importación / Exportación mediante códigos estándar o archivos `.csv`.
* 🖥️ **Multiplataforma:**
  * Ejecución local ultrarrápida con un solo clic en Windows mediante `INICIAR.bat`.
  * Acceso universal desde cualquier dispositivo (PC, móvil, tablet) mediante despliegue web en **Vercel**.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Glassmorphism UI |
| **Backend API** | Node.js, Express, REST API con autenticación por firma HMAC |
| **Base de Datos** | PostgreSQL alojado en [Supabase](https://supabase.com/) (Transaction Pooler en puerto 6543) |
| **Desktop App** | Electron 28, Concurrently, Electron-Builder (generador de instalador NSIS `.exe`) |
| **Despliegue Cloud**| [Vercel](https://vercel.com/) (Frontend Vite + Backend Express con enrutamiento inverso) |
| **Datos TCG** | [RiftHunt API](https://rifthunt.com) (`api.rifthunt.com`) |

---

## 📁 Estructura del Repositorio

```text
RIFTBOUND/
├── docs/
│   └── screenshots/          # Capturas de pantalla para PC y Móvil
├── backend/                  # Servidor Express y base de datos
│   ├── .env.example          # Plantilla documentada de variables de entorno
│   ├── db.js                 # Conexión al pool de PostgreSQL (Supabase SSL)
│   ├── schema.sql            # Definición DDL de tablas y restricciones CASCADE
│   ├── seed.js               # Ingesta masiva desde RiftHunt bulk API
│   ├── server.js             # Endpoints API (/cards, /collection, /decks, /auth)
│   └── package.json          # Dependencias del backend
├── frontend/                 # Interfaz de usuario SPA (React + Vite)
│   ├── src/
│   │   ├── components/       # Componentes (DeckManager, VaultLockScreen, etc.)
│   │   ├── assets/           # Logotipo dorado Meep (logo.png)
│   │   ├── App.jsx           # Catálogo, filtros, autenticación y vistas
│   │   └── index.css         # Tema celestial Bard/Meep con Tailwind CSS
│   ├── package.json          # Dependencias del frontend
│   └── vite.config.js        # Configuración de compilación Vite
├── main.cjs                  # Proceso principal de Electron (modo ventana desktop)
├── INICIAR.bat               # Script Windows para arranque limpio en 1 clic
├── vercel.json               # Configuración multi-servicio para despliegue en Vercel
├── riftbard.ico              # Icono oficial para escritorio Windows (.ico)
├── riftbard.png              # Icono oficial en alta resolución (.png)
└── package.json              # Orquestador del proyecto
```

---

## 🚀 Guía de Instalación Local (Paso a Paso)

Sigue estos sencillos pasos para tener la aplicación funcionando en tu propio ordenador:

### 1. Requisitos Previos
* Instalar **[Node.js](https://nodejs.org/)** (versión 18 LTS o 20 LTS recomendada).
* Instalar **[Git](https://git-scm.com/)**.
* Disponer de una cuenta gratuita en **[Supabase](https://supabase.com/)** (para la base de datos PostgreSQL).

---

### 2. Clonar el Repositorio
Abre tu terminal (PowerShell, CMD o Git Bash) y clona el proyecto:
```bash
git clone https://github.com/XDavider/RiftboundDB.git
cd RiftboundDB
```

---

### 3. Instalar Dependencias
Instala los paquetes en la raíz, en el frontend y en el backend:
```bash
# Instalar dependencias del orquestador y Electron
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

---

### 4. Configuración de Supabase (Base de Datos)

1. **Crear un nuevo proyecto en Supabase:**
   * Entra en [supabase.com](https://supabase.com/) e inicia sesión.
   * Haz clic en **"New project"**.
   * Asigna un nombre a tu proyecto (ej: `riftbard-vault`).
   * **Contraseña de la Base de Datos:** Establece una contraseña segura.
     > 💡 **Consejo de seguridad:** Utiliza caracteres alfanuméricos sencillos (letras y números, ej. `VaultPass2026A`). Evita caracteres especiales como `@`, `:`, `#` o `?`, ya que pueden generar conflictos al parsear la URL de conexión.

2. **Obtener la Connection String (¡Usa Transaction Pooler!):**
   * En el menú lateral izquierdo de Supabase, ve a **Project Settings** (el icono de engranaje) > **Database**.
   * Baja hasta la sección **Connection parameters** o **Connection string**.
   * Selecciona la pestaña **URI** y marca la casilla **Use connection pooling** (Transaction Pooler).
   * **Asegúrate de que el puerto sea `6543`** (ej: `aws-0-eu-west-1.pooler.supabase.com:6543`).
   * Copia esa URL completa. Se verá de este estilo:
     ```text
     postgresql://postgres.[ID_PROYECTO]:[TU_CONTRASEÑA]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

3. **Crear las tablas en Supabase:**
   * Tienes dos formas muy sencillas de hacerlo:
     * **Forma A (Automática):** Al ejecutar el comando de *seed* en el paso siguiente, se crearán solas.
     * **Forma B (Manual desde Supabase):** En el panel de Supabase, ve a **SQL Editor**, pulsa **New Query**, pega todo el contenido de [`backend/schema.sql`](backend/schema.sql) y pulsa **Run**.

---

### 5. Configurar las Variables de Entorno en Local

Crea un archivo llamado `.env` dentro de la carpeta `backend/` (puedes duplicar `backend/.env.example` y renombrarlo a `.env`).

Edita `backend/.env` con tu información:
```env
# 1. Cadena de conexión de Supabase (Transaction Pooler - puerto 6543)
DATABASE_URL="postgresql://postgres.[ID_PROYECTO]:[TU_CONTRASEÑA]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# 2. Puerto en el que escuchará el servidor backend Express
PORT=3001

# 3. Contraseña o PIN secreto de acceso a la bóveda (¡Obligatorio para desbloquear la app!)
VAULT_PASSWORD="MiClaveSecreta123"

# 4. Clave de firma de tokens (Opcional: si la dejas vacía se genera automáticamente)
JWT_SECRET="una_clave_aleatoria_muy_larga_y_segura"
```

---

### 6. Poblar la Base de Datos con las Cartas (Seed Inicial)

Para descargar todas las cartas oficiales (+1.650 cartas) con sus imágenes, rarezas y habilidades directamente a tu Supabase:
```bash
cd backend
npm run seed
cd ..
```
*El script creará las tablas si aún no existían, descargará el catálogo de RiftHunt y guardará todo en tu base de datos.*

---

### 7. Ejecutar la Aplicación en tu PC

Dispones de varias formas para ponerla en marcha:

#### Opción 1: Un solo clic en Windows (Recomendada)
Haz doble clic sobre el archivo **`INICIAR.bat`** en la carpeta principal del proyecto.
* Cerrará automáticamente cualquier proceso bloqueado en los puertos `3001` y `5173`.
* Levantará el backend, el frontend y la ventana de escritorio de Electron.

#### Opción 2: Desde la terminal con Electron
```bash
npm run dev
```

#### Opción 3: Modo solo Navegador Web (sin Electron)
Si solo quieres probarla en Google Chrome, Edge o Firefox:
* **Terminal 1:** `npm run start:backend` (Backend activo en `http://localhost:3001`)
* **Terminal 2:** `npm run start:frontend` (Abre tu navegador en `http://localhost:5173`)

---

## 🌐 Despliegue en Vercel y GitHub

Puedes desplegar la aplicación en la nube para acceder a tu colección desde tu teléfono móvil o cualquier lugar con conexión a Internet:

### 1. Subir tu proyecto a GitHub
Si has creado tu propio fork o repositorio:
```bash
git add .
git commit -m "feat: setup project"
git push origin main
```
*(Nota: El archivo `.env` está en `.gitignore`, por lo que tus secretos nunca se subirán a GitHub).*

### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio de GitHub `RiftboundDB` y pulsa **Import**.
4. Vercel leerá automáticamente el archivo [`vercel.json`](vercel.json) de la raíz, que gestiona el enrutamiento del frontend y del backend Express.

### 3. Configurar Variables de Entorno en Vercel
Antes de pulsar *Deploy*, despliega la sección **Environment Variables** en la pantalla de configuración de Vercel y añade:

| Nombre de la Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[ID]:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres` | URL de conexión de Supabase (Puerto 6543) |
| `VAULT_PASSWORD` | `TuContraseñaSecreta` | El PIN o clave maestra con el que desbloquearás la app |
| `JWT_SECRET` | `clave_secreta_aleatoria` | Cadena aleatoria para firmar sesiones |

### 4. Desplegar
* Haz clic en **Deploy**.
* En un par de minutos, Vercel generará tu URL pública (ejemplo: `https://tu-proyecto.vercel.app`).
* ¡Listo! Entra desde tu teléfono o PC, introduce tu `VAULT_PASSWORD` y disfruta de tu colección sincronizada.

---

## 🔐 Variables de Entorno

Resumen completo de las variables soportadas por el sistema:

| Variable | Ámbito | ¿Obligatoria? | Descripción |
| :--- | :--- | :---: | :--- |
| `DATABASE_URL` | Backend / Vercel | **Sí** | Cadena de conexión PostgreSQL (preferiblemente Supabase Pooler puerto `6543` con SSL activado). |
| `VAULT_PASSWORD`| Backend / Vercel | **Sí** | Clave maestra o PIN para acceder a la bóveda privada. Si no se introduce la correcta, el servidor bloquea las peticiones. |
| `PORT` | Backend local | No | Puerto local del servidor Express (por defecto `3001`). |
| `JWT_SECRET` | Backend / Vercel | No | Llave criptográfica para emitir tokens de sesión seguros HMAC. Se autogenera si no se especifica. |
| `VITE_API_URL` | Frontend | No | Permite sobrescribir la URL de la API. Si se omite, se conecta a `http://localhost:3001/api` en desarrollo local y a `/api` en Vercel. |

---

## 📦 Compilación Desktop (.EXE Instalador Windows)

Para generar el instalador ejecutable independiente de Windows:
```bash
npm run build
```
El archivo de instalación `.exe` se creará dentro de la carpeta `dist-electron/` con el icono oficial de RiftBard.

---

## 🤝 Créditos y Atribuciones

* **Riftbound TCG**: Cartas, arte oficial y marcas registradas son propiedad de Riot Games.
* **RiftHunt API**: Agradecimientos a la comunidad de [RiftHunt](https://rifthunt.com) por proveer los endpoints bulk de datos de cartas.
* Desarrollado con 💛 por y para la comunidad de jugadores y coleccionistas de Riftbound.
