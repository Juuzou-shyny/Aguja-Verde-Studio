import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]   = useState(null)   // { name, email, token }
  const [cart, setCart]   = useState([])     // [{ id, name, price, qty }]
  const [cartOpen, setCartOpen]   = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // ── AUTH ──
  const login = useCallback((userData) => {
    setUser(userData)
    setLoginOpen(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setCart([])
  }, [])

  // ── CART ──
  const addToCart = useCallback((product) => {
    if (!user) { setLoginOpen(true); return }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }, [user])

  const updateQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      return updated.filter(i => i.qty > 0)
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <AppContext.Provider value={{
      user, login, logout,
      cart, cartCount, cartTotal, addToCart, updateQty, removeFromCart,
      cartOpen, setCartOpen,
      loginOpen, setLoginOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
