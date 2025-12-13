export interface AuthUser {
  id: string
  email: string
  role: "admin" | "staff"
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export interface Order {
  id: string
  status: string
  total: number
}
