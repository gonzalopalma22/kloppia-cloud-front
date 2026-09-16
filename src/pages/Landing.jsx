import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

const features = [
  {
    title: 'Resúmenes instantáneos con IA',
    desc: 'Sube tus documentos largos y Gemini AI extraerá los conceptos clave en segundos. Ve directo al grano y enfócate en lo que realmente importa.',
    icon: (
      <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Tus materias bajo control',
    desc: 'Adiós a los archivos perdidos. Crea categorías, agrupa tus apuntes y mantén todo tu material de estudio perfectamente organizado en un solo lugar.',
    icon: (
      <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Repasa donde y cuando quieras',
    desc: 'Tus resúmenes están sincronizados en la nube. Estudia desde tu celular mientras viajas o desde tu computador en casa, sin interrupciones.',
    icon: (
      <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
];

export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/materias');
    }
  }, [user, navigate]);

  return (
    <div className={styles.wrapper}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <span className={styles.logo}>
            Klopp<span className={styles.logoAccent}>IA</span>
          </span>
          <div className={styles.navActions}>
            <button onClick={login} className={styles.loginBtn}>Iniciar sesión</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} />
            Powered by Gemini AI
          </div>
          <h1 className={styles.heroTitle}>
            Estudia más inteligente,
            <br />
            <span className={styles.heroTitleAccent}>no más duro.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Convierte documentos extensos en resúmenes precisos en segundos. Organiza tu información y optimiza tu tiempo de aprendizaje.
          </p>
          <div className={styles.heroActions}>
            <button onClick={login} className={styles.heroCta}>
              Resumir mi primer PDF gratis
            </button>
            <button onClick={login} className={styles.heroSecondary}>
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <p className={styles.featuresLabel}>Por qué KloppIA</p>
          <h2 className={styles.featuresTitle}>Todo lo que necesitas para aprender mejor</h2>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  {f.icon}
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            ¿Listo para transformar tu forma de estudiar?
          </h2>
          <p className={styles.ctaSubtitle}>
            Únete a KloppIA y empieza a convertir horas de lectura en resúmenes inteligentes hoy mismo.
          </p>
          <button onClick={login} className={styles.ctaBtn}>
            Crear cuenta gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2026 <span className={styles.footerAccent}>KloppIA</span> · Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}