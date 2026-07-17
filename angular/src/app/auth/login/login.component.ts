import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  ElementRef,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MatDialogModule,
  MatDialogConfig
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  // Template uses *ngIf="isOpen" and (click)="onBackdropClick($event)"
  isOpen = true;

  // Reactive form
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  // UI errors
  errorMessage = '';
  fieldErrors: Record<string, string> = {};

  // carousel images
  images = [
    'assets/login pic-videos/ChatGPT Image Nov 30, 2025, 03_44_32 PM.png',
    'assets/login pic-videos/Explore Green Paths, Book Your Journey.png',
    'assets/login pic-videos/Explore Scenic Journeys, Book Now.png'
  ];
  currentIndex = 0;
  autoplaySub?: Subscription;
  autoplayDelay = 3500;
  isHovering = false;

  @ViewChild('emailInput', { read: ElementRef }) emailInput?: ElementRef<HTMLInputElement>;

  // Defensive guard: avoid duplicate instances causing multiple backdrops / locked scroll
  private static openCount = 0;

  // Keep a local subscription to dialog afterClosed for cleanup
  private afterClosedSub?: Subscription;

  // True if opened as a modal (via MatDialog), false if mounted directly (page)
  isModal = false;

  // Platform check
  private isBrowser = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>,
    @Inject(PLATFORM_ID) private platformId?: Object
  ) {
    this.isModal = !!this.dialogRef;
    this.isBrowser = isPlatformBrowser(this.platformId as Object);
  }

  ngOnInit(): void {
    // Build form first so server-side rendering templates still bind
    this.loginForm = this.fb.group({
      role: ['user', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // If not running in browser, avoid DOM access and timers
    if (!this.isBrowser) {
      return;
    }

    // If another instance is open, close this one to avoid duplicates
    if (LoginComponent.openCount > 0) {
      if (this.dialogRef) {
        Promise.resolve().then(() => this.dialogRef!.close());
      } else {
        this.cleanupModalArtifacts();
        this.isOpen = false;
      }
      return;
    }

    LoginComponent.openCount++;

    // Autoplay carousel (browser-only)
    this.autoplaySub = interval(this.autoplayDelay).subscribe(() => {
      if (!this.isHovering) {
        this.next();
        this.cdr.markForCheck();
      }
    });

    // If opened via MatDialog, subscribe to afterClosed to ensure cleanup
    if (this.dialogRef) {
      this.afterClosedSub = this.dialogRef.afterClosed().subscribe(() => {
        this.cleanupModalArtifacts();
        this.isOpen = false;
      });
    } else {
      // If not using MatDialog (mounted directly) block body scroll to emulate modal
      try {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
      } catch (e) {
        // defensive: ignore if document not available
        console.warn('Could not modify body styles (non-browser?)', e);
      }
    }
  }

  ngOnDestroy(): void {
    this.autoplaySub?.unsubscribe();
    this.afterClosedSub?.unsubscribe();

    LoginComponent.openCount = Math.max(0, LoginComponent.openCount - 1);

    // cleanup only in browser
    if (this.isBrowser) {
      this.cleanupModalArtifacts();
    }
  }

  // keyboard: close on Escape
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.close();
    }
  }

  /** Template getters */
  get form(): FormGroup { return this.loginForm; }
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get role() { return this.loginForm.get('role'); }

  togglePassword() { this.showPassword = !this.showPassword; }

  submit(): void {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.email?.value,
      password: this.password?.value,
      role: this.role?.value
    };

    this.isLoading = true;

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (this.dialogRef) {
          this.dialogRef.close({ success: true, payload: res });
        } else {
          this.close();
        }
      },
      error: (err) => {
        this.isLoading = false;
        const backend = err?.error;
        if (backend && backend.errors) {
          if (typeof backend.errors === 'object' && !Array.isArray(backend.errors)) {
            this.fieldErrors = { ...backend.errors };
          } else if (Array.isArray(backend.errors)) {
            backend.errors.forEach((e: any) => {
              if (e.field && e.message) this.fieldErrors[e.field] = e.message;
            });
          }
        }
        const backendMessage = backend?.message || backend?.msg || null;
        if (err && err.status === 401) {
          this.errorMessage = backendMessage || 'Invalid email or password.';
        } else if (err && err.status >= 400 && err.status < 500) {
          this.errorMessage = backendMessage || 'Login failed. Please check your inputs.';
        } else if (err && err.status >= 500) {
          this.errorMessage = backendMessage || 'Server error. Please try again later.';
        } else {
          this.errorMessage = backendMessage || 'Unable to reach server. Check your network.';
        }
      }
    });
  }

  // Close helper used by template buttons/links
  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.isOpen = false;
      if (this.isBrowser) this.cleanupModalArtifacts();
    }
  }

  // Backdrop click handler (template calls onBackdropClick)
  onBackdropClick(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
    if (target && target.classList.contains('login-modal-backdrop')) {
      this.close();
    }
  }

  // Carousel controls
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
  goTo(i: number) { this.currentIndex = i % this.images.length; }
  onMouseEnter() { this.isHovering = true; }
  onMouseLeave() { this.isHovering = false; }

  openRegisterModal() {
    if (this.dialogRef) {
      this.dialogRef.close({ registrationRequested: true });
    } else {
      this.isOpen = false;
      if (this.isBrowser) this.cleanupModalArtifacts();
    }

    // Don't navigate - let the parent component handle modal switching
  }

  private cleanupModalArtifacts() {
    if (!this.isBrowser) return;

    try {
      // When opened as modal, let MatDialog handle the cdk-overlay-backdrop removal
      const selectors = this.isModal
        ? '.modal-backdrop, .login-modal-backdrop'
        : '.modal-backdrop, .cdk-overlay-backdrop, .login-modal-backdrop';
      document.querySelectorAll(selectors).forEach(el => (el as HTMLElement).remove());
      document.body.classList.remove('modal-open', 'cdk-global-scrollblock', 'cdk-global-scroll-block');
      document.body.style.overflow = '';
      (document.documentElement as HTMLElement).style.overflow = '';
    } catch (e) {
      // don't let cleanup errors break the app
      // eslint-disable-next-line no-console
      console.warn('Error during modal cleanup', e);
    }
  }
}
