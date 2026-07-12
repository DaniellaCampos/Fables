import {useEffect,useRef} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';

export default function RotatingOptionRail({items,activeIndex,onChange,renderOption,label='Opciones'}){
 const railRef=useRef(null); const drag=useRef({active:false,startX:0,scrollLeft:0});
 const move=(direction)=>onChange((activeIndex+direction+items.length)%items.length);
 useEffect(()=>{const rail=railRef.current;const target=rail?.querySelector(`[data-index="${activeIndex}"]`);target?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},[activeIndex]);
 const onPointerDown=e=>{const rail=railRef.current;drag.current={active:true,startX:e.clientX,scrollLeft:rail.scrollLeft};rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging')};
 const onPointerMove=e=>{if(!drag.current.active)return;railRef.current.scrollLeft=drag.current.scrollLeft-(e.clientX-drag.current.startX)};
 const endDrag=e=>{if(!drag.current.active)return;drag.current.active=false;railRef.current?.releasePointerCapture?.(e.pointerId);railRef.current?.classList.remove('is-dragging');const cards=[...railRef.current.querySelectorAll('.rail-option')];const center=railRef.current.getBoundingClientRect().left+railRef.current.clientWidth/2;const nearest=cards.reduce((best,card)=>Math.abs(card.getBoundingClientRect().left+card.clientWidth/2-center)<Math.abs(best.getBoundingClientRect().left+best.clientWidth/2-center)?card:best,cards[0]);if(nearest)onChange(Number(nearest.dataset.index))};
 return <div className="rotating-rail-shell" aria-label={label}><button type="button" className="rail-arrow" onClick={()=>move(-1)} aria-label="Opción anterior"><ChevronLeft/></button><div ref={railRef} className="rotating-rail" role="listbox" tabIndex="0" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX))railRef.current.scrollLeft+=e.deltaY}}>{items.map((item,index)=><button type="button" role="option" aria-selected={index===activeIndex} data-index={index} className={`rail-option ${index===activeIndex?'active':''}`} key={item.id||item.name||index} onClick={()=>onChange(index)}>{renderOption(item,index,index===activeIndex)}</button>)}</div><button type="button" className="rail-arrow" onClick={()=>move(1)} aria-label="Opción siguiente"><ChevronRight/></button></div>
}
