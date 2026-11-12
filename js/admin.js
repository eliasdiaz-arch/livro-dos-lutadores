/* Painel admin do Livro dos Atletas (Supabase Auth + Postgres + Storage) */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const lista = (t) => t.split(/[,\n]/).map(x => x.trim()).filter(Boolean);

if (SUPABASE_URL.includes("SEU-PROJETO")) {
  document.body.innerHTML = '<main><div class="vazio">Preencha SUPABASE_URL e SUPABASE_ANON_KEY em js/config.js.</div></main>';
  throw new Error("Supabase não configurado");
}
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let atletas = [];          // resumo da lista lateral
let atual = null;          // atleta em edição (objeto completo)
let novo = false;

function toast(msg, erro) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast show" + (erro ? " err" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = "toast", 3500);
}

/* ---------- autenticação ---------- */
async function iniciar() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return mostrarLogin();
  const { data, error } = await sb.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
  if (error || !data) {
    await sb.auth.signOut();
    mostrarLogin("Esta conta não tem permissão de administrador.");
    return;
  }
  $("#user-email").textContent = session.user.email;
  $("#user-box").hidden = false;
  $("#tela-login").hidden = true;
  $("#tela-painel").hidden = false;
  await carregarLista();
}
function mostrarLogin(msg) {
  $("#tela-login").hidden = false; $("#tela-painel").hidden = true; $("#user-box").hidden = true;
  $("#l-erro").textContent = msg || "";
}
$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#l-erro").textContent = "";
  const { error } = await sb.auth.signInWithPassword({ email: $("#l-email").value, password: $("#l-senha").value });
  if (error) { $("#l-erro").textContent = "E-mail ou senha incorretos."; return; }
  iniciar();
});
$("#btn-sair").onclick = async () => { await sb.auth.signOut(); location.reload(); };

/* ---------- lista lateral ---------- */
async function carregarLista() {
  const { data, error } = await sb.from("atletas").select("id,nome,pais,modalidade").order("nome");
  if (error) return toast("Erro ao listar: " + error.message, true);
  atletas = data;
  $("#btn-importar").hidden = atletas.length > 0;
  desenharLista();
}
function desenharLista() {
  const q = $("#busca").value.trim().toLowerCase();
  const f = atletas.filter(a => !q || a.nome.toLowerCase().includes(q));
  $("#lista").innerHTML = f.map(a => `<button class="item-lat ${atual && atual.id === a.id && !novo ? "on" : ""}" data-id="${esc(a.id)}"><span>${esc(a.nome)}</span><small>${esc(a.modalidade)}</small></button>`).join("")
    || '<div class="meta">Nenhum atleta.</div>';
  document.querySelectorAll(".item-lat").forEach(b => b.onclick = () => abrir(b.dataset.id));
}
$("#busca").addEventListener("input", desenharLista);
$("#btn-novo").onclick = () => {
  atual = { id: "", nome: "", apelido: "", pais: "", flag: "", cidade: "", nasc: "", alt: 0, peso: 0, env: 0, cat: "", org: "", equipe: "",
    modalidade: "MMA", mods: ["MMA"], status: "Ativo", lenda: false, foto: "", v: 0, d: 0, e: 0, nc: 0, ko: 0, sub: 0, dec: 0, seq: 0, esp: [], lutas: [], videos: [] };
  novo = true; desenharForm(); desenharLista();
};

async function abrir(id) {
  const { data, error } = await sb.from("atletas").select("*, lutas(*), videos(*)").eq("id", id).single();
  if (error) return toast("Erro ao abrir: " + error.message, true);
  data.lutas.sort((a, b) => b.data.localeCompare(a.data));
  atual = data; novo = false; desenharForm(); desenharLista();
}

/* ---------- formulário ---------- */
const campo = (rotulo, nome, valor, tipo = "text", extra = "") =>
  `<label>${rotulo}<input name="${nome}" type="${tipo}" value="${esc(valor)}" ${extra}></label>`;

function linhaLuta(f = {}) {
  return `<div class="linha-dinamica linha-luta">
    <input data-k="adv" placeholder="Adversário" value="${esc(f.adv)}">
    <input data-k="evento" placeholder="Evento" value="${esc(f.evento)}">
    <input data-k="data" type="date" value="${esc(f.data)}">
    <select data-k="res">${["V", "D", "E", "NC"].map(r => `<option ${f.res === r ? "selected" : ""}>${r}</option>`).join("")}</select>
    <input data-k="metodo" placeholder="Método (ex.: KO R1)" value="${esc(f.metodo)}">
    <button type="button" class="x" title="Remover">✕</button></div>`;
}
function linhaVideo(v = {}) {
  return `<div class="linha-dinamica linha-video">
    <input data-k="titulo" placeholder="Título" value="${esc(v.titulo)}">
    <input data-k="tipo" placeholder="Tipo (Highlights...)" value="${esc(v.tipo)}">
    <input data-k="yt" placeholder="ID do YouTube (opcional)" value="${esc(v.yt)}">
    <button type="button" class="x" title="Remover">✕</button></div>`;
}

