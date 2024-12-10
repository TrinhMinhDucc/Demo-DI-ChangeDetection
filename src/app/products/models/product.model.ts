import { IProduct } from "../interfaces/product.interface";

export class Product implements IProduct {
    pId: string = '';
    name: string = '';
    description: string = '';
    price: number = 0;
    imageUrl: string = '';
    category: string = '';

    constructor(init?: Partial<Product>) {
        Object.assign(this, init);
    }
}

