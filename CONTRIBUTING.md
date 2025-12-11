# Guía de Contribución - GitHub MCP Server

¡Gracias por tu interés en contribuir al GitHub MCP Server! Esta guía te ayudará a empezar.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Proceso de Pull Request](#proceso-de-pull-request)

## Código de Conducta

Este proyecto y todos los participantes se rigen por el [Código de Conducta del Contributor Covenant](https://www.contributor-covenant.org/). Al participar, se espera que mantengas este código.

## Cómo Contribuir

Hay muchas formas de contribuir al proyecto:

- 🐛 **Reportar bugs**: Abre un issue con detalles del problema
- 💡 **Sugerir mejoras**: Propón nuevas funcionalidades o mejoras
- 📚 **Mejorar documentación**: Corrige, amplía o traduce documentación
- 🔧 **Contribuir código**: Implementa fixes o nuevas funcionalidades
- 🧪 **Testing**: Ayuda a probar el proyecto y crear casos de prueba

## Configuración del Entorno de Desarrollo

### Prerrequisitos

- Node.js 16+ 
- npm o yarn
- Cuenta de GitHub para testing

### Instalación

1. **Fork del repositorio**
   ```bash
   # Clona tu fork
   git clone https://github.com/tu-usuario/github-mcp.git
   cd github-mcp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de testing
   ```

4. **Verificar instalación**
   ```bash
   node server.js
   ```

## Estructura del Proyecto

```
github-mcp/
├── server.js              # Servidor MCP principal
├── package.json           # Dependencias y scripts
├── README.md             # Documentación principal
├── API.md                # Documentación de API
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Archivos ignorados por git
├── CONTRIBUTING.md       # Esta guía
└── LICENSE               # Licencia MIT
```

### Archivos Clave

- **server.js**: Contiene toda la lógica del servidor y métodos MCP
- **package.json**: Define dependencias y scripts npm
- **.env.example**: Plantilla para configuración de variables de entorno

## Estándares de Código

### Estilo de Código

- **Indentación**: 2 espacios
- **Lenguaje**: JavaScript ES6+ modules
- **Comillas**: Comillas simples para strings
- **Semicolons**: Siempre incluir punto y coma

### Ejemplo de Código

```javascript
// ✅ Bueno
const createFile = async (params) => {
  const { owner, repo, path, content } = params;
  
  if (!owner || !repo || !path || !content) {
    throw new Error("owner, repo, path y content son requeridos");
  }
  
  try {
    // Lógica del método
    return result;
  } catch (error) {
    throw new Error(`Error creando archivo: ${error.message}`);
  }
};

// ❌ Malo
const createFile = async (params)=>{
  if(!owner||!repo||!path||!content)throw new Error("faltan params")
  try{
    return result
  }catch(error){throw new Error(`Error: ${error.message}`)}
}
```

### Convenciones de Nombres

- **Métodos MCP**: `camelCase` con prefijo del módulo
  - `github.listRepos`
  - `utils.timestamp`
- **Variables**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Clases**: `PascalCase`

### Comentarios

```javascript
// ✅ Bueno: Comentarios descriptivos y en español
// Obtiene el contenido de un archivo desde GitHub
// Maneja diferentes tipos de contenido (archivos, directorios)
const getFile = async (params) => {
  // Validación de parámetros
  if (!owner || !repo || !path) {
    throw new Error("owner, repo y path son requeridos");
  }
  
  // Lógica del método...
};

// ❌ Malo: Comentarios obvios o en inglés inconsistente
// Get file from repo
const getFile = async (params) => {
  // Check params
  if (!owner || !repo || !path) {
    throw new Error("missing params");
  }
};
```

## Testing

### Configurar Testing

1. **Crear token de testing**
   - Crea un token de GitHub para testing (permisos mínimos)
   - Úsalo en el archivo `.env` de testing

2. **Probar métodos individualmente**
   ```bash
   # Inicia el servidor
   node server.js
   
   # En otra terminal, prueba métodos específicos
   # Usa tu cliente MCP preferido para testing
   ```

### Casos de Prueba Importantes

- **Manejo de errores**: Parámetros faltantes, tokens inválidos
- **Autenticación**: Verificar que sin token no funciona
- **Operaciones válidas**: Crear, leer, actualizar archivos
- **Límites de GitHub**: Rate limiting, límites de API

### Ejemplo de Test

```javascript
// Test básico de conexión
const testConnection = async () => {
  try {
    const result = await server.method("github.listRepos", {});
    console.log("✅ Conexión exitosa:", result.length, "repositorios");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
};
```

## Documentación

### Actualizar Documentación

Cuando agregues o modifiques funcionalidades:

1. **Actualiza README.md** si cambia la funcionalidad principal
2. **Actualiza API.md** para nuevos métodos o parámetros
3. **Agrega ejemplos** para nuevas funcionalidades
4. **Incluye troubleshooting** para nuevos errores posibles

### Formato de Documentación

- **Títulos**: Usar `#` para títulos principales, `##` para subsecciones
- **Código**: Usar ```javascript para bloques de código
- **Tablas**: Para parámetros de métodos
- **Ejemplos**: Incluir casos de uso reales

## Proceso de Pull Request

### Antes de Crear PR

1. **Actualiza tu fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Crea una rama feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Haz tus cambios** y asegúrate de que:
   - El código sigue los estándares
   - Los tests pasan
   - La documentación está actualizada
   - No hay console.logs o código de debugging

4. **Commit con mensajes descriptivos**
   ```bash
   git commit -m "feat: agregar método para listar issues con filtros"
   git commit -m "fix: corregir manejo de errores en getFile"
   git commit -m "docs: actualizar API.md con nuevos ejemplos"
   ```

### Tipos de Commit

- **feat**: Nueva funcionalidad
- **fix**: Bug fix
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan funcionalidad)
- **refactor**: Refactoring de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

### Crear Pull Request

1. **Push a tu fork**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

2. **Abre PR en GitHub** con:
   - **Título descriptivo**: `feat: agregar soporte para GitHub Actions`
   - **Descripción**: Explica qué, por qué y cómo
   - **Checklist**: Marca las tareas completadas
   - **Screenshots**: Si aplica (cambios visuales)

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa breaking change)
- [ ] Actualización de documentación

## Testing
- [ ] He probado los cambios localmente
- [ ] Los tests pasan (si aplica)
- [ ] He agregado tests para nueva funcionalidad

## Checklist
- [ ] Mi código sigue los estándares de estilo
- [ ] He hecho self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado documentación correspondiente
- [ ] Mis cambios no generan nuevos warnings

## Screenshots (si aplica)
Agrega screenshots para mostrar cambios visuales.
```

### Después del PR

1. **Responde a feedback** de manera oportuna
2. **Haz cambios solicitados** en commits separados
3. **Mantén el PR actualizado** con la rama main
4. **Espera la revisión** y approval

## Reportar Bugs

### Template de Bug Report

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ve a '...'
2. Click en '....'
3. Scroll down hasta '....'
4. Ver error

## Comportamiento Esperado
Descripción de lo que esperabas que pasara.

## Screenshots
Si aplica, agrega screenshots del problema.

## Información del Entorno
- OS: [e.g. Ubuntu 20.04]
- Node.js: [e.g. 16.14.0]
- Versión del servidor: [e.g. 1.0.0]

## Contexto Adicional
Cualquier otro contexto sobre el problema.
```

## Sugerir Mejoras

### Template de Feature Request

```markdown
## Problema/Motivación
Descripción del problema que esta feature resolvería.

## Solución Propuesta
Descripción clara de lo que quieres que pase.

## Alternativas Consideradas
Descripción de otras soluciones que consideraste.

## Contexto Adicional
Screenshots, mockups, etc. sobre la feature request.
```

## Comunidad

- **Issues**: Para reportar bugs y solicitar features
- **Discussions**: Para preguntas generales y ideas
- **Pull Requests**: Para contribuciones de código

## Recursos

- [Documentación de GitHub API](https://docs.github.com/en/rest)
- [MCP Protocol Documentation](https://spec.modelcontextprotocol.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**¡Gracias por contribuir! 🎉**

Si tienes preguntas sobre esta guía, no dudes en abrir un issue o preguntar en las discussions.
