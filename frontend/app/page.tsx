'use client'
import Navbar from '@/components/Navbar'
import ForgeFlameBackground from '@/components/ForgeFlameBackground'
import ForgeFlameCard from '@/components/ForgeFlameCard'

export default function Home() {
  const scrollToDownload = () => {
    const element = document.getElementById('download-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'transparent', color: '#fff', fontFamily: "'Segoe UI', system-ui, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <ForgeFlameBackground />
      <Navbar />

      {/* Hero Section */}
      <section style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.0, marginBottom: 28, letterSpacing: '-3px' }}>
          Invista com<br />
          <span style={{ color: '#f59e0b' }}>inteligência</span><br />
          e gamificação
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 500, lineHeight: 1.7, marginBottom: 52 }}>
          Gerencie CDB, CDI, SELIC, Poupança e muito mais em um só lugar.
          Ganhe XP, suba de nível e transforme seus investimentos em conquistas.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={scrollToDownload}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              border: 'none',
              fontWeight: 800,
              fontSize: 16,
              padding: '17px 40px',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)',
              fontFamily: 'inherit',
            }}
          >
            <span>📱</span> Baixe aqui
          </button>
        </div>

        <div style={{ display: 'flex', gap: 64, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['9+', 'Tipos de ativo'],
            ['XP', 'Sistema gamificado'],
            ['100%', 'Gratuito'],
          ].map(([value, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', letterSpacing: '-1px' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid de Recursos */}
      <section style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 14 }}>O que é o OREFORGE</div>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Seu gerenciador de<br /><span style={{ color: '#f59e0b' }}>investimentos pessoais</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 560, margin: '20px auto 0', lineHeight: 1.7 }}>
            OREFORGE centraliza todos os seus investimentos de renda fixa e variável, calcula rendimentos automaticamente e te recompensa com XP por cada decisão financeira.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {[
            { icon: '💰', title: 'Registre seus investimentos', desc: 'Adicione CDB, CDI, SELIC, Poupança, Tesouro Direto, Ações, FII ou Cripto de forma rápida e prática.' },
            { icon: '📊', title: 'Rendimentos automáticos', desc: 'O app calcula o rendimento diário de cada ativo com base no CDI e taxas cadastradas, sem complicações.' },
            { icon: '⛏️', title: 'Gamificação financeira', desc: 'Cada ação gera XP. Invista mais, diversifique sua carteira e suba de nível enquanto constrói seu patrimônio.' },
            { icon: '📈', title: 'Visão geral da carteira', desc: 'Veja patrimônio total, rendimento acumulado e distribuição dos seus ativos em um único dashboard.' },
            { icon: '🏆', title: 'Conquistas e medalhas 3D', desc: 'Desbloqueie conquistas e medalhas 3D interativas ao atingir metas e evoluir seu nível.' },
            { icon: '🔐', title: 'Seguro e privado', desc: 'Dados protegidos com autenticação segura. Nenhum dado bancário ou senha de conta é solicitado.' },
          ].map(({ icon, title, desc }) => (
            <ForgeFlameCard key={title} style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </ForgeFlameCard>
          ))}
        </div>
      </section>

      {/* Ativos Suportados */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 14 }}>Ativos suportados</div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, marginBottom: 40, letterSpacing: '-1px' }}>Tudo em um só lugar</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {[
            ['CDB', '#f59e0b'],
            ['CDI', '#a855f7'],
            ['SELIC', '#3b82f6'],
            ['Poupança', '#10b981'],
            ['Tesouro Direto', '#06b6d4'],
            ['Ações', '#ef4444'],
            ['FII', '#8b5cf6'],
            ['Cripto', '#f97316'],
            ['Outros', '#64748b'],
          ].map(([label, color]) => (
            <div key={label} style={{ background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 700 }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Gamificação */}
      <section style={{ padding: '80px 24px', maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 14 }}>Gamificação</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
          Investir virou<br /><span style={{ color: '#f59e0b' }}>um jogo</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 48 }}>
          Ganhe XP a cada investimento adicionado, meta alcançada ou carteira diversificada. Suba de nível e mostre que você é um verdadeiro minerador de riqueza.
        </p>

        <ForgeFlameCard style={{ padding: 28, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Minerador Nível</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', letterSpacing: '-1px' }}>7 ⛏️</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>XP Total</div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 18 }}>3.240</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 12, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: '65%', background: 'linear-gradient(to right, #f59e0b, #d97706)', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>325 XP para o próximo nível</span><span>65%</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {['+30 XP Investimento adicionado', '+50 XP Primeiro aporte', '+80 XP Meta alcançada'].map(xp => (
              <div key={xp} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                {xp}
              </div>
            ))}
          </div>
        </ForgeFlameCard>
      </section>

      {/* Seção Final de Acesso / Download Direto do APK */}
      <section id="download-section" style={{ padding: '80px 24px 120px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <ForgeFlameCard style={{ maxWidth: 560, margin: '0 auto', padding: '64px 48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Comece a minerar<br />seu futuro hoje
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 36, fontSize: 16 }}>
            Aplicativo oficial para Android. 100% gratuito e seguro.
          </p>

          <a
            href="/downloads/oreforge.apk"
            download="oreforge.apk"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: 18,
              padding: '18px 48px',
              borderRadius: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 0 28px rgba(245, 158, 11, 0.4)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span style={{ fontSize: 22 }}>📱</span>
            <span>Baixar App (.APK)</span>
          </a>

          <div style={{ color: '#64748b', fontSize: 12, marginTop: 16 }}>
            Versão de produção para Android · Instalação direta
          </div>
        </ForgeFlameCard>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1, background: 'rgba(8, 11, 20, 0.8)' }}>
        <span style={{ fontWeight: 900, fontSize: 16 }}>ORE<span style={{ color: '#f59e0b' }}>FORGE</span></span>
        <span style={{ color: '#64748b', fontSize: 13 }}>© 2026 OREFORGE</span>
      </footer>
    </main>
  )
}