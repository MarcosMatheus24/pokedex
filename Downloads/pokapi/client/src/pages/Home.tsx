import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Heart,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type Pokemon = {
  id: number;
  name: string;
  sprites: any;
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  species: { url: string };
  description?: string;
  evolution?: string[];
};
const API = "https://pokeapi.co/api/v2";
const types = [
  "all",
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];
const typeColors: Record<string, string> = {
  normal: "#9a9a70",
  fire: "#ed6b3c",
  water: "#4d8fe8",
  electric: "#d99b00",
  grass: "#5aab55",
  ice: "#65c4cc",
  fighting: "#b84b3f",
  poison: "#9e5aa5",
  ground: "#b48a48",
  flying: "#7d9be2",
  psychic: "#df638c",
  bug: "#84a838",
  rock: "#9a7d48",
  ghost: "#725b91",
  dragon: "#5572c5",
  dark: "#57515a",
  steel: "#6b8290",
  fairy: "#d887ad",
};
const labels: Record<string, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  ["special-attack"]: "Atq. esp.",
  ["special-defense"]: "Def. esp.",
  speed: "Velocidade",
};
const pretty = (value: string) => value.replaceAll("-", " ");
const art = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("A API não respondeu como esperado.");
  return response.json();
}
async function getDetail(id: number | string): Promise<Pokemon> {
  const data: any = await getJson(`${API}/pokemon/${id}`);
  const species: any = await getJson(data.species.url);
  const flavor =
    species.flavor_text_entries?.find(
      (entry: any) => entry.language.name === "pt-BR"
    ) ||
    species.flavor_text_entries?.find(
      (entry: any) => entry.language.name === "en"
    );
  const chain: any = await getJson(species.evolution_chain.url);
  const evolution: string[] = [];
  const walk = (node: any) => {
    if (node?.species?.name) {
      evolution.push(node.species.name);
    }
    node?.evolves_to?.forEach(walk);
  };
  walk(chain.chain);
  return {
    ...data,
    description: flavor?.flavor_text?.replace(/[\n\f]/g, " "),
    evolution,
  };
}

function TypeBadge({ name }: { name: string }) {
  return (
    <span
      className="type"
      style={{ background: typeColors[name] || "#8c8c8c" }}
    >
      {pretty(name)}
    </span>
  );
}

function totalStats(pokemon: Pokemon) {
  return pokemon.stats.reduce((sum, item) => sum + item.base_stat, 0);
}

function themeFor(pokemon?: Pokemon) {
  return pokemon
    ? typeColors[pokemon.types[0]?.type.name] || "#ffd21f"
    : "#ffd21f";
}

