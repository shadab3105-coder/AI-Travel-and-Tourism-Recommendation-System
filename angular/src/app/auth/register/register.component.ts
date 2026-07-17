import {
  Component,
  OnInit,
  Optional,
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
  FormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription, interval, timer } from 'rxjs';
import { AuthService, 
         RegisterRequest, 
         RegisterResponse, 
         OTPVerificationRequest, 
         OTPVerificationResponse, 
         ResendOtpRequest, 
         ResendOtpResponse 
} from '../auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-register',
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
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  isOpen = true;

  // OTP sent flag
  otpSent = false;

  // Custom validators
  private passwordMatchValidator = (): ValidatorFn => {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        return null;
      }
    };
  };

  private otpValidator = (): ValidatorFn => {
    return (form: AbstractControl): ValidationErrors | null => {
      const digits = [0, 1, 2, 3, 4, 5].map(i => form.get(`digit${i}`)?.value);

      // Check if all digits are filled
      const isComplete = digits.every(digit => digit && digit.length === 1);

      if (!isComplete) {
        return { incompleteOtp: true };
      }

      return null;
    };
  };

  private phoneNumberValidator = (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty value
      }

      // Remove all non-digit characters
      const cleanValue = value.replace(/\D/g, '');

      // Check if it's exactly 10 digits
      if (cleanValue.length !== 10) {
        return { invalidPhone: true };
      }

      // Check if it starts with a valid digit (not 0)
      if (cleanValue.charAt(0) === '0') {
        return { invalidPhoneFormat: true };
      }

      return null;
    };
  };
  
  // Registration form
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  // OTP form
  otpForm!: FormGroup;
  isVerifyingOtp = false;
  isResendingOtp = false;
  resendCooldown = 0;
  private cooldownSubscription?: Subscription;
  otpExpirationTime = 0;
  private otpExpirationSubscription?: Subscription;

  // UI errors
  errorMessage = '';
  otpErrorMessage = '';
  fieldErrors: Record<string, string> = {};

  // OTP sent message
  otpSentMessage = '';

  // carousel images (same as login for consistency)
  images: string[] = [
    'assets/login pic-videos/ChatGPT Image Nov 30, 2025, 03_44_32 PM.png',
    'assets/login pic-videos/Explore Green Paths, Book Your Journey.png',
    'assets/login pic-videos/Explore Scenic Journeys, Book Now.png'
  ];
  currentIndex: number = 0;
  autoplaySub?: Subscription;
  autoplayDelay: number = 3500;
  isHovering: boolean = false;

  // Store registration data for OTP verification
  private registrationData: RegisterRequest | null = null;
  private otpId: string | null = null;

  // Defensive guard: avoid duplicate instances
  private static openCount = 0;

  // Keep a local subscription to dialog afterClosed for cleanup
  private afterClosedSub?: Subscription;

  // True if opened as a modal (via MatDialog), false if mounted directly (page)
  isModal = false;

  // Platform check
  private isBrowser = false;

  // Last 4 digits of phone for display
  lastFourDigits: string = ''; // Changed from private to public

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef?: MatDialogRef<RegisterComponent>,
    @Inject(PLATFORM_ID) private platformId?: Object
  ) {
    this.isModal = !!this.dialogRef;
    this.isBrowser = isPlatformBrowser(this.platformId as Object);
  }

  ngOnInit(): void {
    // Build registration form with firstName, lastName, and phoneNumber
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [
        Validators.required,
        this.phoneNumberValidator(),
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      isAdmin: [false]
    }, { validators: this.passwordMatchValidator() });

    // Build OTP form
    this.otpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]]
    }, { validators: this.otpValidator() });

    // Check for pending registration from AuthService
    const pendingRegistration = this.authService.getPendingRegistration();
    if (pendingRegistration) {
      this.registrationData = pendingRegistration.data;
      this.otpId = pendingRegistration.otpId || null;
      this.otpSent = true;
      // Store last 4 digits from registration data
      if (this.registrationData && this.registrationData.phoneNumber) {
        this.lastFourDigits = this.registrationData.phoneNumber.slice(-4);
      }
      this.startResendCooldown();
    }

    // If not running in browser, avoid DOM access and timers
    if (!this.isBrowser) {
      return;
    }

    // If another instance is open, close this one to avoid duplicates
    if (RegisterComponent.openCount > 0) {
      if (this.dialogRef) {
        Promise.resolve().then(() => this.dialogRef!.close());
      } else {
        this.cleanupModalArtifacts();
        this.isOpen = false;
      }
      return;
    }

    RegisterComponent.openCount++;

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
        console.warn('Could not modify body styles (non-browser?)', e);
      }
    }
  }

  ngOnDestroy(): void {
    this.autoplaySub?.unsubscribe();
    this.afterClosedSub?.unsubscribe();
    this.cooldownSubscription?.unsubscribe();
    this.otpExpirationSubscription?.unsubscribe();

    RegisterComponent.openCount = Math.max(0, RegisterComponent.openCount - 1);

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
  get form(): FormGroup { return this.registerForm; }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get isAdmin() { return this.registerForm.get('isAdmin'); }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // Phone input formatting
  onPhoneInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Remove all non-digit characters
    value = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Update the input value
    input.value = value;
    
    // Update the form control value
    this.registerForm.patchValue({ phoneNumber: value });
    
    // Clear field errors when typing
    if (this.fieldErrors['phoneNumber']) {
      delete this.fieldErrors['phoneNumber'];
    }
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    if (!phone || phone.length !== 10) return phone;
    return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
  }

  // Set pending registration data
  private setPendingRegistration(data: RegisterRequest, otpId?: string): void {
    this.registrationData = data;
    this.otpId = otpId || null;
    this.authService.setPendingRegistration(data, otpId);
  }

  // Registration form submission
  submitRegistration(): void {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = {
      firstName: this.firstName?.value || '',
      lastName: this.lastName?.value || '',
      phoneNumber: `+91${this.phoneNumber?.value || ''}`,
      email: this.email?.value || '',
      password: this.password?.value || '',
      isAdmin: this.isAdmin?.value || false
    };

    this.isLoading = true;

    // First step: Send registration request and trigger OTP
    this.authService.register(payload).subscribe({
      next: (res: RegisterResponse) => {
        this.isLoading = false;

        // Store registration data for verification
        this.registrationData = payload;
        this.lastFourDigits = payload.phoneNumber ? payload.phoneNumber.slice(-4) : '';

        // Check if OTP was sent
        if (res.otpSent) {
          this.otpId = res.otpId || null;
          // Show OTP fields inline
          this.otpSent = true;
          // Set OTP sent message
          this.otpSentMessage = `OTP sent to your phone number ending with ${this.lastFourDigits}`;
          
          // DEVELOPMENT FALLBACK: If OTP is returned in the response, display it in UI
          if (res.otp) {
            console.log(`🔑 [DEVELOPMENT FALLBACK] OTP received: ${res.otp}`);
            this.otpSentMessage = `[Dev Mode] OTP is ${res.otp} (Skipped SMS)`;
          }

          // Start cooldown for resend OTP
          this.startResendCooldown();
          // Start OTP expiration timer (50 seconds)
          this.startOtpExpirationTimer();
          // Store pending registration in auth service - FIXED: Convert null to undefined
          this.authService.setPendingRegistration(payload, this.otpId || undefined);
        } else {
          // If no OTP required and auto-login successful, close the dialog
          if (this.dialogRef) {
            this.dialogRef.close({ success: true, payload: res });
          } else {
            this.close();
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.handleRegistrationError(err);
      }
    });
  }

  // OTP Verification
  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isVerifyingOtp = true;
    this.otpErrorMessage = '';

    // Get OTP from form
    const otp = [0, 1, 2, 3, 4, 5]
      .map(i => this.otpForm.get(`digit${i}`)?.value)
      .join('');

    if (!this.registrationData) {
      this.otpErrorMessage = 'Registration data not found. Please restart the registration process.';
      this.isVerifyingOtp = false;
      return;
    }

    // Combine registration data with OTP
    const verificationPayload: OTPVerificationRequest = {
      firstName: this.registrationData.firstName,
      lastName: this.registrationData.lastName,
      phoneNumber: this.registrationData.phoneNumber || '',
      email: this.registrationData.email,
      password: this.registrationData.password,
      isAdmin: this.registrationData.isAdmin || false,
      otp: otp,
      otpId: this.otpId || undefined
    };

    // Verify OTP with backend using AuthService
    this.authService.verifyRegistration(verificationPayload).subscribe({
      next: (res: OTPVerificationResponse) => {
        this.isVerifyingOtp = false;
        
        if (res.success) {
          // OTP verification successful - clear pending registration
          this.authService.clearPendingRegistration();
          this.otpSent = false;

          if (this.dialogRef) {
            this.dialogRef.close({
              success: true,
              payload: res,
              message: 'Account created successfully! You can now login.'
            });
          } else {
            this.close();
            alert('Account created successfully! You can now login.');
          }
        } else {
          this.otpErrorMessage = res.message || 'OTP verification failed.';
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        this.handleOtpError(err);
      }
    });
  }

  // Resend OTP
  resendOtp(): void {
    if (this.isResendingOtp || this.resendCooldown > 0 || !this.registrationData) return;

    this.isResendingOtp = true;
    this.otpErrorMessage = '';

    const resendPayload: ResendOtpRequest = {
      email: this.registrationData.email,
      phoneNumber: this.registrationData.phoneNumber || '',
      otpId: this.otpId || undefined
    };

    // Resend OTP using AuthService
    this.authService.resendOtp(resendPayload).subscribe({
      next: (res: ResendOtpResponse) => {
        this.isResendingOtp = false;
        this.startResendCooldown();
        
        if (res.otpSent) {
          // Update OTP ID if provided
          if (res.otpId) {
            this.otpId = res.otpId;
          }
          // Show success message
          this.otpErrorMessage = '';
          
          let alertMsg = `New OTP has been sent to your phone number ending with ${this.lastFourDigits}`;
          if (res.otp) {
            console.log(`🔑 [DEVELOPMENT FALLBACK] New OTP received: ${res.otp}`);
            this.otpErrorMessage = `[Dev Mode] New OTP is ${res.otp}`;
            alertMsg = `[Dev Mode] New OTP is ${res.otp} (Skipped SMS)`;
          }
          alert(alertMsg);
        } else {
          this.otpErrorMessage = res.message || 'Failed to resend OTP.';
        }
      },
      error: (err: any) => {
        this.isResendingOtp = false;
        this.otpErrorMessage = err.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  // Start cooldown timer for resend OTP
  private startResendCooldown(): void {
    this.resendCooldown = 30; // 30 seconds cooldown
    this.cooldownSubscription?.unsubscribe();

    this.cooldownSubscription = timer(0, 1000).subscribe(() => {
      if (this.resendCooldown > 0) {
        this.resendCooldown--;
      } else {
        this.cooldownSubscription?.unsubscribe();
      }
      this.cdr.markForCheck();
    });
  }

  // Start OTP expiration timer (50 seconds)
  private startOtpExpirationTimer(): void {
    this.otpExpirationTime = 50; // 50 seconds
    this.otpExpirationSubscription?.unsubscribe();

    this.otpExpirationSubscription = timer(0, 1000).subscribe(() => {
      if (this.otpExpirationTime > 0) {
        this.otpExpirationTime--;
      } else {
        this.otpExpirationSubscription?.unsubscribe();
        // OTP expired - show error message
        this.otpErrorMessage = 'OTP has expired. Please request a new one.';
        this.resetOtpForm();
      }
      this.cdr.markForCheck();
    });
  }

  // Back to registration form
  backToRegistration(): void {
    this.otpSent = false;
    this.otpErrorMessage = '';
    this.resetOtpForm();
    // Clear any pending registration
    this.authService.clearPendingRegistration();
    // Scroll to top of registration form
    setTimeout(() => {
      const rightPanel = document.querySelector('.right-panel');
      if (rightPanel) {
        rightPanel.scrollTop = 0;
      }
    }, 100);
  }

  // Reset OTP form
  private resetOtpForm(): void {
    [0, 1, 2, 3, 4, 5].forEach(i => {
      this.otpForm.get(`digit${i}`)?.setValue('');
    });
    this.otpForm.markAsPristine();
    this.otpForm.markAsUntouched();
  }

  // OTP input handling
  onOtpInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otpForm.get(`digit${index}`)?.setValue('');
      return;
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`[formControlName="digit${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    // Clear error when user starts typing
    this.otpErrorMessage = '';
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        // Move to previous input
        const prevInput = document.querySelector(`[formControlName="digit${index - 1}"]`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.value = '';
          this.otpForm.get(`digit${index - 1}`)?.setValue('');
        }
      }
    }

    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = document.querySelector(`[formControlName="digit${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      const nextInput = document.querySelector(`[formControlName="digit${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text') || '';

    // Only accept numeric strings
    if (!/^\d+$/.test(pastedText)) return;

    const digits = pastedText.split('').slice(0, 6);

    digits.forEach((digit, index) => {
      if (index <= 5) {
        this.otpForm.get(`digit${index}`)?.setValue(digit);
      }
    });

    // Focus the next empty field or the last field
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.querySelector(`[formControlName="digit${nextEmptyIndex}"]`) as HTMLInputElement;
    if (nextInput) nextInput.focus();
  }

  // Carousel controls
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  goTo(i: number): void { 
    this.currentIndex = i % this.images.length; 
  }

  onMouseEnter(): void { 
    this.isHovering = true; 
  }

  onMouseLeave(): void { 
    this.isHovering = false; 
  }

  // Error handling
  private handleRegistrationError(err: any): void {
    const backend = err?.error;
    if (backend && backend.errors) {
      if (typeof backend.errors === 'object' && !Array.isArray(backend.errors)) {
        this.fieldErrors = { ...backend.errors };
      } else if (Array.isArray(backend.errors)) {
        const fieldErrors: Record<string, string> = {};
        backend.errors.forEach((e: any) => {
          if (e.field && e.message) fieldErrors[e.field] = e.message;
        });
        this.fieldErrors = fieldErrors;
      }
    }
    const backendMessage = backend?.message || backend?.msg || err.message || null;
    
    if (err.status === 400) {
      this.errorMessage = backendMessage || 'Invalid registration data.';
    } else if (err.status === 409) {
      if (backendMessage?.toLowerCase().includes('phone')) {
        this.errorMessage = 'Phone number already exists. Please use a different number or login.';
      } else {
        this.errorMessage = backendMessage || 'Email already exists.';
      }
    } else if (err.status >= 500) {
      this.errorMessage = backendMessage || 'Server error. Please try again later.';
    } else {
      this.errorMessage = backendMessage || 'Registration failed. Please try again.';
    }
  }

  private handleOtpError(err: any): void {
    const backend = err?.error;
    const backendMessage = backend?.message || backend?.msg || err.message || null;
    
    if (err.status === 400) {
      this.otpErrorMessage = backendMessage || 'Invalid OTP. Please check and try again.';
    } else if (err.status === 410) {
      this.otpErrorMessage = backendMessage || 'OTP has expired. Please request a new one.';
    } else if (err.status === 429) {
      this.otpErrorMessage = 'Too many attempts. Please try again after some time.';
    } else if (err.status >= 500) {
      this.otpErrorMessage = backendMessage || 'Server error. Please try again later.';
    } else {
      this.otpErrorMessage = backendMessage || 'OTP verification failed. Please try again.';
    }
    
    // Clear OTP form on error
    this.resetOtpForm();
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

  // Backdrop click handler
  onBackdropClick(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
    if (target && target.classList.contains('register-modal-backdrop')) {
      this.close();
    }
  }

  openLoginModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.isOpen = false;
      if (this.isBrowser) this.cleanupModalArtifacts();
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '70vw';
    dialogConfig.maxWidth = '1100px';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.restoreFocus = true;

    this.dialog.open(LoginComponent, dialogConfig);
  }

  private cleanupModalArtifacts() {
    if (!this.isBrowser) return;

    try {
      const selectors = this.isModal
        ? '.modal-backdrop, .register-modal-backdrop'
        : '.modal-backdrop, .cdk-overlay-backdrop, .register-modal-backdrop';
      document.querySelectorAll(selectors).forEach(el => (el as HTMLElement).remove());
      document.body.classList.remove('modal-open', 'cdk-global-scrollblock', 'cdk-global-scroll-block');
      document.body.style.overflow = '';
      (document.documentElement as HTMLElement).style.overflow = '';
    } catch (e) {
      console.warn('Error during modal cleanup', e);
    }
  }
}