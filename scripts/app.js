(function(){
'use strict';
var ROOT=document.documentElement.getAttribute('data-root')||'./';
var P=window.PRODUCTS||[];
var BY={};P.forEach(function(p){BY[p.slug]=p;});
var CATS=[['building-materials','Building Materials'],['hardware-tools','Hardware & Tools'],['electrical','Electrical'],['plumbing','Plumbing'],['safety','Safety'],['industrial','Industrial']];
var mem={};
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return mem[k]!==undefined?mem[k]:d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){mem[k]=v;}}
function cart(){return load('vs_cart',{});}
function wish(){return load('vs_wish',[]);}
function inr(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function href(slug){return ROOT+'pages/'+slug+'.html';}
function img(p){return ROOT+'images/'+p.img;}
function off(p){return p.mrp&&p.mrp>p.price?Math.round((1-p.price/p.mrp)*100):0;}
function stars(r){if(!r)return '';var f=Math.round(r),s='';for(var i=0;i<5;i++)s+=i<f?'★':'☆';return s;}
var heartSvg='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>';

/* toast */
var tt;function toast(m){var t=document.querySelector('.vs-toast');if(!t){t=document.createElement('div');t.className='vs-toast';document.body.appendChild(t);}t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show');},1800);}

/* cart ops */
function addToCart(slug,q){var c=cart();c[slug]=(c[slug]||0)+(q||1);save('vs_cart',c);updateBadges();toast('Added to cart ✓');}
function setQty(slug,q){var c=cart();if(q<=0)delete c[slug];else c[slug]=q;save('vs_cart',c);updateBadges();}
function toggleWish(slug){var w=wish(),i=w.indexOf(slug);if(i>-1){w.splice(i,1);toast('Removed from wishlist');}else{w.push(slug);toast('Saved to wishlist ♥');}save('vs_wish',w);updateBadges();syncHearts();return i===-1;}
function cartCount(){var c=cart(),n=0;for(var k in c)if(BY[k])n+=c[k];return n;}

/* header badges */
function badge(a,n){if(!a)return;var b=a.querySelector('span');var isBadge=b&&!b.querySelector('svg');
 if(n<=0){if(isBadge)b.remove();return;}
 if(!isBadge){b=document.createElement('span');b.className='vs-badgecount';a.appendChild(b);}
 b.textContent=n;}
function updateBadges(){
 var cn=cartCount(),wn=wish().filter(function(s){return BY[s];}).length;
 document.querySelectorAll('a[href$="cart.html"]').forEach(function(a){if(a.querySelector('svg.lucide-shopping-cart'))badge(a,cn);});
 document.querySelectorAll('a[href$="wishlist.html"]').forEach(function(a){if(a.querySelector('svg.lucide-heart'))badge(a,wn);});
}
function syncHearts(){var w=wish();document.querySelectorAll('[data-wish]').forEach(function(b){var on=w.indexOf(b.getAttribute('data-wish'))>-1;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
 document.querySelectorAll('button[aria-label^="Save "][aria-label$="to wishlist"]').forEach(function(b){var s=slugOf(b);if(!s)return;var on=w.indexOf(s)>-1;b.setAttribute('aria-pressed',on);var sv=b.querySelector('svg');if(sv){sv.style.fill=on?'currentColor':'none';sv.style.color=on?'#d83a2a':'';}});}
function slugOf(el){var card=el.closest('.group,article,[class*="rounded-2xl"]');var a=card&&card.querySelector('a[href*="pages/"],a[href$=".html"]');if(!a)return null;var m=a.getAttribute('href').match(/([a-z0-9-]+)\.html$/);return m&&BY[m[1]]?m[1]:null;}

/* card template */
function card(p){var o=off(p);
 return '<article class="vs-card"><a class="vs-img" href="'+href(p.slug)+'" aria-label="'+esc(p.name)+'"><img loading="lazy" src="'+img(p)+'" alt="'+esc(p.name)+'">'+(o?'<span class="vs-badge">'+o+'% OFF</span>':'')+(p.badge?'<span class="vs-badge2">'+esc(p.badge)+'</span>':'')+'</a>'+
 '<button type="button" class="vs-heart" data-wish="'+p.slug+'" aria-label="Save '+esc(p.name)+' to wishlist">'+heartSvg+'</button>'+
 '<div class="vs-body"><div class="vs-meta"><span>'+esc(p.brand)+'</span><span>'+esc(p.sku)+'</span></div>'+
 '<a class="vs-title" href="'+href(p.slug)+'">'+esc(p.name)+'</a>'+
 (p.rating?'<div class="vs-stars">'+stars(p.rating)+'<small>'+p.rating.toFixed(1)+' ('+p.reviews+')</small></div>':'')+
 '<div class="vs-price"><b>'+inr(p.price)+'</b>'+(p.mrp?'<s>'+inr(p.mrp)+'</s>':'')+'<small>/ '+esc(p.unit)+'</small></div>'+
 '<div class="vs-actions"><button class="vs-btn primary" data-add="'+p.slug+'">Add to Cart</button><a class="vs-btn ghost" href="'+href(p.slug)+'">Details</a></div></div></article>';}

/* pages */
function q(name){return new URLSearchParams(location.search).get(name)||'';}
function renderShop(m){
 var cat=q('cat'),term=q('q').toLowerCase(),sort=q('sort')||'rel',deals=q('deals');
 var title='All Products';CATS.forEach(function(c){if(c[0]===cat)title=c[1];});if(deals)title='Offers & Deals';if(term)title='Results for “'+q('q')+'”';
 function list(){var l=P.filter(function(p){
   if(cat&&p.cat!==cat)return false;
   if(deals&&!off(p))return false;
   if(term&&(p.name+' '+p.desc+' '+p.sku+' '+p.brand).toLowerCase().indexOf(term)<0)return false;return true;});
  if(sort==='lo')l.sort(function(a,b){return a.price-b.price;});
  else if(sort==='hi')l.sort(function(a,b){return b.price-a.price;});
  else if(sort==='off')l.sort(function(a,b){return off(b)-off(a);});
  return l;}
 function draw(){var l=list();
  var chips='<a class="vs-chip'+(!cat&&!deals?' on':'')+'" href="shop.html">All</a>'+CATS.filter(function(c){return P.some(function(p){return p.cat===c[0];});}).map(function(c){return '<a class="vs-chip'+(cat===c[0]?' on':'')+'" href="shop.html?cat='+c[0]+'">'+c[1]+'</a>';}).join('')+'<a class="vs-chip'+(deals?' on':'')+'" href="shop.html?deals=1">🔥 Offers</a>';
  m.innerHTML='<div class="vs-wrap"><div class="vs-crumbs"><a href="'+ROOT+'index.html">Home</a> / Shop</div><h1 class="vs-h1">'+esc(title)+'</h1><p class="vs-sub">'+l.length+' product'+(l.length===1?'':'s')+'</p>'+
   '<div class="vs-toolbar"><div class="vs-chips">'+chips+'</div><select class="vs-select" id="vs-sort"><option value="rel">Sort: Featured</option><option value="lo">Price: Low to High</option><option value="hi">Price: High to Low</option><option value="off">Biggest Discount</option></select></div>'+
   (l.length?'<div class="vs-grid">'+l.map(card).join('')+'</div>':'<div class="vs-empty"><h2>No products found</h2><p>Try a different search or category.</p><p style="margin-top:1rem"><a class="vs-btn primary" href="shop.html">View all products</a></p></div>')+'</div>';
  var s=document.getElementById('vs-sort');s.value=sort;s.onchange=function(){sort=s.value;draw();};
  syncHearts();}
 draw();}

function renderProduct(m){
 var slug=m.getAttribute('data-slug'),p=BY[slug];if(!p){m.innerHTML='<div class="vs-wrap vs-empty"><h2>Product not found</h2><a class="vs-btn primary" href="shop.html">Back to shop</a></div>';return;}
 var o=off(p),qty=1,catName='';CATS.forEach(function(c){if(c[0]===p.cat)catName=c[1];});
 document.title=p.name+' | VANTREX SOLUTIONS';
 var rel=P.filter(function(x){return x.cat===p.cat&&x.slug!==p.slug;}).slice(0,4);
 if(rel.length<4)rel=rel.concat(P.filter(function(x){return x.cat!==p.cat;}).slice(0,4-rel.length));
 m.innerHTML='<div class="vs-wrap"><div class="vs-crumbs"><a href="'+ROOT+'index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?cat='+p.cat+'">'+esc(catName)+'</a> / '+esc(p.name)+'</div>'+
 '<div class="vs-detail"><div class="big"><img src="'+img(p)+'" alt="'+esc(p.name)+'"></div><div class="vs-info">'+
 '<div class="vs-meta"><span>'+esc(p.brand)+'</span><span>SKU: '+esc(p.sku)+'</span></div><h1>'+esc(p.name)+'</h1>'+
 (p.rating?'<div class="vs-stars">'+stars(p.rating)+'<small>'+p.rating.toFixed(1)+' · '+p.reviews+' reviews</small></div>':'')+
 '<div class="price"><b>'+inr(p.price)+'</b>'+(p.mrp?'<s>'+inr(p.mrp)+'</s>':'')+(o?'<span class="off">'+o+'% OFF</span>':'')+'</div><div class="vs-sub" style="margin:-.5rem 0 1rem">Inclusive of taxes · per '+esc(p.unit)+'</div>'+
 '<p class="d">'+esc(p.desc)+'</p>'+
 '<div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;margin-top:1.5rem"><div class="vs-qty"><button id="qm" aria-label="Decrease">−</button><span id="qv">1</span><button id="qp" aria-label="Increase">+</button></div>'+
 '<button class="vs-btn primary lg" id="addb" style="flex:1;min-width:150px">Add to Cart</button><button class="vs-btn gold lg" id="buyb">Buy Now</button><button class="vs-heart" style="position:static" data-wish="'+p.slug+'" aria-label="Save to wishlist">'+heartSvg+'</button></div>'+
 '<div class="vs-perks"><div>🚚 Fast site delivery</div><div>🔒 Secure payments</div><div>✅ Quality checked</div><div>🎧 Expert support</div></div>'+
 '<div class="vs-specs"><div><span>Brand</span><span>'+esc(p.brand)+'</span></div><div><span>SKU</span><span>'+esc(p.sku)+'</span></div><div><span>Category</span><span>'+esc(catName)+'</span></div><div><span>Sold per</span><span>'+esc(p.unit)+'</span></div></div>'+
 '</div></div>'+
 '<h2 class="vs-h1" style="margin:3rem 0 1rem;font-size:1.4rem">You may also like</h2><div class="vs-grid">'+rel.map(card).join('')+'</div></div>';
 var qv=document.getElementById('qv');
 document.getElementById('qm').onclick=function(){if(qty>1)qv.textContent=--qty;};
 document.getElementById('qp').onclick=function(){qv.textContent=++qty;};
 document.getElementById('addb').onclick=function(){addToCart(slug,qty);};
 document.getElementById('buyb').onclick=function(){addToCart(slug,qty);location.href='cart.html';};
 syncHearts();}

function renderCart(m){
 function draw(){var c=cart(),items=Object.keys(c).filter(function(s){return BY[s];});
  if(!items.length){m.innerHTML='<div class="vs-wrap"><h1 class="vs-h1">Shopping Cart</h1><div class="vs-empty"><h2>Your cart is empty</h2><p>Add some products to get started.</p><p style="margin-top:1rem"><a class="vs-btn primary" href="shop.html">Continue shopping</a></p></div></div>';return;}
  var sub=0,mrp=0,n=0;items.forEach(function(s){var p=BY[s];sub+=p.price*c[s];mrp+=(p.mrp||p.price)*c[s];n+=c[s];});
  var ship=sub>=1000?0:99,coupon=load('vs_coupon',''),disc=0;
  if(coupon==='VANTREX10'&&sub>=1000)disc=Math.round(sub*.10);if(coupon==='BUILD500'&&sub>=5000)disc=500;
  var total=sub-disc+ship;
  m.innerHTML='<div class="vs-wrap"><div class="vs-crumbs"><a href="'+ROOT+'index.html">Home</a> / Cart</div><h1 class="vs-h1">Shopping Cart</h1><p class="vs-sub">'+n+' item'+(n>1?'s':'')+' in your cart</p><div class="vs-cart" style="margin-top:1.5rem"><div>'+
  items.map(function(s){var p=BY[s];return '<div class="vs-row"><a href="'+href(s)+'"><img src="'+img(p)+'" alt=""></a><div class="grow"><a href="'+href(s)+'">'+esc(p.name)+'</a><div class="vs-sub">SKU '+esc(p.sku)+'</div><div style="font-weight:800;color:var(--navy);margin-top:.3rem">'+inr(p.price)+' <small style="font-weight:500;color:var(--muted-foreground)">/ '+esc(p.unit)+'</small></div></div>'+
   '<div class="vs-qty"><button data-q="-1" data-s="'+s+'">−</button><span>'+c[s]+'</span><button data-q="1" data-s="'+s+'">+</button></div><div style="font-weight:800;min-width:90px;text-align:right">'+inr(p.price*c[s])+'</div><button class="rm" data-rm="'+s+'">Remove</button></div>';}).join('')+
  '<a class="vs-btn ghost" href="shop.html" style="margin-top:.5rem">← Continue shopping</a></div>'+
  '<aside class="vs-sum"><h2>Order Summary</h2><div class="l"><span>Subtotal</span><span>'+inr(sub)+'</span></div>'+(mrp>sub?'<div class="l ok"><span>You save</span><span>'+inr(mrp-sub)+'</span></div>':'')+(disc?'<div class="l ok"><span>Coupon ('+coupon+')</span><span>− '+inr(disc)+'</span></div>':'')+'<div class="l"><span>Delivery</span><span>'+(ship?inr(ship):'<b class="ok">FREE</b>')+'</span></div><div class="l t"><span>Total</span><span>'+inr(total)+'</span></div>'+
  '<div style="display:flex;gap:.5rem;margin-top:1rem"><input class="vs-input" id="cpn" placeholder="Coupon code" style="flex:1;min-width:0" value="'+esc(coupon)+'"><button class="vs-btn ghost" id="cpb">Apply</button></div>'+
  '<button class="vs-btn primary lg" id="chk" style="width:100%;margin-top:1rem">Proceed to Checkout</button></aside></div></div>';
  m.querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){var s=b.getAttribute('data-s');setQty(s,cart()[s]+parseInt(b.getAttribute('data-q'),10));draw();};});
  m.querySelectorAll('[data-rm]').forEach(function(b){b.onclick=function(){setQty(b.getAttribute('data-rm'),0);draw();};});
  document.getElementById('cpb').onclick=function(){var v=document.getElementById('cpn').value.trim().toUpperCase();if(v==='VANTREX10'||v==='BUILD500'){save('vs_coupon',v);toast('Coupon applied');}else{save('vs_coupon','');toast('Invalid coupon');}draw();};
  document.getElementById('chk').onclick=function(){renderCheckout(m);window.scrollTo(0,0);};}
 draw();}


/* ===== CHECKOUT CONFIG (apni details yahan badlo) ===== */
var STORE_UPI_ID='vantrex@upi';        /* <-- apni real UPI ID daalo */
var STORE_NAME='VANTREX SOLUTIONS';
var STORE_WHATSAPP='';                 /* <-- e.g. '919876543210' (optional, order WhatsApp par bhi bhejne ke liye) */

function calcTotals(){
 var c=cart(),items=Object.keys(c).filter(function(s){return BY[s];}),sub=0;
 items.forEach(function(s){sub+=BY[s].price*c[s];});
 var ship=sub>=1000?0:99,coupon=load('vs_coupon',''),disc=0;
 if(coupon==='VANTREX10'&&sub>=1000)disc=Math.round(sub*.10);if(coupon==='BUILD500'&&sub>=5000)disc=500;
 return {c:c,items:items,sub:sub,ship:ship,disc:disc,coupon:coupon,total:sub-disc+ship};}

function renderCheckout(m){
 var T=calcTotals();
 if(!T.items.length){location.href='cart.html';return;}
 var u=load('vs_user',{}),last=load('vs_last_addr',{});
 function v(k){return esc(last[k]||(k==='email'?u.email||'':''));}
 var sumRows=T.items.map(function(s){var p=BY[s];return '<div class="l"><span>'+esc(p.name)+' × '+T.c[s]+'</span><span>'+inr(p.price*T.c[s])+'</span></div>';}).join('');
 m.innerHTML='<div class="vs-wrap"><div class="vs-crumbs"><a href="'+ROOT+'index.html">Home</a> / <a href="cart.html">Cart</a> / Checkout</div><h1 class="vs-h1">Checkout</h1><p class="vs-sub">Delivery details bharein aur payment method chunein</p>'+
 '<form id="cof" class="vs-cart" style="margin-top:1.5rem" novalidate><div>'+
 '<div class="vs-box"><h2>1. Delivery Details</h2><div class="vs-fg">'+
 '<div><label>Full name *</label><input class="vs-input" name="name" autocomplete="name" value="'+v('name')+'"></div>'+
 '<div><label>Mobile number *</label><input class="vs-input" name="phone" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="10-digit number" value="'+v('phone')+'"></div>'+
 '<div class="full"><label>Email (optional)</label><input class="vs-input" type="email" name="email" autocomplete="email" value="'+v('email')+'"></div>'+
 '<div class="full"><label>Full address *</label><textarea class="vs-input" name="address" rows="3" placeholder="House no., street, area, landmark">'+v('address')+'</textarea></div>'+
 '<div><label>City *</label><input class="vs-input" name="city" value="'+v('city')+'"></div>'+
 '<div><label>State *</label><input class="vs-input" name="state" value="'+v('state')+'"></div>'+
 '<div><label>Pincode *</label><input class="vs-input" name="pin" inputmode="numeric" maxlength="6" value="'+v('pin')+'"></div>'+
 '<div class="full"><label>Order note (optional)</label><input class="vs-input" name="note" placeholder="Delivery instructions, GST no., etc."></div>'+
 '</div></div>'+
 '<div class="vs-box"><h2>2. Payment Method</h2>'+
 '<label class="vs-pay on" data-pm="cod"><input type="radio" name="pm" value="cod" checked><div><b>💵 Cash on Delivery (COD)</b><small>Saaman milne par cash / UPI se payment karein</small></div></label>'+
 '<label class="vs-pay" data-pm="upi"><input type="radio" name="pm" value="upi"><div><b>📱 UPI (GPay / PhonePe / Paytm)</b><small>Abhi UPI se pay karein</small></div></label>'+
 '<div id="upibox" class="vs-upi" style="display:none"><div class="l"><span>Pay to UPI ID</span><b id="upiid">'+esc(STORE_UPI_ID)+'</b></div>'+
 '<a class="vs-btn gold" id="upiapp" href="#" style="margin:.6rem 0">Open UPI App &amp; Pay '+inr(T.total)+'</a>'+
 '<label>Payment ke baad UTR / Transaction ID daalein *</label><input class="vs-input" name="utr" inputmode="numeric" maxlength="22" placeholder="12-digit UTR number"></div>'+
 '</div></div>'+
 '<aside class="vs-sum"><h2>Order Summary</h2>'+sumRows+'<div class="l" style="border-top:1px solid var(--border);margin-top:.4rem"><span>Subtotal</span><span>'+inr(T.sub)+'</span></div>'+(T.disc?'<div class="l ok"><span>Coupon ('+T.coupon+')</span><span>− '+inr(T.disc)+'</span></div>':'')+'<div class="l"><span>Delivery</span><span>'+(T.ship?inr(T.ship):'<b class="ok">FREE</b>')+'</span></div><div class="l t"><span>Total</span><span>'+inr(T.total)+'</span></div>'+
 '<div id="cerr" class="vs-err" style="display:none"></div>'+
 '<button class="vs-btn primary lg" type="submit" id="pob" style="width:100%;margin-top:1rem">Place Order · '+inr(T.total)+'</button>'+
 '<a class="vs-btn ghost" href="cart.html" style="width:100%;margin-top:.5rem">← Back to cart</a></aside></form></div>';
 var f=document.getElementById('cof'),err=document.getElementById('cerr'),ub=document.getElementById('upibox');
 function pm(){return f.pm.value;}
 f.querySelectorAll('[data-pm]').forEach(function(l){l.addEventListener('click',function(){setTimeout(function(){f.querySelectorAll('[data-pm]').forEach(function(x){x.classList.toggle('on',x.querySelector('input').checked);});ub.style.display=pm()==='upi'?'block':'none';},0);});});
 document.getElementById('upiapp').onclick=function(e){e.preventDefault();
  var url='upi://pay?pa='+encodeURIComponent(STORE_UPI_ID)+'&pn='+encodeURIComponent(STORE_NAME)+'&am='+T.total+'&cu=INR&tn='+encodeURIComponent('Order payment');
  location.href=url;toast('UPI app khul raha hai…');};
 function fail(msg,el){err.textContent=msg;err.style.display='block';if(el){el.focus();el.classList.add('bad');setTimeout(function(){el.classList.remove('bad');},2500);}err.scrollIntoView({block:'nearest',behavior:'smooth'});}
 f.onsubmit=function(e){e.preventDefault();err.style.display='none';
  var d={name:f.name.value.trim(),phone:f.phone.value.trim(),email:f.email.value.trim(),address:f.address.value.trim(),city:f.city.value.trim(),state:f.state.value.trim(),pin:f.pin.value.trim()};
  if(d.name.length<2)return fail('Apna poora naam daalein.',f.name);
  if(!/^[6-9]\d{9}$/.test(d.phone))return fail('Sahi 10-digit mobile number daalein.',f.phone);
  if(d.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))return fail('Email sahi nahi hai.',f.email);
  if(d.address.length<8)return fail('Poora address daalein (house no., street, area).',f.address);
  if(!d.city)return fail('City daalein.',f.city);
  if(!d.state)return fail('State daalein.',f.state);
  if(!/^\d{6}$/.test(d.pin))return fail('Sahi 6-digit pincode daalein.',f.pin);
  var utr='';
  if(pm()==='upi'){utr=f.utr.value.trim();if(!/^\d{12,22}$/.test(utr))return fail('UPI payment ke baad 12-digit UTR / Transaction ID daalein.',f.utr);}
  var T2=calcTotals();if(!T2.items.length){location.href='cart.html';return;}
  var id='VX'+Date.now().toString().slice(-8)+Math.floor(Math.random()*90+10);
  var order={id:id,date:new Date().toISOString(),customer:d,note:f.note.value.trim(),
   items:T2.items.map(function(s){return {slug:s,name:BY[s].name,sku:BY[s].sku,qty:T2.c[s],price:BY[s].price};}),
   subtotal:T2.sub,discount:T2.disc,coupon:T2.coupon,shipping:T2.ship,total:T2.total,
   payment:pm()==='cod'?'Cash on Delivery':'UPI',utr:utr,
   status:pm()==='cod'?'Order Confirmed':'Confirmed – payment verification pending'};
  var all=load('vs_orders',[]);all.unshift(order);save('vs_orders',all);
  save('vs_last_addr',{name:d.name,phone:d.phone,email:d.email,address:d.address,city:d.city,state:d.state,pin:d.pin});
  save('vs_cart',{});save('vs_coupon','');updateBadges();
  renderSuccess(m,order);window.scrollTo(0,0);};
}

