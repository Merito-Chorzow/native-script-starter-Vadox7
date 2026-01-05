import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from './product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  // API endpoint - można zmienić na prawdziwe API
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts'; // Przykładowe API do testów
  // Alternatywnie można użyć lokalnego API lub mock service
  private useMockApi = true; // Zmień na false, aby używać prawdziwego API

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Inicjalizacja z przykładowymi danymi
    if (this.useMockApi) {
      this.products.set([
        {
          id: 1,
          name: 'Laptop Dell XPS 15',
          code: 'DLX-001',
          description: 'Wysokiej klasy laptop do pracy i rozrywki',
          status: 'available',
          imageUrl: '',
        },
        {
          id: 2,
          name: 'Smartphone Samsung Galaxy S24',
          code: 'SGS-002',
          description: 'Najnowszy model z zaawansowanym aparatem',
          status: 'available',
          imageUrl: '',
        },
        {
          id: 3,
          name: 'Słuchawki Sony WH-1000XM5',
          code: 'SNY-003',
          description: 'Bezprzewodowe słuchawki z redukcją szumów',
          status: 'out_of_stock',
          imageUrl: '',
        },
      ]);
    }
  }

  // Pobierz wszystkie produkty
  getProducts(): Observable<Product[]> {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.useMockApi) {
      // Symulacja opóźnienia API
      return new Observable((observer) => {
        setTimeout(() => {
          this.isLoading.set(false);
          observer.next([...this.products()]);
          observer.complete();
        }, 500);
      });
    }

    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(this.handleError(error));
        return throwError(() => error);
      })
    );
  }

  // Pobierz produkt po ID
  getProductById(id: number): Observable<Product> {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.useMockApi) {
      return new Observable((observer) => {
        setTimeout(() => {
          const product = this.products().find((p) => p.id === id);
          this.isLoading.set(false);
          if (product) {
            observer.next(product);
            observer.complete();
          } else {
            this.error.set('Produkt nie został znaleziony');
            observer.error(new Error('Produkt nie został znaleziony'));
          }
        }, 500);
      });
    }

    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(this.handleError(error));
        return throwError(() => error);
      })
    );
  }

  // Pobierz produkt po ID (synchronizacja - dla kompatybilności wstecznej)
  getProduct(id: number): Product | undefined {
    return this.products().find((product) => product.id === id);
  }

  // Dodaj nowy produkt
  addProduct(product: Product): Observable<Product> {
    this.isLoading.set(true);
    this.error.set(null);

    // Generuj ID dla nowego produktu
    const maxId = Math.max(...this.products().map((p) => p.id || 0), 0);
    const newProduct: Product = {
      ...product,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Loguj dane przed wysłaniem (do debugowania)
    console.log('Wysyłanie produktu:', {
      name: newProduct.name,
      code: newProduct.code,
      status: newProduct.status,
      hasImage: !!newProduct.imageUrl,
      imageLength: newProduct.imageUrl?.length || 0,
    });

    if (this.useMockApi) {
      return new Observable((observer) => {
        setTimeout(() => {
          this.products.update((products) => [...products, newProduct]);
          this.isLoading.set(false);
          observer.next(newProduct);
          observer.complete();
        }, 500);
      });
    }

    // Dla prawdziwego API - upewniamy się, że imageUrl jest zawsze w payload
    const payload = {
      name: newProduct.name,
      code: newProduct.code,
      description: newProduct.description || '',
      status: newProduct.status,
      image: newProduct.imageUrl || '', // Pole 'image' dla API (może być base64 lub ścieżka)
      imageUrl: newProduct.imageUrl || '', // Również imageUrl dla kompatybilności
    };

    return this.http.post<Product>(this.apiUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(this.handleError(error));
        return throwError(() => error);
      })
    );
  }

  // Zaktualizuj produkt
  updateProduct(id: number, product: Product): Observable<Product> {
    this.isLoading.set(true);
    this.error.set(null);

    const updatedProduct: Product = {
      ...product,
      id,
      updatedAt: new Date().toISOString(),
    };

    if (this.useMockApi) {
      return new Observable((observer) => {
        setTimeout(() => {
          this.products.update((products) =>
            products.map((p) => (p.id === id ? updatedProduct : p))
          );
          this.isLoading.set(false);
          observer.next(updatedProduct);
          observer.complete();
        }, 500);
      });
    }

    // Dla prawdziwego API - upewniamy się, że imageUrl jest zawsze w payload
    const payload = {
      name: updatedProduct.name,
      code: updatedProduct.code,
      description: updatedProduct.description || '',
      status: updatedProduct.status,
      image: updatedProduct.imageUrl || '', // Pole 'image' dla API
      imageUrl: updatedProduct.imageUrl || '', // Również imageUrl dla kompatybilności
    };

    return this.http.put<Product>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(this.handleError(error));
        return throwError(() => error);
      })
    );
  }

  // Usuń produkt
  deleteProduct(id: number): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.useMockApi) {
      return new Observable((observer) => {
        setTimeout(() => {
          this.products.update((products) => products.filter((p) => p.id !== id));
          this.isLoading.set(false);
          observer.next();
          observer.complete();
        }, 500);
      });
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(this.handleError(error));
        return throwError(() => error);
      })
    );
  }

  // Obsługa błędów
  private handleError(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      return `Błąd: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      return `Błąd serwera: ${error.status} - ${error.message}`;
    }
  }
}

