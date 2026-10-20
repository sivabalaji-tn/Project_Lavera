export function productFromDatabase(row) {
  return {
    ...row,
    oldPrice: row.old_price,
    shortDescription: row.short_description,
    photoCredit: row.photo_credit,
    photoCreditUrl: row.photo_credit_url,
  };
}

export function productToDatabase(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    old_price: product.oldPrice === '' || product.oldPrice == null ? null : Number(product.oldPrice),
    short_description: product.shortDescription || '',
    description: product.description || '',
    material: product.material || '',
    finish: product.finish || '',
    dimensions: product.dimensions || '',
    closure: product.closure || '',
    care: product.care || '',
    images: product.images || [],
    featured: Boolean(product.featured),
    badge: product.badge || null,
    photo_credit: product.photoCredit || null,
    photo_credit_url: product.photoCreditUrl || null,
    is_active: Boolean(product.is_active),
    updated_at: new Date().toISOString(),
  };
}
