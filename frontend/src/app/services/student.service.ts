import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Call {
    id: number;
    call_sid: string;
    topic: string;
    start_time: string;
    end_time?: string;
    duration_seconds?: number;
    status: string;
    grammar_score?: number;
    vocabulary_score?: number;
    fluency_score?: number;
}

export interface StudentProfile {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    created_at: string;
    total_calls: number;
    total_seconds: number;
}

export interface StudentStats {
    total_calls: number;
    total_seconds: number;
    avg_grammar: number;
    avg_vocabulary: number;
    avg_fluency: number;
    last_call_date: string;
}

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private apiUrl = `${environment.apiUrl}/student`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<{ success: boolean; profile: StudentProfile }> {
        return this.http.get<{ success: boolean; profile: StudentProfile }>(`${this.apiUrl}/profile`);
    }

    getCalls(): Observable<{ success: boolean; calls: Call[] }> {
        return this.http.get<{ success: boolean; calls: Call[] }>(`${this.apiUrl}/calls`);
    }

    getCallDetails(callId: number): Observable<{ success: boolean; call: Call }> {
        return this.http.get<{ success: boolean; call: Call }>(`${this.apiUrl}/calls/${callId}`);
    }

    getStats(): Observable<{ success: boolean; stats: StudentStats }> {
        return this.http.get<{ success: boolean; stats: StudentStats }>(`${this.apiUrl}/stats`);
    }
}
