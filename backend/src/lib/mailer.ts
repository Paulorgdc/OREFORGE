import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetCodeEmail(toEmail: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`⚠️ SMTP não configurado no Render. Código para ${toEmail}: ${code}`)
    return
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #080b14; color: #ffffff; padding: 40px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(245, 158, 11, 0.3);">
      <h2 style="color: #f59e0b; text-align: center; margin-bottom: 8px;">OREFORGE</h2>
      <p style="text-align: center; color: #94a3b8; font-size: 14px; margin-top: 0;">Recuperação de Conta</p>
      
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Olá,</p>
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta no OREFORGE. Se você realizou esse pedido, utilize o código abaixo:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3); display: inline-block;">
          ${code}
        </span>
      </div>
      
      <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">Esse código expira em 15 minutos.</p>
      <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: #475569; text-align: center;">Se você não solicitou essa alteração, nenhuma ação é necessária e sua senha permanecerá a mesma.</p>
    </div>
  `

  await transporter.sendMail({
    from: '"OREFORGE Support" <' + process.env.SMTP_USER + '>',
    to: toEmail,
    subject: '🔑 Seu código de recuperação - OREFORGE',
    html: htmlContent,
  })
}