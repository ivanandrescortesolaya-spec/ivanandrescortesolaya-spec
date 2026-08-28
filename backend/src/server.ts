import express,{Request,Response} from "express";
import cors from "cors";
import {z} from "zod";
import {categories,products,users,carts,orders,nextId} from "./store.js";

const app=express(); const PORT=Number(process.env.PORT)||3001;
app.use(cors()); app.use(express.json());

const productSchema=z.object({name:z.string().min(2),description:z.string().min(2),price:z.number().positive(),stock:z.number().int().nonnegative(),categoryId:z.number().int().positive(),image:z.string().optional()});
const userSchema=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(6)});

app.get("/api/health",(_,res)=>res.json({ok:true,message:"API de tienda virtual funcionando"}));
app.get("/api/categories",(_,res)=>res.json(categories));
app.get("/api/products",(req,res)=>{
 const q=String(req.query.q||"").toLowerCase(), category=req.query.categoryId?Number(req.query.categoryId):undefined;
 const result=products.filter(p=>p.active&&(!q||p.name.toLowerCase().includes(q)||p.description.toLowerCase().includes(q))&&(!category||p.categoryId===category));
 res.json(result);
});
app.get("/api/products/:id",(req,res)=>{const p=products.find(x=>x.id===Number(req.params.id)&&x.active);p?res.json(p):res.status(404).json({message:"Producto no encontrado"});});
app.post("/api/products",(req,res)=>{const parsed=productSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Datos inválidos",errors:parsed.error.flatten()});const p={id:nextId(products),...parsed.data,image:parsed.data.image||"",active:true};products.push(p);res.status(201).json(p);});
app.put("/api/products/:id",(req,res)=>{const i=products.findIndex(x=>x.id===Number(req.params.id));if(i<0)return res.status(404).json({message:"Producto no encontrado"});const parsed=productSchema.partial().safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Datos inválidos"});products[i]={...products[i],...parsed.data};res.json(products[i]);});
app.delete("/api/products/:id",(req,res)=>{const p=products.find(x=>x.id===Number(req.params.id));if(!p)return res.status(404).json({message:"Producto no encontrado"});p.active=false;res.status(204).send();});

app.post("/api/users",(req,res)=>{const parsed=userSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Datos inválidos"});if(users.some(u=>u.email===parsed.data.email))return res.status(409).json({message:"El correo ya está registrado"});const u={id:nextId(users),...parsed.data};users.push(u);const {password,...safe}=u;res.status(201).json(safe);});
app.post("/api/auth/login",(req,res)=>{const {email,password}=req.body||{};const u=users.find(x=>x.email===email&&x.password===password);if(!u)return res.status(401).json({message:"Credenciales inválidas"});const {password:_,...safe}=u;res.json({user:safe,token:`demo-token-${u.id}`});});

function getCart(userId:number){return carts.get(userId)||[]}
app.get("/api/cart/:userId",(req,res)=>{const userId=Number(req.params.userId);const items=getCart(userId).map(i=>{const p=products.find(x=>x.id===i.productId);return p?{...i,product:p,subtotal:p.price*i.quantity}:null}).filter(Boolean);res.json(items);});
app.post("/api/cart/:userId",(req,res)=>{const userId=Number(req.params.userId);const productId=Number(req.body?.productId),quantity=Number(req.body?.quantity);const p=products.find(x=>x.id===productId&&x.active);if(!p||!Number.isInteger(quantity)||quantity<1)return res.status(400).json({message:"Producto o cantidad inválida"});const cart=getCart(userId),item=cart.find(x=>x.productId===productId);const newQty=(item?.quantity||0)+quantity;if(newQty>p.stock)return res.status(409).json({message:"Stock insuficiente"});if(item)item.quantity=newQty;else cart.push({productId,quantity});carts.set(userId,cart);res.status(201).json(cart);});
app.put("/api/cart/:userId/:productId",(req,res)=>{const cart=getCart(Number(req.params.userId)),item=cart.find(x=>x.productId===Number(req.params.productId)),quantity=Number(req.body?.quantity);if(!item||!Number.isInteger(quantity)||quantity<1)return res.status(400).json({message:"Cantidad inválida"});const p=products.find(x=>x.id===item.productId);if(!p||quantity>p.stock)return res.status(409).json({message:"Stock insuficiente"});item.quantity=quantity;carts.set(Number(req.params.userId),cart);res.json(cart);});
app.delete("/api/cart/:userId/:productId",(req,res)=>{const userId=Number(req.params.userId),cart=getCart(userId).filter(x=>x.productId!==Number(req.params.productId));carts.set(userId,cart);res.status(204).send();});

app.post("/api/orders/:userId",(req,res)=>{const userId=Number(req.params.userId),cart=getCart(userId);if(!cart.length)return res.status(400).json({message:"El carrito está vacío"});const items=[];for(const ci of cart){const p=products.find(x=>x.id===ci.productId);if(!p||ci.quantity>p.stock)return res.status(409).json({message:`Stock insuficiente para ${p?.name||"producto"}`});items.push({productId:p.id,name:p.name,price:p.price,quantity:ci.quantity});}
const total=items.reduce((s,i)=>s+i.price*i.quantity,0);items.forEach(i=>{products.find(p=>p.id===i.productId)!.stock-=i.quantity});const order={id:nextId(orders),userId,items,total,status:"pending" as const,createdAt:new Date().toISOString()};orders.push(order);carts.set(userId,[]);res.status(201).json(order);});
app.get("/api/orders/:userId",(req,res)=>res.json(orders.filter(o=>o.userId===Number(req.params.userId))));
app.get("/api/orders",(req,res)=>res.json(orders));
app.patch("/api/orders/:id/status",(req,res)=>{const o=orders.find(x=>x.id===Number(req.params.id));const status=req.body?.status;if(!o||!["pending","paid","shipped","delivered","cancelled"].includes(status))return res.status(400).json({message:"Pedido o estado inválido"});o.status=status;res.json(o);});

app.use((_,res)=>res.status(404).json({message:"Ruta no encontrada"}));
app.listen(PORT,()=>console.log(`Servidor corriendo en http://localhost:${PORT}`));
