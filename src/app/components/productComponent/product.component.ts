import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../products/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FocusTrapModule } from 'primeng/focustrap';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IProduct } from '../../products/interfaces/product.interface';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    FocusTrapModule,
    DialogModule,
    DataViewModule,
    TableModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [
    ProductService,
    MessageService,
    ConfirmationService,
  ],
  schemas:  [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit{
  products: Product[] = [];

  globalFilter: string | undefined;

  searchValue: string = '';

  editingProduct: Product = { 
    pId: '', name: '', description: '', price: 0, imageUrl: '', category: '' 
  };

  createDialogVisible: boolean = false;

  editDialogVisible: boolean = false;

  selectedFile: File | null = null;

  newProduct : IProduct = {
    pId: '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: ''
  };
  searchTerms: any;
  constructor(
    private productService: ProductService,
    private cdr : ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService : ConfirmationService,
  ){};

  formValid = false;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(){
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Loaded Products', this.products)
        this.cdr.markForCheck();//ChangeDetectorRef
      },
      error : (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

  confirmDeleteProduct(id:string):void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>{
        this.deleteProduct(id);
      },
      reject: ()=>{
        this.messageService.add({
          severity: 'info', summary: 'Cancelled', detail: 'You have cancelled the delection'
        });
      }
    });
  }

  deleteProduct(id : string):void{
    this.productService.deleteProduct(id).subscribe({
      next: () =>{
        this.loadProduct();
        this.messageService.add({
          severity: 'success', summary : 'Success', detail: 'Product deleted sucessfully'
        });
      },
      error: (err) =>{
        this.messageService.add({
          severity: 'error', summary : 'Error', detail: 'Error deleting product'
        });
        console.log('Error deleting product', err);
      }
    });
  }

  openEditDialog(product: Product): void { 
    this.editingProduct = { ...product }; 
    this.editDialogVisible = true; // Show edit dialog 
    }
     
  closeEditDialog(): void { 
    this.editDialogVisible = false; // Close edit dialog 
  }

  editProduct(product:Product):void {
    this.editingProduct = { ...product };
  }
  updateProduct() : void{
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct).subscribe({
        next: () => {
          this.loadProduct(); // Reload products after update
          this.closeEditDialog();
          this.messageService.add({
            severity: 'success', summary : 'Success', detail: 'Product updated sucessfully'
          });
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error updating product'});
          console.error('Error updating product:', err);
        }
      });
    }
  }

  // cancelEdit(): void {
  //   this.editingProduct = null; // Reset editing state
  // }

  createProduct() : void{
    this.productService.createProduct(this.newProduct).subscribe({
      next: (product) =>{
        console.log('Product created:', product);
        this.products.push(product);
        this.closeCreateDialog();
        this.resetForm();
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'success', summary: 'Success', detail: 'Product created successfully'
        });
      },
      error : (err) =>{
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'Error creating product'
        });
        console.error("Erorr creating", err);
      }
    });
  }
  
  resetForm(): void{
    this.newProduct = {
    pId: '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: ''
    };
    this.formValid = false;
  }

  openCreateDialog(): void {
    console.log('Opening create dialog');
    this.createDialogVisible = true; // Show the dialog
  };

  closeCreateDialog(): void {
    this.createDialogVisible = false; // Close the dialog
  };

  checkUniqueId(): void { 
    const existingProduct = this.products.find(
      product => product.pId === this.newProduct.pId
    ); 
    if (existingProduct) { this.messageService.add({ 
      severity: 'error', summary: 'Error', detail: 'ID already exists' }); 
      this.formValid = false; 
    } else { 
      this.validateForm(); 
    } 
  }

  validateForm(): void { 
    const { pId, name, description, price, category, imageUrl } = this.newProduct; 
    this.formValid = pId.trim() !== '' 
    && name.trim() !== '' 
    && description.trim() !== '' 
    && price > 0 && category.trim() !== '' 
    && imageUrl.trim() !== ''; 
  }

  searchProducts(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.trim().toLowerCase();
    if (filterValue) {
      this.productService.searchProducts(filterValue).subscribe({
        next: (data) => {
          const filteredProducts = data;
          const remainingProducts = this.products.filter(
            product => !filteredProducts.some(
              fp => fp.pId === product.pId
            ));
          this.products = [...filteredProducts, ...remainingProducts];
          this.cdr.detectChanges();//ChangeDetectorRef
        },
        error: (error) => console.error("Error searching products: ", error),
      });
    } else {
      this.loadProduct();
    }
  }

  onFileSelected(event: Event): void { 
    const input = event.target as HTMLInputElement; 
    if (input.files && input.files.length) { 
      this.selectedFile = input.files[0]; 
    } else{
      this.selectedFile = null;
    }
    this.validateForms();
  }

  validateForms() : void{
    const { pId, name, description, price, category, imageUrl } = this.newProduct; 
    this.formValid = pId.trim() !== '' 
    && name.trim() !== '' 
    && description.trim() !== '' 
    && price > 0 && category.trim() !== '' 
    this.selectedFile !== null; 

    if(!this.formValid){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'All fields are required' });
    }
  }

  uplodadProduct():void{
    if (this.selectedFile != null){
      this.productService.uploads(this.newProduct, this.selectedFile).subscribe({
        next: (product) =>{
          console.log('Product created:', product);
          this.products.push(product);
          this.closeCreateDialog();
          this.resetForm();
          this.cdr.detectChanges();
          this.messageService.add({
            severity: 'success', summary: 'Success', detail: 'Product created successfully'
          });
        },
        error : (err) =>{
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'Error creating product'
          });
          console.error("Erorr creating", err);
        }
      });
    }else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an image to upload' });
    }
  }
}
