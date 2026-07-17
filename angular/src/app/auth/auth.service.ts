import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  message: string;
  token?: string;       // Matches 'token' or 'accessToken'
  accessToken?: string; // Backend sends 'accessToken'
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Primary field (from 2nd file)
  mobileNumber?: string; // For backward compatibility (from 1st file)
  password: string;
  role?: string;
  isAdmin?: boolean;
}

export interface RegisterResponse {
  message: string;
  accessToken?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
  };
  otpSent?: boolean;
  otpId?: string;
  otp?: string;
}

export interface OTPVerificationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isAdmin?: boolean;
  otp: string;
  otpId?: string;
}

export interface OTPVerificationResponse {
  message: string;
  success: boolean;
  accessToken?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
  };
}

export interface ResendOtpRequest {
  email: string;
  phoneNumber: string;
  otpId?: string;
}

export interface ResendOtpResponse {
  message: string;
  otpSent: boolean;
  otpId?: string;
  otp?: string;
}

// Interface for pending registration data
interface PendingRegistrationData {
  data: RegisterRequest;
  otpId?: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 🛑 FIXED: Pointing to Port 3001 (Your running backend)
  private apiUrl = 'http://localhost:3001/api/auth';

  // ✅ ADDED: Reactive user state so the UI updates instantly
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Store OTP registration data temporarily (improved from 2nd file)
  private pendingRegistration: PendingRegistrationData | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage();
    this.loadPendingRegistrationFromStorage();
  }

  // ==========================================
  // 🔐 AUTHENTICATION METHODS
  // ==========================================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveSession(response);
        this.router.navigate(['/']); // Redirect to home
      }),
      catchError(this.handleError)
    );
  }

  adminLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Use standard login + role check
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.user.role === 'admin') {
          this.saveSession(response);
          this.router.navigate(['/admin/dashboard']);
        } else {
          throw new Error('Not an admin account');
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🆕 COMPREHENSIVE REGISTRATION: Supports both OTP and non-OTP flows
  register(credentials: RegisterRequest): Observable<RegisterResponse> {
    // Use mobile registration for OTP flow, regular registration for non-OTP
    const apiEndpoint = credentials.phoneNumber ? `${this.apiUrl}/register-mobile` : `${this.apiUrl}/register`;

    return this.http.post<RegisterResponse>(apiEndpoint, credentials).pipe(
      tap(response => {
        if (response.otpSent && credentials.phoneNumber) {
          // OTP flow: Store pending registration
          this.setPendingRegistration(credentials, response.otpId);
        } else if (response.accessToken) {
          // Non-OTP flow: Auto-login
          const userData = response.user || {
            email: credentials.email,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            phoneNumber: credentials.phoneNumber || credentials.mobileNumber,
            role: credentials.role || (credentials.isAdmin ? 'admin' : 'user')
          };

          this.saveSession({
            ...response,
            user: userData
          });
          this.clearPendingRegistration(); // Clear any pending data
          this.router.navigate(['/']);
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🆕 OTP VERIFICATION
  verifyRegistration(verificationData: OTPVerificationRequest): Observable<OTPVerificationResponse> {
    return this.http.post<OTPVerificationResponse>(`${this.apiUrl}/verify-otp`, verificationData).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.saveSession(response);
          this.clearPendingRegistration(); // Clear temp data
          this.router.navigate(['/']);
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🆕 RESEND OTP (with improved logic from 2nd file)
  resendOtp(requestData: ResendOtpRequest): Observable<ResendOtpResponse> {
    // Try to get otpId from pending registration if not provided
    const pending = this.getPendingRegistration();
    const dataWithOtpId = {
      ...requestData,
      otpId: requestData.otpId || pending?.otpId
    };

    return this.http.post<ResendOtpResponse>(`${this.apiUrl}/resend-otp`, dataWithOtpId).pipe(
      tap(response => {
        if (response.otpSent && response.otpId) {
          // Update stored otpId if a new one is provided
          if (pending) {
            this.setPendingRegistration(pending.data, response.otpId);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🆕 PHONE-BASED OTP RESEND (from 2nd file)
  resendPhoneOtp(phoneNumber: string, otpId?: string): Observable<ResendOtpResponse> {
    // Get pending registration data to include email if needed
    const pending = this.getPendingRegistration();
    const requestData = {
      phoneNumber,
      email: pending?.data.email || '',
      otpId: otpId || pending?.otpId
    };

    return this.http.post<ResendOtpResponse>(`${this.apiUrl}/resend-phone-otp`, requestData).pipe(
      tap(response => {
        if (response.otpSent && response.otpId) {
          // Update stored otpId if a new one is provided
          if (pending) {
            this.setPendingRegistration(pending.data, response.otpId);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearStoredData();
    this.clearPendingRegistration();
    this.router.navigate(['/auth/login']);
  }

  // ==========================================
  // 👤 USER STATE MANAGEMENT
  // ==========================================

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser(): any {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  getUserPhoneNumber(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.phoneNumber || user.mobileNumber || null : null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === 'admin' : false;
  }

  // ==========================================
  // 📱 PHONE VERIFICATION (from 2nd file)
  // ==========================================

  verifyPhoneNumber(phoneNumber: string, otp: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }

    return this.http.post(`${this.apiUrl}/verify-phone`, {
      userId,
      phoneNumber,
      otp
    }).pipe(
      tap(response => {
        // Update local user data with verified phone number
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            phoneNumber,
            phoneVerified: true,
            mobileNumber: phoneNumber // Keep backward compatibility
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  hasVerifiedPhone(): boolean {
    const user = this.getUser();
    return user ? !!(user.phoneNumber || user.mobileNumber) && user.phoneVerified === true : false;
  }

  getMaskedPhoneNumber(): string | null {
    const phoneNumber = this.getUserPhoneNumber();
    if (!phoneNumber || phoneNumber.length < 4) return phoneNumber;

    // Mask all but last 4 digits
    const visiblePart = phoneNumber.slice(-4);
    const maskedPart = '•'.repeat(phoneNumber.length - 4);
    return `${maskedPart}${visiblePart}`;
  }

  // ==========================================
  // 🔄 PROFILE MANAGEMENT (from 2nd file)
  // ==========================================

  updateUserProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }>): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }

    return this.http.put(`${this.apiUrl}/users/${userId}/profile`, userData).pipe(
      tap(response => {
        // Update local user data
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          // Ensure mobileNumber is synced with phoneNumber for compatibility
          if (userData.phoneNumber && !updatedUser.mobileNumber) {
            updatedUser.mobileNumber = userData.phoneNumber;
          }
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ==========================================
  // 🗄️ STORAGE HELPERS
  // ==========================================

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (e) {
          console.error('Error parsing stored user', e);
          this.clearStoredData();
        }
      }
    }
  }

  private loadPendingRegistrationFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem('pendingRegistration');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as PendingRegistrationData;

          // Check if data is not too old (30 minutes)
          const isExpired = Date.now() - parsed.timestamp > 30 * 60 * 1000;

          if (!isExpired) {
            this.pendingRegistration = parsed;
          } else {
            this.clearPendingRegistration();
          }
        } catch (e) {
          console.error('Error parsing pending registration', e);
          this.clearPendingRegistration();
        }
      }
    }
  }

  private saveSession(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      // Backend might send 'accessToken' or 'token'
      const token = response.accessToken || response.token;
      console.log("response*********", response);

      const user = response.user;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        // Ensure mobileNumber is synced with phoneNumber for compatibility
        if (user.phoneNumber && !user.mobileNumber) {
          user.mobileNumber = user.phoneNumber;
        }
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user); // Update app state immediately
      }
    }
  }

  private clearStoredData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('pendingRegistration');
    }
    this.currentUserSubject.next(null);
  }

  // ==========================================
  // 🔐 PENDING REGISTRATION MANAGEMENT
  // ==========================================

  setPendingRegistration(data: RegisterRequest, otpId?: string): void {
    const pendingData: PendingRegistrationData = {
      data,
      otpId,
      timestamp: Date.now()
    };

    this.pendingRegistration = pendingData;

    // Store in session storage for page reloads
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem('pendingRegistration', JSON.stringify(pendingData));
      } catch (e) {
        console.error('Failed to store pending registration in sessionStorage', e);
      }
    }
  }

  getPendingRegistration(): { data: RegisterRequest; otpId?: string } | null {
    // First check memory
    if (this.pendingRegistration) {
      const { data, otpId } = this.pendingRegistration;
      return { data, otpId };
    }

    // Check session storage if not in memory
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem('pendingRegistration');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as PendingRegistrationData;

          // Check if data is not too old (30 minutes)
          const isExpired = Date.now() - parsed.timestamp > 30 * 60 * 1000;

          if (!isExpired) {
            this.pendingRegistration = parsed;
            const { data, otpId } = parsed;
            return { data, otpId };
          } else {
            // Clear expired data
            this.clearPendingRegistration();
            return null;
          }
        } catch (e) {
          console.error('Error parsing pending registration from sessionStorage', e);
          this.clearPendingRegistration();
          return null;
        }
      }
    }

    return null;
  }

  clearPendingRegistration(): void {
    this.pendingRegistration = null;
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem('pendingRegistration');
      } catch (e) {
        console.error('Failed to remove pending registration from sessionStorage', e);
      }
    }
  }

  // ==========================================
  // 🛠️ UTILITY METHODS
  // ==========================================

  refreshToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.post(`${this.apiUrl}/refresh-token`, { token }).pipe(
      tap((response: any) => {
        if (response.accessToken) {
          localStorage.setItem('token', response.accessToken);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ==========================================
  // ❌ ERROR HANDLING (enhanced from 2nd file)
  // ==========================================

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    let errorCode = error.status || 0;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      const serverMessage = error.error?.message || error.error?.error || error.message;

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = serverMessage || 'Invalid request data.';
          break;
        case 401:
          errorMessage = serverMessage || 'Authentication failed.';
          break;
        case 403:
          errorMessage = serverMessage || 'Access denied.';
          break;
        case 404:
          errorMessage = serverMessage || 'Resource not found.';
          break;
        case 409:
          errorMessage = serverMessage || 'User already exists.';
          break;
        case 410:
          errorMessage = serverMessage || 'OTP has expired. Please request a new one.';
          break;
        case 422:
          errorMessage = serverMessage || 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many attempts. Please try again after some time.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = serverMessage || 'Server error. Please try again later.';
          break;
        default:
          errorMessage = serverMessage || 'An error occurred.';
      }
    }

    // Create error object with all details
    const errorObj = {
      message: errorMessage,
      status: errorCode,
      originalError: error
    };

    return throwError(() => errorObj);
  }
}