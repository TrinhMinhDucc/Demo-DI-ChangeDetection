import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Product } from "../products/models/product.model";
import { LoggerService } from "./logger.service";

@Injectable()

export class ProductService {
    private apiUrl = "https://localhost:7170/api/product";

    constructor(private http: HttpClient, private loggerService : LoggerService) { }

    //Get All 
    getProducts(): Observable<Product[]> {
        this.loggerService.log('ProductService Constructed')
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map((data) => data.map((item) => new Product(item)))
        );
    }

    //GetbyId
    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            map((item) => new Product(item))
        );
    }

    //createProuduct
    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    //updateProduct
    updateProduct(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${product.pId}`, product);
    }
    
    //deletePeoduct
    deleteProduct(productId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${productId}`);
    }
    
    //search
    searchProducts(searchText: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/search?q=${searchText}`);
    }

    //TestUpload
    uploads(product: Product, image: File): Observable<Product> { 
        const formData = new FormData(); 
        formData.append('pId', product.pId); 
        formData.append('name', product.name); 
        formData.append('description', product.description); 
        formData.append('price', product.price.toString()); 
        formData.append('category', product.category); 
        formData.append('image', image);
        
        return this.http.post<Product>(`${this.apiUrl}/upload`, formData)
    }
}