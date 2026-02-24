import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Call } from './student.service';

export interface Student {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    created_at: string;
    total_calls: number;
    last_call_date: string;
}

export interface ProgressData {
    stats: {
        total_calls: number;
        total_minutes: number;
        avg_grammar: number;
        avg_vocabulary: number;
        avg_fluency: number;
    };
    topicBreakdown: Array<{ topic: string; count: number }>;
    progressOverTime: Array<{
        date: string;
        grammar: number;
        vocabulary: number;
        fluency: number;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private apiUrl = `${environment.apiUrl}/teacher`;

    constructor(private http: HttpClient) { }

    getStudents(): Observable<{ success: boolean; students: Student[] }> {
        return this.http.get<{ success: boolean; students: Student[] }>(`${this.apiUrl}/students`);
    }

    addStudent(studentEmail: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${this.apiUrl}/students`,
            { studentEmail }
        );
    }

    getStudentCalls(studentId: number): Observable<{ success: boolean; calls: Call[] }> {
        return this.http.get<{ success: boolean; calls: Call[] }>(
            `${this.apiUrl}/students/${studentId}/calls`
        );
    }

    getStudentProgress(studentId: number): Observable<{ success: boolean } & ProgressData> {
        return this.http.get<{ success: boolean } & ProgressData>(
            `${this.apiUrl}/students/${studentId}/progress`
        );
    }
}
