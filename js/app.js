/* Livro dos Atletas: lógica do front-end (sem dependências) */
const $app = document.getElementById("app");
const filtro = { q: "", mod: "", pais: "", cat: "", org: "", status: "", equipe: "" };
let rankAba = "cartel", rankMod = "", rankCat = "";

/* ---------- utilidades ---------- */
const uniq = (campo) => [...new Set(LUTADORES.flatMap(l => [].concat(l[campo])))].sort();
const idade = (n) => { const h = new Date(), d = new Date(n); let i = h.getFullYear() - d.getFullYear(); if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) i--; return i; };
const dataBR = (s) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR");
const pct = (l) => { const t = l.v + l.d + l.e + l.nc; return t ? Math.round(l.v / t * 100) : 0; };
const ini = (n) => n.split(" ").map(p => p[0]).slice(0, 2).join("");
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const foto = (l) => `<div class="foto">${ini(l.nome)}${l.foto ? `<img src="${esc(l.foto)}" alt="Foto de ${esc(l.nome)}" onerror="this.remove()">` : ""}</div>`;
const opts = (lista, atual, rotulo) => `<option value="">${rotulo}</option>` + lista.map(x => `<option ${x === atual ? "selected" : ""}>${esc(x)}</option>`).join("");

function cardLutador(l) {
  return `<a class="card" href="#/lutador/${l.id}">
    ${foto(l)}
    <div class="corpo">
      <h3>${esc(l.nome)}</h3>
      ${l.apelido ? `<div class="apelido">"${esc(l.apelido)}"</div>` : ""}
      <div class="meta">${l.flag} ${esc(l.pais)}</div>
      <div><span class="tag">${esc(l.mod)}</span></div>
      <div class="cartel">
        <span class="v"><b>${l.v}</b>V</span><span class="d"><b>${l.d}</b>D</span><span><b>${l.e}</b>E</span>
      </div>
    </div></a>`;
}

/* ---------- páginas ---------- */
function paginaInicio() {
  const total = LUTADORES.length;
  const vit = LUTADORES.reduce((s, l) => s + l.v, 0);
  const destaque = [...LUTADORES].sort((a, b) => b.v - a.v).slice(0, 4);
  $app.innerHTML = `
    <section class="hero">
      <div>
        <h1>Todo lutador<br>tem um <span>cartel</span><br>para contar.</h1>
        <p>Pesquise atletas de MMA, UFC, boxe e kickboxing, compare cartéis e reveja as lutas que marcaram a história.</p>
        <a class="btn" href="#/lutadores">Ver lutadores</a>
        <a class="btn sec" href="#/rankings">Ver rankings</a>
      </div>
      <div class="hero-num">
        <div><strong>${total}</strong><span>lutadores</span></div>
        <div><strong>${uniq("mod").length}</strong><span>modalidades</span></div>
        <div><strong>${vit}</strong><span>vitórias registradas</span></div>
        <div><strong>${uniq("pais").length}</strong><span>países</span></div>
      </div>
    </section>
    <h2>Com mais vitórias</h2>
    <div class="grade">${destaque.map(cardLutador).join("")}</div>`;
}

function filtrar() {
  const q = filtro.q.trim().toLowerCase();
  return LUTADORES.filter(l =>
    (!q || l.nome.toLowerCase().includes(q) || (l.apelido || "").toLowerCase().includes(q)) &&
    (!filtro.mod || l.mods.includes(filtro.mod)) && (!filtro.pais || l.pais === filtro.pais) &&
    (!filtro.cat || l.cat === filtro.cat) && (!filtro.org || l.org === filtro.org) &&
    (!filtro.status || l.status === filtro.status) && (!filtro.equipe || l.equipe === filtro.equipe));
}

