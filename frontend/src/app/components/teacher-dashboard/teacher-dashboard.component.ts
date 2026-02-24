import { Component, OnInit } from '@angular/core';
import { TeacherService, Student } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    standalone: false,
    selector: 'app-teacher-dashboard',
    templateUrl: './teacher-dashboard.component.html',
    styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
    students: Student[] = [];
    loading = true;
    addingStudent = false;
    newStudentEmail = '';
    error = '';
    success = '';

    displayedColumns: string[] = ['name', 'email', 'phone', 'totalCalls', 'lastCall', 'actions'];

    constructor(
        private teacherService: TeacherService,
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadStudents();
    }

    loadStudents(): void {
        this.loading = true;
        this.teacherService.getStudents().subscribe({
            next: (response) => {
                this.students = response.students;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading students:', err);
                this.loading = false;
            }
        });
    }

    addStudent(): void {
        if (!this.newStudentEmail) {
            this.error = 'נא להזין אימייל';
            return;
        }

        this.addingStudent = true;
        this.error = '';
        this.success = '';

        this.teacherService.addStudent(this.newStudentEmail).subscribe({
            next: (response) => {
                this.success = 'התלמידה נוספה בהצלחה!';
                this.newStudentEmail = '';
                this.addingStudent = false;
                this.loadStudents();

                setTimeout(() => {
                    this.success = '';
                }, 3000);
            },
            error: (err) => {
                this.error = err.error?.message || 'שגיאה בהוספת תלמידה';
                this.addingStudent = false;
            }
        });
    }

    viewStudent(student: Student): void {
        this.router.navigate(['/teacher/students', student.id]);
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'אין שיחות';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
