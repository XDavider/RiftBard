<p align="center">
  <img src="riftbard.png" width="140" alt="RiftBard Logo" />
</p>

<h1 align="center">RiftBard - Caretaker's Vault & TCG Deck Builder</h1>

<p align="center">
  <strong>La plataforma integral para coleccionistas y constructores de mazos de Riftbound TCG.</strong><br>
  Ejecútala como aplicación de escritorio nativa en tu PC o despliégala en la nube como página web 24/7 accesible desde móvil o cualquier dispositivo.
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

---

## 📌 Índice de Navegación Rápida

| Sección | Descripción | Acceso Directo |
| :--- | :--- | :---: |
| 🖥️ **Capturas de PC** | Interfaz panorámica en escritorio, catálogo, filtros avanzados y deck builder | [Ir a Capturas PC](#capturas-pc) |
| 📱 **Capturas de Móvil** | Vistas responsive en smartphone: bóveda, catálogo, filtros y cotizaciones | [Ir a Capturas Móvil](#capturas-movil) |
| 💻 **Instalar como App en PC** | Guía paso a paso para clonar, configurar y ejecutar en tu ordenador | [Ir a Guía App PC](#instalar-pc) |
| 🌐 **Hostear como Web (PC y Móvil)** | Cómo desplegar tu propia web 24/7 con Vercel y GitHub para acceder desde cualquier sitio | [Ir a Guía Web](#hostear-web) |
| 🗄️ **Configuración de Supabase** | Creación de la base de datos PostgreSQL, Transaction Pooler (puerto 6543) y esquema | [Ir a Supabase](#supabase) |
| 🔐 **Variables de Entorno** | Tabla descriptiva de todas las variables requeridas (`DATABASE_URL`, `VAULT_PASSWORD`, etc.) | [Ir a Variables](#variables-entorno) |
| 📦 **Compilar Instalador .EXE** | Instrucciones para empaquetar un archivo instalador `.exe` independiente para Windows | [Ir a Compilar .EXE](#compilar-exe) |

---

<span id="capturas-pc"></span>
## 🖥️ Capturas de PC (Modo Escritorio)

### 1. Catálogo Completo y Dashboard de Colección
> Visualización en cuadrícula responsiva con estadísticas de cartas normales y foil, barra de búsqueda en vivo, zoom de columnas y distintivo de Bardo.
<p align="center">
  <img src="docs/screenshots/pc-catalog.png" width="100%" alt="Catálogo RiftBard PC" />
</p>

### 2. Panel Lateral de Filtros Multicriterio
> Filtrado exhaustivo por rarezas, tipos de carta, dominios elementales, coste de energía, expansiones oficiales (*Radiance*, *Vendetta*, *Origins*, etc.) y ordenación personalizada.
<p align="center">
  <img src="docs/screenshots/pc-filters.png" width="100%" alt="Filtros Avanzados PC" />
</p>

### 3. Gestor de Mazos (Deck Manager)
> Vista general de mazos guardados, cartas que los componen, acceso directo para crear, importar desde código/CSV y comparar estrategias.
<p align="center">
  <img src="docs/screenshots/pc-deck-manager.png" width="100%" alt="Gestor de Mazos PC" />
</p>

### 4. Constructor y Editor de Mazos (Deck Builder)
> Validación de reglas de torneo (40 cartas principales, Leyenda, Campeón coincidente, Runas, Banquillo) y curva de coste de energía interactiva en tiempo real.
<p align="center">
  <img src="docs/screenshots/pc-deck-builder.png" width="100%" alt="Deck Builder PC" />
</p>

---

<span id="capturas-movil"></span>
## 📱 Capturas de Móvil (Diseño Responsive)

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
</p>
<p align="center">
  <em>(De izq. a der.: Gestor de Mazos • Catálogo de Cartas • Cajón de Filtros • Bóveda Protegida • Detalle de Carta con Cotización Cardmarket)</em>
</p>

---

## ⚡ Características Principales

* 🔒 **Bóveda Protegida (Caretaker's Vault Security):**
  * Pantalla de acceso custodiada con PIN o contraseña maestra.
  * Autenticación HMAC criptográfica basada en tokens de sesión seguros con expiración automática.
  * Sin contraseñas genéricas ni fallbacks inseguros: si no se introduce la clave, el acceso queda 100% bloqueado.
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

<span id="instalar-pc"></span>
## 💻 Instalar y Ejecutar como App en el PC

Sigue estos sencillos pasos para tener la aplicación funcionando como programa en tu propio ordenador:

### 1. Requisitos Previos
* Instalar **[Node.js](https://nodejs.org/)** (versión 18 LTS o 20 LTS recomendada).
* Instalar **[Git](https://git-scm.com/)**.
* Disponer de una base de datos PostgreSQL (recomendamos el plan gratuito de **[Supabase](https://supabase.com/)**).

---

### 2. Clonar el Repositorio
Abre tu terminal (PowerShell, CMD o Git Bash) y clona el proyecto:
```bash
git clone https://github.com/XDavider/RiftBard.git
cd RiftBard
```

---

### 3. Instalar Dependencias
Instala los paquetes necesarios en la raíz, frontend y backend:
```bash
# 1. Dependencias del orquestador y Electron
npm install

# 2. Dependencias del frontend
cd frontend
npm install
cd ..

# 3. Dependencias del backend
cd backend
npm install
cd ..
```

---

<span id="supabase"></span>
### 4. Configuración de Supabase (Base de Datos)

1. **Crear tu proyecto en Supabase:**
   * Entra en [supabase.com](https://supabase.com/) e inicia sesión.
   * Haz clic en **"New project"**.
   * Asigna un nombre a tu proyecto (ej: `riftbard-vault`).
   * **Contraseña de la Base de Datos:** Establece una contraseña segura.
     > 💡 **Consejo de seguridad:** Utiliza caracteres alfanuméricos sencillos (letras y números, ej. `MiPasswordBardo2026`). Evita caracteres especiales como `@`, `:`, `#` o `?`, ya que pueden interferir con el formato de la URL de conexión.

2. **Obtener la Connection String (Transaction Pooler - Puerto 6543):**
   * En el menú lateral izquierdo de Supabase, ve a **Project Settings** (el icono de engranaje) > **Database**.
   * Baja hasta la sección **Connection parameters** o **Connection string**.
   * Selecciona la pestaña **URI** y marca la casilla **Use connection pooling** (Transaction Pooler).
   * **Asegúrate de que el puerto sea `6543`** (ej: `aws-0-eu-west-1.pooler.supabase.com:6543`).
   * Copia esa URL completa. Tendrá una estructura similar a:
     ```text
     postgresql://postgres.[ID_PROYECTO]:[TU_CONTRASEÑA]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

3. **Crear las tablas en Supabase:**
   * Tienes dos métodos sencillos:
     * **Automático:** Al ejecutar el comando de *seed* (paso 6), el script verificará y creará las tablas automáticamente.
     * **Manual:** En Supabase, abre **SQL Editor**, pulsa **New Query**, pega el contenido de [`backend/schema.sql`](backend/schema.sql) y pulsa **Run**.

---

### 5. Configurar las Variables de Entorno en Local

Crea un archivo llamado `.env` dentro de la carpeta `backend/` (puedes duplicar `backend/.env.example` y renombrarlo a `.env`).

Edita `backend/.env` con tus datos:
```env
# 1. Cadena de conexión de Supabase (Transaction Pooler - puerto 6543)
DATABASE_URL="postgresql://postgres.[ID_PROYECTO]:[TU_CONTRASEÑA]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# 2. Puerto local del servidor backend Express
PORT=3001

# 3. Contraseña maestra o PIN de acceso a la bóveda (¡Obligatoria para acceder a la app!)
VAULT_PASSWORD="MiClaveSecreta123"

# 4. Clave de firma de tokens (Opcional: si se omite, se genera automáticamente)
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

---

### 7. Ejecutar la Aplicación en tu PC

Dispones de varias formas para ponerla en marcha:

#### Opción A: Un solo clic en Windows (Recomendada)
Haz doble clic sobre el archivo **`INICIAR.bat`** en la carpeta principal del proyecto.
* Cerrará automáticamente cualquier proceso bloqueado en los puertos `3001` y `5173`.
* Levantará el backend, el frontend y la ventana de escritorio de Electron automáticamente.

#### Opción B: Desde la terminal con Electron
```bash
npm run dev
```

#### Opción C: Modo Navegador Web (sin Electron)
Si deseas usarla directamente en Google Chrome, Edge o Firefox:
* **Terminal 1:** `npm run start:backend` (Backend activo en `http://localhost:3001`)
* **Terminal 2:** `npm run start:frontend` (Abre tu navegador en `http://localhost:5173`)

---

<span id="hostear-web"></span>
## 🌐 Hostear como Página Web (Acceso desde PC y Móvil)

Puedes alojar la aplicación completamente gratis en la nube para acceder a tu colección y mazos desde tu teléfono móvil, tablet o cualquier ordenador sin necesidad de tener tu PC encendido:

### 1. Subir tu proyecto a GitHub
Si has creado tu propio fork o repositorio:
```bash
git add .
git commit -m "feat: setup RiftBard cloud deployment"
git push origin main
```
*(Nota: El archivo `.env` está protegido en `.gitignore`, por lo que tus contraseñas nunca se subirán a GitHub).*

### 2. Conectar tu repositorio con Vercel
1. Entra en [vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en el botón **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio de GitHub `RiftBard` (o `RiftboundDB`) y pulsa **Import**.
4. Vercel detectará automáticamente el archivo [`vercel.json`](vercel.json) de la raíz, que configura tanto el frontend en Vite como el backend en Express sin pasos extra.

### 3. Configurar las Variables de Entorno en Vercel
Antes de pulsar el botón *Deploy*, despliega la sección **Environment Variables** en Vercel y añade:

| Nombre de la Variable | Valor Ejemplo | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[ID]:[PASS]@aws-0-...pooler.supabase.com:6543/postgres` | URL de Supabase (Puerto 6543) |
| `VAULT_PASSWORD` | `MiClaveSecreta123` | El PIN o clave maestra con el que desbloquearás la app |
| `JWT_SECRET` | `clave_secreta_aleatoria_segura` | Cadena aleatoria para firmar sesiones |

### 4. Desplegar y Disfrutar
* Haz clic en **Deploy**.
* En menos de dos minutos, Vercel generará tu enlace público (por ejemplo: `https://tu-proyecto.vercel.app`).
* Abre ese enlace desde el navegador de tu móvil o PC, introduce tu `VAULT_PASSWORD` y ya tendrás tu bóveda sincronizada en tiempo real.

---

<span id="variables-entorno"></span>
## 🔐 Variables de Entorno

Resumen completo de las variables soportadas por el sistema:

| Variable | Ámbito | ¿Obligatoria? | Descripción |
| :--- | :--- | :---: | :--- |
| `DATABASE_URL` | Backend / Vercel | **Sí** | Cadena de conexión PostgreSQL (recomendado Supabase Pooler puerto `6543` con SSL activado). |
| `VAULT_PASSWORD`| Backend / Vercel | **Sí** | Clave maestra o PIN para acceder a la bóveda privada. Si no se introduce la correcta, el servidor bloquea las peticiones. |
| `PORT` | Backend local | No | Puerto local del servidor Express (por defecto `3001`). |
| `JWT_SECRET` | Backend / Vercel | No | Llave criptográfica para emitir tokens de sesión seguros HMAC. Se autogenera si no se especifica. |
| `VITE_API_URL` | Frontend | No | Permite sobrescribir la URL de la API. Si se omite, se conecta a `http://localhost:3001/api` en desarrollo local y a `/api` en Vercel. |

---

<span id="compilar-exe"></span>
## 📦 Compilación Desktop (.EXE Instalador Windows)

Para generar el instalador ejecutable independiente de Windows con el nuevo icono oficial:
```bash
npm run build
```
El instalador `.exe` resultante se generará en la carpeta `dist-electron/`.

---

## 🤝 Créditos y Atribuciones

* **Riftbound TCG**: Cartas, arte oficial y marcas registradas son propiedad de Riot Games.
* **RiftHunt API**: Agradecimientos a la comunidad de [RiftHunt](https://rifthunt.com) por proveer los endpoints bulk de datos de cartas.
* Desarrollado con 💛 por y para la comunidad de jugadores y coleccionistas de Riftbound.
