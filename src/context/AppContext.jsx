import { createContext,useContext,useMemo,useState } from 'react';
import {defaultBrand,mockImages} from '../mocks/data';
const AppContext=createContext(null);
const initialProject={format:'story',selectedTemplate:1,selectedImage:0,selectedFilter:0,selectedTypography:1,selectedPalette:0,selectedLayout:0,selectedHeadline:0,selectedCta:0,selectedDecoration:0};
export function AppProvider({children}){
 const [brand,setBrand]=useState(()=>JSON.parse(localStorage.getItem('cc-brand')||'null')||defaultBrand);
 const [project,setProject]=useState(initialProject); const [images,setImages]=useState(mockImages.slice(0,2));
 const updateBrand=(next)=>{setBrand(next);localStorage.setItem('cc-brand',JSON.stringify(next));};
 const value=useMemo(()=>({brand,updateBrand,project,setProject,images,setImages}),[brand,project,images]);
 return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp=()=>useContext(AppContext);
