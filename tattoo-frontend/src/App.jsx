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
          <ProtectedRoute><Pedidos /></ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute><Perfil /></ProtectedRoute>
        } />
      </Routes>
    </AppProvider>
  )
}
