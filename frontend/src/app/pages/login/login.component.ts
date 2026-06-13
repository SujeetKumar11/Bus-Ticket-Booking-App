import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="logo">Fast<span>X</span></div>
      <h2>Welcome Back</h2>
      <p class="auth-sub">Login to search and book bus tickets</p>
      <form (ngSubmit)="submit()">
        <label>Email or Username</label>
        <input [(ngModel)]="email" name="email" required>
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="password" required>
        <p class="err" *ngIf="error">{{error}}</p>
        <button type="submit">Login</button>
      </form>
      <p class="link"><a routerLink="/forgot">Forgot Password?</a></p>
      <p class="link">No account? <a routerLink="/register">Register</a></p>
    </div>
  </div>`,
  styles: [`:host{display:block}.auth-sub{text-align:center;color:#888;font-size:.9rem;margin:-1rem 0 1rem}`]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    this.error = '';
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (r) => {
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
