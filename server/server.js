require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const dns = require('dns').promises
const nodemailer = require('nodemailer')

const connectDB = require('./config/db')
const Product = require('./models/Product')
const Order = require('./models/Order')
const Admin = require('./models/Admin')

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.APP_BASE_URL,
    ].filter(Boolean),
    credentials: true,
  })
)
app.use(express.json())

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/uploads', express.static(uploadsDir))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()

    cb(null, `${Date.now()}-${safeName}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP files are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
    console.log('Email skipped: SMTP settings missing')
    return
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

const createToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const admin = await Admin.findById(decoded.id).select('-password')

    if (!admin) {
      return res.status(401).json({ message: 'Not authorized, admin not found' })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

const buildPayfastSignature = (data, passphrase = '') => {
  const filteredEntries = Object.entries(data).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  )

  const queryString = filteredEntries
    .map(([key, value]) => {
      const cleanValue = String(value).trim()
      return `${key}=${encodeURIComponent(cleanValue).replace(/%20/g, '+')}`
    })
    .join('&')

  const signatureString = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : queryString

  return crypto.createHash('md5').update(signatureString).digest('hex')
}

const verifyPayfastSignature = (payload, passphrase = '') => {
  const data = { ...payload }
  const receivedSignature = String(data.signature || '').trim().toLowerCase()
  delete data.signature

  const generatedSignature = buildPayfastSignature(data, passphrase).toLowerCase()
  return receivedSignature === generatedSignature
}

const getPayfastProcessUrl = () => {
  const sandbox = String(process.env.PAYFAST_SANDBOX).toLowerCase() === 'true'

  return sandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'
}

const getPayfastIpCandidates = async () => {
  const hosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za',
  ]

  const ipSet = new Set()

  for (const host of hosts) {
    try {
      const records = await dns.lookup(host, { all: true })
      for (const record of records) {
        ipSet.add(record.address)
      }
    } catch (error) {
      console.log(`Payfast IP lookup skipped for ${host}: ${error.message}`)
    }
  }

  return [...ipSet]
}

const isValidPayfastSourceIp = async (req) => {
  if (String(process.env.PAYFAST_SANDBOX).toLowerCase() === 'true') {
    return true
  }

  const forwarded = req.headers['x-forwarded-for']
  const remoteIpRaw = forwarded ? String(forwarded).split(',')[0].trim() : req.socket.remoteAddress
  const remoteIp = String(remoteIpRaw || '').replace('::ffff:', '').trim()

  if (!remoteIp) return false

  const validIps = await getPayfastIpCandidates()
  return validIps.includes(remoteIp)
}

const sendPaymentConfirmedEmail = async (order) => {
  await sendEmail({
    to: order.customerEmail,
    subject: `Payment Confirmed - ${order.orderNumber}`,
    html: `
      <h2>Your payment was confirmed</h2>
      <p>Thank you for your order with take.care box.</p>
      <p><strong>Order Reference:</strong> ${order.orderNumber}</p>
      <p><strong>Amount Paid:</strong> R${Number(order.total).toFixed(2)}</p>
      <p><strong>Status:</strong> Paid</p>
      <p>We’ll now prepare your customised box for fulfilment.</p>
    `,
  })

  if (process.env.ADMIN_NOTIFICATION_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Payment Confirmed - ${order.orderNumber}`,
      html: `
        <h2>Payment confirmed</h2>
        <p><strong>Order Reference:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Amount Paid:</strong> R${Number(order.total).toFixed(2)}</p>
        <p><strong>Status:</strong> Paid</p>
      `,
    })
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Care Package API is running' })
})

app.get('/api/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: 'SMTP Test',
      html: '<p>If you received this, SMTP works.</p>',
    })

    res.json({ message: 'Test email sent successfully' })
  } catch (error) {
    console.error('Test email failed:', error)
    res.status(500).json({
      message: 'Test email failed',
      error: error.message,
      code: error.code,
      response: error.response,
    })
  }
})

app.post('/api/admin/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || 'Admin',
    })

    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      token: createToken(admin),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to register admin' })
  }
})

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      token: createToken(admin),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to login admin' })
  }
})

app.get('/api/admin/me', protectAdmin, async (req, res) => {
  res.json(req.admin)
})

