use('care-package-app');

db.products.insertMany([
  {
    name: 'Classic Gratitude Journal',
    category: 'Journals',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
    description: 'A thoughtful journal for daily reflection.',
    inStock: true
  },
  {
    name: 'Bible Study Guide',
    category: 'Bible Study',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80',
    description: 'A guided devotional and bible study companion.',
    inStock: true
  },
  {
    name: 'Mini Makeup Kit',
    category: 'Makeup',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    description: 'A compact beauty set for gifting.',
    inStock: true
  }
]);