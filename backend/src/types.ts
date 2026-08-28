export type Category={id:number;name:string};
export type Product={id:number;name:string;description:string;price:number;stock:number;categoryId:number;image:string;active:boolean};
export type User={id:number;name:string;email:string;password:string};
export type CartItem={productId:number;quantity:number};
export type OrderItem={productId:number;name:string;price:number;quantity:number};
export type Order={id:number;userId:number;items:OrderItem[];total:number;status:"pending"|"paid"|"shipped"|"delivered"|"cancelled";createdAt:string};
