import { Component, HostListener, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { AuthService } from './auth/auth.service';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule, HttpClientModule, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Vista Travel';
  isHomePage = false;
  isAuthPage = false;
  isMenuCollapsed = true;
  isScrolled = false;
  showScrollToTop = false;
  showMobileSearch = false;
  searchQuery: string = '';
  newsletterEmail: string = '';
  userIsOnline = true;
  
  private isBrowser: boolean;
  private routerSubscription?: Subscription;
  private currentYear = new Date().getFullYear();

  private scrollStrategyOptions: ScrollStrategyOptions;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private sso: ScrollStrategyOptions,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.scrollStrategyOptions = sso;
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Subscribe to router events for page tracking and auto-scroll
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).url;
      this.isHomePage = url === '/';
      this.isAuthPage = url.startsWith('/auth');
      this.isMenuCollapsed = true; // Close mobile menu on navigation
      this.showMobileSearch = false; // Close mobile search on navigation
      
      // Only scroll to top in browser environment
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit() {
    this.checkScrollPosition();
    this.setupOnlineStatus();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Close mobile menu when resizing to desktop
    if (this.isBrowser && window.innerWidth >= 992) {
      this.isMenuCollapsed = true;
      this.showMobileSearch = false;
    }
  }

  private checkScrollPosition() {
    // Only run in browser environment
    if (!this.isBrowser) {
      return;
    }
    
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.isScrolled = scrollPosition > 50;
    this.showScrollToTop = scrollPosition > 300;
  }

  private setupOnlineStatus() {
    if (this.isBrowser) {
      this.userIsOnline = navigator.onLine;
      
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.userIsOnline = true;
      });
      
      window.addEventListener('offline', () => {
        this.userIsOnline = false;
      });
    }
  }

  /* ================= AUTH STATE ================= */
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get user(): any {
    return this.authService.getUser();
  }

  get userInitials(): string {
    if (!this.user) return 'U';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    return initials || firstName.charAt(0).toUpperCase() || 'U';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }

  /* ================= MENU MANAGEMENT ================= */
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu() {
    this.isMenuCollapsed = true;
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    if (this.showMobileSearch && this.isBrowser) {
      // Focus the search input when opened
      setTimeout(() => {
        const searchInput = document.querySelector('.mobile-search-container input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  /* ================= MODAL MANAGEMENT ================= */
  openLoginModal() {
    this.closeMenu();

    // Prevent background scrolling
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70vw';
    dialogConfig.maxWidth = '1100px';
    dialogConfig.height = '85vh';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.restoreFocus = true;
    dialogConfig.panelClass = 'full-auth-modal';

    const dialogRef = this.dialog.open(LoginComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      // Restore background scrolling
      if (this.isBrowser) {
        document.body.style.overflow = '';
      }
      if (result?.registrationRequested) {
        this.openRegisterModal();
      }
    });
  }

  openRegisterModal() {
    this.closeMenu();

    // Prevent background scrolling
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70vw';
    dialogConfig.maxWidth = '1100px';
    dialogConfig.height = '85vh';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.restoreFocus = true;
    dialogConfig.panelClass = 'full-auth-modal';

    const dialogRef = this.dialog.open(RegisterComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      // Restore background scrolling
      if (this.isBrowser) {
        document.body.style.overflow = '';
      }
      if (result?.loginRequested) {
        this.openLoginModal();
      }
    });
  }

  /* ================= SEARCH FUNCTIONALITY ================= */
  onSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    // Check browser environment before accessing localStorage
    if (!this.isBrowser) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.openLoginModal();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{ results: any[], total: number, query: string }>(
      `http://localhost:3001/api/search?q=${encodeURIComponent(this.searchQuery)}`,
      { headers }
    ).subscribe({
      next: (response) => {
        this.router.navigate(['/search'], {
          queryParams: { q: this.searchQuery }
        });
        this.searchQuery = '';
        this.closeMenu();
        this.showMobileSearch = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        // Fallback: navigate anyway (simulate search)
        this.router.navigate(['/search'], {
          queryParams: { q: this.searchQuery }
        });
        this.searchQuery = '';
        this.closeMenu();
        this.showMobileSearch = false;
      }
    });
  }

  /* ================= SCROLL & UI HELPERS ================= */
  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  getRouteState(): string {
    return this.router.url;
  }

  get currentYearValue(): number {
    return this.currentYear;
  }

  /* ================= NEWSLETTER ================= */
  subscribeNewsletter() {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      // You could show a validation message here
      return;
    }

    // In a real app, you would call your newsletter API
    console.log('Subscribing email:', this.newsletterEmail);
    
    // Simulate API call
    setTimeout(() => {
      // Show success message (you could implement a toast service)
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail = '';
    }, 500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /* ================= KEYBOARD SHORTCUTS ================= */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isBrowser) {
      return;
    }
    
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (window.innerWidth >= 992) {
        // Focus desktop search
        const searchInput = document.querySelector('.search-container input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else {
        // Open mobile search
        this.showMobileSearch = true;
        setTimeout(() => {
          const mobileSearchInput = document.querySelector('.mobile-search-container input') as HTMLInputElement;
          if (mobileSearchInput) {
            mobileSearchInput.focus();
          }
        }, 100);
      }
    }
    
    // Escape to close menu or search
    if (event.key === 'Escape') {
      if (!this.isMenuCollapsed) {
        this.closeMenu();
      }
      if (this.showMobileSearch) {
        this.showMobileSearch = false;
      }
    }
    
    // Forward slash (/) for search
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const activeElement = document.activeElement;
      const isInput = activeElement instanceof HTMLInputElement || 
                     activeElement instanceof HTMLTextAreaElement;
      
      if (!isInput) {
        event.preventDefault();
        if (window.innerWidth >= 992) {
          const searchInput = document.querySelector('.search-container input') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      }
    }
  }

  /* ================= BROWSER SAFETY HELPERS ================= */
  getWindow(): Window | null {
    return this.isBrowser ? window : null;
  }

  getLocalStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  getNavigator(): Navigator | null {
    return this.isBrowser ? navigator : null;
  }

  /* ================= MOBILE BOTTOM NAV ACTIONS ================= */
  // These methods handle the mobile bottom navigation actions
  navigateToHome() {
    this.router.navigate(['/']);
    this.closeMenu();
  }

  navigateToFlights() {
    this.router.navigate(['/flights']);
    this.closeMenu();
  }

  openMobileProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.openLoginModal();
    }
    this.closeMenu();
  }

  /* ================= ONLINE STATUS ================= */
  get onlineStatus(): string {
    return this.userIsOnline ? 'Online' : 'Offline';
  }

  get onlineStatusColor(): string {
    return this.userIsOnline ? '#4caf50' : '#f44336';
  }

  refreshPage(): void {
    if (this.isBrowser) {
      window.location.reload();
    }
  }
}