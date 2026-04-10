import { useMemo } from 'react'

function PaymentCancel({ onBackHome }) {
  const orderId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('orderId')
  }, [])

  return (
    <div
      style={{
        maxWidth: '780px',
        margin: '50px auto',
        padding: '0 16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          padding: '32px',
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
          Payment update
        </div>

        <h1
          style={{
            margin: '0 0 14px 0',
            fontSize: '34px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Payment Cancelled
        </h1>

        <p
          style={{
            color: 'var(--text-soft)',
            lineHeight: 1.7,
            marginBottom: '14px',
          }}
        >
          Your payment was cancelled before completion. Your selected items and customization can be added again from the store.
        </p>

        {orderId ? (
          <p
            style={{
              color: 'var(--text-soft)',
              marginBottom: '20px',
            }}
          >
            <strong>Order ID:</strong> {orderId}
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onBackHome}
            style={{
              padding: '12px 16px',
              background: '#111111',
              color: '#ffffff',
              border: '1px solid #111111',
              cursor: 'pointer',
              borderRadius: '0px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Return to Store
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel