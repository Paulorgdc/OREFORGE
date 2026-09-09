import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import investmentRoutes from './routes/investments'
import userRoutes from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors({
  origin: '*',
  credentials: true,
}))

app.use(express.json())

app.get('/health', (_: Request, res: Response) => {
  res.json({ ok: true, app: 'OREFORGE API v1.0' })
})

app.use('/auth', authRoutes)
app.use('/investments', investmentRoutes)
app.use('/users', userRoutes)

app.use((_: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => console.log(`⛏️  OREFORGE API running on port ${PORT}`))