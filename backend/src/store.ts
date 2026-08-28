import {Category,Product,User,CartItem,Order} from "./types.js";
export const categories:Category[]=[
{id:1,name:"Tecnología"},{id:2,name:"Hogar"},{id:3,name:"Accesorios"}
];
export const products:Product[]=[
{id:1,name:"Audífonos Bluetooth",description:"Audífonos inalámbricos con micrófono.",price:89900,stock:20,categoryId:1,image:"",active:true},
{id:2,name:"Teclado mecánico",description:"Teclado mecánico compacto para escritorio.",price:159900,stock:12,categoryId:1,image:"",active:true},
{id:3,name:"Mouse inalámbrico",description:"Mouse ergonómico de conexión inalámbrica.",price:69900,stock:30,categoryId:1,image:"",active:true},
{id:4,name:"Lámpara LED",description:"Lámpara de escritorio con brillo regulable.",price:54900,stock:15,categoryId:2,image:"",active:true}
];
export const users:User[]=[];
export const carts=new Map<number,CartItem[]>();
export const orders:Order[]=[];
export function nextId(list:{id:number}[]){return list.length?Math.max(...list.map(x=>x.id))+1:1}
