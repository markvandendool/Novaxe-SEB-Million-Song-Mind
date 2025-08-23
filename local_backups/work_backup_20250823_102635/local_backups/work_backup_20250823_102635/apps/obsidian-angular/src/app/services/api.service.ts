import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    id?: number;
    email: string;
    firstName?: string;
    lastName?: string;
    created?: Date;
    lastLogin?: Date;
}

export interface Song {
    id?: number;
    userId: number;
    title: string;
    composer?: string;
    key?: string;
    timeSignature?: string;
    tempo?: number;
    scoreData: any;
    abcNotation?: string;
    created?: Date;
    updated?: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) {
        // Check for existing user session
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const userData = localStorage.getItem('obsidian_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('obsidian_user');
            }
        }
    }

    private saveUserToStorage(user: User): void {
        localStorage.setItem('obsidian_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private clearUserFromStorage(): void {
        localStorage.removeItem('obsidian_user');
        this.currentUserSubject.next(null);
    }

    // User Authentication
    createUser(email: string, firstName?: string, lastName?: string): Observable<User> {
        const userData = { email, firstName, lastName };

        return this.http.post<ApiResponse<User>>(
            `${this.baseUrl}/users/create`,
            userData,
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    this.saveUserToStorage(response.data);
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to create user');
                }
            }),
            catchError(error => {
                console.error('Create user error:', error);
                throw error;
            })
        );
    }

    loginUser(email: string): Observable<User> {
        return this.http.post<ApiResponse<User>>(
            `${this.baseUrl}/users/login`,
            { email },
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    this.saveUserToStorage(response.data);
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to login user');
                }
            }),
            catchError(error => {
                console.error('Login user error:', error);
                throw error;
            })
        );
    }

    logoutUser(): void {
        this.clearUserFromStorage();
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isLoggedIn(): boolean {
        return this.getCurrentUser() !== null;
    }

    // Song Management
    createSong(song: Omit<Song, 'id' | 'created' | 'updated'>): Observable<Song> {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            throw new Error('User must be logged in to create songs');
        }

        const songData = {
            ...song,
            userId: currentUser.id
        };

        return this.http.post<ApiResponse<Song>>(
            `${this.baseUrl}/songs/create`,
            songData,
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to create song');
                }
            }),
            catchError(error => {
                console.error('Create song error:', error);
                throw error;
            })
        );
    }

    updateSong(songId: number, updates: Partial<Song>): Observable<Song> {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            throw new Error('User must be logged in to update songs');
        }

        return this.http.put<ApiResponse<Song>>(
            `${this.baseUrl}/songs/${songId}`,
            updates,
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to update song');
                }
            }),
            catchError(error => {
                console.error('Update song error:', error);
                throw error;
            })
        );
    }

    getUserSongs(): Observable<Song[]> {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            throw new Error('User must be logged in to get songs');
        }

        return this.http.get<ApiResponse<Song[]>>(
            `${this.baseUrl}/songs/user/${currentUser.id}`,
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to get user songs');
                }
            }),
            catchError(error => {
                console.error('Get user songs error:', error);
                throw error;
            })
        );
    }

    getSong(songId: number): Observable<Song> {
        return this.http.get<ApiResponse<Song>>(
            `${this.baseUrl}/songs/${songId}`,
            this.httpOptions
        ).pipe(
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to get song');
                }
            }),
            catchError(error => {
                console.error('Get song error:', error);
                throw error;
            })
        );
    }

    deleteSong(songId: number): Observable<void> {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            throw new Error('User must be logged in to delete songs');
        }

        return this.http.delete<ApiResponse<void>>(
            `${this.baseUrl}/songs/${songId}`,
            this.httpOptions
        ).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.error || 'Failed to delete song');
                }
            }),
            catchError(error => {
                console.error('Delete song error:', error);
                throw error;
            })
        );
    }

    // Health check
    healthCheck(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/health`, this.httpOptions);
    }
}
