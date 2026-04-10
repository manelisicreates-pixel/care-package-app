const Order = require('../models/Order')

const createOrder = async (req, res) => {
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
      items,
      totalItems,
      subtotal,
      boxFee,
      giftWrapFee,
      deliveryFee,
      total,
    } = req.body

    if (!customerName || !customerEmail) {
      return res.status(400).json({ message: 'Customer name and email are required' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    const order = await Order.create({
      recipientName,
      giftMessage,
      boxSize,
      deliveryOption,
      giftWrap,
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      totalItems,
      subtotal,
      boxFee,
      giftWrapFee,
      deliveryFee,
      total,
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order' })
  }
}

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}

module.exports = {
  createOrder,
  getOrders,
}