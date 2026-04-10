const Product = require('../models/Product')

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' })
  }
}

const createProduct = async (req, res) => {
  try {
    const { name, category, price, image, description, inStock } = req.body

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Name, category, and price are required' })
    }

    const product = await Product.create({
      name,
      category,
      price,
      image,
      description,
      inStock,
    })

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' })
  }
}

module.exports = {
  getProducts,
  createProduct,
}