function paginaLutadores() {
  $app.innerHTML = `
    <h2>Lutadores</h2>
    <div class="filtros">
      <input id="f-q" type="search" placeholder="Buscar por nome ou apelido" value="${esc(filtro.q)}" aria-label="Buscar lutador">
      <select id="f-mod" aria-label="Modalidade">${opts(uniq("mods"), filtro.mod, "Modalidade")}</select>
      <select id="f-pais" aria-label="País">${opts(uniq("pais"), filtro.pais, "País")}</select>
      <select id="f-cat" aria-label="Categoria de peso">${opts(uniq("cat"), filtro.cat, "Categoria de peso")}</select>
      <select id="f-org" aria-label="Organização">${opts(uniq("org"), filtro.org, "Organização")}</select>
      <select id="f-status" aria-label="Situação">${opts(["Ativo", "Aposentado"], filtro.status, "Situação")}</select>
      <select id="f-equipe" aria-label="Academia">${opts(uniq("equipe"), filtro.equipe, "Academia")}</select>
      <button class="btn sec" id="f-limpar">Limpar filtros</button>
    </div>
    <div class="cont" id="cont"></div><div class="grade" id="lista"></div>`;
  const atualizar = () => {
    const r = filtrar();
    document.getElementById("cont").textContent = `${r.length} ${r.length === 1 ? "lutador encontrado" : "lutadores encontrados"}`;
    document.getElementById("lista").innerHTML = r.length ? r.map(cardLutador).join("") : "";
    if (!r.length) document.getElementById("lista").innerHTML = `<div class="vazio" style="grid-column:1/-1">Nenhum lutador com esses filtros. Remova algum filtro para ver mais resultados.</div>`;
  };
  ["q", "mod", "pais", "cat", "org", "status", "equipe"].forEach(k => {
    const el = document.getElementById("f-" + k);
    el.addEventListener(k === "q" ? "input" : "change", () => { filtro[k] = el.value; atualizar(); });
  });
  document.getElementById("f-limpar").onclick = () => { Object.keys(filtro).forEach(k => filtro[k] = ""); paginaLutadores(); };
  atualizar();
}

function paginaModalidades() {
  const mods = uniq("mods");
  $app.innerHTML = `<h2>Modalidades</h2><div class="grade">${mods.map(m => {
    const n = LUTADORES.filter(l => l.mods.includes(m)).length;
    return `<a class="card mod-card" href="#/lutadores" data-mod="${esc(m)}"><h3>${esc(m)}</h3><div class="meta">${n} ${n === 1 ? "lutador" : "lutadores"}</div></a>`;
  }).join("")}</div>`;
  $app.querySelectorAll("[data-mod]").forEach(a => a.addEventListener("click", () => { Object.keys(filtro).forEach(k => filtro[k] = ""); filtro.mod = a.dataset.mod; }));
}

function donut(l) {
  const tot = l.v + l.d + l.e + l.nc || 1, R = 80, C = 2 * Math.PI * R;
  const partes = [[l.v, "#4cd37b"], [l.d, "#ff3b30"], [l.e, "#9a9aa2"], [l.nc, "#55555c"]];
  let off = 0;
  const arcos = partes.map(([n, cor]) => { const len = n / tot * C; const s = `<circle r="${R}" cx="100" cy="100" fill="none" stroke="${cor}" stroke-width="22" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}"/>`; off += len; return s; }).join("");
  return `<div class="donut"><svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="Gráfico do cartel"><circle r="${R}" cx="100" cy="100" fill="none" stroke="#1f1f22" stroke-width="22"/>${arcos}</svg><div><strong>${pct(l)}%</strong><span>de vitórias</span></div></div>`;
}

function barra(rotulo, n, max) { return `<div class="barra"><span>${rotulo}</span><i><u style="width:${max ? n / max * 100 : 0}%"></u></i><b>${n}</b></div>`; }

