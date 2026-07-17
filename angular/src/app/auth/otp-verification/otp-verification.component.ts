import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent {
  @Input() userData: any;
  @Output() verificationComplete = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<void>();

  otp = '';
  errorMessage = '';
  isLoading = false;
  countdown = 60;
  canResend = false;
  private countdownInterval: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.startCountdown();
  }

  startCountdown() {
    this.canResend = false;
    this.countdown = 60;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  onVerify() {
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      this.isLoading = false;
      return;
    }

    const verificationData = {
      mobileNumber: this.userData.mobileNumber,
      otp: this.otp
    };

    this.http.post('http://localhost:3000/api/auth/verify-otp-mobile', verificationData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.verificationComplete.emit(response);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Verification failed. Please try again.';
        }
      });
  }

  onResendOTP() {
    this.errorMessage = '';
    this.isLoading = true;

    this.http.post('http://localhost:3000/api/auth/send-otp-mobile', { mobileNumber: this.userData.mobileNumber })
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.otp = '';
          this.startCountdown();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Failed to resend OTP. Please try again.';
        }
      });
  }

  onBack() {
    this.goBack.emit();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
