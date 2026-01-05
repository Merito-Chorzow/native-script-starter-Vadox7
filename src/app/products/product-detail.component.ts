import { Component, OnInit, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { confirm } from '@nativescript/core/ui/dialogs';
import { ProductService } from './product.service';
import { Product } from './product';

@Component({
  selector: 'ns-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  productId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = +id;
      this.loadProduct();
    } else {
      this.error.set('Nieprawidłowe ID produktu');
    }
  }

  loadProduct() {
    if (!this.productId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Nie udało się załadować produktu. Spróbuj ponownie.');
        this.isLoading.set(false);
        console.error('Error loading product:', error);
      },
    });
  }

  editProduct() {
    if (this.productId) {
      this.router.navigate(['/products/edit', this.productId]);
    }
  }

  async deleteProduct() {
    if (!this.productId) return;

    const confirmed = await confirm({
      title: 'Usuń produkt',
      message: 'Czy na pewno chcesz usunąć ten produkt?',
      okButtonText: 'Usuń',
      cancelButtonText: 'Anuluj',
    });
    if (!confirmed) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.productService.deleteProduct(this.productId).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.error.set('Nie udało się usunąć produktu. Spróbuj ponownie.');
        this.isLoading.set(false);
        console.error('Error deleting product:', error);
      },
    });
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

