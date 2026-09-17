# KloppIA — Frontend

Frontend web de **KloppIA**, una plataforma para estudiantes que permite organizar materias, subir PDFs y obtener resúmenes automáticos generados con Gemini AI.

Autenticación delegada a **Azure Active Directory (Microsoft Entra ID)** mediante **MSAL** (Microsoft Authentication Library).

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Configuración](#3-configuración)
4. [Ejecución](#4-ejecución)
5. [Flujo de autenticación](#5-flujo-de-autenticación)
6. [Pruebas manuales](#6-pruebas-manuales)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Rutas de la aplicación](#8-rutas-de-la-aplicación)
9. [Tecnologías](#9-tecnologías)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

También necesitas:

- El **backend de KloppIA** corriendo (ver README del backend), accesible a través de AWS API Gateway o localmente.
- Una **App Registration en Azure AD** para el frontend (tipo SPA), con el redirect URI `http://localhost:5173` configurado.

---

## 2. Instalación

```bash
git clone <url-del-repo>
cd kloppia-frontend
npm install
```

Dependencias de autenticación (si no vienen ya en `package.json`):

```bash
npm install @azure/msal-browser @azure/msal-react
```

---

## 3. Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://<tu-api-gateway>.execute-api.us-east-1.amazonaws.com
```

Los datos de Azure AD (tenant ID, client ID, scope) se configuran en `src/context/msalConfig.js`:

```javascript
export const msalConfig = {
  auth: {
    clientId: "<client-id-de-kloppia-frontend>",
    authority: "https://login.microsoftonline.com/<tenant-id>",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["api://<client-id-de-la-api>/access_as_user"],
};
```

> Estos valores (`clientId`, `tenantId`, `scope`) son identificadores públicos, no secretos — es normal y esperado que viajen visibles en las solicitudes del navegador.

---

## 4. Ejecución

### Modo desarrollo

```bash
npm run dev
```

Disponible en `http://localhost:5173` con Hot Module Replacement (HMR).

### Build de producción

```bash
npm run build
npm run preview
```

### Linter

```bash
npm run lint
```

---

## 5. Flujo de autenticación

1. El usuario hace clic en **"Iniciar sesión"** en la Landing page.
2. Se invoca `instance.loginRedirect(loginRequest)` de MSAL, redirigiendo al usuario a la pantalla de login de Microsoft.
3. El usuario ingresa sus credenciales organizacionales y consiente el acceso.
4. Azure AD redirige de vuelta a la aplicación con un código de autorización, que MSAL intercambia automáticamente por un **access_token (JWT)**.
5. El token queda disponible en el almacenamiento de MSAL (localStorage) y la cuenta activa se establece automáticamente.
6. En cada solicitud HTTP hacia el backend, un **interceptor de Axios** (`src/services/api.js`) obtiene el token vigente mediante `acquireTokenSilent` y lo adjunta en el header `Authorization: Bearer <token>`.
7. Si la obtención silenciosa del token falla (por ejemplo, por expiración de sesión), el interceptor recurre a `acquireTokenRedirect` para renovar la autenticación de forma interactiva.
8. El rol del usuario (`ADMIN` / `USER`) se lee desde el claim `roles` de los `idTokenClaims` de la cuenta activa, y se usa para condicionar la interfaz según corresponda.
9. Al cerrar sesión, se invoca `instance.logoutRedirect()`, que limpia la sesión tanto en MSAL como en Azure AD.

> La gestión de usuarios (creación, asignación de roles) se realiza en el portal de **Azure AD → Enterprise Applications → Users and groups**, no desde esta aplicación. Por este motivo, el panel de administración de usuarios presente en versiones anteriores del proyecto fue retirado.

---

## 6. Pruebas manuales

### 6.1 Landing page

1. Abrir `http://localhost:5173`.
2. Verificar que se muestran la barra de navegación, la sección hero, las cards de features y el footer.
3. Hacer clic en **"Iniciar sesión"** → debe redirigir a la pantalla de login de Microsoft.

### 6.2 Inicio de sesión con Azure AD

1. Ingresar las credenciales de una cuenta organizacional autorizada en el tenant.
2. Completar el consentimiento de permisos si es la primera vez.
3. Verificar la redirección de vuelta a `/materias`, ya autenticado.
4. Recargar la página — el usuario debe seguir autenticado (persistencia de sesión vía localStorage).

### 6.3 Materias

> Requiere sesión iniciada. Acceder en `http://localhost:5173/materias`.

| Acción | Pasos | Resultado esperado |
|---|---|---|
| Crear materia | Completar nombre (y descripción opcional) → **+ Agregar** | La materia aparece en la grilla |
| Editar materia | Menú `⋮` → **Editar** → modificar → **Guardar cambios** | El nombre/descripción se actualiza |
| Eliminar materia | Menú `⋮` → **Eliminar** → confirmar | La materia desaparece de la grilla |
| Navegar a apuntes | Clic en la card de una materia | Redirige a `/materias/:id/apuntes` |
| Cerrar sesión | Menú de usuario → **Cerrar sesión** | Redirige a `/` y finaliza la sesión de Azure AD |

### 6.4 Apuntes y resúmenes IA

> Acceder desde una materia, en `http://localhost:5173/materias/:id/apuntes`.

| Acción | Pasos | Resultado esperado |
|---|---|---|
| Subir apunte | Ingresar título → seleccionar un PDF → **Subir** | Se muestra la animación de carga; al terminar, el apunte aparece en la lista |
| Ver resumen / flashcards / chat | Clic en el apunte | Redirige a la vista de estudio con el resumen generado por IA |
| Generar flashcards | Botón correspondiente en la vista de estudio | Se generan preguntas y respuestas a partir del resumen |
| Chat contextual | Escribir una pregunta sobre el apunte | El modelo responde en base al contenido resumido |
| Editar título | Menú `⋮` → **Editar título** → **Guardar cambios** | El título se actualiza |
| Eliminar apunte | Menú `⋮` → **Eliminar** → confirmar | El apunte desaparece de la lista |

### 6.5 Protección de rutas

| Escenario | Resultado esperado |
|---|---|
| Usuario no autenticado accede a `/materias` | Redirige a `/` |
| Usuario no autenticado accede a cualquier ruta de apuntes/estudio | Redirige a `/` |
| Ruta inexistente (ej. `/xyz`) | Redirige a `/` |

---

## 7. Estructura del proyecto

```
kloppia-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── context/
│   │   ├── AuthContext.jsx   # Wrapper sobre useMsal/useAccount (login, logout, user, rol)
│   │   └── msalConfig.js     # Configuración de MSAL (clientId, authority, scopes)
│   ├── pages/
│   │   ├── Landing.jsx / Landing.module.css
│   │   ├── Materias.jsx / Materias.module.css
│   │   ├── Apuntes.jsx / Apuntes.module.css
│   │   └── Estudio.jsx / Estudio.module.css   # Resumen, flashcards y chat
│   ├── services/
│   │   └── api.js            # Axios con interceptor que adjunta el token de MSAL
│   ├── App.jsx                # Router con rutas públicas y privadas
│   ├── main.jsx                # Monta MsalProvider + BrowserRouter + AuthProvider
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.js
├── .env                        # Variables de entorno (no subir al repo)
└── package.json
```

> **Nota:** las páginas `Login.jsx`, `Register.jsx` y `AdminPanel.jsx` de versiones anteriores del proyecto fueron eliminadas. El inicio de sesión ahora es exclusivamente a través de Azure AD (no existe registro propio ni login con email/contraseña), y la administración de usuarios se realiza desde el portal de Azure AD.

---

## 8. Rutas de la aplicación

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `Landing` | Público (incluye botón de inicio de sesión con Microsoft) |
| `/materias` | `Materias` | Autenticado |
| `/materias/:id/apuntes` | `Apuntes` | Autenticado |
| `/materias/:id/apuntes/:apunteId/estudio` | `Estudio` | Autenticado |
| `*` | — | Redirige a `/` |

---

## 9. Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| React | 19 | UI y gestión de estado local |
| React Router DOM | 7 | Navegación SPA y rutas protegidas |
| @azure/msal-browser | 5 | Cliente de autenticación contra Azure AD |
| @azure/msal-react | — | Hooks de integración de MSAL con React |
| Axios | 1 | Cliente HTTP con interceptor de token JWT |
| Vite | 8 | Bundler y servidor de desarrollo |
| CSS Modules | — | Estilos encapsulados por componente |
| oxlint | 1 | Linter de JavaScript/JSX |

---

## 📄 Licencia

© 2026 [gonzaloPalma22](https://github.com/gonzaloPalma22). Todos los derechos reservados.