function ComparePanel({
  selected,
  onRemove,
  onBattle,
}: {
  selected: Pokemon[];
  onRemove: (id: number) => void;
  onBattle: () => void;
}) {
  if (!selected.length) return null;
  const statNames = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
  return (
    <section className="compare-panel" aria-label="Comparação de Pokémon">
      <div className="compare-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> arena de comparação
          </span>
          <h2>
            {selected.length === 2
              ? "Dois achados. Um duelo."
              : "Escolha mais um rival."}
          </h2>
          <p>
            Selecione até dois Pokémon para comparar as estatísticas e iniciar
            uma luta.
          </p>
        </div>
        {selected.length === 2 && (
          <button className="battle-btn" onClick={onBattle}>
            Lutar agora <ArrowRight size={16} />
          </button>
        )}
      </div>
      <div className="compare-grid">
        {selected.map(pokemon => (
          <article
            className="compare-card"
            key={pokemon.id}
            style={{ "--compare-color": themeFor(pokemon) } as any}
          >
            <button
              className="compare-remove"
              aria-label={`Remover ${pokemon.name} da comparação`}
              onClick={() => onRemove(pokemon.id)}
            >
              <X size={15} />
            </button>
            <img src={art(pokemon.id)} alt={pokemon.name} />
            <div>
              <span className="number">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
              <h3>{pretty(pokemon.name)}</h3>
              <div className="types">
                {pokemon.types.map(({ type }) => (
                  <TypeBadge key={type.name} name={type.name} />
                ))}
              </div>
            </div>
            <strong className="compare-total">
              {totalStats(pokemon)} <small>total base</small>
            </strong>
            <div className="compare-stats">
              {statNames.map(name => {
                const value =
                  pokemon.stats.find(item => item.stat.name === name)
                    ?.base_stat || 0;
                return (
                  <div className="compare-stat" key={name}>
                    <span>{labels[name]}</span>
                    <div className="bar">
                      <i
                        style={{
                          width: `${Math.min(100, value / 2.55)}%`,
                          background: "var(--compare-color)",
                        }}
                      />
                    </div>
                    <b>{value}</b>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
        {selected.length === 1 && (
          <div className="compare-empty">
            <span>＋</span>
            <strong>Selecione um segundo Pokémon</strong>
            <small>O botão “Selecionar” aparece em cada card.</small>
          </div>
        )}
      </div>
    </section>
  );
}

const attackNames: Record<string, string[]> = {
  normal: ["Investida", "Ataque Rápido"],
  fire: ["Brasa", "Lança-chamas"],
  water: ["Jato d’Água", "Hidro Pump"],
  electric: ["Choque do Trovão", "Faísca"],
  grass: ["Chicote de Vinha", "Folha Navalha"],
  ice: ["Nevasca", "Raio de Gelo"],
  fighting: ["Golpe Karate", "Esquiva Vital"],
  poison: ["Ácido", "Bomba de Lodo"],
  ground: ["Terremoto", "Cavar"],
  flying: ["Rajada de Vento", "Ataque Asa"],
  psychic: ["Confusão", "Psíquico"],
  bug: ["Picada", "Tesoura X"],
  rock: ["Arremesso de Pedra", "Deslizamento de Rocha"],
  ghost: ["Lambida", "Bola Sombria"],
  dragon: ["Sopro do Dragão", "Garra do Dragão"],
  dark: ["Mordida", "Pulso Sombrio"],
  steel: ["Garra de Metal", "Cabeça de Ferro"],
  fairy: ["Vento de Fada", "Brilho Mágico"],
};

function movesFor(pokemon: Pokemon) {
  return attackNames[pokemon.types[0]?.type.name] || attackNames.normal;
}

function BattleModal({
  first,
  second,
  onClose,
}: {
  first: Pokemon;
  second: Pokemon;
  onClose: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [turn, setTurn] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [move, setMove] = useState("");
  const [hp, setHp] = useState([100, 100]);
  const [log, setLog] = useState<string[]>([]);
  const firstScore =
    totalStats(first) +
    (first.stats.find(item => item.stat.name === "speed")?.base_stat || 0) *
      0.4;
  const secondScore =
    totalStats(second) +
    (second.stats.find(item => item.stat.name === "speed")?.base_stat || 0) *
      0.4;
  const winner = firstScore >= secondScore ? first : second;
  const isDone = turn >= 6;

  useEffect(() => {
    if (!started || isDone) return;
    let cancelled = false;
    const attacker = (turn + (first.id % 2)) % 2;
    const defender = attacker === 0 ? 1 : 0;
    const pokemon = attacker === 0 ? first : second;
    const moveName = movesFor(pokemon)[turn % 2];
    const damage = 12 + (totalStats(pokemon) % 16) + (turn % 3) * 3;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setActive(attacker);
      setMove(moveName);
      window.setTimeout(() => {
        if (cancelled) return;
        setHp(previous =>
          previous.map((value, index) =>
            index === defender ? Math.max(0, value - damage) : value
          )
        );
        setLog(previous =>
          [
            `${pretty(pokemon.name)} usou ${moveName}! -${damage} HP`,
            ...previous,
          ].slice(0, 4)
        );
        setActive(null);
        setMove("");
        setTurn(previous => previous + 1);
      }, 650);
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [started, turn, isDone, first, second]);

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Batalha Pokémon"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <article className="battle-modal">
        <button className="close" aria-label="Fechar batalha" onClick={onClose}>
          <X size={18} />
        </button>
        <span className="eyebrow">
          <Sparkles size={15} /> batalha simulada / turno{" "}
          {Math.min(turn + 1, 6)}
        </span>
        <h2>
          {isDone
            ? "Batalha encerrada!"
            : started
              ? "Escolha seu ataque!"
              : "Quem leva a melhor?"}
        </h2>
        <div className="battle-versus">
          <div className={`fighter ${active === 0 ? "attacking" : ""}`}>
            <img src={art(first.id)} alt={first.name} />
            <strong>{pretty(first.name)}</strong>
            <div className="hp-track">
              <i style={{ width: `${hp[0]}%` }} />
            </div>
            <span>{hp[0]} HP</span>
          </div>
          <div className="versus">{move || "VS"}</div>
          <div className={`fighter ${active === 1 ? "attacking" : ""}`}>
            <img src={art(second.id)} alt={second.name} />
            <strong>{pretty(second.name)}</strong>
            <div className="hp-track">
              <i style={{ width: `${hp[1]}%` }} />
            </div>
            <span>{hp[1]} HP</span>
          </div>
        </div>
        {started && !isDone && (
          <div className="battle-log">
            {log.length ? (
              log.map((line, index) => (
                <span key={`${line}-${index}`}>{line}</span>
              ))
            ) : (
              <span>A batalha vai começar...</span>
            )}
          </div>
        )}
        {!started && (
          <button className="battle-start" onClick={() => setStarted(true)}>
            Começar luta <Sparkles size={16} />
          </button>
        )}
        {isDone && (
          <div className="battle-result">
            <small>resultado da simulação</small>
            <strong>{pretty(winner.name)} vence!</strong>
            <p>
              O combate terminou após seis turnos com base nos atributos e
              ataques temáticos de cada tipo.
            </p>
          </div>
        )}
        <button className="dark-btn" onClick={onClose}>
          {isDone ? "Voltar para a comparação" : "Sair da batalha"}
        </button>
      </article>
    </div>
  );
}
function Entrance({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="entrance">
      <section className="entrance-card">
        <div className="eyebrow">
          <span className="pokeball" /> Pokapi / pesquisa de campo
        </div>
        <div className="entrance-copy">
          <h1 className="display">
            POKÉ
            <br />
            DEX
          </h1>
          <p className="entrance-sub">Escolha seu próximo achado.</p>
          <div className="entrance-actions">
            <button className="primary-btn" onClick={onEnter}>
              Entrar na Pokédex <ArrowRight size={17} />
            </button>
            <button className="text-btn" onClick={onEnter}>
              Ver catálogo
            </button>
          </div>
        </div>
        <img className="hero-pika" src={art(25)} alt="Pikachu" />
      </section>
    </main>
  );
}

function DetailModal({
  pokemon,
  onClose,
  onNavigate,
}: {
  pokemon: Pokemon;
  onClose: () => void;
  onNavigate: (id: number) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${pokemon.name}`}
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <article className="modal">
        <button className="close" aria-label="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="detail-head">
          <img
            className="detail-image"
            src={art(pokemon.id)}
            alt={pokemon.name}
          />
          <div>
            <span className="number">
              #{String(pokemon.id).padStart(3, "0")}
            </span>
            <h2 className="detail-title">{pretty(pokemon.name)}</h2>
            <div className="types">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} name={type.name} />
              ))}
            </div>
            <p className="detail-sub">
              {pokemon.description || "Uma descoberta esperando por você."}
            </p>
          </div>
        </div>
        <div className="detail-grid">
          <div className="detail-section">
            <h4>Leitura rápida</h4>
            <p>
              <b>Altura:</b> {(pokemon.height / 10).toFixed(1)} m
            </p>
            <p>
              <b>Peso:</b> {(pokemon.weight / 10).toFixed(1)} kg
            </p>
            <p>
              <b>Habilidades:</b>{" "}
              {pokemon.abilities.map(x => pretty(x.ability.name)).join(", ")}
            </p>
            <h4 style={{ marginTop: 22 }}>Linha evolutiva</h4>
            <div className="evolutions">
              {pokemon.evolution?.map(name => (
                <button
                  className="evo"
                  key={name}
                  onClick={() =>
                    getJson<any>(`${API}/pokemon/${name}`).then(d =>
                      onNavigate(d.id)
                    )
                  }
                >
                  {pretty(name)}
                </button>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h4>Estatísticas base</h4>
            <div className="stats">
              {pokemon.stats.map(item => (
                <div className="stat" key={item.stat.name}>
                  <span>
                    {labels[item.stat.name] || pretty(item.stat.name)}
                  </span>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, item.base_stat / 2.55)}%`,
                      }}
                    />
                  </div>
                  <b>{item.base_stat}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="detail-footer">
          <button
            className="dark-btn"
            onClick={() => onNavigate(Math.max(1, pokemon.id - 1))}
          >
            <ArrowLeft size={15} /> Anterior
          </button>
          <span className="number">explore / {pokemon.id}</span>
          <button
            className="dark-btn"
            onClick={() => onNavigate(pokemon.id + 1)}
          >
            Próximo <ArrowRight size={15} />
          </button>
        </div>
      </article>
    </div>
  );
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [items, setItems] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const [battleOpen, setBattleOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pokapi-favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const pageSize = 20;
  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const list: any = await getJson(
        `${API}/pokemon?limit=${pageSize}&offset=${nextPage * pageSize}`
      );
      const details = await Promise.all(
        list.results.map((x: any) => getJson<any>(x.url))
      );
      setItems(details);
      setPage(nextPage);
    } catch (e: any) {
      setError(e.message || "Não foi possível carregar o catálogo.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (entered && !items.length) loadPage(0);
  }, [entered]);
  const visible = useMemo(
    () =>
      items.filter(
        p =>
          (activeType === "all" ||
            p.types.some(t => t.type.name === activeType)) &&
          (!onlyFavorites || favorites.includes(p.id))
      ),
    [items, activeType, onlyFavorites, favorites]
  );
  const toggleFav = (id: number) =>
    setFavorites(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id];
      localStorage.setItem("pokapi-favorites", JSON.stringify(next));
      return next;
    });
  const toggleSelection = (id: number) =>
    setSelection(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : prev.length < 2
          ? [...prev, id]
          : [prev[1], id]
    );
  const selectedPokemon = selection
    .map(id => items.find(item => item.id === id))
    .filter(Boolean) as Pokemon[];
  const themeA = themeFor(selectedPokemon[0]);
  const themeB = themeFor(selectedPokemon[1] || selectedPokemon[0]);
  const themedStyle = { "--theme-a": themeA, "--theme-b": themeB } as any;
  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return loadPage(0);
    setLoading(true);
    setError("");
    try {
      const data = await getDetail(query.trim().toLowerCase());
      setItems([data]);
      setPage(0);
      setActiveType("all");
    } catch {
      setItems([]);
      setError("Não encontramos esse Pokémon. Tente pelo nome ou número.");
    } finally {
      setLoading(false);
    }
  };
  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      setSelected(await getDetail(id));
    } catch {
      setError("Falha ao abrir a ficha deste Pokémon.");
    } finally {
      setDetailLoading(false);
    }
  };
  if (!entered) return <Entrance onEnter={() => setEntered(true)} />;
  return (
    <main
      className={`main-view ${selectedPokemon.length ? "has-theme" : ""}`}
      style={themedStyle}
    >
      <div className="container">
        <nav className="nav">
          <div className="wordmark">
            <span className="pokeball" /> POKAPI / POKÉDEX
          </div>
          <span className="nav-note">
            dados vivos da PokéAPI · favoritos: {favorites.length}
          </span>
        </nav>
        <section className="hero-panel">
          <div>
            <span className="eyebrow">
              <Sparkles size={15} /> caderno de campo 001
            </span>
            <h1>
              Descubra
              <br />o próximo.
            </h1>
            <p>
              Pesquise, compare e monte sua própria coleção. Cada ficha traz o
              essencial para você completar a atividade.
            </p>
          </div>
          <div className="hero-orbit">
            <img src={art(25)} alt="Pikachu decorativo" />
          </div>
        </section>
        <section aria-label="Explorar Pokédex">
          <div className="toolbar">
            <form className="search" onSubmit={search}>
              <Search size={19} />
              <input
                aria-label="Buscar Pokémon"
                placeholder="buscar por nome ou número..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button aria-label="Buscar" type="submit">
                <ArrowRight size={18} />
              </button>
            </form>
            <button
              className={`fav-toggle ${onlyFavorites ? "active" : ""}`}
              onClick={() => setOnlyFavorites(x => !x)}
            >
              <Heart size={16} fill={onlyFavorites ? "currentColor" : "none"} />{" "}
              favoritos
            </button>
          </div>
          <div className="type-row">
            {types.map(type => (
              <button
                key={type}
                className={`type-pill ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
              >
                {type === "all" ? "todos" : type}
              </button>
            ))}
          </div>
          <div className="selection-bar" aria-live="polite">
            <div>
              <strong>Comparar e lutar</strong>
              <span>
                {selectedPokemon.length}/2 selecionados · use “Selecionar” nos
                cards
              </span>
            </div>
            <button
              className="battle-btn"
              disabled={selectedPokemon.length !== 2}
              onClick={() => setBattleOpen(true)}
            >
              {selectedPokemon.length === 2
                ? "Lutar agora"
                : "Selecione 2 Pokémon"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
          <ComparePanel
            selected={selectedPokemon}
            onRemove={id =>
              setSelection(prev => prev.filter(item => item !== id))
            }
            onBattle={() => setBattleOpen(true)}
          />
          {loading && (
            <div className="status">
              <Loader2 className="animate-spin" size={20} />{" "}
              <span className="loading-dots">Carregando catálogo</span>
            </div>
          )}
          {!loading && error && <div className="status error">{error}</div>}
          {!loading && !error && visible.length === 0 && (
            <div className="status">
              Nenhum favorito nesta página. Explore outras páginas ou desative o
              filtro.
            </div>
          )}
          <div className="grid">
            {visible.map((p, index) => (
              <article
                className="card"
                style={{ animationDelay: `${index * 35}ms` }}
                key={p.id}
              >
                <div className="card-top">
                  <span className="number">
                    #{String(p.id).padStart(3, "0")}
                  </span>
                  <button
                    className={`heart ${favorites.includes(p.id) ? "active" : ""}`}
                    aria-label={
                      favorites.includes(p.id)
                        ? "Remover dos favoritos"
                        : "Adicionar aos favoritos"
                    }
                    onClick={() => toggleFav(p.id)}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(p.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className={`select-btn ${selection.includes(p.id) ? "selected" : ""}`}
                    onClick={() => toggleSelection(p.id)}
                    aria-pressed={selection.includes(p.id)}
                  >
                    {selection.includes(p.id) ? "Selecionado" : "Selecionar"}
                  </button>
                </div>
                <button className="open-card" onClick={() => openDetail(p.id)}>
                  <div className="card-art">
                    <img
                      src={
                        p.sprites?.other?.["official-artwork"]?.front_default ||
                        art(p.id)
                      }
                      alt={p.name}
                    />
                  </div>
                  <h3>{pretty(p.name)}</h3>
                  <div className="types">
                    {p.types.map(({ type }) => (
                      <TypeBadge key={type.name} name={type.name} />
                    ))}
                  </div>
                </button>
              </article>
            ))}
          </div>
          {!query && !onlyFavorites && (
            <div className="pagination">
              <button
                className="dark-btn"
                disabled={page === 0 || loading}
                onClick={() => loadPage(page - 1)}
              >
                <ArrowLeft size={15} /> anterior
              </button>
              <span className="number">página {page + 1} / 50</span>
              <button
                className="dark-btn"
                disabled={loading}
                onClick={() => loadPage(page + 1)}
              >
                próxima <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
        <section className="activity">
          <div>
            <span className="eyebrow">
              <BookOpen size={15} /> missão rápida
            </span>
            <h2>
              Complete
              <br />
              seu campo.
            </h2>
          </div>
          <div className="activity-card">
            <strong>Atividade da vez: forme um trio.</strong>
            <p>
              Encontre um Pokémon de fogo, um de água e um elétrico. Abra cada
              ficha, compare as estatísticas e favorite o que você escolheria
              para sua equipe.
            </p>
            <br />
            <strong>Dica</strong>
            <p>
              Use os filtros acima ou pesquise pelo nome. A Pokédex atualiza os
              dados ao vivo a cada consulta.
            </p>
          </div>
        </section>
      </div>
      {(selected || detailLoading) && !detailLoading && (
        <DetailModal
          pokemon={selected!}
          onClose={() => setSelected(null)}
          onNavigate={openDetail}
        />
      )}{" "}
      {detailLoading && (
        <div className="overlay">
          <div className="status">
            <Loader2 className="animate-spin" size={22} /> Abrindo ficha...
          </div>
        </div>
      )}
      {battleOpen && selectedPokemon.length === 2 && (
        <BattleModal
          first={selectedPokemon[0]}
          second={selectedPokemon[1]}
          onClose={() => setBattleOpen(false)}
        />
      )}
    </main>
  );
}