function video(v, nome) {
  const busca = `https://www.youtube.com/results?search_query=${encodeURIComponent(nome + " " + v.tipo)}`;
  if (v.yt) return `<div class="video"><iframe src="https://www.youtube.com/embed/${esc(v.yt)}" title="${esc(v.t)}" loading="lazy" allowfullscreen></iframe><div class="t"><b>${esc(v.t)}</b><br><small>${esc(v.tipo)}</small></div></div>`;
  return `<a class="video" href="${busca}" target="_blank" rel="noopener"><div class="ph">▶</div><div class="t"><b>${esc(v.t)}</b><br><small>${esc(v.tipo)}: buscar no YouTube</small></div></a>`;
}

function paginaPerfil(id) {
  const l = LUTADORES.find(x => x.id === id);
  if (!l) { $app.innerHTML = `<div class="vazio">Lutador não encontrado. <a href="#/lutadores" style="color:var(--vermelho2)">Voltar à lista</a></div>`; return; }
  const dado = (r, v) => `<div><small>${r}</small><strong>${v}</strong></div>`;
  const max = Math.max(l.ko, l.sub, l.dec, 1);
  $app.innerHTML = `
    <a class="voltar" href="#/lutadores">Voltar aos lutadores</a>
    <section class="perfil-topo">
      ${foto(l)}
      <div>
        <h1>${esc(l.nome)}</h1>
        ${l.apelido ? `<div class="apelido">"${esc(l.apelido)}"</div>` : ""}
        <span class="tag on">${esc(l.status)}</span> <span class="tag">${esc(l.org)}</span>
        <div class="dados">
          ${dado("Nacionalidade", `${l.flag} ${esc(l.pais)}`)}${dado("Origem", esc(l.cidade))}
          ${dado("Nascimento", `${dataBR(l.nasc)} (${idade(l.nasc)} anos)`)}${dado("Altura", (l.alt / 100).toFixed(2).replace(".", ",") + " m")}
          ${dado("Peso", l.peso + " kg")}${dado("Envergadura", l.env + " cm")}
          ${dado("Categoria", esc(l.cat))}${dado("Equipe / academia", esc(l.equipe))}
        </div>
      </div>
    </section>

    <section class="bloco"><h2>Cartel e estatísticas</h2>
      <div class="stats">${donut(l)}
        <div>
          <div class="nums"><div><b>${l.v}</b><span>Vitórias</span></div><div><b>${l.d}</b><span>Derrotas</span></div><div><b>${l.e}</b><span>Empates</span></div><div><b>${l.nc}</b><span>No contests</span></div></div>
          ${barra("KO/TKO", l.ko, max)}${barra("Finalização", l.sub, max)}${barra("Decisão", l.dec, max)}
        </div>
      </div>
    </section>

    <section class="bloco"><h2>Histórico de lutas</h2>
      ${l.lutas.length ? `<div class="tabela-wrap"><table><thead><tr><th>Res.</th><th>Adversário</th><th>Método</th><th>Evento</th><th>Data</th></tr></thead><tbody>
        ${l.lutas.map(f => `<tr><td><span class="res ${f.res}">${f.res}</span></td><td>${esc(f.adv)}</td><td>${esc(f.metodo)}</td><td>${esc(f.evento)}</td><td>${dataBR(f.data)}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="vazio">Ainda sem lutas cadastradas. Adicione no campo "lutas" em js/data.js.</div>`}
    </section>

    <section class="bloco"><h2>Artes marciais e especialidades</h2>
      <div class="tags">${l.mods.map(m => `<span class="tag ${m === l.mod ? "on" : ""}">${esc(m)}</span>`).join("")}</div>
      <ul style="color:var(--cinza);padding-left:20px">${l.esp.map(e => `<li>${esc(e)}</li>`).join("")}</ul>
    </section>

    <section class="bloco"><h2>Vídeos e conteúdos</h2>
      <div class="videos">${l.videos.map(v => video(v, l.nome)).join("")}</div>
    </section>`;
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

/* ---------- rankings ---------- */
const CRITERIOS = {
  cartel: { nome: "Maiores cartéis", val: l => l.v, fmt: l => `${l.v}-${l.d}-${l.e}` },
  pct: { nome: "% de vitórias", val: pct, fmt: l => pct(l) + "%" },
  seq: { nome: "Sequência de vitórias", val: l => l.seq, fmt: l => l.seq },
  ko: { nome: "Mais nocautes", val: l => l.ko, fmt: l => l.ko },
  sub: { nome: "Mais finalizações", val: l => l.sub, fmt: l => l.sub },
  lendas: { nome: "Lendas", val: l => l.v, fmt: l => `${l.v}-${l.d}-${l.e}` }
};

function paginaRankings() {
  const c = CRITERIOS[rankAba];
  let lista = LUTADORES.filter(l => (!rankMod || l.mods.includes(rankMod)) && (!rankCat || l.cat === rankCat) && (rankAba !== "lendas" || l.lenda));
  lista = [...lista].sort((a, b) => c.val(b) - c.val(a));
  $app.innerHTML = `
    <h2>Rankings</h2>
    <div class="abas">${Object.entries(CRITERIOS).map(([k, v]) => `<button data-k="${k}" class="${k === rankAba ? "on" : ""}">${v.nome}</button>`).join("")}</div>
    <div class="filtros" style="grid-template-columns:1fr 1fr">
      <select id="r-mod" aria-label="Modalidade">${opts(uniq("mods"), rankMod, "Todas as modalidades")}</select>
      <select id="r-cat" aria-label="Categoria">${opts(uniq("cat"), rankCat, "Todas as categorias")}</select>
    </div>
    ${lista.length ? lista.map((l, i) => `<a class="rank-linha" href="#/lutador/${l.id}"><span class="pos">${i + 1}</span><span><b>${esc(l.nome)}</b><br><small class="meta">${l.flag} ${esc(l.cat)}</small></span><span class="val">${c.fmt(l)}</span></a>`).join("") : `<div class="vazio">Nenhum lutador neste recorte.</div>`}`;
  $app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { rankAba = b.dataset.k; paginaRankings(); });
  document.getElementById("r-mod").onchange = e => { rankMod = e.target.value; paginaRankings(); };
  document.getElementById("r-cat").onchange = e => { rankCat = e.target.value; paginaRankings(); };
}

function paginaRecordes() {
  const topo = (fn) => [...LUTADORES].sort((a, b) => fn(b) - fn(a))[0];
  const itens = [
    ["Mais vitórias", l => l.v, "vitórias"], ["Maior sequência de vitórias", l => l.seq, "lutas seguidas"],
    ["Mais nocautes", l => l.ko, "KO/TKO"], ["Mais finalizações", l => l.sub, "finalizações"],
    ["Mais vitórias por decisão", l => l.dec, "decisões"], ["Maior envergadura", l => l.env, "cm"]
  ];
  $app.innerHTML = `<h2>Recordes</h2><div class="recordes">${itens.map(([t, fn, un]) => {
    const l = topo(fn);
    return `<a class="rec" href="#/lutador/${l.id}"><small>${t}</small><div class="big">${fn(l)}</div><b>${esc(l.nome)}</b><br><small>${un}</small></a>`;
  }).join("")}</div>
  <p class="meta" style="margin-top:18px">Recordes calculados entre os lutadores cadastrados na plataforma.</p>`;
}

/* ---------- roteador ---------- */
function rotear() {
  const [, rota = "", param] = location.hash.replace("#", "").split("/");
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("ativo", a.dataset.r === (rota === "lutador" ? "lutadores" : rota)));
  document.getElementById("menu").classList.remove("aberto");
  ({ "": paginaInicio, lutadores: paginaLutadores, modalidades: paginaModalidades, rankings: paginaRankings, recordes: paginaRecordes, lutador: () => paginaPerfil(param) }[rota] || paginaInicio)();
  if (rota !== "lutador") window.scrollTo(0, 0);
}
document.getElementById("burger").onclick = () => document.getElementById("menu").classList.toggle("aberto");
window.addEventListener("hashchange", rotear);
carregarLutadores().then(rotear);
