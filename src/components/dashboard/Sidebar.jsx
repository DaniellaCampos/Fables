import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Palette, Shirt, Calendar, Settings, Sparkles } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mi-marca', label: 'Mi Marca', icon: Palette },
  { to: '/create/closet', label: 'Armario', icon: Shirt },
  { to: '/calendario', label: 'Calendario', icon: Calendar },
  { to: '/ajustes', label: 'Ajustes', icon: Settings }
];

export default function Sidebar() {
  return (
    <>
      {/* Desktop: floating vertical pill sidebar, detached from the screen edge */}
      <aside className="hidden md:flex fixed left-6 top-6 bottom-6 w-20 flex-col items-center justify-between bg-charcoal rounded-3xl py-6 z-20">
        <div className="w-10 h-10 rounded-full bg-hero flex items-center justify-center text-charcoal">
          <Sparkles size={18} />
        </div>

        <nav className="flex flex-col gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  isActive ? 'bg-hero text-charcoal' : 'text-cream/60 hover:text-cream hover:bg-white/5'
                }`
              }
            >
              <Icon size={20} />
            </NavLink>
          ))}
        </nav>

        <div className="w-10 h-10 rounded-full bg-gray-warm-800 text-cream flex items-center justify-center text-xs font-sans font-semibold">
          AL
        </div>
      </aside>

      {/* Mobile: floating bottom bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-charcoal rounded-3xl flex justify-around items-center py-3 z-20">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-2xl ${
                isActive ? 'text-hero' : 'text-cream/60'
              }`
            }
          >
            <Icon size={18} />
          </NavLink>
        ))}
      </nav>
    </>
  );
}
