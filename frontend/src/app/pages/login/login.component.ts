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
      <h2>Welcome Back</h2>

      <form (ngSubmit)="submit()">
        <label>Login as</label>
        <div class="type-seg">
          <button type="button" [class.on]="mode === 'user'" (click)="setMode('user')">Passenger</button>
          <button type="button" [class.on]="mode === 'staff'" (click)="setMode('staff')">Staff</button>
        </div>
        <label>Email or Username</label>
        <input [(ngModel)]="email" name="email" required autocomplete="username">
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password">
        <p class="err" *ngIf="error">{{error}}</p>
        <button type="submit">Login</button>
      </form>

      <p class="link" *ngIf="mode === 'user'"><a routerLink="/forgot">Forgot Password?</a></p>
      <p class="link" *ngIf="mode === 'user'">No account? <a routerLink="/register">Register</a></p>
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
