import { Router, Response } from 'express'
import { db } from '../db/pool'
import { requireAuth, AuthReq } from '../middleware/auth'

const router = Router()

interface UserStats {
  totalInvestments: number
  totalBalance: number
  totalInvested: number
  uniqueTypes: number
  maxDaysActive: number
}

function calcBalance(amount: number, rate: number, startedAt: string): number {
  const days = Math.max(0, (Date.now() - new Date(startedAt).getTime()) / 86400000)
  if (days < 1 || rate <= 0) return amount
  const dailyRate = Math.pow(1 + rate / 100, 1 / 252) - 1
  return amount * Math.pow(1 + dailyRate, days)
}

const ACHIEVEMENTS_DEF = [
  { key: 'WELCOME', xp: 50, check: (_stats: UserStats) => true },
  { key: 'FIRST_INVESTMENT', xp: 100, check: (stats: UserStats) => stats.totalInvestments >= 1 },
  { key: 'FIVE_INVESTMENTS', xp: 200, check: (stats: UserStats) => stats.totalInvestments >= 5 },
  { key: 'TEN_INVESTMENTS', xp: 500, check: (stats: UserStats) => stats.totalInvestments >= 10 },
  { key: 'PORTFOLIO_1K', xp: 100, check: (stats: UserStats) => stats.totalInvested >= 1000 },
  { key: 'PORTFOLIO_5K', xp: 300, check: (stats: UserStats) => stats.totalInvested >= 5000 },
  { key: 'PORTFOLIO_10K', xp: 600, check: (stats: UserStats) => stats.totalInvested >= 10000 },
  { key: 'PORTFOLIO_50K', xp: 1500, check: (stats: UserStats) => stats.totalInvested >= 50000 },
  { key: 'PORTFOLIO_100K', xp: 3000, check: (stats: UserStats) => stats.totalInvested >= 100000 },
  { key: 'DIVERSIFIER_3', xp: 200, check: (stats: UserStats) => stats.uniqueTypes >= 3 },
  { key: 'DIVERSIFIER_5', xp: 500, check: (stats: UserStats) => stats.uniqueTypes >= 5 },
  { key: 'LOYAL_MINER', xp: 300, check: (stats: UserStats) => stats.maxDaysActive >= 30 },
  { key: 'VETERAN_MINER', xp: 800, check: (stats: UserStats) => stats.maxDaysActive >= 180 },
]

router.get('/me', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    const { rows: [user] } = await db(
      'SELECT id, name, email, xp, level, created_at FROM users WHERE id = $1',
      [req.userId]
    )

    const { rows: invs } = await db(
      'SELECT * FROM investments WHERE user_id = $1 AND is_active IS NOT FALSE',
      [req.userId]
    )

    let totalBalance = 0
    let totalInvested = 0
    let maxDaysActive = 0
    const types = new Set<string>()

    for (const inv of invs) {
      totalBalance += calcBalance(+inv.amount, +(inv.rate || 0), inv.started_at)
      totalInvested += parseFloat(inv.amount)
      const days = (Date.now() - new Date(inv.started_at).getTime()) / 86400000
      if (days > maxDaysActive) maxDaysActive = days
      types.add(inv.type)
    }

    const stats: UserStats = {
      totalInvestments: invs.length,
      totalBalance,
      totalInvested,
      uniqueTypes: types.size,
      maxDaysActive,
    }

    const { rows: existing } = await db(
      'SELECT key FROM achievements WHERE user_id = $1', [req.userId]
    )
    const existingKeys = new Set(existing.map((e: { key: string }) => e.key))
    const newAchievements: string[] = []

    for (const ach of ACHIEVEMENTS_DEF) {
      if (!existingKeys.has(ach.key) && ach.check(stats)) {
        await db(
          'INSERT INTO achievements (user_id, key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.userId, ach.key]
        )
        await db(
          'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1,$2,$3,$4)',
          [req.userId, `ACHIEVEMENT_${ach.key}`, ach.xp, 'Conquista desbloqueada!']
        )
        await db('UPDATE users SET xp = xp + $1 WHERE id = $2', [ach.xp, req.userId])
        newAchievements.push(ach.key)
      }
    }

    const { rows: lastPassive } = await db(
      `SELECT created_at FROM xp_events
       WHERE user_id = $1 AND action = 'PASSIVE_XP'
       ORDER BY created_at DESC LIMIT 1`,
      [req.userId]
    )
    const hoursSince = lastPassive[0]
      ? (Date.now() - new Date(lastPassive[0].created_at).getTime()) / 3600000
      : 999

    if (hoursSince >= 24 && totalBalance >= 100) {
      const passiveXp = Math.floor(totalBalance / 100)
      await db(
        'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1,$2,$3,$4)',
        [req.userId, 'PASSIVE_XP', passiveXp, `+${passiveXp} XP passivo do portfólio`]
      )
      await db('UPDATE users SET xp = xp + $1 WHERE id = $2', [passiveXp, req.userId])
    }

    const { rows: [updated] } = await db(
      'SELECT xp FROM users WHERE id = $1', [req.userId]
    )
    const totalXp = updated.xp

    const level = Math.floor(totalXp / 500) + 1
    const xpForLevel = (level - 1) * 500
    const xpCurrent = totalXp - xpForLevel
    const xpNeeded = 500
    const percent = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100))

    await db('UPDATE users SET level = $1 WHERE id = $2', [level, req.userId])

    const { rows: achievements } = await db(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [req.userId]
    )
    const { rows: recentEvents } = await db(
      'SELECT * FROM xp_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.userId]
    )

    return res.json({
      user: { ...user, xp: totalXp, level },
      xp: { current: xpCurrent, needed: xpNeeded, percent, level, total: totalXp },
      stats,
      achievements,
      recentEvents,
      newAchievements,
    })
  } catch (error) {
    console.error('Fetch user data error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router