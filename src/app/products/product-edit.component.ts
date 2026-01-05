import { Component, OnInit, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takePicture, requestPermissions } from '@nativescript/camera';
import { ImageSource } from '@nativescript/core';
import { ProductService } from './product.service';
import { Product } from './product';

@Component({
  selector: 'ns-product-edit',
  templateUrl: './product-edit.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ProductEditComponent implements OnInit {
  name = signal<string>('');
  code = signal<string>('');
  description = signal<string>('');
  status = signal<'available' | 'out_of_stock' | 'discontinued'>('available');
  
  nameError = signal<string>('');
  codeError = signal<string>('');
  statusError = signal<string>('');
  
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  imagePath = signal<string | null>(null);
  imageBase64 = signal<string | null>(null);
  productId: number | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = +id;
      this.loadProduct();
    } else {
      this.error.set('Nieprawidłowe ID produktu');
    }
    this.requestCameraPermissions();
  }

  async requestCameraPermissions() {
    try {
      await requestPermissions();
    } catch (error) {
      console.log('Camera permission error:', error);
    }
  }

  loadProduct() {
    if (!this.productId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.name.set(product.name);
        this.code.set(product.code);
        this.description.set(product.description || '');
        this.status.set(product.status);
        if (product.imageUrl) {
          this.imageBase64.set(product.imageUrl);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Nie udało się załadować produktu. Spróbuj ponownie.');
        this.isLoading.set(false);
        console.error('Error loading product:', error);
      },
    });
  }

  async takePhoto() {
    try {
      const imageAsset = await takePicture({
        width: 300,
        height: 300,
        keepAspectRatio: true,
        saveToGallery: false,
      });

      if (imageAsset) {
        const imageSource = new ImageSource();
        await imageSource.fromAsset(imageAsset);
        
        const base64 = imageSource.toBase64String('jpg', 80);
        this.imageBase64.set(base64);
        this.imagePath.set(imageAsset.android ? imageAsset.android : imageAsset.ios);
      }
    } catch (error) {
      this.error.set('Nie udało się zrobić zdjęcia. Sprawdź uprawnienia aparatu.');
      console.error('Camera error:', error);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.nameError.set('');
    this.codeError.set('');
    this.statusError.set('');

    // Validate name
    if (!this.name() || this.name().trim().length === 0) {
      this.nameError.set('Nazwa jest wymagana');
      isValid = false;
    } else if (this.name().trim().length < 3) {
      this.nameError.set('Nazwa musi mieć co najmniej 3 znaki');
      isValid = false;
    }

    // Validate code
    if (!this.code() || this.code().trim().length === 0) {
      this.codeError.set('Kod jest wymagany');
      isValid = false;
    } else if (this.code().trim().length < 2) {
      this.codeError.set('Kod musi mieć co najmniej 2 znaki');
      isValid = false;
    }

    // Status ma domyślną wartość, więc zawsze jest ustawiony
    // Nie ma potrzeby walidacji statusu

    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      this.error.set('Proszę wypełnić wszystkie wymagane pola poprawnie.');
      return;
    }

    if (!this.productId) return;

    this.isLoading.set(true);
    this.error.set(null);

    const productData: Product = {
      name: this.name().trim(),
      code: this.code().trim(),
      description: this.description().trim(),
      status: this.status(),
      imageUrl: this.imageBase64() || '', // Wysyłamy pusty string zamiast undefined
    };

    this.productService.updateProduct(this.productId, productData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/products', this.productId]);
      },
      error: (error) => {
        this.error.set('Nie udało się zaktualizować produktu. Spróbuj ponownie.');
        this.isLoading.set(false);
        console.error('Error updating product:', error);
      },
    });
  }

  getStatusIndex(): number {
    const statuses: ('available' | 'out_of_stock' | 'discontinued')[] = ['available', 'out_of_stock', 'discontinued'];
    return statuses.indexOf(this.status());
  }

  onStatusChange(index: number) {
    const statuses: ('available' | 'out_of_stock' | 'discontinued')[] = ['available', 'out_of_stock', 'discontinued'];
    this.status.set(statuses[index]);
    this.statusError.set('');
  }

  onNameChange(value: string) {
    this.name.set(value);
    if (this.nameError()) {
      this.nameError.set('');
    }
  }

  onCodeChange(value: string) {
    this.code.set(value);
    if (this.codeError()) {
      this.codeError.set('');
    }
  }

  onDescriptionChange(value: string) {
    this.description.set(value);
  }
}
