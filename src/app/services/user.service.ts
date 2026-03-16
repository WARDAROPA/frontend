import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://4.233.184.106';

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<{ success: boolean; users: User[] }> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users/search`, { params });
  }

  followUser(userId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/users/follow/${userId}`, {});
  }

  unfollowUser(userId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/users/follow/${userId}`);
  }

  getFollowing(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users/following`);
  }

  getFollowers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users/followers`);
  }

  getUserById(id: number): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/users/${id}`);
  }
}