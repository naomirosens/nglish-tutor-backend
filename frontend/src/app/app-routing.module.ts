import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Student routes
    {
        path: 'student',
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'student' },
        children: [
            { path: '', component: StudentDashboardComponent },
            // ניתן להוסיף עוד נתיבים כאן
        ]
    },

    // Teacher routes
    {
        path: 'teacher',
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'teacher' },
        children: [
            { path: '', component: TeacherDashboardComponent },
            // ניתן להוסיף עוד נתיבים כאן
        ]
    },

    // Fallback
    { path: '**', redirectTo: '/login' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
