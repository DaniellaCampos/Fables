import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Upload from './pages/Upload';
import Closet from './pages/Closet';
import Preview from './pages/Preview';
import Brand from './pages/Brand';
import Designs from './pages/Designs';
import NotFound from './pages/NotFound';
import Styleguide from './pages/Styleguide';
import MiMarca from './pages/MiMarca';
export default function App(){return <Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<Login/>}/><Route path="/onboarding" element={<Onboarding/>}/><Route path="/styleguide" element={<Styleguide/>}/><Route element={<AppLayout/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/create" element={<Create/>}/><Route path="/create/upload" element={<Upload/>}/><Route path="/create/closet" element={<Closet/>}/><Route path="/create/preview" element={<Preview/>}/><Route path="/brand" element={<MiMarca/>}/><Route path="/brand/editar" element={<Brand/>}/><Route path="/designs" element={<Designs/>}/><Route path="*" element={<NotFound/>}/></Route></Routes>}
