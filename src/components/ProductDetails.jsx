import { useEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';

export default function ProductDetails({ product, onClose, onEnquire }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => setImageIndex(0), [product?.id]);
  useEffect(() => setCopyStatus(''), [product?.id]);

  useEffect(() => {
    if (!product) return;
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('modal-open'); };
  }, [product, onClose]);

  if (!product) return null;
  const images = product.images ?? [];
  const imageCount = images.length;
  const showPreviousImage = () => setImageIndex((current) => (current - 1 + imageCount) % imageCount);
  const showNextImage = () => setImageIndex((current) => (current + 1) % imageCount);
  const copyProductId = async () => {
    try {
      await navigator.clipboard.writeText(product.id);
      setCopyStatus('Copied to clipboard');
    } catch {
      setCopyStatus(`Please share code ${product.id}`);
    }
    window.setTimeout(() => setCopyStatus(''), 2200);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close product details"><X size={20} /></button>
        <div className="detail-image">
          {images[imageIndex] ? <img src={images[imageIndex]} alt={`${product.name} — photo ${imageIndex + 1}`} /> : <div className="image-placeholder image-placeholder--large"><Sparkles size={35} strokeWidth={1.1} /><span>Product image goes here</span></div>}
          <div className="detail-image__arrows"><button className="icon-button" aria-label="Previous image" onClick={showPreviousImage} disabled={imageCount < 2}><ArrowLeft size={17} /></button><span>{String(imageCount ? imageIndex + 1 : 0).padStart(2, '0')} / {String(imageCount).padStart(2, '0')}</span><button className="icon-button" aria-label="Next image" onClick={showNextImage} disabled={imageCount < 2}><ArrowRight size={17} /></button></div>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category} <span>·</span> LAVÉRA COLLECTION</p>
          <h2 id="detail-title">{product.name}</h2>
          <div className="detail-price">₹{product.price.toLocaleString('en-IN')} {product.oldPrice && <del>₹{product.oldPrice.toLocaleString('en-IN')}</del>}</div>
          <div className="detail-reference"><div><span>PRODUCT REFERENCE</span><strong>{product.id}</strong></div><button type="button" onClick={copyProductId} aria-label={`Copy product reference ${product.id}`}>{copyStatus.startsWith('Copied') ? <Check size={14} /> : <Copy size={14} />}{copyStatus.startsWith('Copied') ? 'Copied' : 'Copy code'}</button></div>
          <p className="copy-status" aria-live="polite">{copyStatus}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-note"><Sparkles size={16} /> A considered little detail, made to be treasured.</div>
          <h3 className="spec-heading">The details</h3>
          <dl className="spec-list">
            <div><dt>Material</dt><dd>{product.material}</dd></div>
            <div><dt>Finish</dt><dd>{product.finish}</dd></div>
            <div><dt>Size / dimensions</dt><dd>{product.dimensions}</dd></div>
            <div><dt>Closure / fit</dt><dd>{product.closure}</dd></div>
            <div><dt>Care</dt><dd>{product.care}</dd></div>
          </dl>
          <p className="gallery-note">To ask Lavéra about this piece, share product reference <strong>{product.id}</strong>.</p>
          <button className="detail-enquire" type="button" onClick={() => onEnquire(product)}>Enquire about this piece <ArrowRight size={16} /></button>
          {product.photoCredit && <a className="photo-credit" href={product.photoCreditUrl} target="_blank" rel="noreferrer">{product.photoCredit}</a>}
        </div>
      </section>
    </div>
  );
}
