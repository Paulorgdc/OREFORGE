export interface Mineral {
  name: string
  emoji: string
  color: string
  minLevel: number
  maxLevel: number
  description: string
}

export interface Insignia {
  key: string
  icon: string
  label: string
  desc: string
  color: string
  bg: string
  requirement: string
}

// ── Progressão por minerais ─────────────────────────────────────────
export const MINERALS: Mineral[] = [
  { name: 'Carvão', emoji: '🪨', color: '#6b7280', minLevel: 1, maxLevel: 2, description: 'O começo de toda mineração' },
  { name: 'Ferro', emoji: '⚙️', color: '#9ca3af', minLevel: 3, maxLevel: 5, description: 'Forjando os primeiros alicerces' },
  { name: 'Cobre', emoji: '🔶', color: '#f97316', minLevel: 6, maxLevel: 9, description: 'Conduzindo riqueza com eficiência' },
  { name: 'Bronze', emoji: '🥉', color: '#d97706', minLevel: 10, maxLevel: 14, description: 'Um minerador com experiência real' },
  { name: 'Prata', emoji: '🥈', color: '#94a3b8', minLevel: 15, maxLevel: 19, description: 'Brilho crescente no portfólio' },
  { name: 'Ouro', emoji: '🥇', color: '#f59e0b', minLevel: 20, maxLevel: 29, description: 'Riqueza genuína sendo construída' },
  { name: 'Titânio', emoji: '🔷', color: '#38bdf8', minLevel: 30, maxLevel: 39, description: 'Resistência e solidez financeira' },
  { name: 'Esmeralda', emoji: '💚', color: '#10b981', minLevel: 40, maxLevel: 49, description: 'Prosperidade verde e constante' },
  { name: 'Rubi', emoji: '❤️', color: '#ef4444', minLevel: 50, maxLevel: 59, description: 'Paixão e dedicação aos investimentos' },
  { name: 'Safira', emoji: '💙', color: '#3b82f6', minLevel: 60, maxLevel: 69, description: 'Profundidade e sabedoria financeira' },
  { name: 'Diamante', emoji: '💎', color: '#a5f3fc', minLevel: 70, maxLevel: 89, description: 'O mais raro e valioso minerador' },
  { name: 'Cristal Arcano', emoji: '✨', color: '#e879f9', minLevel: 90, maxLevel: 999, description: 'Além do comum. Uma lenda das minas' },
]

export function getMineralByLevel(level: number): Mineral {
  return MINERALS.find((m) => level >= m.minLevel && level <= m.maxLevel) || MINERALS[0]
}

// ── Insígnias desbloqueáveis ────────────────────────────────────────
export const INSIGNIAS: Insignia[] = [
  {
    key: 'SHIELD_IRON',
    icon: '🛡️',
    label: 'Escudo de Ferro',
    desc: 'Completou 7 dias no app',
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.15)',
    requirement: '7 dias de conta ativa',
  },
  {
    key: 'SHIELD_BRONZE',
    icon: '🛡️',
    label: 'Escudo de Bronze',
    desc: 'Portfólio acima de R$ 1.000',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.15)',
    requirement: 'R$ 1.000 investidos',
  },
  {
    key: 'SHIELD_SILVER',
    icon: '🛡️',
    label: 'Escudo de Prata',
    desc: 'Portfólio acima de R$ 5.000',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.15)',
    requirement: 'R$ 5.000 investidos',
  },
  {
    key: 'SHIELD_GOLD',
    icon: '🛡️',
    label: 'Escudo de Ouro',
    desc: 'Portfólio acima de R$ 10.000',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    requirement: 'R$ 10.000 investidos',
  },
  {
    key: 'SHIELD_DIAMOND',
    icon: '🛡️',
    label: 'Escudo de Diamante',
    desc: 'Portfólio acima de R$ 50.000',
    color: '#a5f3fc',
    bg: 'rgba(165,243,252,0.15)',
    requirement: 'R$ 50.000 investidos',
  },
  {
    key: 'SWORD_WARRIOR',
    icon: '⚔️',
    label: 'Guerreiro Financeiro',
    desc: '3 tipos diferentes de ativos',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    requirement: '3 tipos de ativos',
  },
  {
    key: 'CROWN_STRATEGIST',
    icon: '👑',
    label: 'Estrategista',
    desc: '5 tipos diferentes de ativos',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    requirement: '5 tipos de ativos',
  },
  {
    key: 'FIRE_STREAK',
    icon: '🔥',
    label: 'Em Chamas',
    desc: '5 investimentos adicionados',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    requirement: '5 investimentos',
  },
  {
    key: 'MOUNTAIN_VETERAN',
    icon: '⛰️',
    label: 'Veterano das Montanhas',
    desc: 'Investimento ativo por 30 dias',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    requirement: '30 dias com investimento',
  },
  {
    key: 'STAR_LEGEND',
    icon: '🌟',
    label: 'Estrela do Mercado',
    desc: 'Atingiu nível 20',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.15)',
    requirement: 'Nível 20',
  },
  {
    key: 'GEM_MASTER',
    icon: '💎',
    label: 'Mestre das Gemas',
    desc: 'Coletou 5 insígnias',
    color: '#a5f3fc',
    bg: 'rgba(165,243,252,0.15)',
    requirement: '5 insígnias desbloqueadas',
  },
  {
    key: 'PICKAXE_LEGEND',
    icon: '⛏️',
    label: 'Lenda das Minas',
    desc: 'Portfólio acima de R$ 100.000',
    color: '#e879f9',
    bg: 'rgba(232,121,249,0.15)',
    requirement: 'R$ 100.000 investidos',
  },
]

export const INSIGNIA_MAP: Record<string, Insignia> = Object.fromEntries(
  INSIGNIAS.map((i) => [i.key, i])
)