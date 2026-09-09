import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthReq extends Request {
  userId?: string
}

export function requireAuth(req: AuthReq, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado' })
    return
  }

  try {
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}