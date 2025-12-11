# GitHub MCP Serveiminar de 

Servidor MCP (Model Context Protocol) para operaciones de GitHub con autenticación integrada.

## Descripción

Este servidor MCP proporciona una interfaz completa para interactuar con GitHub a través de métodos estandarizados. Permite gestionar repositorios, archivos, issues, pull requests y workflows de GitHub, así como métodos utilitarios adicionales.

## Características

- ✅ **Gestión de Repositorios**: Listar repositorios del usuario autenticado
- ✅ **Gestión de Archivos**: Obtener, crear y actualizar archivos en repositorios
- ✅ **Issues**: Crear y listar issues de repositorios
- ✅ **Pull Requests**: Crear, listar y hacer merge de pull requests
- ✅ **Workflows**: Disparar workflows de GitHub Actions
- ✅ **Utilidades**: Codificación base64, timestamps e información del servidor
- ✅ **Autenticación Segura**: Basada en tokens de GitHub y variables de entorno

## Instalación

1. **Clonar o descargar el proyecto:**
   ```bash
   git clone <repository-url>
   cd github-mcp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus credenciales reales.

## Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto:

```env
# Autenticación MCP (requerido)
AUTH_ID=tu_auth_id_aqui
AUTH_TOKEN=tu_auth_token_aqui

# Token de GitHub (requerido)
GITHUB_TOKEN=ghp_tu_token_de_github_aqui
```

### Obtener Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Selecciona los permisos necesarios:
   - `repo` (acceso completo a repositorios)
   - `workflow` (para disparar workflows)
   - `admin:org` (opcional, para organizaciones)

## Uso

### Iniciar el Servidor

```bash
node server.js
```

El servidor estará disponible y listo para recibir peticiones MCP.

### Métodos Disponibles

#### Gestión de Repositorios

**Listar Repositorios**
```javascript
server.method("github.listRepos", {
  visibility: "all" // "all", "public", "private"
})
```

#### Gestión de Archivos

**Obtener Archivo**
```javascript
server.method("github.getFile", {
  owner: "usuario",
  repo: "repositorio", 
  path: "ruta/al/archivo.js",
  ref: "main" // opcional
})
```

**Crear Archivo**
```javascript
server.method("github.createFile", {
  owner: "usuario",
  repo: "repositorio",
  path: "nuevo/archivo.js",
  content: "console.log('Hola mundo');",
  message: "Agregar nuevo archivo",
  branch: "main" // opcional
})
```

**Actualizar Archivo**
```javascript
server.method("github.updateFile", {
  owner: "usuario",
  repo: "repositorio",
  path: "archivo/existente.js", 
  content: "contenido actualizado",
  message: "Actualizar archivo",
  branch: "main" // opcional
})
```

#### Gestión de Issues

**Crear Issue**
```javascript
server.method("github.createIssue", {
  owner: "usuario",
  repo: "repositorio",
  title: "Bug en la aplicación",
  body: "Descripción detallada del problema",
  labels: ["bug", "priority-high"] // opcional
})
```

**Listar Issues**
```javascript
server.method("github.listIssues", {
  owner: "usuario",
  repo: "repositorio",
  state: "open" // "open", "closed", "all"
})
```

#### Pull Requests

**Crear Pull Request**
```javascript
server.method("github.createPullRequest", {
  owner: "usuario",
  repo: "repositorio", 
  title: "Nueva funcionalidad",
  head: "rama-feature",
  base: "main",
  body: "Descripción de los cambios",
  draft: false // opcional
})
```

**Merge Pull Request**
```javascript
server.method("github.mergePullRequest", {
  owner: "usuario",
  repo: "repositorio",
  pull_number: 123,
  merge_method: "squash" // "merge", "squash", "rebase"
})
```

#### GitHub Actions

**Disparar Workflow**
```javascript
server.method("github.dispatchWorkflow", {
  owner: "usuario",
  repo: "repositorio",
  workflow_id: "ci.yml", // archivo del workflow
  ref: "main",
  inputs: {
    environment: "production"
  }
})
```

#### Utilidades

**Codificar Base64**
```javascript
server.method("utils.base64Encode", {
  text: "Hola mundo"
})
```

**Decodificar Base64**
```javascript
server.method("utils.base64Decode", {
  encoded: "SGFsYSBtdW5kbw=="
})
```

**Timestamp Actual**
```javascript
server.method("utils.timestamp", {})
```

**Información del Servidor**
```javascript
server.method("utils.serverInfo", {})
```

## Ejemplos de Respuesta

### Listar Repositorios
```json
[
  {
    "name": "mi-repo",
    "full_name": "usuario/mi-repo", 
    "private": false,
    "default_branch": "main",
    "html_url": "https://github.com/usuario/mi-repo",
    "description": "Mi repositorio",
    "language": "JavaScript",
    "stargazers_count": 5
  }
]
```

### Crear Archivo
```json
{
  "commitSha": "abc123...",
  "contentSha": "def456...", 
  "html_url": "https://github.com/usuario/repo/blob/main/archivo.js"
}
```

## Errores Comunes

### Variables de Entorno Faltantes
```
Error: Faltan credenciales de MCP - AUTH_ID y AUTH_TOKEN son requeridos en .env
```
**Solución**: Verifica que el archivo `.env` contenga todas las variables requeridas.

### Token de GitHub Inválido
```
Error: Error listando repositorios: Bad credentials
```
**Solución**: Verifica que el `GITHUB_TOKEN` sea válido y tenga los permisos necesarios.

### Archivo No Encontrado
```
Error: Error obteniendo archivo: Not Found
```
**Solución**: Verifica que la ruta del archivo sea correcta y que tengas acceso al repositorio.

## Dependencias

- `mcp`: Framework MCP (Model Context Protocol)
- `dotenv`: Gestión de variables de entorno
- `@octokit/rest`: Cliente oficial de GitHub para Node.js

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación API](API.md)
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Versión**: 1.0.0  
**Autor**: MCP Server Generator  
**Licencia**: MIT
