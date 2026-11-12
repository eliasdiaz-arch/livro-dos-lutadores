/* =====================================================================
   BANCO DE DADOS DO LIVRO DOS ATLETAS
   Edite, apague ou copie um bloco para cadastrar novos lutadores.
   ATENÇÃO: os números abaixo são de exemplo e podem estar desatualizados.
   Confira em fontes oficiais antes de publicar.

   Campos:
   foto    -> caminho/URL da foto (ex.: "img/khabib.jpg"). Vazio = iniciais.
   v,d,e,nc -> vitórias, derrotas, empates, no contests
   ko,sub,dec -> vitórias por KO/TKO, finalização, decisão
   seq     -> maior sequência de vitórias
   lenda   -> true aparece em "Lendas" nos rankings
   videos  -> { t: título, tipo, yt: ID do vídeo no YouTube }.
              Sem "yt", o card abre uma busca no YouTube.
   ===================================================================== */
const LUTADORES = [
  {
    id: "khabib-nurmagomedov", nome: "Khabib Nurmagomedov", apelido: "The Eagle",
    pais: "Rússia", flag: "🇷🇺", cidade: "Sildi, Daguestão", nasc: "1988-09-20",
    alt: 178, peso: 70, env: 178, cat: "Peso leve", org: "UFC", equipe: "American Kickboxing Academy",
    mod: "MMA", mods: ["MMA", "Wrestling", "Sambo", "Judô"], status: "Aposentado", lenda: true, foto: "",
    v: 29, d: 0, e: 0, nc: 0, ko: 8, sub: 11, dec: 10, seq: 29,
    esp: ["Wrestling de pressão e controle", "Queda de dupla perna", "Finalização por mata-leão e triângulo"],
    lutas: [
      { adv: "Justin Gaethje", data: "2020-10-24", evento: "UFC 254", res: "V", metodo: "Finalização (triângulo) R2" },
      { adv: "Dustin Poirier", data: "2019-09-07", evento: "UFC 242", res: "V", metodo: "Finalização (mata-leão) R3" },
      { adv: "Conor McGregor", data: "2018-10-06", evento: "UFC 229", res: "V", metodo: "Finalização (neck crank) R4" }
    ],
    videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Finalizações", tipo: "Finalizações" }, { t: "Documentário", tipo: "Documentários" }]
  },
  {
    id: "jon-jones", nome: "Jon Jones", apelido: "Bones",
    pais: "Estados Unidos", flag: "🇺🇸", cidade: "Rochester, Nova York", nasc: "1987-07-19",
    alt: 193, peso: 112, env: 215, cat: "Peso pesado", org: "UFC", equipe: "Jackson Wink MMA",
    mod: "MMA", mods: ["MMA", "Wrestling", "Muay Thai"], status: "Aposentado", lenda: true, foto: "",
    v: 28, d: 1, e: 0, nc: 1, ko: 11, sub: 7, dec: 10, seq: 19,
    esp: ["Envergadura excepcional", "Cotoveladas e chutes oblíquos", "Clinch e quedas"],
    lutas: [], videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Nocautes", tipo: "Nocautes" }]
  },
  {
    id: "anderson-silva", nome: "Anderson Silva", apelido: "Spider",
    pais: "Brasil", flag: "🇧🇷", cidade: "São Paulo, SP", nasc: "1975-04-14",
    alt: 188, peso: 84, env: 195, cat: "Peso médio", org: "UFC", equipe: "Black House",
    mod: "MMA", mods: ["MMA", "Muay Thai", "Taekwondo", "Jiu-jitsu brasileiro", "Boxe"], status: "Aposentado", lenda: true, foto: "",
    v: 34, d: 11, e: 0, nc: 1, ko: 23, sub: 3, dec: 8, seq: 16,
    esp: ["Striking de precisão", "Clinch de Muay Thai", "Contra-ataque e esquivas"],
    lutas: [], videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Nocautes", tipo: "Nocautes" }]
  },
  {
    id: "amanda-nunes", nome: "Amanda Nunes", apelido: "The Lioness",
    pais: "Brasil", flag: "🇧🇷", cidade: "Salvador, BA", nasc: "1988-05-30",
    alt: 173, peso: 61, env: 175, cat: "Peso galo feminino", org: "UFC", equipe: "American Top Team",
    mod: "MMA", mods: ["MMA", "Boxe", "Jiu-jitsu brasileiro"], status: "Aposentado", lenda: true, foto: "",
    v: 23, d: 5, e: 0, nc: 0, ko: 13, sub: 4, dec: 6, seq: 12,
    esp: ["Boxe de potência", "Ground and pound", "Pressão constante"],
    lutas: [], videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Nocautes", tipo: "Nocautes" }]
  },
  {
    id: "conor-mcgregor", nome: "Conor McGregor", apelido: "The Notorious",
    pais: "Irlanda", flag: "🇮🇪", cidade: "Dublin", nasc: "1988-07-14",
    alt: 175, peso: 70, env: 188, cat: "Peso pena", org: "UFC", equipe: "SBG Ireland",
    mod: "MMA", mods: ["MMA", "Boxe", "Taekwondo"], status: "Ativo", lenda: false, foto: "",
    v: 22, d: 6, e: 0, nc: 0, ko: 19, sub: 1, dec: 2, seq: 15,
    esp: ["Mão esquerda de potência", "Chutes de Taekwondo", "Controle de distância"],
    lutas: [
      { adv: "José Aldo", data: "2015-12-12", evento: "UFC 194", res: "V", metodo: "KO R1 (13s)" },
      { adv: "Eddie Alvarez", data: "2016-11-12", evento: "UFC 205", res: "V", metodo: "TKO R2" },
      { adv: "Khabib Nurmagomedov", data: "2018-10-06", evento: "UFC 229", res: "D", metodo: "Finalização R4" }
    ],
    videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Entrevistas", tipo: "Entrevistas" }]
  },
  {
    id: "georges-st-pierre", nome: "Georges St-Pierre", apelido: "Rush",
    pais: "Canadá", flag: "🇨🇦", cidade: "Saint-Isidore, Quebec", nasc: "1981-05-19",
    alt: 178, peso: 77, env: 193, cat: "Peso meio-médio", org: "UFC", equipe: "Tristar Gym",
    mod: "MMA", mods: ["MMA", "Karatê", "Jiu-jitsu brasileiro", "Wrestling", "Boxe"], status: "Aposentado", lenda: true, foto: "",
    v: 26, d: 2, e: 0, nc: 0, ko: 8, sub: 6, dec: 12, seq: 13,
    esp: ["Jab e controle de distância", "Quedas encadeadas", "Gestão de luta"],
    lutas: [], videos: [{ t: "Melhores momentos", tipo: "Highlights" }, { t: "Treinos", tipo: "Treinos" }]
  },
  {
    id: "ilia-topuria", nome: "Ilia Topuria", apelido: "El Matador",
    pais: "Espanha", flag: "🇪🇸", cidade: "Halle, Alemanha", nasc: "1997-01-21",
    alt: 170, peso: 70, env: 175, cat: "Peso leve", org: "UFC", equipe: "Climent Club",
    mod: "MMA", mods: ["MMA", "Boxe", "Jiu-jitsu brasileiro", "Wrestling"], status: "Ativo", lenda: false, foto: "",
    v: 17, d: 0, e: 0, nc: 0, ko: 8, sub: 3, dec: 6, seq: 17,
    esp: ["Boxe técnico de curta distância", "Jiu-jitsu faixa preta", "Poder de nocaute"],
    lutas: [], videos: [{ t: "Nocautes", tipo: "Nocautes" }, { t: "Entrevistas", tipo: "Entrevistas" }]
  },
  {
    id: "mike-tyson", nome: "Mike Tyson", apelido: "Iron Mike",
    pais: "Estados Unidos", flag: "🇺🇸", cidade: "Brooklyn, Nova York", nasc: "1966-06-30",
    alt: 178, peso: 100, env: 180, cat: "Peso pesado", org: "Boxe profissional", equipe: "Catskill Boxing Club",
    mod: "Boxe", mods: ["Boxe"], status: "Aposentado", lenda: true, foto: "",
    v: 50, d: 6, e: 0, nc: 2, ko: 44, sub: 0, dec: 6, seq: 19,
    esp: ["Estilo peek-a-boo", "Combinações de gancho e cruzado", "Explosão nos primeiros rounds"],
    lutas: [], videos: [{ t: "Nocautes", tipo: "Nocautes" }, { t: "Documentário", tipo: "Documentários" }]
  }
];
