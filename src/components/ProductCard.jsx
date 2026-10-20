import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onOpen }) {
  return (
    <button className="product-card" type="button" onClick={() => onOpen(product)} aria-label={`View details for ${product.name}`}>
      <div className="product-card__image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder" aria-label="Product photo to be added">
            <Sparkles size={25} strokeWidth={1.2} />
            <span>Add product photo</span>
          </div>
        )}
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="product-card__open"><ArrowUpRight size={18} /></span>
      </div>
      <div className="product-card__meta">
        <div><span className="product-card__category">{product.category}</span><h3>{product.name}</h3><span className="product-card__reference">REF. {product.id}</span></div>
        <div className="product-price"><span>₹{Number(product.price).toLocaleString('en-IN')}</span>{product.oldPrice && <del>₹{Number(product.oldPrice).toLocaleString('en-IN')}</del>}</div>
      </div>
      <p className="product-card__description">{product.shortDescription}</p>
    </button>
  );
}
