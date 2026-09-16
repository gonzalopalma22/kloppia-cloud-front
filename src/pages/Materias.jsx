import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './Materias.module.css';

export default function Materias() {
  const [materias, setMaterias]         = useState([]);
  const [form, setForm]                 = useState({ nombre: '', descripcion: '' });
  const [error, setError]               = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuAbierto, setMenuAbierto]   = useState(null);
  const [modalEditar, setModalEditar]   = useState(null);
  const [formEditar, setFormEditar]     = useState({ nombre: '', descripcion: '' });
  const { user, logout }                = useAuth();
  const navigate                        = useNavigate();
  const dropdownRef                     = useRef(null);

  useEffect(() => { fetchMaterias(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (!e.target.closest(`.${styles.cardMenu}`)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMaterias = async () => {
    try {
      const res = await api.get('/api/materias');
      setMaterias(res.data);
    } catch {
      setError('Error al cargar materias');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/materias', form);
      setForm({ nombre: '', descripcion: '' });
      fetchMaterias();
    } catch {
      setError('Error al crear materia');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta materia? También se eliminarán todos sus apuntes.')) return;
    try {
      await api.delete(`/api/materias/${id}`);
      fetchMaterias();
    } catch {
      setError('Error al eliminar materia');
    }
  };

  const abrirEditar = (m) => {
    setMenuAbierto(null);
    setModalEditar(m);
    setFormEditar({ nombre: m.nombre, descripcion: m.descripcion || '' });
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/materias/${modalEditar.id}`, formEditar);
      setModalEditar(null);
      fetchMaterias();
    } catch {
      setError('Error al editar materia');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

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
          <h1 className={styles.pageTitle}>Mis materias</h1>
          <p className={styles.pageSubtitle}>Crea tus materias y sube tus PDFs para resumirlos al instante.</p>
        </div>
      </div>

      {/* Content */}
      <main className={styles.content}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.formCard}>
          <p className={styles.formTitle}>Nueva materia</p>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.formInput}>
              <input
                className="input"
                name="nombre"
                placeholder="Nombre de la materia"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formInput}>
              <input
                className="input"
                name="descripcion"
                placeholder="Descripción (opcional)"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className={styles.addBtn}>
              + Agregar
            </button>
          </form>
        </div>

        <p className={styles.sectionTitle}>
          {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
        </p>

        {materias.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No tienes materias aún</p>
            <p className={styles.emptyDesc}>Crea tu primera materia para empezar a organizar tus apuntes</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {materias.map((m) => (
              <div key={m.id} className={styles.card} onClick={() => navigate(`/materias/${m.id}/apuntes`)}>
                <div className={styles.cardTopRow}>
                  <p className={styles.cardName}>{m.nombre}</p>
                  <div className={styles.cardMenu}>
                    <button
                      className={styles.menuBtn}
                      onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === m.id ? null : m.id); }}
                    >
                      ⋮
                    </button>
                    {menuAbierto === m.id && (
                      <div className={styles.cardDropdown}>
                        <button
                          className={styles.cardDropdownItem}
                          onClick={(e) => { e.stopPropagation(); abrirEditar(m); }}
                        >
                          Editar
                        </button>
                        <button
                          className={`${styles.cardDropdownItem} ${styles.cardDropdownDanger}`}
                          onClick={(e) => { e.stopPropagation(); setMenuAbierto(null); handleDelete(m.id); }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {m.descripcion && (
                  <p className={styles.cardDesc}>{m.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal editar */}
      {modalEditar && (
        <div className={styles.modalOverlay} onClick={() => setModalEditar(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Editar materia</h2>
            <form onSubmit={handleEditar} className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  className="input"
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input
                  className="input"
                  value={formEditar.descripcion}
                  onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setModalEditar(null)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.modalSaveBtn}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}