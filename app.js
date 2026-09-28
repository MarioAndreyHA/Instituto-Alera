'use strict';

// Prototipo de IHC: todos los datos son ejemplos, no existe autenticación ni backend.
const courses = [
  { id: 'ihc', code: 'EST-301', name: 'Interacción Humano-Computadora', teacher: 'Docente de IHC', area: 'Diseño y tecnología' },
  { id: 'bd', code: 'EST-302', name: 'Bases de Datos', teacher: 'Docente de Bases de Datos', area: 'Desarrollo de software' },
  { id: 'redes', code: 'EST-303', name: 'Redes de Computadoras', teacher: 'Docente de Redes', area: 'Infraestructura' },
  { id: 'prog', code: 'EST-304', name: 'Programación Web', teacher: 'Docente de Programación', area: 'Desarrollo de software' }
];
const tasks = [
  { id: 't1', course: 'ihc', name: 'Boceto de interfaz', description: 'Prepara un boceto sencillo con las pantallas principales, su navegación y las acciones del estudiante.', days: 2 },
  { id: 't2', course: 'bd', name: 'Modelo de datos', description: 'Dibuja un modelo con las entidades, relaciones y llaves principales de una plataforma educativa.', days: 4 },
  { id: 't3', course: 'redes', name: 'Topología de red', description: 'Representa una topología de red y explica brevemente qué hace cada componente.', days: 5 },
  { id: 't4', course: 'prog', name: 'Estructura HTML', description: 'Crea una página con encabezado, navegación, contenido y pie utilizando etiquetas semánticas.', days: 7 },
  { id: 't5', course: 'ihc', name: 'Prueba de usabilidad', description: 'Define tres tareas y observa si un usuario puede completarlas con tu prototipo.', days: 9 }
];
const keys = { done: 'alera-demo-done' };
const state = { view: 'inicio', course: null, filter: 'todos', completed: new Set() };
const $ = selector => document.querySelector(selector);
const content = $('#content');
const modal = $('#task-modal');
let toastTimer;
try {
  const saved = JSON.parse(sessionStorage.getItem(keys.done) || '[]');
  state.completed = new Set(saved.filter(id => tasks.some(task => task.id === id)));
} catch { state.completed = new Set(); }

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
function futureDate(days) {
  const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date);
}
function today() { return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); }
function remainingTasks() { return tasks.filter(task => !state.completed.has(task.id)); }
function taskCourse(task) { return courses.find(course => course.id === task.course); }
function heading(eyebrow, title, description) {
  return `<div class="page-header"><div><div class="page-eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><span class="date-tag">${escapeHTML(today())}</span></div>`;
}
function card(course) {
  const pending = tasks.filter(task => task.course === course.id && !state.completed.has(task.id)).length;
  return `<button class="course-card" type="button" data-course="${course.id}"><span class="course-code">${course.code} / ${escapeHTML(course.area)}</span><h3>${escapeHTML(course.name)}</h3><p>${escapeHTML(course.teacher)}</p><span class="course-bottom"><span>${pending} ${pending === 1 ? 'actividad pendiente' : 'actividades pendientes'}</span><span aria-hidden="true">↗</span></span></button>`;
}
function taskRow(task) {
  const done = state.completed.has(task.id);
  return `<div class="task-row"><span class="task-indicator ${done ? 'done' : ''}" aria-hidden="true">${done ? '✓' : '↗'}</span><div class="task-content"><strong>${escapeHTML(task.name)}</strong><span>${escapeHTML(taskCourse(task).name)} · ${futureDate(task.days)}</span></div><div class="task-right"><span class="status-chip ${done ? 'done' : ''}">${done ? 'COMPLETADA' : 'PENDIENTE'}</span><button class="task-open" type="button" data-task="${task.id}" aria-label="Ver ${escapeHTML(task.name)}">Ver ↗</button></div></div>`;
}
function renderHome() {
  const pending = remainingTasks();
  content.innerHTML = heading('BIENVENIDO A TU ESPACIO', 'Hola, <em>estudiante.</em>', 'Este es tu punto de partida para organizar la semana.') + `
    <section class="hero-strip"><div><span class="hero-strip-label">TU PRÓXIMO PASO</span><h2>Un día a la vez.<br>Una meta a la vez.</h2><p>Tus actividades y materias, organizadas en un solo espacio.</p></div><button type="button" class="button" data-view="actividades">Ver mis actividades <span aria-hidden="true">↗</span></button></section>
    <section class="stats-grid" aria-label="Resumen académico"><div class="stat-card"><div class="stat-label">MATERIAS</div><div class="stat-value">${courses.length.toString().padStart(2,'0')}</div><div class="stat-meta">En curso</div></div><div class="stat-card"><div class="stat-label">PENDIENTES</div><div class="stat-value">${pending.length.toString().padStart(2,'0')}</div><div class="stat-meta">Por realizar</div></div><div class="stat-card"><div class="stat-label">COMPLETADAS</div><div class="stat-value">${state.completed.size.toString().padStart(2,'0')}</div><div class="stat-meta">En esta demo</div></div></section>
    <section><div class="section-title-row"><h2>Próximas actividades</h2><button class="text-link" type="button" data-view="actividades">Ver todas ↗</button></div><div class="task-list">${pending.length ? pending.slice(0,3).map(taskRow).join('') : '<div class="empty-state">No tienes actividades pendientes en esta demostración.</div>'}</div></section>
    <section style="margin-top:40px"><div class="section-title-row"><h2>Tus materias</h2><button class="text-link" type="button" data-view="materias">Ver materias ↗</button></div><div class="course-grid">${courses.slice(0,2).map(card).join('')}</div></section>`;
}
function renderCourses() {
  content.innerHTML = heading('TU RECORRIDO ACADÉMICO', 'Mis <em>materias.</em>', 'Selecciona una asignatura para revisar sus actividades.') + `<div class="course-grid">${courses.map(card).join('')}</div>`;
}
function renderCourse() {
  const course = courses.find(item => item.id === state.course);
  if (!course) return renderCourses();
  const list = tasks.filter(task => task.course === course.id);
  content.innerHTML = `<button class="text-link" type="button" id="back-courses" style="margin-bottom:28px">← Volver a materias</button>` + heading('MATERIA / ' + course.code, escapeHTML(course.name), 'Consulta las actividades correspondientes a esta asignatura.') + `<section class="course-detail"><span class="course-code">${escapeHTML(course.area)}</span><h2>${escapeHTML(course.name)}</h2><p>Este espacio reúne las actividades y la información de la materia. Los datos mostrados son ejemplos.</p><div class="course-meta"><span>DOCENTE: ${escapeHTML(course.teacher)}</span><span>ACTIVIDADES: ${list.length}</span></div></section><div class="section-title-row"><h2>Actividades de la materia</h2></div><div class="task-list">${list.map(taskRow).join('')}</div>`;
}
function renderTasks() {
  const list = tasks.filter(task => state.filter === 'todos' || (state.filter === 'pendientes' ? !state.completed.has(task.id) : state.completed.has(task.id)));
  content.innerHTML = heading('ORGANIZA TU SEMANA', 'Mis <em>actividades.</em>', 'Consulta los detalles y marca el progreso de tu demostración.') + `<div class="filter-bar" role="group" aria-label="Filtrar actividades">${[['todos','Todas'],['pendientes','Pendientes'],['completadas','Completadas']].map(([id,label])=>`<button type="button" class="filter-button ${state.filter === id ? 'active' : ''}" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join('')}</div><div class="task-list">${list.length ? list.map(taskRow).join('') : '<div class="empty-state">No hay actividades en esta categoría.</div>'}</div><p class="notice">Prototipo académico: marcar una actividad como completada solo modifica esta demostración. No se envían archivos ni se registran calificaciones.</p>`;
}
function renderProfile() {
  content.innerHTML = heading('TU CUENTA', 'Mi <em>perfil.</em>', 'Información de ejemplo utilizada para presentar la interfaz.') + `<div class="profile-card"><div class="profile-avatar" aria-hidden="true">EA</div><div><div class="course-code">PERFIL / DEMOSTRACIÓN</div><h2>Estudiante Alera</h2><p>Rol: Estudiante<br>Modalidad: Demostración académica<br>Materias activas: ${courses.length}</p></div></div><div class="notice">Esta versión no solicita datos personales ni almacena contraseñas. La gestión de usuarios y el inicio de sesión real se desarrollarán después con Cloudflare Workers y D1.</div><button type="button" class="button button-secondary" id="profile-exit" style="margin-top:26px">Salir de la demostración <span aria-hidden="true">↗</span></button>`;
}
const views = { inicio: 'Inicio', materias: 'Mis materias', actividades: 'Actividades', perfil: 'Mi perfil' };
function navigate(view, options = {}) {
  if (!Object.hasOwn(views, view)) return;
  state.view = view;
  if (view !== 'materias' || !options.keepCourse) state.course = null;
  document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === view); if (button.classList.contains('nav-item')) button.setAttribute('aria-current', button.dataset.view === view ? 'page' : 'false'); });
  $('#header-section').textContent = views[view];
  if (view === 'inicio') renderHome();
  if (view === 'materias') state.course ? renderCourse() : renderCourses();
  if (view === 'actividades') renderTasks();
  if (view === 'perfil') renderProfile();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function openTask(id) {
  const task = tasks.find(item => item.id === id); if (!task) return;
  const done = state.completed.has(id);
  $('#modal-content').innerHTML = `<div class="page-eyebrow">DETALLE DE ACTIVIDAD</div><h2 id="modal-title">${escapeHTML(task.name)}</h2><p>${escapeHTML(task.description)}</p><div class="modal-meta"><div><small>MATERIA</small><strong>${escapeHTML(taskCourse(task).name)}</strong></div><div><small>FECHA DE REFERENCIA</small><strong>${futureDate(task.days)}</strong></div><div><small>ESTADO</small><strong>${done ? 'Completada' : 'Pendiente'}</strong></div><div><small>MODALIDAD</small><strong>Demostración</strong></div></div><button type="button" class="button button-primary" id="toggle-task">${done ? 'Volver a pendiente' : 'Marcar como completada (demo)'} <span aria-hidden="true">↗</span></button><p class="demo-disclaimer">Esta acción no constituye una entrega real.</p>`;
  $('#toggle-task').addEventListener('click', () => {
    if (state.completed.has(id)) state.completed.delete(id); else state.completed.add(id);
    try { sessionStorage.setItem(keys.done, JSON.stringify([...state.completed])); } catch { /* modo privado: continúa sin persistencia */ }
    modal.close();
    navigate(state.view, { keepCourse: true });
    notify(state.completed.has(id) ? 'Actividad marcada como completada (demo).' : 'Actividad marcada como pendiente.');
  });
  if (typeof modal.showModal === 'function') modal.showModal();
}
function notify(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3100);
}
function enter() { $('#welcome').classList.add('hidden'); $('#app-shell').classList.remove('hidden'); navigate('inicio'); }
function exit() { $('#app-shell').classList.add('hidden'); $('#welcome').classList.remove('hidden'); state.course = null; window.scrollTo(0, 0); }
$('#enter-demo').addEventListener('click', enter);
$('#exit-demo').addEventListener('click', exit);
$('#close-modal').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.view) navigate(button.dataset.view);
  else if (button.dataset.course) { state.course = button.dataset.course; navigate('materias', { keepCourse: true }); }
  else if (button.dataset.task) openTask(button.dataset.task);
  else if (button.dataset.filter) { state.filter = button.dataset.filter; renderTasks(); }
  else if (button.id === 'back-courses') navigate('materias');
  else if (button.id === 'profile-exit') exit();
});
