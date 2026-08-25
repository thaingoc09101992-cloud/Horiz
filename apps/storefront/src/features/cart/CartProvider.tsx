import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type CartItem = {
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
  available?: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  removeItem: (productId: string, size: string) => void
  clearCart: () => void
}

const storageKey = 'horiz-cart-v1'
const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  try {
    const value = localStorage.getItem(storageKey)
    return value ? JSON.parse(value) as CartItem[] : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  const save = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (newItem, quantity = 1) => {
      const safeQuantity = Math.max(1, Math.min(99, Math.floor(quantity)))
      save(items.some((item) => item.productId === newItem.productId && item.size === newItem.size)
        ? items.map((item) => item.productId === newItem.productId && item.size === newItem.size ? { ...item, quantity: Math.min(item.available ?? 99, item.quantity + safeQuantity) } : item)
        : [...items, { ...newItem, quantity: safeQuantity }])
    },
    updateQuantity: (productId, size, quantity) => save(items
      .map((item) => item.productId === productId && item.size === size ? { ...item, quantity: Math.min(quantity, item.available ?? 99) } : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (productId, size) => save(items.filter((item) => item.productId !== productId || item.size !== size)),
    clearCart: () => save([]),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart phải được dùng bên trong CartProvider')
  return context
}
