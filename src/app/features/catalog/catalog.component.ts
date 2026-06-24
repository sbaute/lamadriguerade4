import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);

  isLoading = signal<boolean>(true);
  selectedCategory = signal<string>('Todos');
  categories = ['Todos', 'Heno', 'Juguetes'];

  // All products computed from the service signal
  private allProducts = this.productService.products;

  // Computed signal for filtered products based on category and original products list
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const list = this.allProducts();
    
    if (category === 'Todos') {
      return list;
    }
    return list.filter(p => p.category === category);
  });

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      // Fetch products (triggers the service check and load)
      await this.productService.getProducts();
    } catch (e) {
      console.error('Error al cargar productos del catálogo', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectedProduct = signal<Product | null>(null);
  activeFaq = signal<number | null>(null);

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  openDetails(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeDetails(): void {
    this.selectedProduct.set(null);
  }

  toggleFaq(index: number): void {
    if (this.activeFaq() === index) {
      this.activeFaq.set(null);
    } else {
      this.activeFaq.set(index);
    }
  }
}

