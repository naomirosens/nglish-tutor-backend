import { Component, OnInit } from '@angular/core';
import { StudentService, StudentProfile, StudentStats, Call } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: false,
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
    profile: StudentProfile | null = null;
    stats: StudentStats | null = null;
    recentCalls: Call[] = [];
    loading = true;

    constructor(
        private studentService: StudentService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;

        // טעינת פרופיל
        this.studentService.getProfile().subscribe({
            next: (response) => {
                this.profile = response.profile;
            },
            error: (err) => console.error('Error loading profile:', err)
        });

        // טעינת סטטיסטיקות
        this.studentService.getStats().subscribe({
            next: (response) => {
                this.stats = response.stats;
            },
            error: (err) => console.error('Error loading stats:', err)
        });

        // טעינת שיחות אחרונות
        this.studentService.getCalls().subscribe({
            next: (response) => {
                this.recentCalls = response.calls.slice(0, 5);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading calls:', err);
                this.loading = false;
            }
        });
    }

    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTopicName(topic: string): string {
        const topics: { [key: string]: string } = {
            'hobbies': 'תחביבים',
            'dailyRoutine': 'שגרת יום',
            'foodAndCooking': 'אוכל ובישול',
            'travel': 'טיולים'
        };
        return topics[topic] || topic;
    }

    getScoreColor(score: number): string {
        if (score >= 80) return 'primary';
        if (score >= 60) return 'accent';
        return 'warn';
    }
}
