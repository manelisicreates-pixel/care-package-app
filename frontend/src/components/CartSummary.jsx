function CartSummary({
  cart,
  recipientName,
  setRecipientName,
  giftMessage,
  setGiftMessage,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  onClearCart,
  totalItems,
  subtotal,
  boxSize,
  boxFee,
  giftWrap,
  giftWrapFee,
  deliveryOption,
  deliveryFee,
  total,
  onPlaceOrder,
  orderLoading,
}) {
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

  const smallButton = {
    padding: '6px 10px',
    borderRadius: '0px',
    border: '1px solid var(--border)',
    background: '#ffffff',
    color: 'var(--text)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.08em',
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        padding: '20px',
        height: 'fit-content',
        position: 'sticky',
        top: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Your Care Package
        </h2>

        <button onClick={onClearCart} style={smallButton}>
          Clear Cart
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        {totalItems} item{totalItems !== 1 ? 's' : ''} in your box
      </p>

      <input
        type="text"
        placeholder="Recipient name"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Gift message"
        value={giftMessage}
        onChange={(e) => setGiftMessage(e.target.value)}
        style={{
          ...inputStyle,
          minHeight: '100px',
          resize: 'vertical',
        }}
      />

      <div style={{ marginBottom: '20px' }}>
        {cart.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No items added yet.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              style={{
                border: '1px solid var(--border)',
                padding: '12px',
                marginBottom: '12px',
                background: 'var(--bg-soft)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>
                    R{Number(item.price).toFixed(2)} each
                  </p>
                </div>

                <button onClick={() => onRemoveItem(item._id)} style={smallButton}>
                  Remove
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => onDecreaseQty(item._id)} style={smallButton}>
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button onClick={() => onIncreaseQty(item._id)} style={smallButton}>
                    +
                  </button>
                </div>

                <p style={{ fontWeight: 700, margin: 0 }}>
                  R{(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          marginBottom: '12px',
        }}
      >
        {[
          ['Subtotal', subtotal],
          [`${boxSize} Box`, boxFee],
          [`Gift Wrap ${giftWrap ? '' : '(Not selected)'}`, giftWrapFee],
          [deliveryOption, deliveryFee],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              color: 'var(--text-soft)',
            }}
          >
            <span>{label}</span>
            <span>R{Number(value).toFixed(2)}</span>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '20px',
            fontWeight: 700,
            marginTop: '14px',
          }}
        >
          <span>Total</span>
          <span>R{Number(total).toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={orderLoading}
        style={{
          width: '100%',
          padding: '13px 14px',
          background: orderLoading ? '#b7b2aa' : '#111111',
          color: '#ffffff',
          border: '1px solid #111111',
          borderRadius: '0px',
          fontSize: '12px',
          cursor: orderLoading ? 'not-allowed' : 'pointer',
          marginTop: '14px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {orderLoading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  )
}

export default CartSummary