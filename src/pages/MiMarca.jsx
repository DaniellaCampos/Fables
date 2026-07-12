import { useNavigate } from 'react-router-dom';
import { Sliders } from 'lucide-react';
import { Badge, Button } from '../components/ui';
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
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="page-heading split">
        <div>
          <Badge tone="teal">TU MARCA HOY</Badge>
          <h1 className="capitalize">
            Tu marca hoy, {brand.name} ☀️
          </h1>
          <p className="mt-2 font-sans text-gray-warm-500 capitalize">{todayLabel}</p>
        </div>
        <Button onClick={() => navigate('/brand/editar')}>
          <Sliders size={16} />
          Editar negocio
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <BrandDNACard className="md:col-span-6 md:row-span-2" />
        <SocialStatsCard className="md:col-span-6" />
        <OpportunityRadarCard className="md:col-span-6" />
        <ContentCalendarCard className="md:col-span-12" />
      </div>
    </div>
  );
}
