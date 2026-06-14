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

      <div class="login-tabs">
        <button type="button" [class.active]="mode === 'user'" (click)="setMode('user')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Passenger
        </button>
        <button type="button" [class.active]="mode === 'staff'" (click)="setMode('staff')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 17l-6.5 3.5 2-7L2 9h7z"/></svg>
          Admin / Operator
        </button>
      </div>

      <h2>{{ mode === 'user' ? 'Passenger Login' : 'Staff Login' }}</h2>
      <p class="auth-sub" *ngIf="mode === 'user'">Sign in to search routes and book tickets</p>
      <p class="auth-sub" *ngIf="mode === 'staff'">Sign in to manage routes, bookings, or the platform</p>

      <form (ngSubmit)="submit()">
        <label>Email or Username</label>
        <input [(ngModel)]="email" name="email" required autocomplete="username">
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password">
        <p class="err" *ngIf="error">{{error}}</p>
        <button type="submit">{{ mode === 'user' ? 'Login as Passenger' : 'Login as Staff' }}</button>
      </form>

      <div class="staff-hint" *ngIf="mode === 'staff'">
        <p><strong>Demo accounts</strong></p>
        <span>Admin: admin@fastx.com</span>
        <span>Operator: operator@fastx.com</span>
      </div>

      <ng-container *ngIf="mode === 'user'">
        <p class="link"><a routerLink="/forgot">Forgot Password?</a></p>
        <p class="link">No account? <a routerLink="/register">Register as Passenger</a></p>
      </ng-container>

      <p class="link staff-link" *ngIf="mode === 'staff'">
        Not staff? <a href="#" (click)="setMode('user'); $event.preventDefault()">Passenger login</a>
      </p>
    </div>
  </div>`,
  styles: [`:host{display:block}.auth-card app-brand-logo{justify-content:center;margin-bottom:.75rem}`]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  mode: 'user' | 'staff' = 'user';

  constructor(private api: ApiService, private router: Router) {}

  setMode(m: 'user' | 'staff') {
    this.mode = m;
    this.error = '';
  }

  submit() {
    this.error = '';
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (r) => {
        if (this.mode === 'user' && r.role !== 'user') {
          this.error = 'This is a staff account. Please use Admin / Operator login.';
          return;
        }
        if (this.mode === 'staff' && r.role === 'user') {
          this.error = 'Passenger account detected. Please use Passenger login or register.';
          return;
        }
        localStorage.setItem('token', r.token);
        localStorage.setItem('role', r.role);
        localStorage.setItem('name', r.name);
        const map: Record<string, string> = { user: '/user', operator: '/operator', admin: '/admin' };
        this.router.navigate([map[r.role] || '/login']);
      },
      error: (e) => this.error = e.error?.error || 'Login failed'
    });
  }
}