function renderSuccess(m,o){
 var rows=o.items.map(function(i){return '<div class="l"><span>'+esc(i.name)+' × '+i.qty+'</span><span>'+inr(i.price*i.qty)+'</span></div>';}).join('');
 var msg='*New Order '+o.id+'*%0A'+o.items.map(function(i){return i.name+' x'+i.qty;}).join('%0A')+'%0ATotal: '+inr(o.total)+'%0APayment: '+o.payment+(o.utr?' (UTR '+o.utr+')':'')+'%0A'+encodeURIComponent(o.customer.name+', '+o.customer.phone+', '+o.customer.address+', '+o.customer.city+' '+o.customer.pin);
 m.innerHTML='<div class="vs-wrap"><div class="vs-done"><div class="tick">✓</div><h1 class="vs-h1">Order Placed Successfully!</h1><p class="vs-sub">Dhanyavaad, '+esc(o.customer.name)+'! Aapka order receive ho gaya hai.</p>'+
 '<div class="vs-box" style="text-align:left;margin-top:1.5rem"><div class="l"><span>Order ID</span><b>'+o.id+'</b></div><div class="l"><span>Status</span><b class="ok">'+esc(o.status)+'</b></div><div class="l"><span>Payment</span><b>'+o.payment+(o.utr?' · UTR '+esc(o.utr):'')+'</b></div>'+
 '<div class="l"><span>Deliver to</span><span style="text-align:right;max-width:60%">'+esc(o.customer.address)+', '+esc(o.customer.city)+', '+esc(o.customer.state)+' – '+esc(o.customer.pin)+'<br>📞 '+esc(o.customer.phone)+'</span></div>'+
 '<div style="border-top:1px solid var(--border);margin:.6rem 0;padding-top:.6rem">'+rows+'</div>'+
 '<div class="l"><span>Delivery</span><span>'+(o.shipping?inr(o.shipping):'FREE')+'</span></div>'+(o.discount?'<div class="l ok"><span>Coupon ('+o.coupon+')</span><span>− '+inr(o.discount)+'</span></div>':'')+
 '<div class="l t" style="border-top:1px solid var(--border);margin-top:.4rem;padding-top:.6rem;font-weight:800;font-size:1.1rem"><span>'+(o.payment==='Cash on Delivery'?'Amount to pay on delivery':'Total paid via UPI')+'</span><span>'+inr(o.total)+'</span></div></div>'+
 '<div style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;margin-top:1.5rem">'+
 (STORE_WHATSAPP?'<a class="vs-btn gold lg" target="_blank" rel="noopener" href="https://wa.me/'+STORE_WHATSAPP+'?text='+msg+'">Send order on WhatsApp</a>':'')+
 '<button class="vs-btn ghost lg" onclick="window.print()">Print / Save receipt</button><a class="vs-btn primary lg" href="shop.html" style="flex:0 1 auto">Continue shopping</a></div></div></div>';}

