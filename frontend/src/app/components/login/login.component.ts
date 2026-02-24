import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: false,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';

        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe({
            next: (response) => {
                if (response.success) {
                    // ניתוב לפי תפקיד
                    if (response.user.role === 'student') {
                        this.router.navigate(['/student']);
                    } else if (response.user.role === 'teacher') {
                        this.router.navigate(['/teacher']);
                    }
                }
            },
            error: (err) => {
                this.error = err.error?.message || 'שגיאה בהתחברות';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
