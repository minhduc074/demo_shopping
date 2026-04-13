import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  init(): Promise<void> {
    return new Promise(resolve => {
      this.http.get<{ user: User }>(`${this.api}/me`, { withCredentials: true }).subscribe({
        next: res => { this._user.set(res.user); resolve(); },
        error: () => resolve(),
      });
    });
  }

  register(data: { email: string; password: string; name: string }): Observable<{ user: User }> {
    const payload = { email: data.email, password: data.password, fullName: data.name };
    return this.http.post<{ user: User }>(`${this.api}/register`, payload, { withCredentials: true }).pipe(
      tap(res => this._user.set(res.user))
    );
  }

  login(email: string, password: string): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.api}/login`, { email, password }, { withCredentials: true }).pipe(
      tap(res => this._user.set(res.user))
    );
  }

  logout(): void {
    this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => {
        this._user.set(null);
        this.router.navigate(['/']);
      }
    });
  }

  updateProfile(data: { name?: string; phone?: string; address?: string }): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.api}/me`, data, { withCredentials: true }).pipe(
      tap(res => this._user.set(res.user))
    );
  }
}
