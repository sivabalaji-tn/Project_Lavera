/**
 * LAVÉRA PRODUCT CATALOG
 * These four entries are DEMOS. Replace sample prices, descriptions, and specs
 * before launch. Copy an object to add a product, give it a new unique id, and
 * add its photos under /public/images/products/.
 *
 * Add several photos to one product like this:
 * images: ['/images/products/front.jpg', '/images/products/side.jpg']
 */
export const products = [
  {
    id: 'LV-NK-001',
    name: 'Emerald Glow Necklace Set',
    category: 'Necklaces',
    price: 4599,
    oldPrice: null,
    shortDescription: 'A statement necklace with matching earrings.',
    description: 'Demo listing for a necklace and matching earrings. Replace this description and verify all product details before publishing.',
    material: 'Add actual material',
    finish: 'Add actual finish',
    dimensions: 'Add necklace length and set measurements',
    closure: 'Add closure details',
    care: 'Add care instructions for this piece.',
    images: [
      '/images/products/necklace1.jpg',
      '/images/products/Necklace2.jpg',
      '/images/products/necklace1.jpg',
    ],
    featured: true,
    badge: 'Preview item',
  },
  {
    id: 'LV-ER-001',
    name: 'Twist Light Hoops',
    category: 'Earrings',
    price: 1299,
    oldPrice: null,
    shortDescription: 'A twisted-gold look for everyday styling.',
    description: 'Demo listing inspired by the sample photo. Replace with the actual Lavéra product description and verified specifications before publishing.',
    material: 'Add actual material',
    finish: 'Add actual finish',
    dimensions: 'Add diameter or size',
    closure: 'Add closure type',
    care: 'Add care instructions for this piece.',
    images: ['/images/products/demo-earrings.jpg'],
    photoCredit: 'Demo photo by Oscar Ramirez on Unsplash',
    photoCreditUrl: 'https://unsplash.com/photos/a-pair-of-gold-earrings-sitting-on-top-of-a-white-box-H_YaPGnmIY8',
    featured: true,
    badge: 'Preview item',
  },
  {
    id: 'LV-RG-001',
    name: 'Golden Hour Band',
    category: 'Rings',
    price: 899,
    oldPrice: null,
    shortDescription: 'A clean, classic gold-tone band.',
    description: 'Demo listing inspired by the sample photo. Replace with the actual Lavéra product description and verified specifications before publishing.',
    material: 'Add actual material',
    finish: 'Add actual finish',
    dimensions: 'Add available ring sizes',
    closure: 'Add fit details',
    care: 'Add care instructions for this piece.',
    images: ['/images/products/demo-ring.jpg'],
    photoCredit: 'Demo photo by Roman Derrick Okello on Unsplash',
    photoCreditUrl: 'https://unsplash.com/photos/gold-ring-on-brown-wooden-table-qUgVvJHS9Dc',
    featured: true,
    badge: 'Preview item',
  },
  {
    id: 'LV-BR-001',
    name: 'Golden Link Bracelet',
    category: 'Bracelets',
    price: 1499,
    oldPrice: null,
    shortDescription: 'A polished chain detail for your wrist.',
    description: 'Demo listing inspired by the sample photo. Replace with the actual Lavéra product description and verified specifications before publishing.',
    material: 'Add actual material',
    finish: 'Add actual finish',
    dimensions: 'Add bracelet length',
    closure: 'Add closure type',
    care: 'Add care instructions for this piece.',
    images: ['/images/products/demo-bracelet.jpg'],
    photoCredit: 'Demo photo by Amina Atar on Unsplash',
    photoCreditUrl: 'https://unsplash.com/photos/a-gold-chain-bracelet-laying-on-top-of-a-white-blanket-F6qEiDArzfk',
    featured: true,
    badge: 'Preview item',
  },
];

export const categories = ['All pieces', 'Earrings', 'Necklaces', 'Rings', 'Bracelets'];
