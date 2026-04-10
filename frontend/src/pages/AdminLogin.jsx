import { useState } from 'react'

const API_BASE_URL =
import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('carePackageAdminAuth', 'true')
      localStorage.setItem('carePackageAdminToken', data.token)
      localStorage.setItem('carePackageAdminUser', JSON.stringify(data))

      onLogin(data)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
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

  return (
    <div
      style={{
        maxWidth: '520px',
        margin: '50px auto',
        padding: '0 14px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          padding: '28px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '10px',
          }}
        >
          Secure Access
        </div>

        <h1
          style={{
            margin: '0 0 18px 0',
            fontSize: '32px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Admin Login
        </h1>

        {error ? (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              border: '1px solid var(--error-border)',
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
            }}
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#111111',
              color: '#ffffff',
              border: '1px solid #111111',
              borderRadius: '0px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin