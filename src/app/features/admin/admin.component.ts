import { Component, inject, signal, computed, OnInit, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {
    effect(async () => {
      if (this.authService.isAuthenticated()) {
        try {
          this.isLoading.set(true);
          await this.productService.getProducts();
        } catch (e) {
          console.error('Error al cargar panel de administración', e);
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }

  // Active products list from service
  products = this.productService.products;

  // Reactively calculate metrics using computed signals
  totalProducts = computed(() => this.products().length);
  lowStockCount = computed(() => this.products().filter(p => p.stock <= 5).length);
  totalInventoryValue = computed(() => 
    this.products().reduce((sum, p) => sum + (p.price * p.stock), 0)
  );

  // State management
  isLoading = signal<boolean>(false);
  isSaving = false;
  editingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  // Form Fields
  categories = ['Heno', 'Juguetes'];
  formModel = {
    name: '',
    description: '',
    price: 0,
    category: 'Heno',
    stock: 10,
    imageUrl: '',
    badge: ''
  };

  async ngOnInit(): Promise<void> {
    // Loaded reactively via constructor effect once authenticated
  }


  // Edit action: Populate form with selected product
  startEdit(product: Product): void {
    this.editingId = product.id || null;
    this.errorMessage = '';
    this.successMessage = '';
    this.formModel = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
      badge: product.badge || ''
    };
    
    // Smooth scroll to form on mobile devices
    const formElement = document.getElementById('abm-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.resetForm();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e.target?.result) {
          this.formModel.imageUrl = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.formModel.name || !this.formModel.description || this.formModel.price <= 0 || !this.formModel.imageUrl) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.editingId) {
        // Edit existing product
        await this.productService.updateProduct(this.editingId, {
          name: this.formModel.name,
          description: this.formModel.description,
          price: this.formModel.price,
          category: this.formModel.category,
          stock: this.formModel.stock,
          imageUrl: this.formModel.imageUrl,
          badge: this.formModel.badge || undefined
        });
        this.successMessage = '¡Producto actualizado correctamente! 🌿';
      } else {
        // Create new product
        await this.productService.addProduct({
          name: this.formModel.name,
          description: this.formModel.description,
          price: this.formModel.price,
          category: this.formModel.category,
          stock: this.formModel.stock,
          imageUrl: this.formModel.imageUrl,
          badge: this.formModel.badge || undefined
        });
        this.successMessage = '¡Producto agregado correctamente! 🍄';
      }
      this.resetForm();
      this.editingId = null;
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al procesar el producto.';
    } finally {
      this.isSaving = false;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto de la madriguera? 🐾')) {
      return;
    }

    try {
      this.errorMessage = '';
      this.successMessage = '';
      await this.productService.deleteProduct(id);
      this.successMessage = 'Producto eliminado de la madriguera.';
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al eliminar el producto.';
    }
  }

  private resetForm(): void {
    this.formModel = {
      name: '',
      description: '',
      price: 0,
      category: 'Heno',
      stock: 10,
      imageUrl: '',
      badge: ''
    };
  }
}
