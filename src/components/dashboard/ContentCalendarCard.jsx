import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getForecast } from '../../services/api';

/**
 * @typedef {Object} DummyPost
 * @property {string} date - 'YYYY-MM-DD'
 * @property {string} time - 'HH:MM', usada solo para ubicar el post en la vista semanal
 * @property {string|null} thumbnail
 * @property {string} caption
 * @property {'published'|'scheduled'|'draft'} status
 */

/** Umbral de score a partir del cual un día se marca como "pico esperado" (ver services/forecast_service.py). */
const PEAK_THRESHOLD = 2;
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function startOfDay(d) {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeekMonday(d) {
  const day = d.getDay(); // 0=Dom..6=Sáb
  const diff = (day === 0 ? -6 : 1) - day;
  return startOfDay(addDays(d, diff));
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getMonthGrid(cursor) {
  const gridStart = startOfWeekMonday(startOfMonth(cursor));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function getWeekDays(cursor) {
  const weekStart = startOfWeekMonday(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function timeBand(time) {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'Mañana';
  if (hour < 18) return 'Tarde';
  return 'Noche';
}

// Aventuras Lago Azul — negocio ficticio de paseos en lancha en el Lago de
// Ilopango (mismo negocio de ejemplo usado en el resto del demo). Fechas
// calculadas como offsets desde hoy para que el calendario siempre se vea
// poblado sin importar cuándo se corra la demo.
function buildDummyPosts() {
  const today = startOfDay(new Date());
  const at = (offset) => toKey(addDays(today, offset));

  return [
    {
      date: at(-9), time: '08:00', status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=60',
      caption: 'Nuevo tour matutino: sal antes que el sol caliente demasiado ☀️'
    },
    {
      date: at(-7), time: '10:30', status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&q=60',
      caption: 'Familias completas disfrutando el lago 💙 Reserva tu paseo de fin de semana'
    },
    {
      date: at(-5), time: '17:30', status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200&q=60',
      caption: 'Atardecer en Ilopango: el mejor ángulo se ve desde la lancha 🌅'
    },
    {
      date: at(-3), time: '15:00', status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60',
      caption: '3 razones para elegir Aventuras Lago Azul este verano'
    },
    {
      date: at(-2), time: '11:00', status: 'draft', thumbnail: null,
      caption: 'Borrador: promo combo desayuno + paseo'
    },
    {
      date: at(-1), time: '19:00', status: 'published',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=60',
      caption: 'Gracias a las 40 familias que nos visitaron este fin de semana 🙌'
    },
    {
      date: at(0), time: '16:00', status: 'scheduled', thumbnail: null,
      caption: 'Recordatorio: cupos limitados para el paseo de esta tarde'
    },
    {
      date: at(2), time: '19:30', status: 'scheduled', thumbnail: null,
      caption: 'Paseo especial de luna llena 🌕 (cupos limitados)'
    }
  ];
}

const STATUS_DOT = {
  published: 'bg-success',
  scheduled: 'bg-amber',
  draft: 'bg-gray-warm-500'
};

function ForecastChip({ opportunity, isBest }) {
  return (
    <span
      title={`${opportunity.reason} — ${opportunity.suggestedTimeSlot}`}
      className={`inline-block text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-pill whitespace-nowrap border ${
        isBest ? 'bg-hero text-charcoal border-hero' : 'bg-white text-charcoal border-amber/40'
      }`}
    >
      ⚡ Pico
    </span>
  );
}

function DayPopover({ day, opportunity, onClose, onCreate }) {
  return (
    <div className="day-popover absolute z-30 top-full mt-1 left-0 w-56 bg-charcoal text-cream rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-cream/70 mb-2">
        {day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      {opportunity && (
        <p className="text-xs text-hero mb-2">⚡ {opportunity.reason} — {opportunity.suggestedTimeSlot}</p>
      )}
      <button
        onClick={onCreate}
        className="w-full text-left text-sm font-sans font-semibold bg-hero text-charcoal rounded-pill px-3 py-2 hover:opacity-90 transition"
      >
        Crear contenido para este día →
      </button>
      <button
        onClick={onClose}
        className="w-full text-center text-xs text-cream/60 mt-2 hover:text-cream transition"
      >
        Cerrar
      </button>
    </div>
  );
}

export default function ContentCalendarCard({ className = '' }) {
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [forecastByDate, setForecastByDate] = useState({});
  const [bestDate, setBestDate] = useState(null);
  const [openPopoverKey, setOpenPopoverKey] = useState(null);
  const posts = useMemo(() => buildDummyPosts(), []);
  const nav = useNavigate();

  const today = startOfDay(new Date());
  const todayKey = toKey(today);

  useEffect(() => {
    (async () => {
      try {
        const data = await getForecast();
        const byDate = {};
        (data.opportunities || []).forEach(o => { byDate[o.date] = o; });
        setForecastByDate(byDate);
        const top = data.opportunities?.[0];
        setBestDate(top && top.score >= PEAK_THRESHOLD ? top.date : null);
      } catch {
        // Sin forecast disponible: el calendario sigue siendo útil solo con los posts.
        setForecastByDate({});
        setBestDate(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!openPopoverKey) return;
    const handler = (e) => {
      if (!e.target.closest('.day-popover')) {
        setOpenPopoverKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPopoverKey]);

  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      (map[p.date] ||= []).push(p);
    });
    return map;
  }, [posts]);

  const goToCreate = (dateKey, opportunity) => {
    setOpenPopoverKey(null);
    nav('/create/closet', {
      state: {
        opportunityDate: dateKey,
        inspiration: opportunity
          ? `${opportunity.reason} — horario sugerido: ${opportunity.suggestedTimeSlot}`
          : undefined
      }
    });
  };

  const handleDayClick = (day, dateKey, hasPosts) => {
    const isPast = day < today;
    if (isPast || hasPosts) return;
    setOpenPopoverKey(prev => (prev === dateKey ? null : dateKey));
  };

  const navLabel = view === 'month'
    ? `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`
    : (() => {
        const days = getWeekDays(cursor);
        const first = days[0], last = days[6];
        const sameMonth = first.getMonth() === last.getMonth();
        return sameMonth
          ? `${first.getDate()} – ${last.getDate()} de ${MONTH_LABELS[first.getMonth()]}`
          : `${first.getDate()} ${MONTH_LABELS[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTH_LABELS[last.getMonth()].slice(0, 3)}`;
      })();

  const step = (dir) => {
    setOpenPopoverKey(null);
    setCursor(c => view === 'month'
      ? new Date(c.getFullYear(), c.getMonth() + dir, 1)
      : addDays(c, dir * 7));
  };

  function renderDayCell(day, { muted = false } = {}) {
    const dateKey = toKey(day);
    const isToday = dateKey === todayKey;
    const isPast = day < today;
    const opp = forecastByDate[dateKey];
    const hasChip = Boolean(opp) && opp.score >= PEAK_THRESHOLD;
    const isBest = hasChip && dateKey === bestDate;
    const dayPosts = postsByDate[dateKey] || [];
    const hasPosts = dayPosts.length > 0;
    const isClickable = !isPast && !hasPosts;

    return (
      <div
        key={dateKey}
        className={`relative rounded-xl p-2 min-h-[92px] flex flex-col gap-1.5 border transition-colors ${
          hasChip ? 'bg-[#FDF0C6] border-transparent' : 'bg-cream/70 border-gray-warm-500/10'
        } ${isToday ? 'ring-2 ring-charcoal ring-inset' : ''} ${
          isClickable ? 'cursor-pointer hover:border-gray-warm-500/30' : ''
        } ${muted ? 'opacity-40' : ''}`}
        onClick={() => handleDayClick(day, dateKey, hasPosts)}
      >
        <div className="flex items-start justify-between gap-1">
          <span className={`text-xs font-sans font-bold ${isToday ? 'text-charcoal' : 'text-gray-warm-800'}`}>
            {day.getDate()}
          </span>
          {hasChip && <ForecastChip opportunity={opp} isBest={isBest} />}
        </div>

        <div className="flex flex-wrap gap-1 mt-auto">
          {dayPosts.slice(0, 3).map((post, i) => (
            post.status === 'published' ? (
              <img
                key={i}
                src={post.thumbnail}
                alt={post.caption}
                title={post.caption}
                className="w-6 h-6 rounded-md object-cover"
              />
            ) : (
              <span
                key={i}
                title={post.caption}
                className={`w-2.5 h-2.5 rounded-full self-center ${STATUS_DOT[post.status]}`}
              />
            )
          ))}
        </div>

        {openPopoverKey === dateKey && (
          <DayPopover
            day={day}
            opportunity={opp}
            onClose={() => setOpenPopoverKey(null)}
            onCreate={() => goToCreate(dateKey, opp)}
          />
        )}
      </div>
    );
  }

  const monthDays = useMemo(() => getMonthGrid(cursor), [cursor]);
  const weekDays = useMemo(() => getWeekDays(cursor), [cursor]);
  const bands = ['Mañana', 'Tarde', 'Noche'];

  return (
    <div className={`bg-butter rounded-card p-6 md:p-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Calendario de contenido</h2>
          <p className="font-sans text-xs text-gray-warm-500 mt-1">
            Los días con ⚡ tienen mayor probabilidad de demanda según el radar de oportunidades.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-cream/80 rounded-pill p-1">
          {['month', 'week'].map(v => (
            <button
              key={v}
              onClick={() => { setView(v); setOpenPopoverKey(null); }}
              className={`rounded-pill px-4 py-1.5 text-sm font-sans font-semibold transition ${
                view === v ? 'bg-charcoal text-cream' : 'text-gray-warm-800'
              }`}
            >
              {v === 'month' ? 'Mes' : 'Semana'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => step(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-warm-800 hover:bg-cream transition"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-sans text-sm font-semibold text-charcoal capitalize min-w-[180px] text-center">
          {navLabel}
        </span>
        <button
          onClick={() => step(1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-warm-800 hover:bg-cream transition"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        {view === 'month' ? (
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAY_LABELS.map(w => (
                <span key={w} className="text-xs font-sans font-semibold text-gray-warm-500 text-center">{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => renderDayCell(day, {
                muted: day.getMonth() !== cursor.getMonth()
              }))}
            </div>
          </div>
        ) : (
          <div className="min-w-[640px] grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dateKey = toKey(day);
              const isToday = dateKey === todayKey;
              const opp = forecastByDate[dateKey];
              const hasChip = Boolean(opp) && opp.score >= PEAK_THRESHOLD;
              const isBest = hasChip && dateKey === bestDate;
              const dayPosts = postsByDate[dateKey] || [];
              const isPast = day < today;
              const isClickable = !isPast && dayPosts.length === 0;

              return (
                <div key={dateKey} className="flex flex-col gap-2">
                  <div className={`text-center rounded-xl py-2 ${isToday ? 'ring-2 ring-charcoal ring-inset' : ''} ${hasChip ? 'bg-[#FDF0C6]' : 'bg-cream/70'}`}>
                    <div className="text-xs font-sans font-bold text-gray-warm-800">{WEEKDAY_LABELS[i]}</div>
                    <div className="text-sm font-sans font-bold text-charcoal">{day.getDate()}</div>
                    {hasChip && <div className="mt-1 flex justify-center"><ForecastChip opportunity={opp} isBest={isBest} /></div>}
                  </div>

                  <div
                    className={`relative flex-1 rounded-xl border border-gray-warm-500/10 bg-cream/50 p-1.5 flex flex-col gap-1.5 ${isClickable ? 'cursor-pointer hover:border-gray-warm-500/30' : ''}`}
                    onClick={() => handleDayClick(day, dateKey, dayPosts.length > 0)}
                  >
                    {bands.map(band => {
                      const bandPosts = dayPosts.filter(p => timeBand(p.time) === band);
                      return (
                        <div key={band} className="min-h-[46px] rounded-lg bg-white/40 px-2 py-1">
                          <span className="text-[9px] uppercase tracking-wide text-gray-warm-500 font-sans">{band}</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {bandPosts.map((post, idx) => (
                              post.status === 'published' ? (
                                <img
                                  key={idx}
                                  src={post.thumbnail}
                                  alt={post.caption}
                                  title={post.caption}
                                  className="w-6 h-6 rounded-md object-cover"
                                />
                              ) : (
                                <span
                                  key={idx}
                                  title={post.caption}
                                  className={`w-2.5 h-2.5 rounded-full self-center ${STATUS_DOT[post.status]}`}
                                />
                              )
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {openPopoverKey === dateKey && (
                      <DayPopover
                        day={day}
                        opportunity={opp}
                        onClose={() => setOpenPopoverKey(null)}
                        onCreate={() => goToCreate(dateKey, opp)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
