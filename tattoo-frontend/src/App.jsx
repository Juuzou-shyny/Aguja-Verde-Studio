import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Nav          from './components/Nav/Nav'
import LoginModal   from './components/Modal/LoginModal'
import CartDrawer   from './components/Cart/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'

import Home    from './pages/Home/Home'
import Tienda  from './pages/Tienda/Tienda'
import Pedidos from './pages/Pedidos/Pedidos'
import Perfil  from './pages/Perfil/Perfil'

import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin/Admin'

import PagoExitoso   from './pages/PagoExitoso.jsx'
import PagoCancelado from './pages/PagoCancelado'

export default function App() {
  return (
    <AppProvider>
      <Nav />
      <LoginModal />
      <CartDrawer />

      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/pedidos" element={
        <ProtectedRoute><Pedidos /></ProtectedRoute>} />
        <Route path="/perfil" element={ <ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/admin" element={ <AdminRoute><Admin /></AdminRoute>} />
        <Route path="/pago-exitoso"   element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />
      </Routes>
    </AppProvider>
  )
}
