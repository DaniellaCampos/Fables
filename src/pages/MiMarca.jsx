import Sidebar from '../components/dashboard/Sidebar';
import BrandDNACard from '../components/dashboard/BrandDNACard';
import SocialStatsCard from '../components/dashboard/SocialStatsCard';
import OpportunityRadarCard from '../components/dashboard/OpportunityRadarCard';
import ContentCalendarCard from '../components/dashboard/ContentCalendarCard';
import { useApp } from '../context/AppContext';

const todayLabel = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

export default function MiMarca() {
  const { brand } = useApp();

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Sidebar />

      <main className="md:pl-32 px-6 md:pr-10 py-10 pb-40 md:pb-10">
        <header className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-charcoal">
            Tu marca hoy, {brand.name} ☀️
          </h1>
          <p className="mt-2 font-sans text-gray-warm-500 capitalize">{todayLabel}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <BrandDNACard className="md:col-span-6 md:row-span-2" />
          <SocialStatsCard className="md:col-span-6" />
          <OpportunityRadarCard className="md:col-span-6" />
          <ContentCalendarCard className="md:col-span-12" />
        </div>
      </main>
    </div>
  );
}
