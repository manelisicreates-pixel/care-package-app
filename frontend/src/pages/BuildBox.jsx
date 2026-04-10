import { useEffect, useMemo, useState } from 'react'
import CategoryFilter from '../components/CategoryFilter'
import ProductCard from '../components/ProductCard'
import CartSummary from '../components/CartSummary'
import LiveBoxMockup from '../components/LiveBoxMockup'
import { getProducts } from '../services/api'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function BuildBox() {
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  const [recipientName, setRecipientName] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [boxSize, setBoxSize] = useState('Medium')
  const [deliveryOption, setDeliveryOption] = useState('Standard Delivery')
  const [giftWrap, setGiftWrap] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const [orderError, setOrderError] = useState('')
  const [showSuccessPanel, setShowSuccessPanel] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992)

  const [boxFinish, setBoxFinish] = useState('Classic Linen')
  const [ribbonColor, setRibbonColor] = useState('Black')
  const [cardStyle, setCardStyle] = useState('Minimal')
  const [boxName, setBoxName] = useState('')
  const [cardMessage, setCardMessage] = useState('')
  const [fontChoice, setFontChoice] = useState('Elegant Serif')
  const [extras, setExtras] = useState({
    driedFlowers: false,
    tissuePaper: true,
    luxuryFiller: false,
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        setProductsError('')
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        setProductsError(error.message || 'Failed to load products.')
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const savedCart = localStorage.getItem('carePackageCart')
    const savedRecipientName = localStorage.getItem('carePackageRecipientName')
    const savedGiftMessage = localStorage.getItem('carePackageGiftMessage')
    const savedBoxSize = localStorage.getItem('carePackageBoxSize')
    const savedDeliveryOption = localStorage.getItem('carePackageDeliveryOption')
    const savedGiftWrap = localStorage.getItem('carePackageGiftWrap')
    const savedCustomerName = localStorage.getItem('carePackageCustomerName')
    const savedCustomerEmail = localStorage.getItem('carePackageCustomerEmail')
    const savedDeliveryAddress = localStorage.getItem('carePackageDeliveryAddress')
    const savedBoxFinish = localStorage.getItem('carePackageBoxFinish')
    const savedRibbonColor = localStorage.getItem('carePackageRibbonColor')
    const savedCardStyle = localStorage.getItem('carePackageCardStyle')
    const savedBoxName = localStorage.getItem('carePackageBoxName')
    const savedCardMessage = localStorage.getItem('carePackageCardMessage')
    const savedFontChoice = localStorage.getItem('carePackageFontChoice')
    const savedExtras = localStorage.getItem('carePackageExtras')

    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedRecipientName) setRecipientName(savedRecipientName)
    if (savedGiftMessage) setGiftMessage(savedGiftMessage)
    if (savedBoxSize) setBoxSize(savedBoxSize)
    if (savedDeliveryOption) setDeliveryOption(savedDeliveryOption)
    if (savedGiftWrap) setGiftWrap(JSON.parse(savedGiftWrap))
    if (savedCustomerName) setCustomerName(savedCustomerName)
    if (savedCustomerEmail) setCustomerEmail(savedCustomerEmail)
    if (savedDeliveryAddress) setDeliveryAddress(savedDeliveryAddress)
    if (savedBoxFinish) setBoxFinish(savedBoxFinish)
    if (savedRibbonColor) setRibbonColor(savedRibbonColor)
    if (savedCardStyle) setCardStyle(savedCardStyle)
    if (savedBoxName) setBoxName(savedBoxName)
    if (savedCardMessage) setCardMessage(savedCardMessage)
    if (savedFontChoice) setFontChoice(savedFontChoice)
    if (savedExtras) setExtras(JSON.parse(savedExtras))
  }, [])

  useEffect(() => localStorage.setItem('carePackageCart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('carePackageRecipientName', recipientName), [recipientName])
  useEffect(() => localStorage.setItem('carePackageGiftMessage', giftMessage), [giftMessage])
  useEffect(() => localStorage.setItem('carePackageBoxSize', boxSize), [boxSize])
  useEffect(() => localStorage.setItem('carePackageDeliveryOption', deliveryOption), [deliveryOption])
  useEffect(() => localStorage.setItem('carePackageGiftWrap', JSON.stringify(giftWrap)), [giftWrap])
  useEffect(() => localStorage.setItem('carePackageCustomerName', customerName), [customerName])
  useEffect(() => localStorage.setItem('carePackageCustomerEmail', customerEmail), [customerEmail])
  useEffect(() => localStorage.setItem('carePackageDeliveryAddress', deliveryAddress), [deliveryAddress])
  useEffect(() => localStorage.setItem('carePackageBoxFinish', boxFinish), [boxFinish])
  useEffect(() => localStorage.setItem('carePackageRibbonColor', ribbonColor), [ribbonColor])
  useEffect(() => localStorage.setItem('carePackageCardStyle', cardStyle), [cardStyle])
  useEffect(() => localStorage.setItem('carePackageBoxName', boxName), [boxName])
  useEffect(() => localStorage.setItem('carePackageCardMessage', cardMessage), [cardMessage])
  useEffect(() => localStorage.setItem('carePackageFontChoice', fontChoice), [fontChoice])
  useEffect(() => localStorage.setItem('carePackageExtras', JSON.stringify(extras)), [extras])

  const categories = ['All', ...new Set(products.map((item) => item.category))]

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory

      const lowerSearch = searchTerm.toLowerCase()
      const matchesSearch =
        item.name.toLowerCase().includes(lowerSearch) ||
        item.category.toLowerCase().includes(lowerSearch)

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchTerm])

  const addToCart = (product) => {
    if (product.inStock === false) return

    const existing = cart.find((item) => item._id === product._id)

    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id) => setCart(cart.filter((item) => item._id !== id))

  const clearBuilder = () => {
    setCart([])
    setRecipientName('')
    setGiftMessage('')
    setBoxSize('Medium')
    setDeliveryOption('Standard Delivery')
    setGiftWrap(false)
    setCustomerName('')
    setCustomerEmail('')
    setDeliveryAddress('')
    setBoxFinish('Classic Linen')
    setRibbonColor('Black')
    setCardStyle('Minimal')
    setBoxName('')
    setCardMessage('')
    setFontChoice('Elegant Serif')
    setExtras({
      driedFlowers: false,
      tissuePaper: true,
      luxuryFiller: false,
    })
  }

  const clearStoredBuilder = () => {
    localStorage.removeItem('carePackageCart')
    localStorage.removeItem('carePackageRecipientName')
    localStorage.removeItem('carePackageGiftMessage')
    localStorage.removeItem('carePackageBoxSize')
    localStorage.removeItem('carePackageDeliveryOption')
    localStorage.removeItem('carePackageGiftWrap')
    localStorage.removeItem('carePackageCustomerName')
    localStorage.removeItem('carePackageCustomerEmail')
    localStorage.removeItem('carePackageDeliveryAddress')
    localStorage.removeItem('carePackageBoxFinish')
    localStorage.removeItem('carePackageRibbonColor')
    localStorage.removeItem('carePackageCardStyle')
    localStorage.removeItem('carePackageBoxName')
    localStorage.removeItem('carePackageCardMessage')
    localStorage.removeItem('carePackageFontChoice')
    localStorage.removeItem('carePackageExtras')
  }

  const handleClearCart = () => {
    clearBuilder()
    clearStoredBuilder()
    setOrderError('')
    setOrderMessage('')
    setShowSuccessPanel(false)
    setLastOrder(null)
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  const boxSizeFeeMap = { Small: 29.99, Medium: 49.99, Large: 79.99 }
  const deliveryFeeMap = {
    'Standard Delivery': 60.0,
    'Express Delivery': 120.0,
    'Store Pickup': 0.0,
  }

  const extrasFee =
    (extras.driedFlowers ? 20 : 0) +
    (extras.tissuePaper ? 10 : 0) +
    (extras.luxuryFiller ? 25 : 0)

  const personalizationFee =
    (boxName.trim() ? 15 : 0) + (cardMessage.trim() ? 12 : 0)

  const boxFee = cart.length > 0 ? boxSizeFeeMap[boxSize] : 0
  const giftWrapFee = giftWrap && cart.length > 0 ? 25.0 : 0
  const deliveryFee = cart.length > 0 ? deliveryFeeMap[deliveryOption] : 0
  const total = subtotal + boxFee + giftWrapFee + deliveryFee + extrasFee + personalizationFee

  const redirectToPayfast = (paymentUrl, paymentData) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentUrl
    form.style.display = 'none'

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const handlePlaceOrder = async () => {
    try {
      setOrderError('')
      setOrderMessage('')
      setShowSuccessPanel(false)
      setLastOrder(null)

      if (cart.length === 0) {
        setOrderError('Please add at least one item to your box.')
        return
      }

      if (!customerName.trim() || !customerEmail.trim()) {
        setOrderError('Please enter your name and email address.')
        return
      }

      if (deliveryOption !== 'Store Pickup' && !deliveryAddress.trim()) {
        setOrderError('Please enter a delivery address.')
        return
      }

      const orderPayload = {
        recipientName,
        giftMessage,
        boxSize,
        deliveryOption,
        giftWrap,
        customerName,
        customerEmail,
        deliveryAddress,
        boxFinish,
        ribbonColor,
        cardStyle,
        boxName,
        cardMessage,
        fontChoice,
        extras,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image,
        })),
        totalItems,
        subtotal,
        boxFee,
        giftWrapFee,
        deliveryFee,
        extrasFee,
        personalizationFee,
        total,
      }

      setOrderLoading(true)

      const response = await fetch(`${API_BASE_URL}/payments/payfast/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment')
      }

      setLastOrder(data.order)
      setOrderMessage('Redirecting to secure payment...')
      redirectToPayfast(data.paymentUrl, data.paymentData)
    } catch (error) {
      setOrderError(error.message || 'Failed to initialize payment.')
    } finally {
      setOrderLoading(false)
    }
  }

  const sectionStyle = {
    background: '#ffffff',
    border: '1px solid var(--border)',
    padding: '22px',
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
    fontSize: '15px',
    boxSizing: 'border-box',
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
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url("https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isMobile ? '300px' : '470px',
          border: '1px solid var(--border-strong)',
          position: 'relative',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid var(--border-strong)',
            padding: isMobile ? '22px' : '32px',
            margin: isMobile ? '18px' : '30px',
            maxWidth: '450px',
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
            Custom gifting
          </div>

          <h1
            style={{
              fontSize: isMobile ? '30px' : '42px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.08,
            }}
          >
            Build Your Own Care Package
          </h1>

          <div
            style={{
              marginTop: '8px',
              fontSize: isMobile ? '14px' : '16px',
              color: 'var(--text-soft)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            Custom gifting made simple
          </div>
        </div>
      </section>

      {orderMessage ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px',
            border: '1px solid var(--success-border)',
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
          }}
        >
          {orderMessage}
        </div>
      ) : null}

      {orderError ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '14px',
            border: '1px solid var(--error-border)',
            background: 'var(--error-bg)',
            color: 'var(--error-text)',
          }}
        >
          {orderError}
        </div>
      ) : null}

      {showSuccessPanel && lastOrder ? (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            border: '1px solid var(--success-border)',
            background: 'var(--success-bg)',
          }}
        >
          <h2 style={{ marginTop: 0, color: 'var(--success-text)' }}>
            Thank you for your order
          </h2>

          <p style={{ marginBottom: '10px', color: 'var(--success-text)' }}>
            Your care package order has been submitted successfully.
          </p>

          <p style={{ marginBottom: '8px', color: 'var(--success-text)' }}>
            <strong>Order Reference:</strong> {lastOrder.orderNumber}
          </p>

          <p style={{ marginBottom: '14px', color: 'var(--success-text)' }}>
            <strong>Email:</strong> {lastOrder.customerEmail}
          </p>

          <button
            onClick={() => setShowSuccessPanel(false)}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--success-border)',
              background: '#e6efe7',
              color: 'var(--success-text)',
              cursor: 'pointer',
              borderRadius: '0px',
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.08em',
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2fr) minmax(340px, 1fr)',
          gap: '34px',
          alignItems: 'start',
        }}
      >
        <div>
          <section style={sectionStyle}>
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />

            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </section>

          <section style={{ marginBottom: '30px' }}>
            {productsLoading ? (
              <p>Loading products...</p>
            ) : productsError ? (
              <div
                style={{
                  padding: '14px',
                  border: '1px solid var(--error-border)',
                  background: 'var(--error-bg)',
                  color: 'var(--error-text)',
                }}
              >
                {productsError}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p style={{ color: 'var(--text-soft)' }}>No products found.</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '24px',
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Box Customization
            </h2>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Box Finish
              </label>
              <select value={boxFinish} onChange={(e) => setBoxFinish(e.target.value)} style={inputStyle}>
                <option>Classic Linen</option>
                <option>Premium Matte</option>
                <option>Soft Floral</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Ribbon Color
              </label>
              <select value={ribbonColor} onChange={(e) => setRibbonColor(e.target.value)} style={inputStyle}>
                <option>Black</option>
                <option>Cream</option>
                <option>Blush</option>
                <option>Navy</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Card Style
              </label>
              <select value={cardStyle} onChange={(e) => setCardStyle(e.target.value)} style={inputStyle}>
                <option>Minimal</option>
                <option>Elegant</option>
                <option>Handwritten</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Name on Box
              </label>
              <input
                type="text"
                placeholder="Enter a name for the box"
                value={boxName}
                onChange={(e) => setBoxName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Card Message
              </label>
              <textarea
                placeholder="Write a short message for the card"
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Font Choice
              </label>
              <select value={fontChoice} onChange={(e) => setFontChoice(e.target.value)} style={inputStyle}>
                <option>Elegant Serif</option>
                <option>Modern</option>
                <option>Signature</option>
                <option>Minimal</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700 }}>
                Extra Touches
              </label>

              <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={extras.driedFlowers}
                  onChange={(e) =>
                    setExtras((prev) => ({ ...prev, driedFlowers: e.target.checked }))
                  }
                />
                <span>Add dried flowers</span>
              </label>

              <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={extras.tissuePaper}
                  onChange={(e) =>
                    setExtras((prev) => ({ ...prev, tissuePaper: e.target.checked }))
                  }
                />
                <span>Add tissue paper</span>
              </label>

              <label style={{ display: 'flex', gap: '10px', color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={extras.luxuryFiller}
                  onChange={(e) =>
                    setExtras((prev) => ({ ...prev, luxuryFiller: e.target.checked }))
                  }
                />
                <span>Add luxury filler</span>
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Preview Your Customized Box
            </h2>

            <LiveBoxMockup
              boxFinish={boxFinish}
              ribbonColor={ribbonColor}
              cardStyle={cardStyle}
              boxName={boxName}
              cardMessage={cardMessage}
              fontChoice={fontChoice}
              extras={extras}
              isMobile={isMobile}
            />
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Gift Setup
            </h2>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Box Size
              </label>
              <select value={boxSize} onChange={(e) => setBoxSize(e.target.value)} style={inputStyle}>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Delivery Option
              </label>
              <select
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value)}
                style={inputStyle}
              >
                <option>Standard Delivery</option>
                <option>Express Delivery</option>
                <option>Store Pickup</option>
              </select>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: 'var(--text-soft)',
              }}
            >
              <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
              <span>Add gift wrapping</span>
            </label>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                fontSize: '24px',
                margin: '0 0 18px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Checkout Details
            </h2>

            <input
              type="text"
              placeholder="Your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Your email address"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', marginBottom: 0 }}
            />
          </section>
        </div>

        <CartSummary
          cart={cart}
          recipientName={recipientName}
          setRecipientName={setRecipientName}
          giftMessage={giftMessage}
          setGiftMessage={setGiftMessage}
          onIncreaseQty={increaseQty}
          onDecreaseQty={decreaseQty}
          onRemoveItem={removeItem}
          onClearCart={handleClearCart}
          totalItems={totalItems}
          subtotal={subtotal}
          boxSize={boxSize}
          boxFee={boxFee}
          giftWrap={giftWrap}
          giftWrapFee={giftWrapFee + extrasFee + personalizationFee}
          deliveryOption={deliveryOption}
          deliveryFee={deliveryFee}
          total={total}
          onPlaceOrder={handlePlaceOrder}
          orderLoading={orderLoading}
        />
      </div>
    </div>
  )
}

export default BuildBox