import {useEffect,useMemo,useState} from "react";
import {api,Category,CartItem,Order,Product,User} from "./api";

const money=(n:number)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);

export default function App(){
 const [products,setProducts]=useState<Product[]>([]),[categories,setCategories]=useState<Category[]>([]);
 const [cart,setCart]=useState<CartItem[]>([]),[user,setUser]=useState<User|null>(null);
 const [search,setSearch]=useState(""),[category,setCategory]=useState(""),[loading,setLoading]=useState(true);
 const [showCart,setShowCart]=useState(false),[showLogin,setShowLogin]=useState(false),[showRegister,setShowRegister]=useState(false);
 const [orders,setOrders]=useState<Order[]>([]),[showOrders,setShowOrders]=useState(false),[error,setError]=useState("");

 async function loadProducts(){try{setLoading(true);const r=await api.get("/products",{params:{q:search||undefined,categoryId:category||undefined}});setProducts(r.data)}catch{setError("No se pudo conectar con el backend.")}finally{setLoading(false)}}
 async function loadCategories(){try{setCategories((await api.get("/categories")).data)}catch{}}
 async function loadCart(id:number){try{setCart((await api.get("/cart/"+id)).data)}catch{}}
 useEffect(()=>{loadCategories()},[]);
 useEffect(()=>{loadProducts()},[search,category]);
 useEffect(()=>{const raw=localStorage.getItem("tienda_user");if(raw){const u=JSON.parse(raw);setUser(u);loadCart(u.id)}},[]);

 const total=useMemo(()=>cart.reduce((s,i)=>s+i.subtotal,0),[cart]),count=useMemo(()=>cart.reduce((s,i)=>s+i.quantity,0),[cart]);
 async function add(p:Product){if(!user){setShowLogin(true);return}try{await api.post("/cart/"+user.id,{productId:p.id,quantity:1});await loadCart(user.id)}catch(e:any){setError(e?.response?.data?.message||"No se pudo agregar al carrito.")}}
 async function remove(p:number){if(!user)return;await api.delete("/cart/"+user.id+"/"+p);await loadCart(user.id)}
 async function change(p:number,q:number){if(!user)return;if(q<1)return remove(p);try{await api.put("/cart/"+user.id+"/"+p,{quantity:q});await loadCart(user.id)}catch(e:any){setError(e?.response?.data?.message||"Stock insuficiente.")}}
 async function checkout(){if(!user)return;try{await api.post("/orders/"+user.id);await loadCart(user.id);setShowCart(false);setError("");alert("¡Pedido creado correctamente!");}catch(e:any){setError(e?.response?.data?.message||"No se pudo crear el pedido.")}}
 async function loadOrders(){if(!user)return;setOrders((await api.get("/orders/"+user.id)).data);setShowOrders(true)}
 function login(u:User){setUser(u);localStorage.setItem("tienda_user",JSON.stringify(u));loadCart(u.id);setShowLogin(false)}
 function logout(){setUser(null);setCart([]);localStorage.removeItem("tienda_user")}
 return <div className="app">
  <header><div className="nav"><div className="brand">🛍️ <span>Tienda<span className="accent">Virtual</span></span></div>
   <nav><a href="#inicio">Inicio</a><a href="#catalogo">Catálogo</a>{user&&<button className="link" onClick={loadOrders}>Mis pedidos</button>}</nav>
   <div className="actions">{user?<><span className="welcome">Hola, {user.name.split(" ")[0]}</span><button className="outline" onClick={logout}>Salir</button></>:<button className="outline" onClick={()=>setShowLogin(true)}>Iniciar sesión</button>}<button className="cartBtn" onClick={()=>setShowCart(true)}>🛒 <b>{count}</b></button></div>
  </div></header>
  <main id="inicio">
   <section className="hero"><div><span className="pill">NUEVA COLECCIÓN</span><h1>Compra lo que necesitas.<br/><span className="accent">Fácil y rápido.</span></h1><p>Explora nuestro catálogo, agrega tus productos al carrito y realiza tu pedido en pocos pasos.</p><a href="#catalogo" className="primary">Ver productos ↓</a></div><div className="heroCard"><span>🔥</span><h3>Ofertas destacadas</h3><p>Productos seleccionados para ti.</p><strong>Envíos disponibles</strong></div></section>
   <section id="catalogo" className="catalog"><div className="sectionHead"><div><p className="eyebrow">NUESTRO CATÁLOGO</p><h2>Encuentra tus favoritos</h2></div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos..." /></div></div>
    <div className="filters"><button className={!category?"active":""} onClick={()=>setCategory("")}>Todos</button>{categories.map(c=><button key={c.id} className={category===String(c.id)?"active":""} onClick={()=>setCategory(String(c.id))}>{c.name}</button>)}</div>
    {error&&<div className="error">{error}<button onClick={()=>setError("")}>×</button></div>}
    {loading?<div className="empty">Cargando productos...</div>:products.length===0?<div className="empty">No encontramos productos.</div>:<div className="grid">{products.map(p=><article className="card" key={p.id}><div className="productImage">{p.image?<img src={p.image} alt={p.name}/>:<span>{p.categoryId===1?"💻":p.categoryId===2?"🏠":"🎧"}</span>}</div><div className="cardBody"><small>{categories.find(c=>c.id===p.categoryId)?.name||"Producto"}</small><h3>{p.name}</h3><p>{p.description}</p><div className="cardFoot"><strong>{money(p.price)}</strong><button onClick={()=>add(p)} disabled={p.stock===0}>{p.stock===0?"Agotado":"+ Carrito"}</button></div></div></article>)}</div>}
   </section>
  </main>
  <footer><strong>🛍️ TiendaVirtual</strong><span>Backend + Frontend funcional</span></footer>
  {showCart&&<div className="overlay" onClick={()=>setShowCart(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawerHead"><h2>Tu carrito</h2><button onClick={()=>setShowCart(false)}>×</button></div>{!user?<div className="empty">Inicia sesión para usar tu carrito.</div>:cart.length===0?<div className="empty">Tu carrito está vacío.</div>:<><div className="cartItems">{cart.map(i=><div className="cartItem" key={i.productId}><div><b>{i.product.name}</b><small>{money(i.product.price)}</small></div><div className="qty"><button onClick={()=>change(i.productId,i.quantity-1)}>−</button><span>{i.quantity}</span><button onClick={()=>change(i.productId,i.quantity+1)}>+</button></div><strong>{money(i.subtotal)}</strong><button className="remove" onClick={()=>remove(i.productId)}>×</button></div>)}</div><div className="checkout"><div><span>Total</span><strong>{money(total)}</strong></div><button className="primary wide" onClick={checkout}>Realizar pedido</button></div></>}</aside></div>}
  {showLogin&&<Login onLogin={login} onClose={()=>setShowLogin(false)} onRegister={()=>{setShowLogin(false);setShowRegister(true)}}/>}
  {showRegister&&<Register onLogin={login} onClose={()=>setShowRegister(false)}/>}
  {showOrders&&<div className="overlay" onClick={()=>setShowOrders(false)}><aside className="modal" onClick={e=>e.stopPropagation()}><div className="drawerHead"><h2>Mis pedidos</h2><button onClick={()=>setShowOrders(false)}>×</button></div>{orders.length===0?<div className="empty">Todavía no tienes pedidos.</div>:orders.map(o=><div className="order" key={o.id}><div><b>Pedido #{o.id}</b><small>{new Date(o.createdAt).toLocaleString("es-CO")}</small></div><span className={"status "+o.status}>{o.status}</span><strong>{money(o.total)}</strong></div>)}</aside></div>}
 </div>
}

function Login({onLogin,onClose,onRegister}:{onLogin:(u:User)=>void;onClose:()=>void;onRegister:()=>void}){const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[err,setErr]=useState("");return <div className="overlay"><div className="auth" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button><h2>Bienvenido</h2><p>Inicia sesión para comprar.</p>{err&&<div className="error">{err}</div>}<input placeholder="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary wide" onClick={async()=>{try{const r=await api.post("/auth/login",{email,password});onLogin(r.data.user)}catch(e:any){setErr(e?.response?.data?.message||"Error al iniciar sesión")}}}>Iniciar sesión</button><button className="textBtn" onClick={onRegister}>Crear una cuenta</button></div></div>}
function Register({onLogin,onClose}:{onLogin:(u:User)=>void;onClose:()=>void}){const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[err,setErr]=useState("");return <div className="overlay"><div className="auth" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button><h2>Crear cuenta</h2><p>Regístrate para empezar a comprar.</p>{err&&<div className="error">{err}</div>}<input placeholder="Nombre completo" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Contraseña (mínimo 6)" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary wide" onClick={async()=>{try{const r=await api.post("/users",{name,email,password});onLogin({...r.data})}catch(e:any){setErr(e?.response?.data?.message||"No se pudo crear la cuenta")}}}>Registrarme</button></div></div>}
