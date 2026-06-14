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
      <h2>Create Account</h2>
      <p class="auth-sub">Join YatraGo as a passenger or operator</p>
      <form (ngSubmit)="submit()">
        <label>Name</label>
        <input [(ngModel)]="f.name" name="name" required (input)="validate()">
        <span class="hint" *ngIf="f.name && f.name.length < 2">Name too short</span>
        <label>Email</label>
        <input type="email" [(ngModel)]="f.email" name="email" required (input)="validate()">
        <span class="hint" *ngIf="f.email && !emailOk">Invalid email</span>
        <label>Password</label>
        <input type="password" [(ngModel)]="f.password" name="password" required minlength="6" (input)="checkStrength()">
        <span class="strength" [class]="strength">{{strength || 'Enter password'}}</span>
        <label>Confirm Password</label>
        <input type="password" [(ngModel)]="f.confirm_password" name="confirm_password" required (input)="validate()">
        <span class="hint" *ngIf="f.confirm_password && f.password !== f.confirm_password">Passwords do not match</span>
        <label>Gender</label>
        <select [(ngModel)]="f.gender" name="gender">
          <option value="">Select</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
        <label>Phone</label>
        <input [(ngModel)]="f.phone" name="phone" pattern="[0-9]{10}">
        <span class="hint" *ngIf="f.phone && f.phone.length !== 10">10 digit phone required</span>
        <label>Address</label>
        <input [(ngModel)]="f.address" name="address">
        <label>Role</label>
        <select [(ngModel)]="f.role" name="role">
          <option value="user">Passenger</option>
          <option value="operator">Bus Operator</option>
        </select>
        <p class="err" *ngIf="error">{{error}}</p>
        <p class="ok" *ngIf="msg">{{msg}}</p>
        <button type="submit" [disabled]="!valid()">Register</button>
      </form>
      <p class="link">Have account? <a routerLink="/login">Login</a></p>
    </div>
  </div>`,
  styles: [`:host{display:block}.auth-card app-brand-logo{justify-content:center;margin-bottom:.5rem}.auth-sub{text-align:center;color:#64748B;font-size:.9rem;margin:-.25rem 0 1rem}`]
})
export class RegisterComponent {
  f = { name: '', email: '', password: '', confirm_password: '', gender: '', phone: '', address: '', role: 'user' };
  error = '';
  msg = '';
  strength = '';
  emailOk = false;

  constructor(private api: ApiService, private router: Router) {}

  validate() {
    this.emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.f.email);
  }

  checkStrength() {
    const p = this.f.password;
    if (p.length < 6) this.strength = 'weak';
    else if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) this.strength = 'medium';
    else this.strength = 'strong';
    this.validate();
  }

  valid() {
    return this.f.name.length >= 2 && this.emailOk && this.f.password.length >= 6 &&
      this.f.password === this.f.confirm_password &&
      (!this.f.phone || this.f.phone.length === 10);
  }

  submit() {
    this.error = '';
    this.msg = '';
    this.api.register(this.f).subscribe({
      next: () => {
        this.msg = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (e) => this.error = e.error?.error || 'Registration failed'
    });
  }
}
