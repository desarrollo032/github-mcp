import { WebSocketServer } from "ws";
import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("Falta GITHUB_TOKEN en variables de entorno");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Helper JSON-RPC simple
async function handleRequest(req) {
  const { id, method, params } = req;

  try {
    let result;

    switch (method) {
      // A) LEER -------------
      case "github.listRepos":
        result = await listRepos(params);
        break;
      case "github.getFile":
        result = await getFile(params);
        break;

      // B) ESCRIBIR ARCHIVOS -------------
      case "github.updateFile":
        result = await updateFile(params);
        break;
      case "github.createFile":
        result = await createFile(params);
        break;

      // C) ISSUES / PRs -------------
      case "github.createIssue":
        result = await createIssue(params);
        break;
      case "github.listIssues":
        result = await listIssues(params);
        break;
      case "github.createPullRequest":
        result = await createPullRequest(params);
        break;
      case "github.mergePullRequest":
        result = await mergePullRequest(params);
        break;

      // D) AUTOMATION (workflows) -------------
      case "github.dispatchWorkflow":
        result = await dispatchWorkflow(params);
        break;

      default:
        throw new Error(`Método no soportado: ${method}`);
    }

    return { id, result };
  } catch (err) {
    console.error("Error manejando request:", err);
    return {
      id,
      error: {
        message: err.message || "Error interno",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
      }
    };
  }
}

// ---------- IMPLEMENTACIONES ----------

// A) Leer repos
async function listRepos({ visibility = "all" } = {}) {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100,
    visibility
  });
  return data.map(r => ({
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    default_branch: r.default_branch,
    html_url: r.html_url
  }));
}

// A) Leer archivo
async function getFile({ owner, repo, path, ref }) {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref
  });

  // Si es archivo, GitHub devuelve base64
  const content =
    data && data.content
      ? Buffer.from(data.content, data.encoding || "base64").toString("utf8")
      : null;

  return {
    path,
    sha: data.sha,
    content
  };
}

// B) Crear archivo
async function createFile({ owner, repo, path, content, message, branch }) {
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
    contentSha: res.data.content.sha
  };
}

// B) Actualizar archivo existente
async function updateFile({ owner, repo, path, content, message, branch }) {
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
    contentSha: res.data.content.sha
  };
}

// C) Crear issue
async function createIssue({ owner, repo, title, body, labels }) {
  const { data } = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels
  });
  return {
    number: data.number,
    url: data.html_url
  };
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
