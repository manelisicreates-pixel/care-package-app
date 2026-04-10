import { useEffect, useState } from 'react'

const API_BASE_URL = 
import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const FALLBACK_IMAGE =
  'https://via.placeholder.com/600x400/f5f3ef/111111?text=Care+Package+Item'

const getAuthHeaders = () => {
  const token = localStorage.getItem('carePackageAdminToken')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function StatusBadge({ status }) {
  const styles = {
    Pending: {
      background: '#f5efe2',
      color: '#7a5a21',
      border: '#dbcba6',
    },
    Processing: {
      background: '#e8eef6',
      color: '#2b4f77',
      border: '#bfd0e4',
    },
    Shipped: {
      background: '#ece9f4',
      color: '#5a4a7d',
      border: '#cfc5df',
    },
    Delivered: {
      background: '#e9f3ea',
      color: '#3a6840',
      border: '#c8d9ca',
    },
    Cancelled: {
      background: '#f5e9ea',
      color: '#8a3940',
      border: '#dec1c4',
    },
  }

  const current = styles[status] || {
    background: '#efefef',
    color: '#444',
    border: '#d3d3d3',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        border: `1px solid ${current.border}`,
        background: current.background,
        color: current.color,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  )
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    inStock: true,
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/products`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products')
      }

      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      setError('')

      const token = localStorage.getItem('carePackageAdminToken')

      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders')
      }

      setOrders(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      image: '',
      description: '',
      inStock: true,
    })
    setEditingProductId(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setError('')
      setMessage('')

      const token = localStorage.getItem('carePackageAdminToken')
      const uploadData = new FormData()
      uploadData.append('image', file)

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image')
      }

      setFormData((prev) => ({
        ...prev,
        image: data.imageUrl,
      }))

      setMessage('Image uploaded successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      if (!formData.name.trim() || !formData.category.trim() || formData.price === '') {
        setError('Product name, category, and price are required.')
        return
      }

      const url = editingProductId
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products`

      const method = editingProductId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save product')
      }

      setMessage(
        editingProductId
          ? 'Product updated successfully.'
          : 'Product added successfully.'
      )

      resetForm()
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product._id)
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price ?? '',
      image: product.image || '',
      description: product.description || '',
      inStock: product.inStock !== false,
    })
    setMessage('')
    setError('')
  }

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?')
    if (!confirmed) return

    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product')
      }

      setMessage('Product deleted successfully.')
      loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateOrderStatus = async (id, status) => {
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status')
      }

      setMessage('Order status updated successfully.')
      loadOrders()
    } catch (err) {
      setError(err.message)
    }
  }

  const totalProducts = products.length
  const inStockProducts = products.filter((p) => p.inStock !== false).length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid var(--border)',
    padding: '20px',
    marginBottom: '24px',
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '14px',
    borderRadius: '0px',
    border: '1px solid var(--border)',
    background: '#ffffff',
    color: 'var(--text)',
    boxSizing: 'border-box',
  }

  const primaryButtonStyle = {
    padding: '11px 14px',
    background: '#111111',
    color: '#ffffff',
    border: '1px solid #111111',
    borderRadius: '0px',
    cursor: 'pointer',
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.08em',
  }

  const secondaryButtonStyle = {
    padding: '11px 14px',
    background: '#ffffff',
    color: 'var(--text)',
    border: '1px solid var(--border-strong)',
    borderRadius: '0px',
    cursor: 'pointer',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.08em',
  }

  const dangerButtonStyle = {
    padding: '11px 14px',
    background: '#ffffff',
    color: '#7a2f35',
    border: '1px solid #caaeb1',
    borderRadius: '0px',
    cursor: 'pointer',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.08em',
  }

  return (
    <div
      style={{
        padding: isMobile ? '20px 14px' : '30px 20px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <section
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-strong)',
          padding: isMobile ? '20px' : '26px',
          marginBottom: '28px',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '30px' : '38px',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Admin Dashboard
        </h2>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard label="Products" value={totalProducts} />
        <StatCard label="In Stock" value={inStockProducts} />
        <StatCard label="Orders" value={totalOrders} />
        <StatCard label="Revenue" value={`R${totalRevenue.toFixed(2)}`} />
      </section>

      {message ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px',
            border: '1px solid var(--success-border)',
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px',
            border: '1px solid var(--error-border)',
            background: 'var(--error-bg)',
            color: 'var(--error-text)',
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(320px, 1fr) minmax(0, 1.2fr)',
          gap: '30px',
          alignItems: 'start',
        }}
      >
        <div>
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: '22px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {editingProductId ? 'Edit Product' : 'Add Product'}
            </h3>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                style={inputStyle}
              />

              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                style={inputStyle}
              />

              <input
                type="text"
                name="image"
                placeholder="Image URL or upload below"
                value={formData.image}
                onChange={handleChange}
                style={inputStyle}
              />

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Upload product image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  style={{ marginBottom: '8px' }}
                />

                {uploadingImage ? (
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Uploading image...</p>
                ) : null}
              </div>

              {(formData.image || editingProductId) ? (
                <img
                  src={formData.image || FALLBACK_IMAGE}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    marginBottom: '14px',
                    border: '1px solid var(--border)',
                  }}
                />
              ) : null}

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  color: 'var(--text-soft)',
                }}
              >
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                />
                <span>In stock</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="submit" style={primaryButtonStyle}>
                  {editingProductId ? 'Update Product' : 'Add Product'}
                </button>

                {editingProductId ? (
                  <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div style={cardStyle}>
            <h3
              style={{
                fontSize: '22px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Product List
            </h3>

            {loadingProducts ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <EmptyState
                title="No products yet"
                description="Add your first product from the form above to start building your catalog."
              />
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    border: '1px solid var(--border)',
                    padding: '14px',
                    marginBottom: '12px',
                    display: 'grid',
                    gridTemplateColumns: product.image && !isMobile ? '80px 1fr' : '1fr',
                    gap: '14px',
                    alignItems: 'start',
                    background: 'var(--bg-soft)',
                  }}
                >
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE
                    }}
                    style={{
                      width: isMobile ? '100%' : '80px',
                      height: isMobile ? '180px' : '80px',
                      objectFit: 'cover',
                    }}
                  />

                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{product.name}</h4>
                    <p style={{ margin: '0 0 6px 0', color: 'var(--text-soft)' }}>
                      {product.category}
                    </p>
                    <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>
                      R{Number(product.price).toFixed(2)}
                    </p>
                    <p
                      style={{
                        margin: '0 0 10px 0',
                        color: product.inStock ? '#4d4a44' : '#8d5559',
                      }}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>

                    {product.description ? (
                      <p
                        style={{
                          margin: '0 0 12px 0',
                          color: 'var(--text-muted)',
                          fontSize: '14px',
                        }}
                      >
                        {product.description}
                      </p>
                    ) : null}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        style={secondaryButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 10px',
              border: '1px solid var(--text)',
              background: '#111111',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Orders
          </div>

          <h3
            style={{
              fontSize: '26px',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Orders
          </h3>

          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Orders placed from the customer view will appear here."
            />
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: '1px solid var(--border)',
                  padding: '16px',
                  marginBottom: '14px',
                  background: 'var(--bg-soft)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div><strong>Order Ref:</strong> {order.orderNumber || 'N/A'}</div>
                  <div><strong>Customer:</strong> {order.customerName}</div>
                  <div><strong>Email:</strong> {order.customerEmail}</div>
                  <div><strong>Recipient:</strong> {order.recipientName || 'Not provided'}</div>
                  <div>
                    <strong>Status:</strong> <StatusBadge status={order.status} />
                  </div>
                  <div><strong>Delivery:</strong> {order.deliveryOption}</div>
                  <div><strong>Box Size:</strong> {order.boxSize}</div>
                  <div><strong>Total Items:</strong> {order.totalItems}</div>
                  <div><strong>Total:</strong> R{Number(order.total).toFixed(2)}</div>
                  <div>
                    <strong>Created:</strong>{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                {order.giftMessage ? (
                  <div
                    style={{
                      marginTop: '12px',
                      marginBottom: '12px',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      background: '#ffffff',
                      color: 'var(--text-soft)',
                    }}
                  >
                    <strong>Gift Message:</strong> {order.giftMessage}
                  </div>
                ) : null}

                <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <strong>Items:</strong>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      marginTop: '8px',
                      color: 'var(--text-soft)',
                    }}
                  >
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity} — R{Number(item.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleUpdateOrderStatus(order._id, 'Processing')}
                    style={secondaryButtonStyle}
                  >
                    Mark Processing
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order._id, 'Shipped')}
                    style={secondaryButtonStyle}
                  >
                    Mark Shipped
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                    style={primaryButtonStyle}
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        padding: '18px',
      }}
    >
      <p
        style={{
          margin: '0 0 8px 0',
          color: 'var(--text-muted)',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </p>
      <h3 style={{ margin: 0, fontSize: '28px' }}>{value}</h3>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div
      style={{
        border: '1px dashed var(--border-strong)',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--text-soft)' }}>
        {title}
      </h4>
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  )
}

export default AdminDashboard