import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function Designs() {
  const { savedDesigns, setProject, setCampaign } = useApp();
  const nav = useNavigate();

  // If there are no saved designs, fallback to default mocks so the page isn't empty
  const designsToShow = savedDesigns.length > 0 
    ? savedDesigns.map((d) => ({
        name: d.name,
        type: d.format === 'story' ? 'Historia' : d.format === 'post' ? 'Post' : 'Carrusel',
        url: d.imageUrl,
        editedText: 'Creado recientemente',
        settings: d.projectSettings,
        campaignCopy: d.campaignCopy || '',
        campaignHashtags: d.campaignHashtags || [],
        campaignMusic: d.campaignMusic || ''
      }))
    : [
        { 
          name: 'Fin de semana en el lago', 
          type: 'Historia', 
          url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80', 
          editedText: 'Editado hace 2 días' 
        },
        { 
          name: 'Una tarde diferente', 
          type: 'Post', 
          url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80', 
          editedText: 'Editado hace 3 días' 
        },
        { 
          name: 'Descubre Ilopango', 
          type: 'Carrusel', 
          url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80', 
          editedText: 'Editado hace 4 días' 
        }
      ];

  const handleOpen = (item) => {
    if (item.settings) {
      setProject(item.settings);
    }
    // Restaurar los datos de campaña asociados para que Preview pueda mostrarlos
    setCampaign({
      instagram_copy: item.campaignCopy || '',
      hashtags: item.campaignHashtags || [],
      suggested_music: item.campaignMusic || ''
    });
    nav('/create/preview');
  };

  return (
    <div className="page">
      <header className="page-heading split">
        <div>
          <Badge>TU COLECCIÓN</Badge>
          <h1>Mis diseños</h1>
          <p>
            Ideas que guardaste para volver a usarlas o inspirarte.{" "}
            <span style={{ color: "#e85f3d", fontWeight: "600" }}>
              (Se eliminan automáticamente después de 90 días)
            </span>
          </p>
        </div>
        <Button onClick={() => nav('/create')}>
          <Plus />
          Nueva pieza
        </Button>
      </header>

      <div className="designs-grid">
        {designsToShow.map((item, i) => (
          <article key={item.name + '-' + i}>
            <img src={item.url} alt={item.name} />
            <div>
              <Badge tone={i === 0 ? 'coral' : 'teal'}>{item.type}</Badge>
              <h2>{item.name}</h2>
              <p>{item.editedText}</p>
              <button onClick={() => handleOpen(item)}>
                Abrir <ArrowRight />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