function renderWish(m){
 function draw(){var w=wish().filter(function(s){return BY[s];});
  m.innerHTML='<div class="vs-wrap"><div class="vs-crumbs"><a href="'+ROOT+'index.html">Home</a> / Wishlist</div><h1 class="vs-h1">My Wishlist</h1><p class="vs-sub">'+w.length+' saved item'+(w.length===1?'':'s')+'</p><div style="margin-top:1.5rem">'+
  (w.length?'<div class="vs-grid">'+w.map(function(s){return card(BY[s]);}).join('')+'</div>':'<div class="vs-empty"><h2>Your wishlist is empty</h2><p>Tap the heart on any product to save it here.</p><p style="margin-top:1rem"><a class="vs-btn primary" href="shop.html">Browse products</a></p></div>')+'</div></div>';
  syncHearts();}
 window.__redrawWish=draw;draw();}

function renderAuth(m){
 var mode='in';
 function draw(){m.innerHTML='<div class="vs-wrap"><div class="vs-form" style="margin:2rem auto;background:var(--card);border:1px solid var(--border);border-radius:1.25rem;padding:2rem;box-shadow:var(--shadow-card)"><h1 class="vs-h1">'+(mode==='in'?'Sign in':'Create account')+'</h1><p class="vs-sub">'+(mode==='in'?'Welcome back to VANTREX SOLUTIONS':'Track orders and save wishlists')+'</p>'+
  '<div class="vs-chips" style="margin:1.25rem 0 .5rem"><span class="vs-chip'+(mode==='in'?' on':'')+'" data-m="in">Sign in</span><span class="vs-chip'+(mode==='up'?' on':'')+'" data-m="up">Create account</span></div>'+
  '<form id="af">'+(mode==='up'?'<label>Full name</label><input class="vs-input" required name="n">':'')+'<label>Email</label><input class="vs-input" type="email" required name="e"><label>Password</label><input class="vs-input" type="password" required minlength="6" name="p">'+
  '<button class="vs-btn primary lg" style="width:100%;margin-top:1.25rem" type="submit">'+(mode==='in'?'Sign in':'Create account')+'</button></form></div></div>';
  m.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){mode=b.getAttribute('data-m');draw();};});
  document.getElementById('af').onsubmit=function(e){e.preventDefault();save('vs_user',{email:this.e.value});toast(mode==='in'?'Signed in ✓':'Account created ✓');setTimeout(function(){location.href=ROOT+'index.html';},900);};}
 draw();}

