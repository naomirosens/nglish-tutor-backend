import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const requiredRole = route.data['role'] as 'student' | 'teacher';

        if (this.authService.hasRole(requiredRole)) {
            return true;
        }

        // אם אין הרשאה, מפנה לדף המתאים
        const user = this.authService.getCurrentUser();
        if (user?.role === 'student') {
            return this.router.createUrlTree(['/student']);
        } else if (user?.role === 'teacher') {
            return this.router.createUrlTree(['/teacher']);
        }

        return this.router.createUrlTree(['/login']);
    }
}
