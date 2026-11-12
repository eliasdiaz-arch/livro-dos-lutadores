/* Cliente Supabase + carregamento dos atletas.
   Converte o formato do banco para o formato que app.js já usa. */
const configurado = !SUPABASE_URL.includes("SEU-PROJETO");
const sb = configurado && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function doBanco(a) {
  return {
    id: a.id, nome: a.nome, apelido: a.apelido || "", pais: a.pais, flag: a.flag || "", cidade: a.cidade || "",
    nasc: a.nasc || "2000-01-01", alt: a.alt || 0, peso: Number(a.peso) || 0, env: a.env || 0,
    cat: a.cat || "", org: a.org || "", equipe: a.equipe || "",
    mod: a.modalidade, mods: a.mods || [], status: a.status, lenda: a.lenda, foto: a.foto || "",
    v: a.v, d: a.d, e: a.e, nc: a.nc, ko: a.ko, sub: a.sub, dec: a.dec, seq: a.seq,
    esp: a.esp || [],
    lutas: (a.lutas || []).map(f => ({ adv: f.adv, data: f.data, evento: f.evento || "", res: f.res, metodo: f.metodo || "" }))
      .sort((x, y) => y.data.localeCompare(x.data)),
    videos: (a.videos || []).map(v => ({ t: v.titulo, tipo: v.tipo || "Vídeo", yt: v.yt || "" }))
  };
}

/* Substitui o conteúdo de LUTADORES (vindo de data.js como reserva) pelo do banco. */
async function carregarLutadores() {
  if (!sb) { console.warn("Supabase não configurado: usando js/data.js"); return; }
  const { data, error } = await sb.from("atletas").select("*, lutas(*), videos(*)").order("nome");
  if (error) { console.error("Erro ao carregar do Supabase, usando js/data.js:", error.message); return; }
  LUTADORES.splice(0, LUTADORES.length, ...data.map(doBanco));
}
