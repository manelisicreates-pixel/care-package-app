const API_BASE_URL = 
import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create order')
  }

  return data
}