import { Router, Response } from 'express'
import { db } from '../db/pool'
import { requireAuth, AuthReq } from '../middleware/auth'

const router = Router()

interface InvestmentRecord {
  id: string
  user_id: string
  type: string
  name: string
  amount: string
  rate: string
  started_at: string
  due_at?: string
  institution?: string
  notes?: string
  is_active: boolean
}

function calcYield(amount: number, annualRate: number, startedAt: string, dueAt?: string) {
  const start = new Date(startedAt)
  const end = dueAt
    ? new Date(Math.min(new Date(dueAt).getTime(), Date.now()))
    : new Date()
  const days = Math.max(0, (end.getTime() - start.getTime()) / 86400000)

  if (days < 1 || annualRate <= 0) return { balance: amount, yieldAmount: 0 }

  const dailyRate = Math.pow(1 + annualRate / 100, 1 / 252) - 1
  const balance = amount * Math.pow(1 + dailyRate, days)
  return {
    balance: parseFloat(balance.toFixed(2)),
    yieldAmount: parseFloat((balance - amount).toFixed(2)),
  }
}

async function grantXP(userId: string, action: string, xp: number, desc: string) {
  await db(
    'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1,$2,$3,$4)',
    [userId, action, xp, desc]
  )
  const { rows } = await db(
    'UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp, level',
    [xp, userId]
  )
  return rows[0]
}

async function checkAchievements(userId: string, stats: {
  count: number; totalAmount: number; uniqueTypes: number; maxDays: number
}) {
  const list = [
    { key: 'FIRST_INVESTMENT', xp: 100, cond: stats.count >= 1 },
    { key: 'FIVE_INVESTMENTS', xp: 200, cond: stats.count >= 5 },
    { key: 'TEN_INVESTMENTS', xp: 500, cond: stats.count >= 10 },
    { key: 'PORTFOLIO_1K', xp: 100, cond: stats.totalAmount >= 1000 },
    { key: 'PORTFOLIO_5K', xp: 300, cond: stats.totalAmount >= 5000 },
    { key: 'PORTFOLIO_10K', xp: 600, cond: stats.totalAmount >= 10000 },
    { key: 'PORTFOLIO_50K', xp: 1500, cond: stats.totalAmount >= 50000 },
    { key: 'PORTFOLIO_100K', xp: 3000, cond: stats.totalAmount >= 100000 },
    { key: 'DIVERSIFIER_3', xp: 200, cond: stats.uniqueTypes >= 3 },
    { key: 'DIVERSIFIER_5', xp: 500, cond: stats.uniqueTypes >= 5 },
    { key: 'LOYAL_MINER', xp: 300, cond: stats.maxDays >= 30 },
    { key: 'VETERAN_MINER', xp: 800, cond: stats.maxDays >= 180 },
  ]

  const { rows: existing } = await db(
    'SELECT key FROM achievements WHERE user_id = $1', [userId]
  )
  const existingKeys = new Set(existing.map((e: { key: string }) => e.key))
  const newAchievements: string[] = []

  for (const ach of list) {
    if (ach.cond && !existingKeys.has(ach.key)) {
      await db(
        'INSERT INTO achievements (user_id, key) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [userId, ach.key]
      )
      await db(
        'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1,$2,$3,$4)',
        [userId, `ACHIEVEMENT_${ach.key}`, ach.xp, `Conquista: ${ach.key}`]
      )
      await db('UPDATE users SET xp = xp + $1 WHERE id = $2', [ach.xp, userId])
      newAchievements.push(ach.key)
    }
  }
  return newAchievements
}

