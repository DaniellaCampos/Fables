export function Button({variant='primary',className='',...props}){return <button className={`btn btn-${variant} ${className}`} {...props}/>}
export function Card({className='',...props}){return <section className={`card ${className}`} {...props}/>}
export function Badge({children,tone='teal'}){return <span className={`badge badge-${tone}`}>{children}</span>}
export function Field({label,error,...props}){return <label className="field"><span>{label}</span><input {...props}/>{error&&<small className="error">{error}</small>}</label>}
export function SelectField({label,children,...props}){return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>}
export function ChoiceGrid({items,selected,onToggle,multiple=false}){return <div className="choice-grid">{items.map(item=>{const active=multiple?selected.includes(item):selected===item;return <button type="button" className={`choice ${active?'active':''}`} aria-pressed={active} onClick={()=>onToggle(item)} key={item}><span className="choice-mark">{active?'✓':'+'}</span>{item}</button>})}</div>}
