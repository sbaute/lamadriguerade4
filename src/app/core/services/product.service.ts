import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';
import { db } from '../config/firebase.config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private platformId = inject(PLATFORM_ID);
  
  // Backing list signal
  private productsSignal = signal<Product[]>([]);
  
  // Read-only public signal
  products = computed(() => this.productsSignal());

  // Seed data (Heno y Juguetes para conejos)
  private readonly defaultProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Heno de Alfalfa Premium 🌾',
      description: 'Heno fresco y altamente nutritivo de alfalfa, ideal para conejos jóvenes, hembras gestantes y un aporte óptimo de calcio.',
      price: 3500,
      category: 'Heno',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop',
      badge: '¡Nuevo!',
      createdAt: new Date('2026-06-01')
    },
    {
      id: 'prod-2',
      name: 'Juguete Colgante de Madera de Manzano 🍎',
      description: 'Colgante artesanal elaborado con ramas de manzano natural deshidratadas. 100% seguro para roer y desgastar los dientes.',
      price: 2800,
      category: 'Juguetes',
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=600&auto=format&fit=crop',
      badge: '¡Más vendido!',
      createdAt: new Date('2026-06-02')
    },
    {
      id: 'prod-3',
      name: 'Heno de Avena de Alta Fibra 🌾',
      description: 'Heno de avena premium seleccionado por su alto contenido de fibra. Excelente para el sistema digestivo y el desgaste de molares.',
      price: 4200,
      category: 'Heno',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=600&auto=format&fit=crop',
      badge: 'Recomendado',
      createdAt: new Date('2026-06-03')
    },
    {
      id: 'prod-4',
      name: 'Pelota de Hierbas Tejida 🏀',
      description: 'Pelota masticable tejida con hierbas naturales deshidratadas y flores silvestres. Estimula el juego y el comportamiento natural.',
      price: 1500,
      category: 'Juguetes',
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1535268647977-a403b69fc756?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date('2026-06-04')
    },
    {
      id: 'prod-5',
      name: 'Túnel de Heno Relleno con Flores 🕳️',
      description: 'Túnel comestible recubierto de crujiente heno de pradera y pétalos de caléndula y rosa. El refugio interactivo ideal.',
      price: 5900,
      category: 'Juguetes',
      stock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
      badge: '¡Pocos!',
      createdAt: new Date('2026-06-05')
    },
    {
      id: 'prod-6',
      name: 'Heno de Festuca con Caléndula 🌼',
      description: 'Heno de festuca verde de aroma intenso mezclado con flores de caléndula deshidratadas que aportan antioxidantes naturales.',
      price: 3800,
      category: 'Heno',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date('2026-06-06')
    }
  ];

  constructor() {
    this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data['name'],
          description: data['description'],
          price: data['price'],
          category: data['category'],
          stock: data['stock'],
          imageUrl: data['imageUrl'],
          badge: data['badge'] || '',
          createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : new Date(data['createdAt'])
        });
      });

      if (list.length === 0) {
        // If empty, auto-seed products to Firestore if browser execution allows
        if (isPlatformBrowser(this.platformId)) {
          await this.seedProducts();
        } else {
          this.productsSignal.set(this.defaultProducts);
        }
      } else {
        this.productsSignal.set(list);
      }
    } catch (e) {
      console.error('Error al cargar productos desde Firestore:', e);
      // Fallback local so that catalog stays loaded
      this.productsSignal.set(this.defaultProducts);
    }
  }

  private async seedProducts(): Promise<void> {
    console.log('Sembrando productos iniciales en Firestore...');
    const list: Product[] = [];
    try {
      for (const prod of this.defaultProducts) {
        const newDoc = {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          category: prod.category,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          badge: prod.badge || '',
          createdAt: prod.createdAt ? prod.createdAt.toISOString() : new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'products'), newDoc);
        list.push({ ...prod, id: docRef.id });
      }
      this.productsSignal.set(list);
    } catch (error) {
      console.error('Error during database seeding:', error);
      this.productsSignal.set(this.defaultProducts);
    }
  }

  async getProducts(): Promise<Product[]> {
    if (this.productsSignal().length === 0) {
      await this.loadProducts();
    }
    return this.productsSignal();
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newDoc = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
      badge: product.badge || '',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'products'), newDoc);
    const addedProduct: Product = {
      ...newDoc,
      id: docRef.id,
      createdAt: new Date(newDoc.createdAt)
    };
    
    this.productsSignal.update(list => [addedProduct, ...list]);
    return addedProduct;
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    const docRef = doc(db, 'products', id);
    const cleanUpdates: any = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.price !== undefined) cleanUpdates.price = updates.price;
    if (updates.category !== undefined) cleanUpdates.category = updates.category;
    if (updates.stock !== undefined) cleanUpdates.stock = updates.stock;
    if (updates.imageUrl !== undefined) cleanUpdates.imageUrl = updates.imageUrl;
    if (updates.badge !== undefined) cleanUpdates.badge = updates.badge || '';
    
    await updateDoc(docRef, cleanUpdates);
    
    let updatedProduct: Product | null = null;
    this.productsSignal.update(list => list.map(p => {
      if (p.id === id) {
        updatedProduct = { ...p, ...updates };
        return updatedProduct;
      }
      return p;
    }));
    
    if (!updatedProduct) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    this.productsSignal.update(list => list.filter(p => p.id !== id));
  }
}
