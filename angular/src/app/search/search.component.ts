import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TitleCasePipe, isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  description: string;
  price: number;
  data: any;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule, TitleCasePipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];

    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Please login to search';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{ results: SearchResult[], total: number, query: string }>(
      `http://localhost:3000/api/search?q=${encodeURIComponent(this.searchQuery)}`,
      { headers }
    ).subscribe({
      next: (response) => {
        this.searchResults = response.results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.errorMessage = error.error?.error || 'Search failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onBook(result: SearchResult) {
    switch (result.type) {
      case 'flight':
        this.router.navigate(['/flights'], {
          queryParams: { flightId: result.id }
        });
        break;
      case 'hotel':
        this.router.navigate(['/hotels'], {
          queryParams: { hotelId: result.id }
        });
        break;
      case 'car':
        this.router.navigate(['/cars'], {
          queryParams: { carId: result.id }
        });
        break;
      case 'package':
        this.router.navigate(['/packages'], {
          queryParams: { packageId: result.id }
        });
        break;
      default:
        console.error('Unknown result type:', result.type);
    }
  }
}
