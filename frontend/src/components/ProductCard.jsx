import { useState } from 'react'

const FALLBACK_IMAGE =
  'https://via.placeholder.com/600x400/f5f3ef/111111?text=Care+Package+Item'

function ProductCard({ product, onAddToCart }) {
  const [imageSrc, setImageSrc] = useState(product.image || FALLBACK_IMAGE)
  const isOutOfStock = product.inStock === false

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
      }}
    >
      <img
        src={imageSrc}
        alt={product.name}
        onError={() => setImageSrc(FALLBACK_IMAGE)}
        style={{
          width: '100%',
          height: '230px',
          objectFit: 'cover',
          display: 'block',
          borderBottom: '1px solid var(--border)',
        }}
      />

      <div style={{ padding: '18px' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {product.name}
        </h3>

        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          {product.category}
        </div>

        {product.description ? (
          <p
            style={{
              margin: '0 0 14px 0',
              color: 'var(--text-soft)',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            {product.description}
          </p>
        ) : null}

        <div
          style={{
            fontWeight: 700,
            marginBottom: '12px',
            fontSize: '15px',
          }}
        >
          R{Number(product.price).toFixed(2)}
        </div>

        <div
          style={{
            marginBottom: '14px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isOutOfStock ? '#8d5559' : '#444444',
          }}
        >
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          style={{
            width: '100%',
            padding: '12px 14px',
            background: isOutOfStock ? '#b7b2aa' : '#111111',
            color: '#ffffff',
            border: '1px solid #111111',
            borderRadius: '0px',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {isOutOfStock ? 'Unavailable' : 'Add to Box'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard