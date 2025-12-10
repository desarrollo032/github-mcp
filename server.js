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
}

// C) Listar issues abiertos
async function listIssues({ owner, repo, state = "open" }) {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: 100
  });
  return data.map(i => ({
    number: i.number,
    title: i.title,
    state: i.state,
    url: i.html_url
  }));
}

// C) Crear PR
async function createPullRequest({
  owner,
  repo,
  title,
  head,
  base,
  body,
  draft = false
}) {
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
    url: data.html_url
  };
}

// C) Merge PR
async function mergePullRequest({ owner, repo, pull_number, merge_method = "squash" }) {
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
}

// D) Disparar workflow (GitHub Actions)
async function dispatchWorkflow({
  owner,
  repo,
  workflow_id, // filename.yml o ID numérico
  ref,         // rama (ej: "main")
  inputs = {}
}) {
  await octokit.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id,
    ref,
    inputs
  });
  return { ok: true };
}

// ---------- SERVIDOR WEBSOCKET ----------

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`Servidor MCP-GitHub WebSocket escuchando en puerto ${PORT}`);

wss.on("connection", ws => {
  console.log("Cliente conectado");

  ws.on("message", async raw => {
    let req;
    try {
      req = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ error: { message: "JSON inválido" } }));
      return;
    }

    const res = await handleRequest(req);
    ws.send(JSON.stringify(res));
  });

  ws.on("close", () => console.log("Cliente desconectado"));
});