/* global delegation */
document.addEventListener('click',function(e){
 var t=e.target;
 var add=t.closest('[data-add]');if(add){e.preventDefault();addToCart(add.getAttribute('data-add'));return;}
 var w=t.closest('[data-wish]');if(w){e.preventDefault();toggleWish(w.getAttribute('data-wish'));if(window.__redrawWish&&document.querySelector('main[data-page="wishlist"]'))window.__redrawWish();return;}
 var b=t.closest('button');
 if(b&&/^Add to Cart$/i.test((b.textContent||'').trim())&&!b.hasAttribute('data-add')){var s=slugOf(b);if(s){e.preventDefault();addToCart(s);return;}}
 if(b&&/^Save .* to wishlist$/.test(b.getAttribute('aria-label')||'')){var s2=slugOf(b);if(s2){e.preventDefault();toggleWish(s2);return;}}
 if(b&&b.getAttribute('aria-label')==='Open menu'){e.preventDefault();openMenu();return;}
});
function openMenu(){var d=document.querySelector('.vs-drawer');if(!d){d=document.createElement('div');d.className='vs-drawer';d.innerHTML='<div class="bg"></div><nav><a href="'+ROOT+'index.html">Home</a><a href="'+ROOT+'pages/shop.html">All Products</a>'+CATS.filter(function(c){return P.some(function(p){return p.cat===c[0];});}).map(function(c){return '<a href="'+ROOT+'pages/shop.html?cat='+c[0]+'">'+c[1]+'</a>';}).join('')+'<a href="'+ROOT+'pages/shop.html?deals=1">🔥 Offers &amp; Deals</a><a href="'+ROOT+'pages/wishlist.html">Wishlist</a><a href="'+ROOT+'pages/cart.html">Cart</a><a href="'+ROOT+'pages/auth.html">Sign in / Register</a></nav>';document.body.appendChild(d);d.querySelector('.bg').onclick=function(){d.classList.remove('open');};}d.classList.add('open');}

