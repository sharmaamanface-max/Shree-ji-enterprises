const cfg=window.STORE_CONFIG||{};
const configured=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("PASTE_")&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
const sb=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
let products=[],cart={};
const $=id=>document.getElementById(id);
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN")}
function wa(text){if(!cfg.WHATSAPP_NUMBER){alert("WhatsApp number is not configured yet. Add it in config.js.");return}window.open("https://wa.me/"+cfg.WHATSAPP_NUMBER.replace(/\D/g,"")+"?text="+encodeURIComponent(text),"_blank","noopener")}
function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function loadProducts(){
 if(!sb){products=demoProducts;render();$("count").textContent="Demo catalogue";return}
 const {data,error}=await sb.from("products").select("*").eq("active",true).order("created_at",{ascending:false});
 if(error){$("products").innerHTML='<p class="muted">Catalogue could not load. Check Supabase setup.</p>';console.error(error);return}
 products=data||[];render()
}
function render(){
 const q=$("search").value.toLowerCase(),cat=$("category").value;
 const rows=products.filter(p=>(!cat||p.category===cat)&&(`${p.name} ${p.description||""}`).toLowerCase().includes(q));
 $("count").textContent=rows.length+" items";
 const cats=[...new Set(products.map(p=>p.category).filter(Boolean))],select=$("category"),current=select.value;
 select.innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
 select.value=current;
 $("products").innerHTML=rows.length?rows.map(p=>`<article class="product"><div class="product-img">${p.image_url?`<img loading="lazy" src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}">`:`<span class="emoji">${escapeHTML(p.emoji||"📚")}</span>`}</div><div class="product-name">${escapeHTML(p.name)}</div><div class="product-desc">${escapeHTML(p.description||"Fancy stationery wholesale")}</div><div class="price">${money(p.price)} <small>/ ${escapeHTML(p.unit||"unit")}</small></div><div class="qtyrow"><label for="qty-${p.id}">Qty</label><input id="qty-${p.id}" type="number" min="1" max="${Math.max(1,Number(p.stock||9999))}" value="1" ${Number(p.stock)<=0?"disabled":""}>${Number(p.stock)<=0?'<small>Out of stock</small>':`<small>${Number(p.stock)} in stock</small>`}</div><button class="buy" ${Number(p.stock)<=0?"disabled":""} onclick="addCart('${String(p.id).replace(/'/g,"\\'")}')">ADD TO CART</button></article>`).join(""):'<p class="muted">No products found.</p>';
 updateCartCount()
}
function addCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;const qty=Math.max(1,parseInt($("qty-"+id)?.value||"1",10));if(qty>Number(p.stock)){alert("Quantity exceeds available stock.");return}cart[id]=(cart[id]||0)+qty;if(cart[id]>Number(p.stock)){cart[id]=Number(p.stock);alert("Cart quantity adjusted to available stock.")}updateCartCount()}
function updateCartCount(){$("cartCount").textContent=Object.values(cart).reduce((a,b)=>a+b,0)}
function showCart(){$("cartPanel").classList.remove("hidden");drawCart()}
function drawCart(){let entries=Object.entries(cart).map(([id,qty])=>({p:products.find(p=>String(p.id)===id),qty})).filter(x=>x.p);$("cartItems").innerHTML=entries.length?entries.map(({p,qty})=>`<div class="cart-line"><span>${escapeHTML(p.name)}<br><b>${money(p.price*qty)}</b> <small>(${money(p.price)} × ${qty})</small></span><span>Qty ${qty}</span><button onclick="removeCart('${String(p.id).replace(/'/g,"\\'")}')">Remove</button></div>`).join(""):'<p class="muted">Your cart is empty. Add products first.</p>';$("cartTotal").textContent=entries.reduce((a,x)=>a+x.qty,0)}
function removeCart(id){delete cart[id];updateCartCount();drawCart()}
$("search").addEventListener("input",render);$("category").addEventListener("change",render);$("cartOpen").addEventListener("click",showCart);$("cartClose").addEventListener("click",()=>$("cartPanel").classList.add("hidden"));$("headWa").addEventListener("click",e=>{e.preventDefault();wa("Hello Shree Ji Enterprises, I have a wholesale enquiry.")});$("contactWa").addEventListener("click",e=>{e.preventDefault();wa("Hello Shree Ji Enterprises, I have a wholesale enquiry.")});
$("orderForm").addEventListener("submit",async e=>{e.preventDefault();const entries=Object.entries(cart).map(([id,qty])=>({p:products.find(p=>String(p.id)===id),qty})).filter(x=>x.p);if(!entries.length){alert("Please add products to cart.");return}const name=$("buyerName").value.trim(),phone=$("buyerPhone").value.trim(),note=$("buyerNote").value.trim();const order={customer_name:name,phone,notes:note,items:entries.map(({p,qty})=>({product_id:p.id,name:p.name,quantity:qty,unit_price:p.price})),total:entries.reduce((a,x)=>a+x.p.price*x.qty,0),status:"new"};if(sb){const {error}=await sb.from("orders").insert({customer_name:name,phone,notes:note,items:order.items,total:order.total,status:"new"});if(error){alert("Order could not be saved to the store. WhatsApp can still be used.");console.error(error)}}const msg=`Wholesale order — Shree Ji Enterprises\nName/shop: ${name}\nPhone: ${phone||"Not provided"}\n${entries.map(({p,qty})=>`${p.name} × ${qty} = ${money(p.price*qty)}`).join("\n")}\nTotal estimate: ${money(order.total)}\nNotes: ${note||"None"}\nPlease confirm stock and final wholesale pricing.`;wa(msg)});
const demoProducts=[
{id:"d1",name:"Pencil Box",category:"Pencil Boxes",price:85,unit:"each (sample)",stock:50,emoji:"🖍️",description:"Cute and colourful pencil boxes"},
{id:"d2",name:"Pencil Pouch",category:"Pencil Boxes",price:75,unit:"each (sample)",stock:45,emoji:"✏️",description:"Fancy zip pouches"},
{id:"d3",name:"Fountain Pen",category:"Pens & Writing",price:120,unit:"each (sample)",stock:35,emoji:"🖋️",description:"Stylish writing pens"},
{id:"d4",name:"LCD Writing Tablet",category:"School Stationery",price:165,unit:"each (sample)",stock:20,emoji:"📟",description:"Reusable writing tablet"},
{id:"d5",name:"Fancy Pencil",category:"Pens & Writing",price:65,unit:"pack (sample)",stock:100,emoji:"✏️",description:"Cartoon and novelty pencils"},
{id:"d6",name:"Premium Pen Set",category:"Pens & Writing",price:90,unit:"pack (sample)",stock:40,emoji:"🖊️",description:"Pens for everyday writing"},
{id:"d7",name:"Novelty Eraser",category:"School Stationery",price:25,unit:"pack (sample)",stock:100,emoji:"🧼",description:"Cute erasers in assorted designs"},
{id:"d8",name:"Office Diary",category:"Diaries & Accessories",price:110,unit:"each (sample)",stock:25,emoji:"📔",description:"Classic office diary"},
{id:"d9",name:"Fancy Diary",category:"Diaries & Accessories",price:130,unit:"each (sample)",stock:30,emoji:"📒",description:"Cute diaries and notebooks"},
{id:"d10",name:"Keychain",category:"Diaries & Accessories",price:30,unit:"each (sample)",stock:80,emoji:"🔑",description:"Giftable keychains"},
{id:"d11",name:"Colour Set",category:"Art & Colours",price:90,unit:"set (sample)",stock:30,emoji:"🎨",description:"Colouring supplies"},
{id:"d12",name:"Paint Brush Set",category:"Art & Colours",price:60,unit:"set (sample)",stock:25,emoji:"🖌️",description:"Brushes for art and craft"}
];
loadProducts();