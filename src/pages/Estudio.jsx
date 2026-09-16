import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { generarFlashcards, enviarMensajeChat, obtenerHistorialChat } from '../services/api';
import styles from './Estudio.module.css';

export default function Estudio() {
  const { id: materiaId, apunteId }       = useParams();
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();

  const [apunte, setApunte]           = useState(null);
  const [tabActiva, setTabActiva]     = useState('resumen');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                   = useRef(null);

  // ── Flashcards ─────────────────────────────────────────────────────────────
  const [flashcards, setFlashcards]   = useState([]);
  const [cantidad, setCantidad]       = useState(10);
  const [cardActual, setCardActual]   = useState(0);
  const [volteada, setVolteada]       = useState(false);
  const [loadingFC, setLoadingFC]     = useState(false);
  const [errorFC, setErrorFC]         = useState('');

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [historial, setHistorial]     = useState([]);
  const [pregunta, setPregunta]       = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [errorChat, setErrorChat]     = useState('');
  const chatBottomRef                 = useRef(null);

  useEffect(() => {
    fetchApunte();
    fetchHistorial();
  }, [apunteId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial]);

  const fetchApunte = async () => {
    try {
      const res = await api.get(`/api/materias/${materiaId}/apuntes/${apunteId}`);
      setApunte(res.data);
    } catch {
      navigate(`/materias/${materiaId}/apuntes`);
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await obtenerHistorialChat(materiaId, apunteId);
      setHistorial(res.data);
    } catch {
      // Si falla silenciosamente, el chat arranca vacio
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Flashcards ─────────────────────────────────────────────────────────────

  const handleGenerarFlashcards = async () => {
    setLoadingFC(true);
    setErrorFC('');
    setFlashcards([]);
    setCardActual(0);
    setVolteada(false);
    try {
      const res = await generarFlashcards(materiaId, apunteId, cantidad);
      setFlashcards(res.data);
    } catch {
      setErrorFC('Error al generar flashcards. Intenta de nuevo.');
    } finally {
      setLoadingFC(false);
    }
  };

  const siguiente = () => {
    setVolteada(false);
    setTimeout(() => setCardActual((c) => Math.min(c + 1, flashcards.length - 1)), 150);
  };

  const anterior = () => {
    setVolteada(false);
    setTimeout(() => setCardActual((c) => Math.max(c - 1, 0)), 150);
  };

  // ── Chat ───────────────────────────────────────────────────────────────────

  const handleEnviar = async (e) => {
    e.preventDefault();
    const texto = pregunta.trim();
    if (!texto || loadingChat) return;

    setHistorial((h) => [...h, { role: 'user', content: texto }]);
    setPregunta('');
    setLoadingChat(true);
    setErrorChat('');

    try {
      const res = await enviarMensajeChat(materiaId, apunteId, texto);
      setHistorial((h) => [...h, { role: 'model', content: res.data.respuesta }]);
    } catch {
      setErrorChat('Error al enviar mensaje. Intenta de nuevo.');
      setHistorial((h) => h.slice(0, -1));
    } finally {
      setLoadingChat(false);
    }
  };

  if (!apunte) return (
    <div className={styles.wrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <span className={styles.logo}>
            Klopp<span className={styles.logoAccent}>IA</span>
          </span>
        </div>
      </nav>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonTabs} />
      <main className={styles.content}>
        <div className={styles.skeletonCard} />
      </main>
    </div>
  );

  return (
    <div className={styles.wrapper}>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <span className={styles.logo} onClick={() => navigate('/materias')}>
            Klopp<span className={styles.logoAccent}>IA</span>
          </span>
          <div className={styles.navRight}>
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user?.nombre}
                <span className={styles.userBtnChevron}>▼</span>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerGrid} />
        <div className={styles.headerGlow} />
        <div className={styles.headerInner}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(`/materias/${materiaId}/apuntes`)}
          >
            ← Volver a apuntes
          </button>
          <h1 className={styles.pageTitle}>{apunte.titulo}</h1>
          <p className={styles.pageSubtitle}>{apunte.nombreArchivo}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {[
            { key: 'resumen',    label: 'Resumen'   },
            { key: 'flashcards', label: 'Flashcards' },
            { key: 'chat',       label: 'Chat'       },
          ].map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${tabActiva === t.key ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className={styles.content}>

        {/* ── Resumen ──────────────────────────────────────────────────────── */}
        {tabActiva === 'resumen' && (
          <div className={styles.resumenCard}>
            <p className={styles.resumenLabel}>Resumen generado por IA</p>
            <p className={styles.resumenText}>{apunte.resumen}</p>
          </div>
        )}

        {/* ── Flashcards ───────────────────────────────────────────────────── */}
        {tabActiva === 'flashcards' && (
          <div className={styles.flashcardsWrapper}>
            {flashcards.length === 0 ? (
              <div className={styles.fcSetup}>
                <p className={styles.fcSetupTitle}>Generar flashcards</p>
                <p className={styles.fcSetupDesc}>
                  La IA creara preguntas y respuestas a partir del resumen de este apunte.
                </p>
                <div className={styles.fcCantidadWrapper}>
                  <label className={styles.fcCantidadLabel}>¿Cuantas flashcards?</label>
                  <div className={styles.fcCantidadBtns}>
                    {[5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        className={`${styles.fcCantidadBtn} ${cantidad === n ? styles.fcCantidadBtnActive : ''}`}
                        onClick={() => setCantidad(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                {errorFC && <p className={styles.fcError}>{errorFC}</p>}
                <button
                  className={styles.fcGenerarBtn}
                  onClick={handleGenerarFlashcards}
                  disabled={loadingFC}
                >
                  {loadingFC ? (
                    <span className={styles.fcLoadingText}>
                      <span className={styles.fcSpinner} /> Generando...
                    </span>
                  ) : 'Generar flashcards'}
                </button>
              </div>
            ) : (
              <div className={styles.fcViewer}>
                <div className={styles.fcProgress}>
                  <span className={styles.fcProgressText}>
                    {cardActual + 1} / {flashcards.length}
                  </span>
                  <div className={styles.fcProgressBar}>
                    <div
                      className={styles.fcProgressFill}
                      style={{ width: `${((cardActual + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div
                  className={`${styles.fcCard} ${volteada ? styles.fcCardFlipped : ''}`}
                  onClick={() => setVolteada(!volteada)}
                >
                  <div className={styles.fcCardInner}>
                    <div className={styles.fcCardFront}>
                      <span className={styles.fcCardHint}>Pregunta — clic para ver respuesta</span>
                      <p className={styles.fcCardText}>{flashcards[cardActual]?.pregunta}</p>
                    </div>
                    <div className={styles.fcCardBack}>
                      <span className={styles.fcCardHint}>Respuesta</span>
                      <p className={styles.fcCardText}>{flashcards[cardActual]?.respuesta}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.fcNav}>
                  <button
                    className={styles.fcNavBtn}
                    onClick={anterior}
                    disabled={cardActual === 0}
                  >
                    ← Anterior
                  </button>
                  <button
                    className={styles.fcResetBtn}
                    onClick={() => { setFlashcards([]); setCardActual(0); setVolteada(false); }}
                  >
                    Regenerar
                  </button>
                  <button
                    className={styles.fcNavBtn}
                    onClick={siguiente}
                    disabled={cardActual === flashcards.length - 1}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Chat ─────────────────────────────────────────────────────────── */}
        {tabActiva === 'chat' && (
          <div className={styles.chatWrapper}>
            <div className={styles.chatMessages}>
              {historial.length === 0 && (
                <div className={styles.chatEmpty}>
                  <p className={styles.chatEmptyTitle}>Chat con tu apunte</p>
                  <p className={styles.chatEmptyDesc}>
                    Consulta dudas, pide que explique conceptos o pon a prueba tu conocimiento.
                  </p>
                </div>
              )}
              {historial.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.chatMsg} ${m.role === 'user' ? styles.chatMsgUser : styles.chatMsgModel}`}
                >
                  <p className={styles.chatMsgText}>{m.content}</p>
                </div>
              ))}
              {loadingChat && (
                <div className={`${styles.chatMsg} ${styles.chatMsgModel}`}>
                  <span className={styles.chatTyping}>
                    <span /><span /><span />
                  </span>
                </div>
              )}
              {errorChat && <p className={styles.chatError}>{errorChat}</p>}
              <div ref={chatBottomRef} />
            </div>

            <form className={styles.chatForm} onSubmit={handleEnviar}>
              <input
                className={styles.chatInput}
                placeholder="Escribe tu pregunta..."
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                disabled={loadingChat}
                autoComplete="off"
              />
              <button
                type="submit"
                className={styles.chatSendBtn}
                disabled={!pregunta.trim() || loadingChat}
              >
                Enviar
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}