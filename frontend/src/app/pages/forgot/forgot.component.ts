import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

import { BrandLogoComponent } from '../../shared/brand-logo.component';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf, BrandLogoComponent],
  template: `
  <div class="auth-wrap">
    <div class="auth-card">
      <app-brand-logo [light]="true"></app-brand-logo>
      <h2>Reset Password</h2>
      <p class="auth-sub">Enter your email and choose a new password</p>
      <form (ngSubmit)="submit()">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="email" required>
        <label>New Password</label>
        <input type="password" [(ngModel)]="password" name="password" required minlength="6" (input)="checkStrength()">
        <span class="strength" [class]="strength">{{strength || 'Enter password'}}</span>
        <p class="err" *ngIf="error">{{error}}</p>
        <p class="ok" *ngIf="msg">{{msg}}</p>
        <button type="submit" [disabled]="password.length < 6">Reset Password</button>
      </form>
      <p class="link"><a routerLink="/login">Back to Login</a></p>
    </div>
  </div>`,
  styles: [`:host{display:block}.auth-card app-brand-logo{justify-content:center;margin-bottom:.5rem}.auth-sub{text-align:center;color:#64748B;font-size:.9rem;margin:-.25rem 0 1rem}`]
})
export class ForgotComponent {
  email = '';
  password = '';
  error = '';
  msg = '';
  strength = '';

  constructor(private api: ApiService, private router: Router) {}

  checkStrength() {
    const p = this.password;
    if (p.length < 6) this.strength = 'weak';
    else if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) this.strength = 'medium';
    else this.strength = 'strong';
  }

  submit() {
    this.error = '';
    this.msg = '';
    this.api.forgotPassword({ email: this.email, password: this.password }).subscribe({
      next: () => { this.msg = 'Password reset. Redirecting to login...'; setTimeout(() => this.router.navigate(['/login']), 1500); },
      error: (e) => this.error = e.error?.error || 'Reset failed'
    });
  }
}
