import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Check, ChevronRight, CircleUserRound, Gem, ImagePlus, Inbox, LoaderCircle, LogOut, Mail, Menu, PackagePlus, Plus, Search, Send, Settings, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { productFromDatabase, productToDatabase } from '../lib/catalog.js';

const categories = ['Earrings', 'Necklaces', 'Rings', 'Bracelets'];
const categoryCodes = { Earrings: 'ER', Necklaces: 'NK', Rings: 'RG', Bracelets: 'BR' };
const blankProduct = { id: '', name: '', category: 'Earrings', price: '', oldPrice: '', shortDescription: '', description: '', material: '', finish: '', dimensions: '', closure: '', care: '', images: [], featured: false, badge: '', is_active: true, photoCredit: '', photoCreditUrl: '' };

function isPasswordSetupLink() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const params = new URLSearchParams(window.location.search);
  return ['invite', 'recovery'].includes(hash.get('type') || params.get('type'));
}

function newReference(category, list) {
  const prefix = `LV-${categoryCodes[category] || 'PR'}-`;
  const max = list.reduce((value, item) => item.id.startsWith(prefix) ? Math.max(value, Number(item.id.slice(prefix.length)) || 0) : value, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function displayDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState('checking');
  const [passwordSetup, setPasswordSetup] = useState(isPasswordSetupLink);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState('overview');
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDraft, setProductDraft] = useState(blankProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const checkAdmin = useCallback(async (activeSession) => {
    if (!supabase || !activeSession) { setAccess('signed-out'); return; }
    const { data, error } = await supabase.rpc('is_lavera_admin');
    setSession(activeSession);
    if (error) {
      setAccess('setup-error');
      setAuthError(`Could not check owner permission. Run supabase/setup.sql first. ${error.message}`);
    } else setAccess(data ? 'admin' : 'not-admin');
  }, []);

  useEffect(() => {
    if (!supabase) { setAccess('not-configured'); return undefined; }
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (current) checkAdmin(current);
      else setAccess('signed-out');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, current) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && isPasswordSetupLink())) setPasswordSetup(true);
      setSession(current);
      if (!current) setAccess('signed-out');
      else window.setTimeout(() => checkAdmin(current), 0);
    });
    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoadingData(true);
    setDataError('');
    const [productResult, enquiryResult] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
    ]);
    if (productResult.error || enquiryResult.error) setDataError(productResult.error?.message || enquiryResult.error?.message);
    else {
      setProducts((productResult.data || []).map(productFromDatabase));
      setEnquiries(enquiryResult.data || []);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { if (access === 'admin') loadData(); }, [access, loadData]);

  useEffect(() => {
    if (!editorOpen || editingProduct) return;
    setProductDraft((draft) => ({ ...draft, id: newReference(draft.category, products) }));
  }, [editorOpen, editingProduct, products]);

  const signIn = async (event) => {
    event.preventDefault();
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    else await checkAdmin(data.session);
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    window.location.hash = '';
    window.location.reload();
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductDraft({ ...blankProduct, id: newReference('Earrings', products) });
    setNotice('');
    setEditorOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product.id);
    setProductDraft({ ...blankProduct, ...product, oldPrice: product.oldPrice ?? '' });
    setNotice('');
    setEditorOpen(true);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setNotice('');
    const payload = productToDatabase(productDraft);
    const { error } = await supabase.from('products').upsert(payload).select().single();
    setSavingProduct(false);
    if (error) { setNotice(error.message); return; }
    setEditorOpen(false);
    await loadData();
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name} (${product.id})?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) setNotice(error.message);
    else await loadData();
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setNotice('');
    const uploaded = [];
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${productDraft.id || 'new-product'}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false });
      if (error) { setNotice(`Image upload failed: ${error.message}`); break; }
      uploaded.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
    }
    setProductDraft((draft) => ({ ...draft, images: [...draft.images, ...uploaded] }));
    setUploading(false);
    event.target.value = '';
  };

  const updateEnquiryStatus = async (id, status) => {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
    if (error) setNotice(error.message);
    else setEnquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  };

  const changeOwnerPassword = async (event) => {
    event.preventDefault();
    setPasswordFeedback('');
    if (!currentPassword) { setPasswordFeedback('Enter your current or temporary password to confirm this change.'); return; }
    if (newPassword.length < 8) { setPasswordFeedback('Choose a password with at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordFeedback('The two passwords do not match.'); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
    setPasswordSaving(false);
    if (error) setPasswordFeedback(error.message);
    else {
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setPasswordFeedback('Your password has been changed. Keep it private and secure.');
    }
  };

  const finishPasswordSetup = async (event) => {
    event.preventDefault();
    setPasswordFeedback('');
    if (newPassword.length < 8) { setPasswordFeedback('Choose a password with at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordFeedback('The two passwords do not match.'); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) { setPasswordFeedback(error.message); return; }
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback('Password saved. Opening your owner dashboard…');
    window.history.replaceState({}, document.title, window.location.pathname);
    window.setTimeout(() => setPasswordSetup(false), 700);
  };

  const filteredProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(productSearch.toLowerCase())), [products, productSearch]);
  const newCount = enquiries.filter((item) => item.status === 'new').length;
  const counts = categories.map((category) => ({ category, count: products.filter((product) => product.category === category).length }));

  if (access === 'not-configured') return <SetupRequired />;
  if (passwordSetup && !session && access === 'checking') return <div className="admin-loading"><LoaderCircle className="spin" /> Verifying your secure setup link…</div>;
  if (passwordSetup && !session && access === 'signed-out') return <InvalidSetupLink />;
  if (passwordSetup && session) return <PasswordSetupScreen email={session.user?.email} password={newPassword} setPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} onSubmit={finishPasswordSetup} saving={passwordSaving} feedback={passwordFeedback} />;
  if (access === 'checking') return <div className="admin-loading"><LoaderCircle className="spin" /> Checking owner access…</div>;
  if (access === 'signed-out') return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onSubmit={signIn} error={authError} />;
  if (access === 'setup-error') return <SetupRequired error={authError} />;
  if (access === 'not-admin') return <div className="admin-login-wrap"><div className="admin-login"><BrandMark /><ShieldCheck size={34} /><h1>This account isn’t an owner account</h1><p>Ask the project developer to add this Supabase user to the Lavéra owner allowlist.</p><button className="admin-primary" onClick={signOut}>Sign out</button></div></div>;

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNav ? 'admin-sidebar--open' : ''}`}>
        <BrandMark />
        <div className="admin-sidebar__label">WORKSPACE</div>
        <button className={section === 'overview' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => { setSection('overview'); setMobileNav(false); }}><BarChart3 size={17} /> Overview</button>
        <button className={section === 'products' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => { setSection('products'); setMobileNav(false); }}><Gem size={17} /> Products <span>{products.length}</span></button>
        <button className={section === 'enquiries' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => { setSection('enquiries'); setMobileNav(false); }}><Inbox size={17} /> Message center {newCount > 0 && <b>{newCount}</b>}</button>
        <button className={section === 'settings' ? 'admin-nav-item active' : 'admin-nav-item'} onClick={() => { setSection('settings'); setMobileNav(false); }}><Settings size={17} /> Account settings</button>
        <div className="admin-sidebar__bottom"><a href="/" className="admin-back-link"><ArrowLeft size={15} /> View the website</a><button className="admin-nav-item" onClick={signOut}><LogOut size={17} /> Sign out</button></div>
      </aside>
      {mobileNav && <button className="admin-nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu"><Menu /></button><div><span>OWNER CONTROL PANEL</span><strong>Lavéra Studio</strong></div><div className="admin-topbar__user"><CircleUserRound size={20} /><span>{session?.user?.email}</span><button onClick={signOut} aria-label="Sign out"><LogOut size={16} /></button></div></header>
        <div className="admin-content">
          {dataError && <div className="admin-alert">{dataError} <button onClick={loadData}>Retry</button></div>}
          {notice && !editorOpen && <div className="admin-alert">{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
          {section === 'overview' && <>
            <div className="admin-welcome"><div><p className="admin-eyebrow">YOUR LITTLE CORNER OF LAVÉRA</p><h1>Welcome back<span> ✦</span></h1><p>Here’s what’s happening with the collection today.</p></div><button className="admin-primary" onClick={openNewProduct}><Plus size={17} /> Add a product</button></div>
            <div className="admin-stat-grid"><Stat icon={<Gem />} label="Live products" value={products.filter((item) => item.is_active).length} /><Stat icon={<Inbox />} label="New enquiries" value={newCount} accent /><Stat icon={<PackagePlus />} label="Categories" value={categories.length} /><Stat icon={<ImagePlus />} label="Product photos" value={products.reduce((total, item) => total + (item.images?.length || 0), 0)} /></div>
            <div className="admin-overview-grid"><section className="admin-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">YOUR CATALOG</span><h2>Pieces by category</h2></div><button className="admin-text-link" onClick={() => setSection('products')}>Manage products <ChevronRight size={15} /></button></div><div className="category-count-list">{counts.map(({ category, count }) => <div className="category-count" key={category}><span>{category}</span><div><i style={{ width: `${products.length ? Math.max(5, count / products.length * 100) : 0}%` }} /></div><b>{count}</b></div>)}</div></section>
              <section className="admin-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">LATEST NOTES</span><h2>Recent enquiries</h2></div><button className="admin-text-link" onClick={() => setSection('enquiries')}>Open inbox <ChevronRight size={15} /></button></div>{enquiries.slice(0, 4).length ? enquiries.slice(0, 4).map((item) => <div className="recent-enquiry" key={item.id}><span className={`status-dot status-dot--${item.status}`} /><div><strong>{item.name}</strong><span>{item.product_reference} · {item.category}</span></div><time>{displayDate(item.created_at)}</time></div>) : <p className="admin-empty-copy">Your enquiries will appear here when customers reach out.</p>}</section></div>
          </>}
          {section === 'products' && <section className="admin-card admin-products"><div className="admin-card-heading"><div><span className="admin-eyebrow">THE LAVÉRA COLLECTION</span><h1>Products</h1></div><button className="admin-primary" onClick={openNewProduct}><Plus size={17} /> Add product</button></div><div className="admin-table-tools"><label><Search size={16} /><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Find a product or reference…" /></label><span>{filteredProducts.length} pieces</span></div>{loadingData ? <AdminLoader /> : <div className="admin-product-list">{filteredProducts.map((product) => <article className="admin-product-row" key={product.id}><div className="admin-product-thumb">{product.images?.[0] ? <img src={product.images[0]} alt="" /> : <Gem size={20} />}</div><div className="admin-product-info"><strong>{product.name}</strong><span>{product.id} · {product.category}</span></div><div className="admin-product-price">₹{Number(product.price).toLocaleString('en-IN')}</div><span className={product.is_active ? 'product-state is-live' : 'product-state'}>{product.is_active ? 'Live' : 'Hidden'}</span><button className="admin-row-action" onClick={() => openEditProduct(product)}>Edit</button><button className="admin-icon-danger" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)}><Trash2 size={16} /></button></article>)}{!filteredProducts.length && <p className="admin-empty-copy">No products yet. Add the first Lavéra piece.</p>}</div>}</section>}
          {section === 'enquiries' && <section className="admin-card admin-inbox"><div className="admin-card-heading"><div><span className="admin-eyebrow">CUSTOMER CARE</span><h1>Message center</h1><p>Product questions and customer requests, all in one place.</p></div><span className="inbox-count"><Inbox size={16} /> {newCount} new</span></div>{loadingData ? <AdminLoader /> : enquiries.length ? <div className="inbox-list">{enquiries.map((item) => <article className={`inbox-message ${item.status === 'new' ? 'inbox-message--new' : ''}`} key={item.id}><div className="inbox-message__top"><div><span className={`message-status message-status--${item.status}`}>{item.status}</span><time>{displayDate(item.created_at)}</time></div><select aria-label={`Update status for ${item.name}`} value={item.status} onChange={(event) => updateEnquiryStatus(item.id, event.target.value)}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></div><h3>{item.name} <span>is asking about</span> {item.product_reference}</h3><p className="inbox-product-line">{item.category} · Ref {item.product_reference}</p>{item.message && <p className="inbox-message__body">{item.message}</p>}<div className="inbox-message__actions"><a href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Lavéra enquiry: ${item.product_reference}`)}`}><Mail size={15} /> {item.email}</a><a href={`tel:${encodeURIComponent(item.phone)}`}>{item.phone}</a><a className="reply-link" href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Re: Lavéra enquiry ${item.product_reference}`)}`}><Send size={14} /> Reply</a></div></article>)}</div> : <div className="admin-empty"><Inbox size={30} /><h2>Your inbox is ready</h2><p>New product enquiries from the website will show up here.</p></div>}</section>}
          {section === 'settings' && <section className="admin-card admin-settings"><div className="admin-card-heading"><div><span className="admin-eyebrow">YOUR ACCOUNT</span><h1>Account settings</h1><p>Update the owner login details for this studio.</p></div></div><div className="admin-account-card"><CircleUserRound size={24} /><div><span>Signed in as</span><strong>{session?.user?.email}</strong></div><span className="account-verified"><ShieldCheck size={15} /> Owner access</span></div><form className="admin-password-form" onSubmit={changeOwnerPassword}><h2>Change password</h2><p>For security, replace the temporary password after your first sign-in. Choose a private password you don’t use elsewhere.</p><label>Current or temporary password<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label>New password<input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" /></label><label>Confirm new password<input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type it again" /></label>{passwordFeedback && <p className={passwordFeedback.startsWith('Your password') ? 'password-feedback password-feedback--success' : 'password-feedback'}>{passwordFeedback}</p>}<button className="admin-primary" type="submit" disabled={passwordSaving}>{passwordSaving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{passwordSaving ? 'Updating…' : 'Update password'}</button></form></section>}
        </div>
      </main>

      {editorOpen && <div className="admin-editor-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditorOpen(false)}><section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header className="admin-editor__header"><div><span className="admin-eyebrow">COLLECTION DETAILS</span><h2 id="editor-title">{editingProduct ? 'Edit piece' : 'Add a new piece'}</h2></div><button className="admin-close" onClick={() => setEditorOpen(false)} aria-label="Close editor"><X /></button></header><form onSubmit={saveProduct} className="product-editor-form">
        <div className="admin-form-grid"><label>Product name<input required value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} placeholder="e.g. Moonlit Pearl Drops" /></label><label>Category<select value={productDraft.category} onChange={(event) => setProductDraft({ ...productDraft, category: event.target.value, id: editingProduct ? productDraft.id : newReference(event.target.value, products) })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Product reference<input required value={productDraft.id} readOnly title="Automatically assigned based on category" /></label><label>Price (₹)<input required type="number" min="0" step="0.01" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} /></label><label>Old price (₹)<input type="number" min="0" step="0.01" value={productDraft.oldPrice} onChange={(event) => setProductDraft({ ...productDraft, oldPrice: event.target.value })} /></label><label>Badge (optional)<input value={productDraft.badge || ''} onChange={(event) => setProductDraft({ ...productDraft, badge: event.target.value })} placeholder="New arrival" /></label><label className="admin-form-wide">Short description<input value={productDraft.shortDescription} onChange={(event) => setProductDraft({ ...productDraft, shortDescription: event.target.value })} placeholder="A lovely line shown on the card" /></label><label className="admin-form-wide">Full description<textarea rows="3" value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} /></label><label>Material<input value={productDraft.material} onChange={(event) => setProductDraft({ ...productDraft, material: event.target.value })} placeholder="e.g. Gold-plated alloy" /></label><label>Finish<input value={productDraft.finish} onChange={(event) => setProductDraft({ ...productDraft, finish: event.target.value })} /></label><label>Size / dimensions<input value={productDraft.dimensions} onChange={(event) => setProductDraft({ ...productDraft, dimensions: event.target.value })} /></label><label>Closure / fit<input value={productDraft.closure} onChange={(event) => setProductDraft({ ...productDraft, closure: event.target.value })} /></label><label className="admin-form-wide">Care instructions<textarea rows="2" value={productDraft.care} onChange={(event) => setProductDraft({ ...productDraft, care: event.target.value })} /></label></div>
        <div className="admin-image-manager"><div><strong>Product photos</strong><span>Add more than one image; the first is the cover photo.</span></div><label className="admin-upload-button"><Upload size={16} /> {uploading ? 'Uploading…' : 'Upload images'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={uploadImages} disabled={uploading} /></label></div>
        {productDraft.images.length > 0 && <div className="admin-image-list">{productDraft.images.map((image, index) => <div className="admin-image-item" key={`${image}-${index}`}><img src={image} alt={`Product view ${index + 1}`} /><span>{index === 0 ? 'Cover' : `Image ${index + 1}`}</span><button type="button" onClick={() => setProductDraft({ ...productDraft, images: productDraft.images.filter((_, i) => i !== index) })} aria-label="Remove image"><X size={14} /></button></div>)}</div>}
        <div className="admin-form-checks"><label><input type="checkbox" checked={productDraft.featured} onChange={(event) => setProductDraft({ ...productDraft, featured: event.target.checked })} /> Featured item</label><label><input type="checkbox" checked={productDraft.is_active} onChange={(event) => setProductDraft({ ...productDraft, is_active: event.target.checked })} /> Visible in gallery</label></div>
        {notice && <p className="admin-form-error">{notice}</p>}<footer className="admin-editor__footer"><button type="button" className="admin-secondary" onClick={() => setEditorOpen(false)}>Cancel</button><button className="admin-primary" disabled={savingProduct || uploading}>{savingProduct ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{savingProduct ? 'Saving…' : 'Save product'}</button></footer>
      </form></section></div>}
    </div>
  );
}

function BrandMark() { return <a className="admin-brand" href="/" aria-label="Lavéra"><img src="/images/laveralogo.jpeg" alt="" /><span>Lavéra<small>OWNER STUDIO</small></span></a>; }
function AdminLoader() { return <div className="admin-loader"><LoaderCircle className="spin" /> Loading workspace…</div>; }
function Stat({ icon, label, value, accent }) { return <article className={`admin-stat ${accent ? 'admin-stat--accent' : ''}`}><span className="admin-stat__icon">{icon}</span><span className="admin-stat__label">{label}</span><strong>{value}</strong><small>Current collection</small></article>; }

function PasswordSetupScreen({ email, password, setPassword, confirmPassword, setConfirmPassword, onSubmit, saving, feedback }) {
  const isSuccess = feedback.startsWith('Password saved');
  return <div className="admin-login-wrap"><div className="admin-login"><BrandMark /><span className="admin-login__kicker">SECURE OWNER SETUP</span><h1>Create your password.</h1><p>Welcome{email ? `, ${email}` : ''}. Choose a private password for the Lavéra owner dashboard.</p><form onSubmit={onSubmit}><label>New password<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label><label>Confirm new password<input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type it again" /></label>{feedback && <p className={isSuccess ? 'password-feedback password-feedback--success' : 'admin-form-error'}>{feedback}</p>}<button className="admin-primary" type="submit" disabled={saving || isSuccess}>{saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{saving ? 'Saving…' : isSuccess ? 'Password saved' : 'Set password'}</button></form><span className="admin-login__foot"><ShieldCheck size={14} /> This password is stored securely by Supabase</span></div></div>;
}

function InvalidSetupLink() {
  return <div className="admin-login-wrap"><div className="admin-login"><BrandMark /><span className="admin-login__kicker">LINK EXPIRED OR ALREADY USED</span><h1>Let’s get you a fresh link.</h1><p>This secure setup link could not be verified. Ask the project owner to send a new invitation or password reset link after confirming the website redirect settings.</p><a className="admin-primary admin-link-button" href="/admin">Go to owner sign in <ChevronRight size={17} /></a></div></div>;
}

function LoginScreen({ email, setEmail, password, setPassword, onSubmit, error }) {
  return <div className="admin-login-wrap"><a className="admin-login-back" href="/">← Back to Lavéra website</a><div className="admin-login"><BrandMark /><span className="admin-login__kicker">A WARM WELCOME BACK</span><h1>Your studio awaits.</h1><p>Sign in to tend to your collection and customer messages.</p><form onSubmit={onSubmit}><label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@example.com" /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>{error && <p className="admin-form-error">{error}</p>}<button className="admin-primary" type="submit">Sign in <ChevronRight size={17} /></button></form><span className="admin-login__foot"><ShieldCheck size={14} /> Private owner access</span></div></div>;
}

function SetupRequired({ error }) {
  return <div className="admin-login-wrap"><a className="admin-login-back" href="/">← Back to Lavéra website</a><div className="admin-login"><BrandMark /><span className="admin-login__kicker">ONE-TIME PROJECT SETUP</span><h1>Let’s connect your studio.</h1><p>{error || 'Add the Supabase project URL and publishable (anon) key to your local .env.local and Netlify environment variables, then run supabase/setup.sql in your Supabase SQL Editor.'}</p><div className="setup-checklist"><span><Check size={15} /> Create your Supabase project</span><span><Check size={15} /> Run the included setup.sql</span><span><Check size={15} /> Add the project URL and public key</span><span><Check size={15} /> Create the owner login and approve it</span></div><a className="admin-primary admin-link-button" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Open Supabase <ChevronRight size={17} /></a></div></div>;
}