function desenharForm() {
  const a = atual;
  $("#editor").innerHTML = `<form class="editor-form" id="form-atleta">
    <h2>${novo ? "Novo atleta" : esc(a.nome)}</h2>

    <fieldset><legend>Foto</legend>
      <div class="foto-edit">
        <div class="foto-prev" id="foto-prev">${a.foto ? `<img src="${esc(a.foto)}" alt="">` : "Sem foto"}</div>
        <div style="display:grid;gap:10px">
          <input type="file" id="foto-file" accept="image/*">
          ${campo("ou URL da foto", "foto", a.foto, "url", 'placeholder="https://..."')}
        </div>
      </div>
    </fieldset>

    <fieldset><legend>Dados pessoais</legend>
      <div class="g2">${campo("Nome", "nome", a.nome, "text", "required")}${campo("Apelido", "apelido", a.apelido)}</div>
      <div class="g3">${campo("País", "pais", a.pais, "text", "required")}${campo("Bandeira (emoji)", "flag", a.flag)}${campo("Cidade de origem", "cidade", a.cidade)}</div>
      <div class="g4">${campo("Nascimento", "nasc", a.nasc, "date")}${campo("Altura (cm)", "alt", a.alt, "number")}${campo("Peso (kg)", "peso", a.peso, "number", 'step="0.1"')}${campo("Envergadura (cm)", "env", a.env, "number")}</div>
    </fieldset>

    <fieldset><legend>Carreira</legend>
      <div class="g3">${campo("Categoria de peso", "cat", a.cat)}${campo("Organização", "org", a.org)}${campo("Equipe / academia", "equipe", a.equipe)}</div>
      <div class="g3">
        ${campo("Modalidade principal", "modalidade", a.modalidade, "text", "required")}
        <label>Situação<select name="status">${["Ativo", "Aposentado"].map(s => `<option ${a.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
        <label class="check" style="margin-top:22px"><input type="checkbox" name="lenda" ${a.lenda ? "checked" : ""}> Aparece em "Lendas"</label>
      </div>
      <label>Todas as modalidades (separe por vírgula)<input name="mods" value="${esc(a.mods.join(", "))}"></label>
      <label>Especialidades (uma por linha)<textarea name="esp">${esc(a.esp.join("\n"))}</textarea></label>
    </fieldset>

    <fieldset><legend>Cartel</legend>
      <div class="g4">${campo("Vitórias", "v", a.v, "number", 'min="0"')}${campo("Derrotas", "d", a.d, "number", 'min="0"')}${campo("Empates", "e", a.e, "number", 'min="0"')}${campo("No contests", "nc", a.nc, "number", 'min="0"')}</div>
      <div class="g4">${campo("Vitórias por KO/TKO", "ko", a.ko, "number", 'min="0"')}${campo("Por finalização", "sub", a.sub, "number", 'min="0"')}${campo("Por decisão", "dec", a.dec, "number", 'min="0"')}${campo("Maior sequência", "seq", a.seq, "number", 'min="0"')}</div>
    </fieldset>

    <fieldset><legend>Histórico de lutas</legend>
      <div id="lutas">${a.lutas.map(linhaLuta).join("")}</div>
      <button type="button" class="btn sec" id="add-luta">+ Adicionar luta</button>
    </fieldset>

    <fieldset><legend>Vídeos</legend>
      <div id="videos">${a.videos.map(linhaVideo).join("")}</div>
      <button type="button" class="btn sec" id="add-video">+ Adicionar vídeo</button>
    </fieldset>

    <div class="acoes">
      <button class="btn" type="submit" id="btn-salvar">Salvar</button>
      ${novo ? "" : '<button class="btn perigo" type="button" id="btn-excluir">Excluir atleta</button>'}
    </div></form>`;

  const form = $("#form-atleta");
  form.onsubmit = salvar;
  $("#add-luta").onclick = () => $("#lutas").insertAdjacentHTML("beforeend", linhaLuta());
  $("#add-video").onclick = () => $("#videos").insertAdjacentHTML("beforeend", linhaVideo());
  form.addEventListener("click", (e) => { if (e.target.classList.contains("x")) e.target.parentElement.remove(); });
  $("#foto-file").onchange = enviarFoto;
  form.elements.foto.addEventListener("input", (e) => {
    $("#foto-prev").innerHTML = e.target.value ? `<img src="${esc(e.target.value)}" alt="">` : "Sem foto";
  });
  if (!novo) $("#btn-excluir").onclick = excluir;
}

/* ---------- foto (Storage) ---------- */
async function enviarFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast("A foto deve ter no máximo 5 MB.", true);
  const nome = $("#form-atleta").elements.nome.value || "atleta";
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const caminho = `${slug(nome) || "atleta"}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("fotos").upload(caminho, file, { cacheControl: "31536000", contentType: file.type });
  if (error) return toast("Erro no upload: " + error.message, true);
  const { data } = sb.storage.from("fotos").getPublicUrl(caminho);
  $("#form-atleta").elements.foto.value = data.publicUrl;
  $("#foto-prev").innerHTML = `<img src="${esc(data.publicUrl)}" alt="">`;
  toast("Foto enviada. Clique em Salvar para gravar no perfil.");
}

/* ---------- salvar / excluir ---------- */
function lerForm() {
  const f = $("#form-atleta").elements;
  const num = (n) => Number(f[n].value) || 0;
  const mods = lista(f.mods.value);
  if (!mods.includes(f.modalidade.value.trim())) mods.unshift(f.modalidade.value.trim());
  return {
    id: novo ? slug(f.nome.value) : atual.id,
    nome: f.nome.value.trim(), apelido: f.apelido.value.trim() || null, pais: f.pais.value.trim(),
    flag: f.flag.value.trim(), cidade: f.cidade.value.trim(), nasc: f.nasc.value || null,
    alt: num("alt"), peso: num("peso"), env: num("env"),
    cat: f.cat.value.trim(), org: f.org.value.trim(), equipe: f.equipe.value.trim(),
    modalidade: f.modalidade.value.trim(), mods, status: f.status.value, lenda: f.lenda.checked,
    foto: f.foto.value.trim(),
    v: num("v"), d: num("d"), e: num("e"), nc: num("nc"), ko: num("ko"), sub: num("sub"), dec: num("dec"), seq: num("seq"),
    esp: f.esp.value.split("\n").map(x => x.trim()).filter(Boolean)
  };
}
function lerLinhas(seletor, obrigatorio) {
  return [...document.querySelectorAll(seletor + " .linha-dinamica")].map(l => {
    const o = {}; l.querySelectorAll("[data-k]").forEach(i => o[i.dataset.k] = i.value.trim()); return o;
  }).filter(o => o[obrigatorio]);
}

async function gravarFilhos(id, lutas, videos) {
  let r = await sb.from("lutas").delete().eq("atleta_id", id); if (r.error) throw r.error;
  r = await sb.from("videos").delete().eq("atleta_id", id); if (r.error) throw r.error;
  if (lutas.length) { r = await sb.from("lutas").insert(lutas.map(l => ({ ...l, atleta_id: id }))); if (r.error) throw r.error; }
  if (videos.length) { r = await sb.from("videos").insert(videos.map(v => ({ ...v, atleta_id: id }))); if (r.error) throw r.error; }
}

async function salvar(e) {
  e.preventDefault();
  const btn = $("#btn-salvar"); btn.disabled = true; btn.textContent = "Salvando...";
  try {
    const dados = lerForm();
    if (!dados.id) throw new Error("Nome inválido.");
    const lutas = lerLinhas("#lutas", "adv").map(l => {
      if (!l.data) throw new Error(`Informe a data da luta contra ${l.adv}.`);
      return l;
    });
    const videos = lerLinhas("#videos", "titulo");
    if (novo && atletas.some(a => a.id === dados.id)) throw new Error("Já existe um atleta com esse nome.");
    const r = await sb.from("atletas").upsert(dados);
    if (r.error) throw r.error;
    await gravarFilhos(dados.id, lutas, videos);
    toast("Atleta salvo!");
    novo = false;
    await carregarLista();
    await abrir(dados.id);
  } catch (err) {
    toast("Erro: " + (err.message || err), true);
  } finally {
    const b = $("#btn-salvar"); if (b) { b.disabled = false; b.textContent = "Salvar"; }
  }
}

async function excluir() {
  if (!confirm(`Excluir "${atual.nome}" e todas as suas lutas e vídeos? Isso não pode ser desfeito.`)) return;
  const { error } = await sb.from("atletas").delete().eq("id", atual.id);
  if (error) return toast("Erro ao excluir: " + error.message, true);
  toast("Atleta excluído.");
  atual = null;
  $("#editor").innerHTML = '<div class="vazio">Escolha um atleta ou crie um novo.</div>';
  carregarLista();
}

/* ---------- importar os dados de exemplo de js/data.js ---------- */
$("#btn-importar").onclick = async () => {
  if (!confirm(`Importar ${LUTADORES.length} atletas de exemplo para o banco?`)) return;
  try {
    for (const l of LUTADORES) {
      const r = await sb.from("atletas").upsert({
        id: l.id, nome: l.nome, apelido: l.apelido || null, pais: l.pais, flag: l.flag, cidade: l.cidade, nasc: l.nasc,
        alt: l.alt, peso: l.peso, env: l.env, cat: l.cat, org: l.org, equipe: l.equipe, modalidade: l.mod, mods: l.mods,
        status: l.status, lenda: l.lenda, foto: l.foto || "", v: l.v, d: l.d, e: l.e, nc: l.nc, ko: l.ko, sub: l.sub, dec: l.dec, seq: l.seq, esp: l.esp
      });
      if (r.error) throw r.error;
      await gravarFilhos(l.id,
        l.lutas.map(f => ({ adv: f.adv, data: f.data, evento: f.evento, res: f.res, metodo: f.metodo })),
        l.videos.map(v => ({ titulo: v.t, tipo: v.tipo, yt: v.yt || "" })));
    }
    toast("Importação concluída!");
    carregarLista();
  } catch (err) { toast("Erro na importação: " + (err.message || err), true); }
};

iniciar();
