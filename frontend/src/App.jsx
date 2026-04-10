import { useEffect, useMemo, useState } from 'react'
import BuildBox from './pages/BuildBox'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import BrandLogo from './components/BrandLogo'

function App() {
  const [activePage, setActivePage] = useState('shop')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  const currentPath = useMemo(() => window.location.pathname, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('carePackageAdminToken')
    setIsAdminAuthenticated(!!token)
  }, [])

  useEffect(() => {
    if (currentPath === '/payment/success') {
      setActivePage('payment-success')
    } else if (currentPath === '/payment/cancel') {
      setActivePage('payment-cancel')
    } else {
      setActivePage('shop')
    }
  }, [currentPath])

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
    setActivePage('admin')
    window.history.pushState({}, '', '/')
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('carePackageAdminAuth')
    localStorage.removeItem('carePackageAdminToken')
    localStorage.removeItem('carePackageAdminUser')
    setIsAdminAuthenticated(false)
    setActivePage('shop')
    window.history.pushState({}, '', '/')
  }

  const handleGoToShop = () => {
    setActivePage('shop')
    window.history.pushState({}, '', '/')
  }

  const handleGoToAdmin = () => {
    setActivePage('admin')
    window.history.pushState({}, '', '/admin')
  }

  const navButtonStyle = (active) => ({
    padding: '10px 14px',
    border: active ? '1px solid var(--text)' : '1px solid var(--border)',
    background: active ? 'var(--text)' : 'transparent',
    color: active ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.12em',
    borderRadius: '0px',
    minWidth: isMobile ? 'unset' : '140px',
  })

  const showHeaderNav =
    activePage !== 'payment-success' && activePage !== 'payment-cancel'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div
        style={{
          background: '#111111',
          color: '#ffffff',
          textAlign: 'center',
          padding: '8px 12px',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Custom gifting made simple
      </div>

      <header
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '16px 18px' : '22px 18px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-start',
              alignItems: 'center',
            }}
          >
            <BrandLogo />
          </div>

          {showHeaderNav ? (
            <div
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={handleGoToShop}
                style={navButtonStyle(activePage === 'shop')}
              >
                Customer View
              </button>

              <button
                onClick={handleGoToAdmin}
                style={navButtonStyle(activePage === 'admin')}
              >
                Admin View
              </button>

              {isAdminAuthenticated ? (
                <button onClick={handleAdminLogout} style={navButtonStyle(false)}>
                  Logout
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <main>
        {activePage === 'shop' ? (
          <BuildBox />
        ) : activePage === 'admin' ? (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        ) : activePage === 'payment-success' ? (
          <PaymentSuccess onBackHome={handleGoToShop} />
        ) : activePage === 'payment-cancel' ? (
          <PaymentCancel onBackHome={handleGoToShop} />
        ) : (
          <BuildBox />
        )}
      </main>
    </div>
  )
}

export default App