/* search forms */
document.addEventListener('submit',function(e){var f=e.target;if(f.getAttribute('role')==='search'){e.preventDefault();var i=f.querySelector('input');location.href=ROOT+'pages/shop.html?q='+encodeURIComponent(i?i.value.trim():'');}});

/* nav + footer link mapping by text */
function fixLinks(){
 var map={'building materials':'building-materials','hardware & tools':'hardware-tools','electrical':'electrical','plumbing':'plumbing','safety':'safety','industrial':'industrial'};
 document.querySelectorAll('a[href$="shop.html"]').forEach(function(a){
  var t=a.textContent.replace(/\s+/g,' ').trim().toLowerCase().replace('&amp;','&');
  var base=a.getAttribute('href');
  if(map[t])a.setAttribute('href',base+'?cat='+map[t]);
  else if(t.indexOf('offers')>-1)a.setAttribute('href',base+'?deals=1');});
 document.querySelectorAll('a[href*="#categories"]').forEach(function(a){});
}


/* scroll-reveal fix: .reveal blocks ko visible karta hai */
function initReveal(){
 var els=[].slice.call(document.querySelectorAll('.reveal[data-visible="false"]'));if(!els.length)return;
 function show(e){e.setAttribute('data-visible','true');}
 if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:0.05});
  els.forEach(function(e){io.observe(e);});
 }else els.forEach(show);
 setTimeout(function(){document.querySelectorAll('.reveal[data-visible="false"]').forEach(show);},2500);
}
function initFaq(){document.querySelectorAll('.vs-faq-q').forEach(function(b){b.onclick=function(){var it=b.parentNode,on=it.classList.toggle('open');b.setAttribute('aria-expanded',on);};});}

function init(){
 fixLinks();updateBadges();syncHearts();initReveal();initFaq();
 var m=document.querySelector('main[data-page]');if(!m)return;
 var pg=m.getAttribute('data-page');
 if(pg==='shop')renderShop(m);else if(pg==='product')renderProduct(m);else if(pg==='cart')renderCart(m);else if(pg==='wishlist')renderWish(m);else if(pg==='auth')renderAuth(m);
 fixLinks();updateBadges();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
