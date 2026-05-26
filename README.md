# Dialektica

PWA en HTML, CSS y JavaScript (sin framework). Incluye onboarding, creador de avatar, home con módulos mock y navegación por pantallas.

## Requisitos

- Un navegador moderno (Chrome, Firefox, Safari, Edge).
- **Servidor HTTP local.** No abras `index.html` con doble clic: los módulos ES y la carga de SVG (`fetch` en `assets/hair/`) fallan con el protocolo `file://`.

No hace falta instalar dependencias del proyecto (no hay `package.json`). Solo necesitas Node o Python si usas uno de los servidores sugeridos abajo.

## Cómo ejecutar

Desde la raíz del repositorio:

```bash
cd /ruta/a/dialekttica
npx serve .
```

Abre la URL que imprime la terminal (por ejemplo `http://localhost:3000`).

### Alternativas

**Python 3:**

```bash
python3 -m http.server 8080
```

→ `http://localhost:8080`

**Live Server (Cursor / VS Code):** clic derecho en `index.html` → *Open with Live Server*.

### PWA / service worker

En `app.js` se registra `sw.js`. En local funciona igual; para probar “instalable” conviene HTTPS o `localhost`.

---

## Flujo normal (sin modo dev)

1. **Splash** (~2 s) → **Login**.
2. **Login:** cualquier usuario y contraseña no vacíos → entra directo a **Home** (auth mock, sin backend).
3. **Registro:** formulario completo y contraseñas iguales → **Test** (5 preguntas) → **Editar perfil** → **Finalizar** → **Home**.
4. **Editar perfil:** avatar, formulario; enlace *realizar test* para repetir el test.
5. **Crear personaje:** pestañas Piel, Cabello, Rostro, Color ropa. El avatar se guarda en `localStorage` (`dialektica_avatar`).
6. **App:** barra inferior — Ajustes, Chats, Home, Perfil. Desde Home: Tareas, Foro, Artículos, Libreta, Simulador, Seguimiento.
7. **Libreta:** notas en `localStorage` (`dialektica-notebook`); datos iniciales en `data.js` si no hay guardado.

Los chats, amigos, artículos y tareas son **datos mock** en `data.js`.

### Demo / presentación (sin backend)

Puedes usar **cualquier texto** en los formularios; no hay API ni validación de credenciales reales.

| Paso | Qué exige la app |
|------|------------------|
| **Login** | Usuario y contraseña con al menos un carácter (cualquier valor). |
| **Registro** | Todos los campos con texto; **contraseña = confirmar contraseña** (única regla extra). |
| **Test** | Elegir una opción por pregunta antes de **Siguiente**. |
| **Editar perfil** | **Finalizar** sin validar campos (pueden ir vacíos). |
| **Resto de la app** | Datos mock; libreta y avatar se guardan en `localStorage` del dispositivo. |

Atajo para saltar pantallas en la review: `?dev` (ver abajo).

---

## Desplegar en Vercel

Proyecto **estático** (sin build). Vercel sirve los archivos tal cual.

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repositorio.
3. Deja **Framework Preset: Other** y **Build Command** vacío; **Output Directory** en blanco (raíz).
4. Deploy. Obtendrás una URL `https://tu-proyecto.vercel.app`.

### Instalar en el móvil (PWA)

1. Abre la URL de Vercel en **Chrome (Android)** o **Safari (iOS)**.
2. **Android:** menú ⋮ → *Instalar aplicación* / *Añadir a pantalla de inicio*.
3. **iOS:** botón compartir → *Añadir a pantalla de inicio*.

Requiere HTTPS (Vercel ya lo incluye). Los iconos están en `icons/` y el manifiesto en `manifest.json`.

### Variables de entorno

No son necesarias para esta versión demo.

---

## Modo de pruebas (dev)

Activa un menú flotante para saltar a cualquier pantalla sin recorrer el onboarding.

### Activar

Añade el parámetro `dev` a la URL:

```
http://localhost:3000/?dev
```

(o el puerto que uses: `http://localhost:8080/?dev`)

Verás la etiqueta **DEV** arriba a la derecha y el botón **＋** abajo a la derecha.

### Uso

1. Pulsa **＋** para abrir el panel.
2. Elige una pantalla:
   - **Auth:** Splash, Login, Register.
   - **Profile:** Editar perfil, Crear personaje.
   - **Test:** salta al test en la pregunta 1–5.
   - **App:** Home, Tareas, Libreta, Foro, Artículos, Chats, Perfil, Ajustes, Seguimiento, Simulador.

Las pantallas con barra inferior (Home, Chats, Perfil, Ajustes) usan `enterApp()` para mostrar también la navegación correcta.

### Implementación

- Solo se carga si la URL tiene `?dev` (`app.js` importa `dev.js` de forma dinámica).
- `dev.js` no debe usarse en producción; es navegación rápida para diseño y QA.

### Probar el creador de avatar

1. Abre `/?dev`.
2. En el menú dev → **Crear personaje**.
3. Cambia pestañas y opciones; recarga la página para comprobar persistencia en `localStorage`.

---

## Estructura del proyecto

| Archivo / carpeta | Rol |
|-------------------|-----|
| `index.html` | Pantallas y markup |
| `styles.css` | Estilos globales |
| `app.js` | Splash, auth mock, test de onboarding, arranque |
| `router.js` | Navegación app, listas, home, chats |
| `profile.js` | Estado del avatar, perfil, creador |
| `creator-preview.js` | Vista previa compuesta (círculo + peinado + rostro) |
| `hair-styles.js` | SVG de peinados, colores, alineación |
| `avatar.js` | Frame 4, paletas, rostros vectoriales |
| `data.js` | Datos mock |
| `notebook.js` | Libreta + `localStorage` |
| `dev.js` | Overlay de desarrollo (`?dev`) |
| `assets/hair/` | SVG de peinados |
| `assets/avatar/` | Frame base del perfil |
| `manifest.json`, `sw.js` | PWA |

---

## Depuración

- **Consola del navegador:** login, registro y test completado hacen `console.log` (sin API real).
- **Borrar estado local:** DevTools → Application → Local Storage → eliminar `dialektica_avatar` y/o `dialektica-notebook`.
- **Avatar no se ve en Cabello:** confirma que la app va por HTTP, no por `file://`.

---

## Licencia

Consulta el repositorio o los mantenedores del proyecto para términos de uso.
