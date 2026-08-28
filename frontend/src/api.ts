import axios from "axios";
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://localhost:3001/api",headers:{"Content-Type":"application/json"}});
export type Product={id:number;name:string;description:string;price:number;stock:number;categoryId:number;image:string;active:boolean};
export type Category={id:number;name:string};
export type CartItem={productId:number;quantity:number;product:Product;subtotal:number};
export type Order={id:number;userId:number;items:{productId:number;name:string;price:number;quantity:number}[];total:number;status:string;createdAt:string};
export type User={id:number;name:string;email:string};
