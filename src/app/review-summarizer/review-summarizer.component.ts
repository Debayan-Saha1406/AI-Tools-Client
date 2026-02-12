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
  public products: any[] = [];
  public selectedProduct: any = null;
  public reviewSummary : ReviewSummary= {
    reviews: /** @type {Review[]} */ ([]),
    summary: ''
  }
  // reviews: any[] = [];
  // summary: string = '';
  public loadingProducts: boolean = false;
  public loadingReviews: boolean = false;
  public loadingSummary: boolean = false;
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {

  }

  public ngOnInit(): void {
    this.loadProducts();
  }

  public loadProducts(): void {
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
          this.cdr.detectChanges();
        }
      });
  }

  public selectProduct(product: any): void {
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
          this.cdr.detectChanges();
        },
      });
  }

  public generateSummary(): void {
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
          this.loadingSummary = false;
          this.cdr.detectChanges();
        }
      });
  }
}
