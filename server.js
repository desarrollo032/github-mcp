import { Server } from "mcp/server";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Verificar credenciales de autenticación
const AUTH_ID = process.env.AUTH_ID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_ID || !AUTH_TOKEN) {
  throw new Error("Faltan credenciales de MCP - AUTH_ID y AUTH_TOKEN son requeridos en .env");
}

// Verificar token de GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("Falta GITHUB_TOKEN en variables de entorno");
}

// Inicializar cliente de GitHub
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Crear servidor MCP
const server = new Server({
  name: "mcp-github-server",
  version: "1.0.0",
  description: "Servidor MCP para operaciones de GitHub con autenticación"
});

// ===== MÉTODOS DE GITHUB =====

// Listar repositorios
server.method("github.listRepos", async (params) => {
  const { visibility = "all" } = params || {};
  
  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      visibility
    });
    
    return data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      default_branch: repo.default_branch,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count
    }));
  } catch (error) {
    throw new Error(`Error listando repositorios: ${error.message}`);
  }
});

// Obtener archivo
server.method("github.getFile", async (params) => {
  const { owner, repo, path, ref } = params;
  
  if (!owner || !repo || !path) {
    throw new Error("owner, repo y path son requeridos");
  }
  
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref
    });

    // Si es archivo, GitHub devuelve base64
    let content = null;
    if (data && data.content) {
      content = Buffer.from(data.content, data.encoding || "base64").toString("utf8");
    }

    return {
      path: data.path,
      sha: data.sha,
      content,
      size: data.size,
      encoding: data.encoding,
      type: data.type
    };
  } catch (error) {
    throw new Error(`Error obteniendo archivo: ${error.message}`);
  }
});

// Crear archivo
server.method("github.createFile", async (params) => {
  const { owner, repo, path, content, message, branch } = params;
  
  if (!owner || !repo || !path || !content) {
    throw new Error("owner, repo, path y content son requeridos");
  }
  
  try {
    const res = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: message || `create ${path}`,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch
    });

    return {
      commitSha: res.data.commit.sha,
      contentSha: res.data.content.sha,
      html_url: res.data.content.html_url
    };
  } catch (error) {
    throw new Error(`Error creando archivo: ${error.message}`);
  }
});

// Actualizar archivo
server.method("github.updateFile", async (params) => {
  const { owner, repo, path, content, message, branch } = params;
  
  if (!owner || !repo || !path || !content) {
    throw new Error("owner, repo, path y content son requeridos");
  }
  
  try {
    // Primero obtener SHA actual
    const current = await octokit.repos.getContent({ owner, repo, path, ref: branch });
    const sha = current.data.sha;

    const res = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: message || `update ${path}`,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch
    });

    return {
      commitSha: res.data.commit.sha,
      contentSha: res.data.content.sha,
      html_url: res.data.content.html_url
    };
  } catch (error) {
    throw new Error(`Error actualizando archivo: ${error.message}`);
  }
});

// Crear issue
server.method("github.createIssue", async (params) => {
  const { owner, repo, title, body, labels } = params;
  
  if (!owner || !repo || !title) {
    throw new Error("owner, repo y title son requeridos");
  }
  
  try {
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
      labels
    });
    
    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
      state: data.state,
      created_at: data.created_at
    };
  } catch (error) {
    throw new Error(`Error creando issue: ${error.message}`);
  }
});

// Listar issues
server.method("github.listIssues", async (params) => {
  const { owner, repo, state = "open" } = params;
  
  if (!owner || !repo) {
    throw new Error("owner y repo son requeridos");
  }
  
  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100
    });
    
    return data.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
      author: issue.user.login,
      created_at: issue.created_at,
      labels: issue.labels.map(label => 
        typeof label === 'string' ? label : label.name
      )
    }));
  } catch (error) {
    throw new Error(`Error listando issues: ${error.message}`);
  }
});

// Crear Pull Request
server.method("github.createPullRequest", async (params) => {
  const { owner, repo, title, head, base, body, draft = false } = params;
  
  if (!owner || !repo || !title || !head || !base) {
    throw new Error("owner, repo, title, head y base son requeridos");
  }
  
  try {
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
      draft
    });
    
    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
      state: data.state,
      draft: data.draft,
      author: data.user.login,
      created_at: data.created_at
    };
  } catch (error) {
    throw new Error(`Error creando Pull Request: ${error.message}`);
  }
});

// Merge Pull Request
server.method("github.mergePullRequest", async (params) => {
  const { owner, repo, pull_number, merge_method = "squash" } = params;
  
  if (!owner || !repo || !pull_number) {
    throw new Error("owner, repo y pull_number son requeridos");
  }
  
  try {
    const { data } = await octokit.pulls.merge({
      owner,
      repo,
      pull_number,
      merge_method
    });
    
    return {
      merged: data.merged,
      sha: data.sha,
      message: data.message
    };
  } catch (error) {
    throw new Error(`Error haciendo merge del Pull Request: ${error.message}`);
  }
});

// Disparar workflow (GitHub Actions)
server.method("github.dispatchWorkflow", async (params) => {
  const { owner, repo, workflow_id, ref, inputs = {} } = params;
  
  if (!owner || !repo || !workflow_id || !ref) {
    throw new Error("owner, repo, workflow_id y ref son requeridos");
  }
  
  try {
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref,
      inputs
    });
    
    return { 
      ok: true, 
      message: `Workflow ${workflow_id} disparado en ${ref}` 
    };
  } catch (error) {
    throw new Error(`Error disparando workflow: ${error.message}`);
  }
});

// ===== MÉTODOS UTILITARIOS =====

// Encode base64
server.method("utils.base64Encode", async (params) => {
  const { text } = params;
  
  if (!text) {
    throw new Error("text es requerido");
  }
  
  try {
    return {
      encoded: Buffer.from(text, "utf8").toString("base64")
    };
  } catch (error) {
    throw new Error(`Error codificando base64: ${error.message}`);
  }
});

// Decode base64
server.method("utils.base64Decode", async (params) => {
  const { encoded } = params;
  
  if (!encoded) {
    throw new Error("encoded es requerido");
  }
  
  try {
    return {
      text: Buffer.from(encoded, "base64").toString("utf8")
    };
  } catch (error) {
    throw new Error(`Error decodificando base64: ${error.message}`);
  }
});

// Obtener timestamp actual
server.method("utils.timestamp", async () => {
  return {
    timestamp: Date.now(),
    iso: new Date().toISOString(),
    utc: new Date().toUTCString()
  };
});

// Obtener información del servidor
server.method("utils.serverInfo", async () => {
  return {
    name: "mcp-github-server",
    version: "1.0.0",
    description: "Servidor MCP para operaciones de GitHub",
    authEnabled: true,
    availableMethods: [
      // GitHub methods
      "github.listRepos",
      "github.getFile", 
      "github.createFile",
      "github.updateFile",
      "github.createIssue",
      "github.listIssues",
      "github.createPullRequest",
      "github.mergePullRequest",
      "github.dispatchWorkflow",
      // Utils methods
      "utils.base64Encode",
      "utils.base64Decode",
      "utils.timestamp",
      "utils.serverInfo"
    ]
  };
});

// Exportar servidor
export default server;
