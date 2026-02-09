import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';



interface Review {
  id: number;
  author: string;
  rating: number;
  content: string;
}


interface ReviewSummary {
  reviews: Review[];
  summary: string;
}


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MarkdownModule],
  templateUrl: './review-summarizer.component.html',
  styleUrl: './review-summarizer.component.css',
})

export class ReviewSummarizerComponent {
  products: any[] = [];
  selectedProduct: any = null;
  reviewSummary : ReviewSummary= {
    reviews: /** @type {Review[]} */ ([]),
    summary: ''
  }
  // reviews: any[] = [];
  // summary: string = '';
  loadingProducts: boolean = false;
  loadingReviews: boolean = false;
  loadingSummary: boolean = false;
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    this.http
      .get<any[]>('http://localhost:3000/api/products')
      .subscribe({
        next: (data) => {
          this.loadingProducts = false;
          this.products = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loadingProducts = false;
          console.error('Failed to load products', err);
          this.cdr.detectChanges();
        }
      });
  }

   selectProduct(product: any) {
    this.loadingReviews = true;
    this.selectedProduct = product;
   
    this.http
      .get<ReviewSummary>('http://localhost:3000/api/products/{}/reviews'.replace('{}', product.id))
      .subscribe({
        next: (data : ReviewSummary) => {
          this.reviewSummary = data;
          this.loadingReviews = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.reviewSummary = {
            reviews: [],
            summary: ''
          };
          this.loadingReviews = false;
          console.error('Failed to load reviews', err);
          this.cdr.detectChanges();
        },
      });
  }

  generateSummary() {
  this.loadingSummary = true;
   this.http
      .post<any>('http://localhost:3000/api/products/{}/reviews/summarize'.replace('{}', this.selectedProduct.id), {})
      .subscribe({
        next: (summary) => {
          this.reviewSummary = {
            ...this.reviewSummary,
            summary: summary.summary
          };

          this.loadingSummary = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to generate summary', err);
          this.loadingSummary = false;
          this.cdr.detectChanges();
        }
      });
  }
}