app.post('/api/upload', protectAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' })
    }

    const imageUrl = `${process.env.API_BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image' })
  }
})

app.post('/api/payments/payfast/init', async (req, res) => {
  try {
    const {
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
      items,
      totalItems,
      subtotal,
      boxFee,
      giftWrapFee,
      deliveryFee,
      extrasFee,
      personalizationFee,
      total,
    } = req.body

    if (!customerName || !customerEmail) {
      return res.status(400).json({ message: 'Customer name and email are required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
      return res.status(500).json({ message: 'Payfast credentials are missing in the server .env file' })
    }

    const orderNumber = `TCB-${Date.now()}`

    const newOrder = await Order.create({
      orderNumber,
      recipientName: recipientName || '',
      giftMessage: giftMessage || '',
      boxSize: boxSize || 'Medium',
      deliveryOption: deliveryOption || 'Standard Delivery',
      giftWrap: giftWrap || false,
      customerName,
      customerEmail,
      deliveryAddress: deliveryAddress || '',
      boxFinish: boxFinish || 'Classic Linen',
      ribbonColor: ribbonColor || 'Black',
      cardStyle: cardStyle || 'Minimal',
      boxName: boxName || '',
      cardMessage: cardMessage || '',
      fontChoice: fontChoice || 'Elegant Serif',
      extras: extras || {
        driedFlowers: false,
        tissuePaper: false,
        luxuryFiller: false,
      },
      items,
      totalItems,
      subtotal,
      boxFee,
      giftWrapFee,
      deliveryFee,
      extrasFee: extrasFee || 0,
      personalizationFee: personalizationFee || 0,
      total,
      status: 'Pending',
      paymentStatus: 'PENDING',
      paymentProvider: 'Payfast',
    })

    try {
      await sendEmail({
        to: customerEmail,
        subject: `Order Received - ${newOrder.orderNumber}`,
        html: `
          <h2>We received your order</h2>
          <p>Your order has been created and your payment is being initialized.</p>
          <p><strong>Order Reference:</strong> ${newOrder.orderNumber}</p>
          <p><strong>Total:</strong> R${Number(total).toFixed(2)}</p>
          <p><strong>Status:</strong> Pending payment</p>
        `,
      })

      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Order Started - ${newOrder.orderNumber}`,
          html: `
            <h2>New order started</h2>
            <p><strong>Order Reference:</strong> ${newOrder.orderNumber}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Total:</strong> R${Number(total).toFixed(2)}</p>
            <p><strong>Status:</strong> Pending payment</p>
          `,
        })
      }
    } catch (emailError) {
      console.error('Init email sending failed:', emailError.message)
    }

    const amount = Number(total).toFixed(2)

    const paymentData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.APP_BASE_URL}/payment/success?orderId=${newOrder._id}`,
      cancel_url: `${process.env.APP_BASE_URL}/payment/cancel?orderId=${newOrder._id}`,
      notify_url: `${process.env.API_BASE_URL}/api/payments/payfast/notify`,
      name_first: customerName,
      email_address: customerEmail,
      m_payment_id: String(newOrder._id),
      amount,
      item_name: `Care Package ${newOrder.orderNumber}`,
      item_description: `Care package order ${newOrder.orderNumber}`,
      custom_str1: newOrder.orderNumber,
    }

    const signature = buildPayfastSignature(
      paymentData,
      process.env.PAYFAST_PASSPHRASE || ''
    )

    res.status(201).json({
      order: newOrder,
      paymentUrl: getPayfastProcessUrl(),
      paymentData: {
        ...paymentData,
        signature,
      },
    })
  } catch (error) {
    console.error('Payfast init error:', error.message)
    res.status(500).json({ message: 'Failed to initialize Payfast payment' })
  }
})

app.post(
  '/api/payments/payfast/notify',
  express.urlencoded({ extended: false }),
  async (req, res) => {
    try {
      const payload = { ...req.body }
      const paymentId = payload.m_payment_id
      const paymentStatus = String(payload.payment_status || '').toUpperCase()

      if (!paymentId) {
        return res.status(400).send('Missing payment id')
      }

      const isValidSignature = verifyPayfastSignature(
        payload,
        process.env.PAYFAST_PASSPHRASE || ''
      )

      if (!isValidSignature) {
        return res.status(400).send('Invalid signature')
      }

      const isValidSourceIp = await isValidPayfastSourceIp(req)
      if (!isValidSourceIp) {
        return res.status(400).send('Invalid source IP')
      }

      const order = await Order.findById(paymentId)

      if (!order) {
        return res.status(404).send('Order not found')
      }

      const grossAmount = Number(payload.amount_gross || 0)
      const expectedAmount = Number(order.total || 0)

      if (grossAmount && expectedAmount && grossAmount !== expectedAmount) {
        return res.status(400).send('Amount mismatch')
      }

      order.paymentReference = payload.pf_payment_id || order.paymentReference
      order.pfPaymentId = payload.pf_payment_id || order.pfPaymentId
      order.paymentStatus = paymentStatus || order.paymentStatus

      if (paymentStatus === 'COMPLETE') {
        const wasAlreadyPaid = order.status === 'Paid'

        order.status = 'Paid'
        order.paidAt = order.paidAt || new Date()

        if (!wasAlreadyPaid && !order.paymentConfirmedEmailSent) {
          try {
            await sendPaymentConfirmedEmail(order)
            order.paymentConfirmedEmailSent = true
          } catch (emailError) {
            console.error('Payment confirmation email failed:', emailError.message)
          }
        }
      } else if (paymentStatus === 'FAILED') {
        order.status = 'Payment Failed'
      } else if (paymentStatus === 'CANCELLED') {
        order.status = 'Cancelled'
      } else if (paymentStatus === 'PENDING') {
        order.status = 'Pending'
      }

      await order.save()
      res.status(200).send('OK')
    } catch (error) {
      console.error('Payfast notify error:', error.message)
      res.status(500).send('Error')
    }
  }
)

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' })
  }
})

app.post('/api/products', protectAdmin, async (req, res) => {
  try {
    const { name, category, price, image, description, inStock } = req.body

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' })
    }

    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      image: image || '',
      description: description || '',
      inStock: inStock ?? true,
    })

    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' })
  }
})

app.put('/api/products/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, price, image, description, inStock } = req.body

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.name = name ?? product.name
    product.category = category ?? product.category
    product.price = price !== undefined ? Number(price) : product.price
    product.image = image ?? product.image
    product.description = description ?? product.description
    product.inStock = inStock ?? product.inStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' })
  }
})

app.delete('/api/products/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' })
  }
})

app.get('/api/orders', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

app.put('/api/orders/:id/status', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status || order.status
    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message })
  }

  if (error) {
    return res.status(400).json({ message: error.message || 'Something went wrong' })
  }

  next()
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})