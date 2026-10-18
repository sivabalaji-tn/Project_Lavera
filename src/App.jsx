import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Menu, Search, X, Sparkles } from 'lucide-react';
import { products, categories } from './data/products.js';
import ProductCard from './components/ProductCard.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import LaunchWelcome from './components/LaunchWelcome.jsx';

export default function App() {
  const [category, setCategory] = useState('All pieces');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLaunchWelcome, setShowLaunchWelcome] = useState(true);
  const [enquiryCategory, setEnquiryCategory] = useState('');
  const [enquiryReference, setEnquiryReference] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  useEffect(() => {
    document.getElementById('initial-loader')?.remove();
  }, []);

  const finishLaunch = useCallback(() => {
    setShowLaunchWelcome(false);
    window.requestAnimationFrame(() => {
      document.getElementById('collection')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }, []);

  const prepareProductEnquiry = useCallback((product) => {
    setEnquiryCategory(product.category);
    setEnquiryReference(product.id);
    setEnquiryStatus('');
    setSelectedProduct(null);
    window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  const submitEnquiry = async (event) => {
    event.preventDefault();
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      setEnquiryStatus('The form is ready. It will send enquiries after the site is deployed to Netlify.');
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquiryStatus('');
    const form = event.currentTarget;
    try {
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      setEnquiryCategory('');
      setEnquiryReference('');
      setEnquiryStatus('Thank you. Your enquiry has been sent to Lavéra.');
    } catch {
      setEnquiryStatus('We could not send that just now. Please try again in a moment.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const visibleProducts = useMemo(() => products.filter((product) => {
    const inCategory = category === 'All pieces' || product.category === category;
    const text = `${product.name} ${product.category} ${product.material}`.toLowerCase();
    return inCategory && text.includes(query.toLowerCase());
  }), [category, query]);

  return (
    <>
      {showLaunchWelcome && <LaunchWelcome onFinish={finishLaunch} />}
      <div className="announcement"><span>JEWELLERY THAT FEELS LIKE YOU</span><span className="announcement__dot">✦</span><span>SHINE WITH ELEGANCE</span><span className="announcement__dot">✦</span><span>THOUGHTFULLY CHOSEN, BEAUTIFULLY WORN</span></div>
      <header className="site-header">
        <button className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
        <a className="wordmark" href="#home" aria-label="Lavéra home">Lavéra<span>✦</span></a>
        <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}>
          <a href="#collection" onClick={() => setMenuOpen(false)}>The collection</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#care" onClick={() => setMenuOpen(false)}>Care guide</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Search pieces" onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X /> : <Search />}</button>
          <a className="header-contact" href="#contact">Get in touch <ArrowRight size={15} /></a>
        </div>
      </header>
      {searchOpen && <div className="search-panel"><Search size={17} /><input autoFocus placeholder="Search the collection…" value={query} onChange={(e) => setQuery(e.target.value)} /><button className="text-button" onClick={() => { setQuery(''); setSearchOpen(false); }}>Close</button></div>}

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> THE LAVÉRA EDIT</p>
            <h1>Shine in<br /><em>your own</em><br />way.</h1>
            <p className="hero-description">Little treasures, lasting feelings. Discover jewellery made to bring a touch of elegance to the everyday.</p>
            <a className="button button--gold" href="#collection">Explore the collection <ArrowRight size={16} /></a>
            <a className="hero-scroll" href="#collection"><span>SCROLL TO DISCOVER</span><ArrowDown size={14} /></a>
          </div>
          <div className="hero-art" aria-label="Lavéra brand emblem">
            <div className="hero-art__frame"><img src="/images/laveralogo.jpeg" alt="Lavéra — shine with elegance" /></div>
            <div className="hero-art__caption"><span>THE ART OF THE LITTLE THINGS</span><span>01 — 04</span></div>
            <span className="hero-art__sparkle sparkle-one">✦</span><span className="hero-art__sparkle sparkle-two">✧</span>
          </div>
          <div className="hero-index">01 <span>/</span> 04</div>
        </section>

        <section className="intro-strip" id="story">
          <span className="intro-strip__mark">L</span>
          <p>For the moments you keep.<br /><em>And the ones you make.</em></p>
          <div className="intro-strip__right"><Sparkles size={17} /><span>Thoughtful style, everyday beauty</span></div>
        </section>

        <section className="category-discovery section-wrap" aria-labelledby="category-title">
          <div className="discovery-heading"><p className="eyebrow">A LITTLE SOMETHING FOR EVERY YOU</p><h2 id="category-title">Find your kind of <em>shine</em></h2></div>
          <div className="category-cards">
            {[
              { name: 'Earrings', note: 'A little light around the face', number: '01' },
              { name: 'Necklaces', note: 'The finishing touch, close to heart', number: '02' },
              { name: 'Rings', note: 'Small details, lovely gestures', number: '03' },
              { name: 'Bracelets', note: 'A golden detail in motion', number: '04' },
            ].map((item) => <button className="category-card" key={item.name} onClick={() => { setCategory(item.name); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="category-card__number">{item.number}</span><span className="category-card__title">{item.name}</span><span className="category-card__note">{item.note}</span><span className="category-card__arrow"><ArrowRight size={16} /></span>
            </button>)}
          </div>
        </section>

        <section className="collection section-wrap" id="collection">
          <div className="section-heading">
            <div><p className="eyebrow">CURATED FOR YOU</p><h2>Discover <em>the collection</em></h2></div>
            <p className="section-heading__aside">A little something to make<br />every day feel special.</p>
          </div>
          <div className="collection-toolbar">
            <div className="category-tabs" role="tablist" aria-label="Filter products by category">
              {categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'category-tab category-tab--active' : 'category-tab'} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <span className="product-count">{visibleProducts.length} PIECES</span>
          </div>
          <p className="catalog-preview-note">Preview catalogue · replace sample products, prices, and details in <code>src/data/products.js</code> before publishing.</p>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}</div> : <div className="empty-state">No pieces found. Try another search or category.</div>}
          <div className="collection-footnote"><span>✦</span> Each piece is a small celebration of you.</div>
        </section>

        <section className="care-section" id="care">
          <div className="care-inner">
            <div className="care-copy"><p className="eyebrow">THE LITTLE THINGS MATTER</p><h2>A little care<br />goes a <em>long way.</em></h2><p>Keep your favourite pieces looking their best with a few simple habits. For material-specific guidance, check the care notes on each product.</p><a href="#collection" className="care-link">Browse the pieces <ArrowRight size={15} /></a></div>
            <div className="care-tips">
              <article><span>01</span><div><h3>Last on, first off</h3><p>Put jewellery on after perfume, lotion and hair products. Take it off before showering, swimming or exercise.</p></div></article>
              <article><span>02</span><div><h3>A gentle clean</h3><p>After wearing, wipe gently with a soft, dry cloth. Follow the specific care instructions listed with each piece.</p></div></article>
              <article><span>03</span><div><h3>A place of its own</h3><p>Store pieces dry and separately to help prevent tangles and scratches.</p></div></article>
            </div>
          </div>
        </section>

        <section className="brand-note">
          <div className="brand-note__ornament">✳</div><p>Adornment is the art of<br /><em>feeling like yourself.</em></p><span>LAVÉRA — SHINE WITH ELEGANCE</span>
        </section>

        <section className="enquiry-section" id="contact">
          <div className="enquiry-layout">
            <div className="enquiry-intro"><p className="eyebrow">WE’RE HERE TO HELP</p><h2>A piece caught<br /><em>your eye?</em></h2><p>Tell us which piece you’re asking about and Lavéra can get back to you.</p><div className="enquiry-reference-tip"><Sparkles size={17} /><span>Open a product and choose <strong>Enquire about this piece</strong> to fill in its category and reference automatically.</span></div></div>
            <form className="enquiry-form" name="product-enquiry" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={submitEnquiry}>
              <input type="hidden" name="form-name" value="product-enquiry" />
              <p className="honeypot-field" aria-hidden="true"><label>Leave this field empty<input name="bot-field" tabIndex="-1" autoComplete="off" /></label></p>
              <div className="form-row">
                <label className="form-field"><span>Your name <b>*</b></span><input type="text" name="name" placeholder="Name" autoComplete="name" required /></label>
                <label className="form-field"><span>Product category <b>*</b></span><select name="category" value={enquiryCategory} onChange={(event) => setEnquiryCategory(event.target.value)} required><option value="" disabled>Choose a category</option>{categories.filter((item) => item !== 'All pieces').map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              </div>
              <label className="form-field"><span>Product reference ID <b>*</b></span><input type="text" name="product-reference" value={enquiryReference} onChange={(event) => setEnquiryReference(event.target.value)} placeholder="For example, LV-NK-001" required /></label>
              <div className="form-row">
                <label className="form-field"><span>Email address <b>*</b></span><input type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label>
                <label className="form-field"><span>Phone number <b>*</b></span><input type="tel" name="phone" placeholder="Your phone number" autoComplete="tel" required /></label>
              </div>
              <label className="form-field"><span>Your message <small>Optional</small></span><textarea name="message" rows="3" placeholder="What would you like to know about this piece?" /></label>
              <p className="enquiry-privacy">Lavéra will use your details to respond to this product enquiry.</p>
              <button className="enquiry-submit" type="submit" disabled={isSubmittingEnquiry}>{isSubmittingEnquiry ? 'Sending…' : 'Send product enquiry'} <ArrowRight size={16} /></button>
              <p className="enquiry-status" role="status" aria-live="polite">{enquiryStatus}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><a className="wordmark wordmark--footer" href="#home">Lavéra<span>✦</span></a><p>Shine with elegance.</p></div>
        <div className="footer-contact"><span>HAVE A QUESTION ABOUT A PIECE?</span><a href="#collection">Explore the collection <ArrowRight size={15} /></a></div>
        <a className="social-link" href="#contact" aria-label="Contact Lavéra"><Sparkles size={19} /></a>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Lavéra. All rights reserved.</span><span>Made with a little sparkle <span className="gold-text">✦</span></span></div>
      </footer>
      <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} onEnquire={prepareProductEnquiry} />
    </>
  );
}
