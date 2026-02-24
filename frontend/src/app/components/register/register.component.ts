import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: false,
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            phone: ['', [Validators.required]],
            role: ['student', [Validators.required]]
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';

        const formData = this.registerForm.value;

        this.authService.register(formData).subscribe({
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
                this.error = err.error?.message || 'שגיאה בהרשמה';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
