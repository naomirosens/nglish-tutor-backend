import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: 'student' | 'teacher';
    phone?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUserFromToken();
    }

    private loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                this.currentUserSubject.next({
                    id: decoded.id,
                    email: decoded.email,
                    fullName: decoded.fullName || '',
                    role: decoded.role
                });
            } catch (error) {
                this.logout();
            }
        }
    }

    register(data: {
        email: string;
        password: string;
        fullName: string;
        role: 'student' | 'teacher';
        phone?: string;
    }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.setToken(response.token);
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.setToken(response.token);
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    hasRole(role: 'student' | 'teacher'): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }
}
