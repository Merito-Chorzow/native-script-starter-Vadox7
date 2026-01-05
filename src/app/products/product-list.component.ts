import { Component, OnInit, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './product.service';
import { Product } from './product';

@Component({
  selector: 'ns-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Reference to service signals (will be set in ngOnInit)

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Nie udało się załadować produktów. Spróbuj ponownie.');
        this.isLoading.set(false);
        console.error('Error loading products:', error);
      },
    });
  }

  navigateToDetail(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  navigateToAdd() {
    this.router.navigate(['/products/add']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'out_of_stock':
        return '#FF9800';
      case 'discontinued':
        return '#F44336';
      default:
        return '#757575';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'available':
        return 'Dostępny';
      case 'out_of_stock':
        return 'Brak';
      case 'discontinued':
        return 'Wycofany';
      default:
        return status;
    }
  }

  getImageSource(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    // Jeśli imageUrl zaczyna się od 'data:', to jest już pełny base64 string
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    // W przeciwnym razie dodaj prefix base64
    return 'data:image/jpeg;base64,' + imageUrl;
  }
}

