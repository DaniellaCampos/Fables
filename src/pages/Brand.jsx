import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Check,Save,ArrowLeft} from 'lucide-react';
import {audiences,brandStyles} from '../mocks/data';
import {useApp} from '../context/AppContext';
import {Badge,Button,ChoiceGrid,Field,SelectField} from '../components/ui';
import {updateOnboarding} from '../services/api';

export default function Brand(){
  const {brand,updateBrand}=useApp();
  const [data,setData]=useState(brand);
  const [saved,setSaved]=useState(false);
  const navigate = useNavigate();

  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  const toggle=(k,v)=>set(k,data[k].includes(v)?data[k].filter(x=>x!==v):[...data[k],v]);
  const save=async()=>{
    try {
      const payload={
        name: data.name || '',
        nicho_negocio: data.service || 'Paseos en lancha',
        ubicacion: data.location || 'Lago de Ilopango',
        language: data.language || 'Español',
        color_hex: data.primary || '#0b6670',
        secondary_color: data.secondary || '#e85f3d',
        audiences: data.audiences || [],
        
        arquetipo_marca: brand.arquetipo_marca || "Explorador",
        proposito_marca: brand.proposito_marca || data.description || "porque si",
        enemigo_marca: brand.enemigo_marca || "la gente",
        tono_voz: brand.tono_voz || "Formal",
        emocion_objetivo: brand.emocion_objetivo || "Confianza",
        cliente_ideal: data.audiences && data.audiences.length ? data.audiences.join(', ') : "Familias",
        vibra_marca: (data.styles && data.styles[0]) || "Aventurera"
      };

      await updateOnboarding(payload);
      
      updateBrand({
        ...data,
        arquetipo_marca: payload.arquetipo_marca,
        proposito_marca: payload.proposito_marca,
        enemigo_marca: payload.enemigo_marca,
        tono_voz: payload.tono_voz,
        emocion_objetivo: payload.emocion_objetivo
      });

      setSaved(true);
      setTimeout(()=>setSaved(false),2200);
    } catch (err) {
      console.error("Error al actualizar marca:", err);
      alert("Hubo un problema al guardar los cambios en la base de datos de Firebase.");
    }
  };

  return (
    <div className="page brand-page">
      <header className="page-heading split">
        <div>
          <Badge>IDENTIDAD DE MARCA</Badge>
          <h1>Mi marca</h1>
          <p>Mantén al día la esencia que guía todas tus recomendaciones.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => navigate('/brand')}>
            <ArrowLeft size={16} /> Volver
          </Button>
          <Button onClick={save}>
            <Save size={16} /> Guardar cambios
          </Button>
        </div>
      </header>
      <div className="brand-editor">
        <section>
          <div className="editor-block">
            <span>01 · TU NEGOCIO</span>
            <div className="form-grid">
              <Field label="Nombre del negocio" value={data.name} onChange={e=>set('name',e.target.value)}/>
              <Field label="Servicio" value={data.service} onChange={e=>set('service',e.target.value)}/>
              <Field label="Ubicación" value={data.location} onChange={e=>set('location',e.target.value)}/>
              <SelectField label="Idioma" value={data.language} onChange={e=>set('language',e.target.value)}>
                <option>Español</option>
                <option>English</option>
                <option>Español e inglés</option>
              </SelectField>
            </div>
          </div>
          <div className="editor-block">
            <span>02 · TU PÚBLICO</span>
            <ChoiceGrid items={audiences} selected={data.audiences} multiple onToggle={v=>toggle('audiences',v)}/>
          </div>
          <div className="editor-block">
            <span>03 · TU ESTILO</span>
            <ChoiceGrid items={brandStyles} selected={data.styles} multiple onToggle={v=>toggle('styles',v)}/>
            <div className="color-fields">
              <label className="field">
                <span>Color principal</span>
                <div className="color-input">
                  <input type="color" value={data.primary} onChange={e=>set('primary',e.target.value)}/>
                  <code>{data.primary}</code>
                </div>
              </label>
              <label className="field">
                <span>Color secundario</span>
                <div className="color-input">
                  <input type="color" value={data.secondary} onChange={e=>set('secondary',e.target.value)}/>
                  <code>{data.secondary}</code>
                </div>
              </label>
            </div>
          </div>
        </section>
        <aside className="brand-mini-preview" style={{background:data.primary}}>
          <small>ASÍ TE VERÁN</small>
          <h2>{data.name}</h2>
          <p>{data.description}</p>
          <span style={{background:data.secondary}}>{data.styles[0]||'TU ESTILO'}</span>
        </aside>
      </div>
      {saved&&<div className="toast" role="status"><Check/>Tu marca quedó actualizada</div>}
    </div>
  );
}