router.get('/', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    const { rows } = await db(
      `SELECT * FROM investments
       WHERE user_id = $1 AND is_active IS NOT FALSE
       ORDER BY created_at DESC`,
      [req.userId]
    )

    const investments = rows.map((inv: InvestmentRecord) => {
      const { balance, yieldAmount } = calcYield(
        parseFloat(inv.amount),
        parseFloat(inv.rate) || 0,
        inv.started_at,
        inv.due_at
      )
      return { ...inv, current_balance: balance, yield_amount: yieldAmount }
    })

    const totalBalance = investments.reduce((sum, item) => sum + item.current_balance, 0)
    const totalYield = investments.reduce((sum, item) => sum + item.yield_amount, 0)

    return res.json({
      investments,
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      totalYield: parseFloat(totalYield.toFixed(2)),
    })
  } catch (error) {
    console.error('Fetch investments error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    const { type, name, amount, rate, started_at, due_at, institution, notes } = req.body

    if (!type || !name || !amount || !started_at) {
      return res.status(400).json({ error: 'type, name, amount e started_at são obrigatórios' })
    }

    const { rows } = await db(
      `INSERT INTO investments
        (user_id, type, name, amount, rate, started_at, due_at, institution, notes, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)
       RETURNING *`,
      [req.userId, type, name, amount, rate || null, started_at, due_at || null, institution || null, notes || null]
    )

    const numericAmount = Number(amount)
    const xpBase = numericAmount >= 10000 ? 80 : numericAmount >= 5000 ? 60 : numericAmount >= 1000 ? 50 : 30
    const userXp = await grantXP(req.userId!, 'ADD_INVESTMENT', xpBase, `Investimento "${name}" adicionado`)

    const { rows: allInvs } = await db(
      'SELECT * FROM investments WHERE user_id = $1 AND is_active IS NOT FALSE',
      [req.userId]
    )

    const stats = {
      count: allInvs.length,
      totalAmount: allInvs.reduce((sum: number, item: InvestmentRecord) => sum + parseFloat(item.amount), 0),
      uniqueTypes: new Set(allInvs.map((item: InvestmentRecord) => item.type)).size,
      maxDays: allInvs.length > 0
        ? Math.max(...allInvs.map((item: InvestmentRecord) =>
            (Date.now() - new Date(item.started_at).getTime()) / 86400000
          ))
        : 0,
    }

    const newAchievements = await checkAchievements(req.userId!, stats)

    return res.status(201).json({
      investment: rows[0],
      xp: userXp,
      newAchievements,
    })
  } catch (error) {
    console.error('Create investment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/:id', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    const { name, amount, rate, due_at, institution, notes } = req.body
    const { rows } = await db(
      `UPDATE investments
       SET name=$1, amount=$2, rate=$3, due_at=$4, institution=$5, notes=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [name, amount, rate || null, due_at || null, institution || null, notes || null, req.params.id, req.userId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' })
    await grantXP(req.userId!, 'EDIT_INVESTMENT', 10, `Investimento "${name}" editado`)
    return res.json({ investment: rows[0] })
  } catch (error) {
    console.error('Update investment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    await db(
      'UPDATE investments SET is_active = FALSE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )
    return res.json({ ok: true })
  } catch (error) {
    console.error('Delete investment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/:id/history', requireAuth, async (req: AuthReq, res: Response) => {
  try {
    const { rows } = await db(
      'SELECT * FROM investments WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' })

    const inv = rows[0] as InvestmentRecord
    const amount = parseFloat(inv.amount)
    const rate = parseFloat(inv.rate) || 0
    const start = new Date(inv.started_at)
    const today = new Date()
    const history: { date: string; balance: number; yield: number }[] = []
    const cur = new Date(start)

    while (cur <= today) {
      const days = Math.max(0, (cur.getTime() - start.getTime()) / 86400000)
      const dailyRate = rate > 0 ? Math.pow(1 + rate / 100, 1 / 252) - 1 : 0
      const balance = amount * Math.pow(1 + dailyRate, days)
      history.push({
        date: cur.toISOString().split('T')[0],
        balance: parseFloat(balance.toFixed(2)),
        yield: parseFloat((balance - amount).toFixed(2)),
      })
      cur.setMonth(cur.getMonth() + 1)
    }

    const todayStr = today.toISOString().split('T')[0]
    if (history[history.length - 1]?.date !== todayStr) {
      const { balance, yieldAmount } = calcYield(amount, rate, inv.started_at)
      history.push({ date: todayStr, balance, yield: yieldAmount })
    }

    return res.json({ investment: inv, history })
  } catch (error) {
    console.error('Get history error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router