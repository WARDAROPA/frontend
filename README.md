<p align="center">
  <img src="frontend/src/assets/logo.png" alt="Wardaropa Logo" width="180"/>
</p>
<h1 align="center">Wardaropa</h1>
<p align="center">
  <strong>Tu red social de moda inteligente</strong><br/>
  Comparte looks, gestiona tu armario y prueba outfits con IA.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/n8n-Workflows-EA4B71?style=for-the-badge&logo=n8n&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</p>

---

## ¿Qué es Wardaropa?

**Wardaropa** es una red social de moda que combina la gestión personal del armario con inteligencia artificial. Los usuarios pueden publicar sus looks, descubrir tendencias, crear outfits y visualizar cómo les quedaría una combinación de ropa antes de vestirla, todo dentro de una misma plataforma.
Tambien pueden estar a la última con la mejor selección de noticias de moda! Y tambien abrir debates o consultas en el foro!
---

## Características principales

### 👗 Armario digital
- Sube prendas con foto y descripción.
- La IA genera automáticamente una descripción detallada de cada prenda (tejido, estilo, color, ocasión).
- Organiza tus prendas por tipo: camiseta, pantalón, zapatos y complementos.

### 👔 Gestión de outfits
- Crea outfits manuales combinando 4 prendas de tu armario.
- Genera outfits completos con IA a partir de una descripción o estado de ánimo.
- **Match IA**: la IA analiza tu armario y sugiere una puntuación sobre como combinaria esa prenda en tu armario.

### 🪞 Prueba de outfit virtual (Beta)
- Sube una foto de cuerpo entero y visualiza cómo te quedaría cualquier outfit.
- Pipeline de dos fases con Google Gemini:
  1. **Fase 1** — genera el outfit sobre tu cuerpo preservando pose y fondo.
  2. **Fase 2** — restaura tu identidad facial exacta sobre la imagen generada. (beta)

### 📰 Feed y noticias
- Publica posts con fotos y descripciones de tus prendas.
- Sección de noticias de moda con likes en tiempo real, seleccionadas de las mejores webs de moda y redactado para ti!.
- Una comunidad deseandote escuchar en el foro sobre tus consultas o novedades.


### 🔐 Autenticación segura
- Registro y login con JWT.
- Sesión persistente con interceptor HTTP automático.
- Validación de email y contraseña en cliente y servidor.

> Las funcionalidades desarolladas con n8n estan explicadas en el readme del backend :)
---

## Tecnologías

| Capa        | Tecnología                                              |
|-------------|--------------------------------------------------------|
| Frontend    | Angular 17 · Standalone Components · SCSS              |
| Backend     | Node.js · Express.js · mysql2                          |
| Base de datos | MySQL                                               |
| IA          | Google Gemini (gemini-2.5-flash · gemini-2.5-flash-image) |
| Automatización | n8n (workflows de generación y vision)            |
| Auth        | JSON Web Tokens (JWT)                                  |
| Deploy      | GitHub Pages (frontend) · VPS (backend)                |

---

## Estructura del proyecto

```
ECV/
├── frontend/          # Aplicación Angular 17
│   └── src/app/
│       ├── components/
│       │   ├── home/       # Feed principal de publicaciones
│       │   ├── noticias/   # Noticias de moda
│       │   ├── profile/    # Perfil · armario · outfits · try-on
│       │   ├── login/      # Inicio de sesión
│       │   ├── register/   # Registro de usuario
│       │   └── navbar/     # Navegación global
│       └── services/       # Auth · Posts · Noticias · WebSocket
└── backend/           # API REST con Express.js
    ├── server.js       # Rutas y lógica de negocio
    ├── database.js     # Conexión a MySQL
    └── n8n_nodes_IA/   # Workflows de n8n para IA
```

---

## Puesta en marcha

### Requisitos
- Node.js 20+
- MySQL
- n8n (para las funciones de IA)

### Backend

```bash
cd backend
cp .env.example .env   # Rellena tus credenciales
npm install
node server.js
```

Variables de entorno necesarias en `.env`:

```
DB_HOST=...
DB_USER=...
DB_PASS=...
DB_NAME=...
JWT_SECRET=...
GEMINI_API_KEY=...
N8N_OUTFIT_WEBHOOK_URL=...
N8N_OUTFIT_TRYON_WEBHOOK_URL=...
```

### Frontend

```bash
cd frontend
npm install
npm start
```

La app se abrirá en `http://localhost:4200`. Asegúrate de tener el backend corriendo primero.

---

## Workflows de n8n (IA)

Los workflows están en `backend/n8n_nodes_IA/`. Impórtalos directamente en tu instancia de n8n:

| Archivo | Función |
|---------|---------|
| `wardaropa_Scrap_and_post.json` | Scraping y publicación automática de noticias |
| `wardaropa_outfit_recommendation_ia.json` | Generación de outfits con IA desde texto libre |
| `wardaropa_outfit_tryon_ia.json` | Try-on virtual en dos fases con Gemini Vision |
| `wardaropa_generar_posts_demo.json` | Simula usuarios a tiempo real para testing de features de IA |
| `wardaropa_texto_ia_sql_n8m.json` | Genera descripción de un producto con Ia para abaratar costes|

---

## Demo

> Para aceptar el certificado primero se debe entrar a la web del backend aceptar certificado y posteriormente acceder a wardaropa en github pages, sino pueden haber errores.

🌐 **GitHub Pages:** [Ver Wardaropa](https://thepalms.github.io/ECV/frontend/)

🖥️ **Backend:** `https://4.233.184.106`

> Puedes registrar tu propia cuenta o usar las credenciales de prueba: `admin` / `admin`

---

<p align="center">
  Hecho con ❤️ por Gerard y Gorka Hernández
</p>
