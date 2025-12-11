# Documentación de API - GitHub MCP Server

Esta documentación describe en detalle todos los métodos disponibles en el servidor MCP de GitHub.

## Índice

- [Métodos de GitHub](#métodos-de-github)
  - [Listar Repositorios](#githublistrepos)
  - [Obtener Archivo](#githubgetfile)
  - [Crear Archivo](#githubcreatefile)
  - [Actualizar Archivo](#githubupdatefile)
  - [Crear Issue](#githubcreateissue)
  - [Listar Issues](#githublistissues)
  - [Crear Pull Request](#githubcreatepullrequest)
  - [Merge Pull Request](#githubmergepullrequest)
  - [Disparar Workflow](#githubdispatchworkflow)
- [Métodos Utilitarios](#métodos-utilitarios)
  - [Codificar Base64](#utilsbase64encode)
  - [Decodificar Base64](#utilsbase64decode)
  - [Timestamp](#utilstimestamp)
  - [Información del Servidor](#utilsserverinfo)

---

## Métodos de GitHub

### github.listRepos

Lista los repositorios del usuario autenticado.

#### Parámetros

| Parámetro | Tipo | Requerido | Valor por Defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| `visibility` | string | No | `"all"` | Visibilidad de repositorios (`"all"`, `"public"`, `"private"`) |

#### Respuesta

```json
[
  {
    "name": "string",
    "full_name": "string", 
    "private": boolean,
    "default_branch": "string",
    "html_url": "string",
    "description": "string",
    "language": "string",
    "stargazers_count": number
  }
]
```

#### Ejemplo

```javascript
// Listar todos los repositorios
await server.method("github.listRepos", {})

// Listar solo repositorios públicos
await server.method("github.listRepos", { visibility: "public" })
```

#### Errores Comunes

- `Error listando repositorios`: Token inválido o sin permisos

---

### github.getFile

Obtiene el contenido de un archivo específico de un repositorio.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `path` | string | Sí | Ruta del archivo |
| `ref` | string | No | Rama o commit (por defecto: rama por defecto) |

#### Respuesta

```json
{
  "path": "string",
  "sha": "string",
  "content": "string",
  "size": number,
  "encoding": "string",
  "type": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.getFile", {
  owner: "octocat",
  repo: "Hello-World", 
  path: "README.md",
  ref: "main"
})
```

#### Errores Comunes

- `Error obteniendo archivo: Not Found`: Archivo no existe
- `Error obteniendo archivo: Bad credentials`: Token inválido

---

### github.createFile

Crea un nuevo archivo en un repositorio.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `path` | string | Sí | Ruta del nuevo archivo |
| `content` | string | Sí | Contenido del archivo |
| `message` | string | No | Mensaje del commit (por defecto: `"create {path}"`) |
| `branch` | string | No | Rama donde crear el archivo |

#### Respuesta

```json
{
  "commitSha": "string",
  "contentSha": "string",
  "html_url": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.createFile", {
  owner: "octocat",
  repo: "Hello-World",
  path: "nuevo-archivo.js",
  content: "console.log('Hola mundo');",
  message: "Agregar nuevo archivo JavaScript"
})
```

#### Errores Comunes

- `Error creando archivo: Bad credentials`: Sin permisos para escribir
- `Error creando archivo: File already exists`: El archivo ya existe (usar `updateFile`)

---

### github.updateFile

Actualiza un archivo existente en un repositorio.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `path` | string | Sí | Ruta del archivo a actualizar |
| `content` | string | Sí | Nuevo contenido del archivo |
| `message` | string | No | Mensaje del commit (por defecto: `"update {path}"`) |
| `branch` | string | No | Rama donde actualizar el archivo |

#### Respuesta

```json
{
  "commitSha": "string",
  "contentSha": "string", 
  "html_url": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.updateFile", {
  owner: "octocat",
  repo: "Hello-World",
  path: "README.md",
  content: "# Nuevo contenido actualizado",
  message: "Actualizar README con nueva información"
})
```

#### Errores Comunes

- `Error actualizando archivo: Not Found`: El archivo no existe
- `Error actualizando archivo: Bad credentials`: Sin permisos para escribir

---

### github.createIssue

Crea un nuevo issue en un repositorio.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `title` | string | Sí | Título del issue |
| `body` | string | No | Descripción del issue |
| `labels` | array | No | Lista de etiquetas |

#### Respuesta

```json
{
  "number": number,
  "url": "string",
  "title": "string",
  "state": "string",
  "created_at": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.createIssue", {
  owner: "octocat",
  repo: "Hello-World",
  title: "Bug en la funcionalidad X",
  body: "Descripción detallada del problema encontrado",
  labels: ["bug", "priority-high"]
})
```

#### Errores Comunes

- `Error creando issue: Bad credentials`: Sin permisos para crear issues

---

### github.listIssues

Lista los issues de un repositorio.

#### Parámetros

| Parámetro | Tipo | Requerido | Valor por Defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| `owner` | string | Sí | - | Propietario del repositorio |
| `repo` | string | Sí | - | Nombre del repositorio |
| `state` | string | No | `"open"` | Estado de issues (`"open"`, `"closed"`, `"all"`) |

#### Respuesta

```json
[
  {
    "number": number,
    "title": "string",
    "state": "string",
    "url": "string",
    "author": "string",
    "created_at": "string",
    "labels": ["string"]
  }
]
```

#### Ejemplo

```javascript
await server.method("github.listIssues", {
  owner: "octocat",
  repo: "Hello-World",
  state: "open"
})
```

#### Errores Comunes

- `Error listando issues: Bad credentials`: Token inválido

---

### github.createPullRequest

Crea un nuevo pull request.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `title` | string | Sí | Título del pull request |
| `head` | string | Sí | Rama fuente (rama con cambios) |
| `base` | string | Sí | Rama objetivo (rama base) |
| `body` | string | No | Descripción del pull request |
| `draft` | boolean | No | Si es un borrador |

#### Respuesta

```json
{
  "number": number,
  "url": "string",
  "title": "string",
  "state": "string",
  "draft": boolean,
  "author": "string",
  "created_at": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.createPullRequest", {
  owner: "octocat",
  repo: "Hello-World",
  title: "Nueva funcionalidad de búsqueda",
  head: "feature-search",
  base: "main",
  body: "Implementa funcionalidad de búsqueda avanzada"
})
```

#### Errores Comunes

- `Error creando Pull Request: Bad credentials`: Sin permisos para crear PRs
- `Error creando Pull Request: Reference does not exist`: Rama fuente no existe

---

### github.mergePullRequest

Hace merge de un pull request.

#### Parámetros

| Parámetro | Tipo | Requerido | Valor por Defecto | Descripción |
|-----------|------|-----------|-------------------|-------------|
| `owner` | string | Sí | - | Propietario del repositorio |
| `repo` | string | Sí | - | Nombre del repositorio |
| `pull_number` | number | Sí | - | Número del pull request |
| `merge_method` | string | No | `"squash"` | Método de merge (`"merge"`, `"squash"`, `"rebase"`) |

#### Respuesta

```json
{
  "merged": boolean,
  "sha": "string",
  "message": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.mergePullRequest", {
  owner: "octocat",
  repo: "Hello-World",
  pull_number: 42,
  merge_method: "squash"
})
```

#### Errores Comunes

- `Error haciendo merge del Pull Request: Pull request not mergeable`: PR no puede ser mergeado
- `Error haciendo merge del Pull Request: Not Found`: PR no existe

---

### github.dispatchWorkflow

Dispara manualmente un workflow de GitHub Actions.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Propietario del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `workflow_id` | string | Sí | ID o nombre del archivo del workflow |
| `ref` | string | Sí | Rama o commit donde ejecutar |
| `inputs` | object | No | Inputs para el workflow |

#### Respuesta

```json
{
  "ok": boolean,
  "message": "string"
}
```

#### Ejemplo

```javascript
await server.method("github.dispatchWorkflow", {
  owner: "octocat",
  repo: "Hello-World",
  workflow_id: "ci.yml",
  ref: "main",
  inputs: {
    environment: "production",
    version: "1.2.3"
  }
})
```

#### Errores Comunes

- `Error disparando workflow: Bad credentials`: Sin permisos para workflows
- `Error disparando workflow: Workflow not found`: Workflow no existe

---

## Métodos Utilitarios

### utils.base64Encode

Codifica texto a base64.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `text` | string | Sí | Texto a codificar |

#### Respuesta

```json
{
  "encoded": "string"
}
```

#### Ejemplo

```javascript
await server.method("utils.base64Encode", {
  text: "Hola mundo"
})
// Respuesta: { "encoded": "SGFsYSBtdW5kbw==" }
```

---

### utils.base64Decode

Decodifica texto desde base64.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `encoded` | string | Sí | Texto codificado en base64 |

#### Respuesta

```json
{
  "text": "string"
}
```

#### Ejemplo

```javascript
await server.method("utils.base64Decode", {
  encoded: "SGFsYSBtdW5kbw=="
})
// Respuesta: { "text": "Hola mundo" }
```

---

### utils.timestamp

Obtiene el timestamp actual en diferentes formatos.

#### Parámetros

No requiere parámetros.

#### Respuesta

```json
{
  "timestamp": number,
  "iso": "string",
  "utc": "string"
}
```

#### Ejemplo

```javascript
await server.method("utils.timestamp", {})
// Respuesta: {
//   "timestamp": 1640995200000,
//   "iso": "2022-01-01T00:00:00.000Z",
//   "utc": "Sat, 01 Jan 2022 00:00:00 GMT"
// }
```

---

### utils.serverInfo

Obtiene información del servidor y métodos disponibles.

#### Parámetros

No requiere parámetros.

#### Respuesta

```json
{
  "name": "string",
  "version": "string", 
  "description": "string",
  "authEnabled": boolean,
  "availableMethods": ["string"]
}
```

#### Ejemplo

```javascript
await server.method("utils.serverInfo", {})
// Respuesta: {
//   "name": "mcp-github-server",
//   "version": "1.0.0",
//   "description": "Servidor MCP para operaciones de GitHub",
//   "authEnabled": true,
//   "availableMethods": ["github.listRepos", ...]
// }
```

---

## Manejo de Errores

Todos los métodos pueden generar errores con el siguiente formato:

```json
{
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE"
  }
}
```

### Códigos de Error Comunes

- `MISSING_PARAMS`: Parámetros requeridos faltantes
- `INVALID_TOKEN`: Token de autenticación inválido
- `PERMISSION_DENIED`: Sin permisos para la operación
- `RESOURCE_NOT_FOUND`: Recurso no encontrado
- `NETWORK_ERROR`: Error de conectividad con GitHub

---

## Límites de Rate

GitHub API tiene límites de rate que pueden afectar las operaciones:

- **Autenticado**: 5,000 requests por hora
- **Sin autenticación**: 60 requests por hora

Para operaciones masivas, considera implementar delays entre requests.

---

## Mejores Prácticas

1. **Manejo de Errores**: Siempre maneja errores en las respuestas
2. **Validación**: Valida parámetros antes de hacer requests
3. **Rate Limiting**: Implementa delays para evitar límites
4. **Logs**: Registra operaciones importantes
5. **Seguridad**: Nunca expongas tokens en logs o respuestas

---

**Última actualización**: v1.0.0  
**Autor**: GitHub MCP Server
