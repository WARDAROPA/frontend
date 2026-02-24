import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comment, CreatePostRequest, CreateCommentRequest, LikeRequest } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://4.233.184.106:3000';

  constructor(private http: HttpClient) {}

  getPosts(usuarioId?: number): Observable<{ success: boolean; posts: Post[] }> {
    const params: any = usuarioId ? { usuario_id: usuarioId.toString() } : undefined;
    return this.http.get<{ success: boolean; posts: Post[] }>(`${this.apiUrl}/posts`, params ? { params } : {});
  }

  createPost(post: CreatePostRequest): Observable<{ success: boolean; message: string; postId: number }> {
    return this.http.post<{ success: boolean; message: string; postId: number }>(
      `${this.apiUrl}/posts`,
      post
    );
  }

  likePost(postId: number, likeRequest: LikeRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/posts/${postId}/like`,
      likeRequest
    );
  }

  unlikePost(postId: number, likeRequest: LikeRequest): Observable<{ success: boolean; message: string }> {
    return this.http.request<{ success: boolean; message: string }>(
      'DELETE',
      `${this.apiUrl}/posts/${postId}/like`,
      { body: likeRequest }
    );
  }

  getComments(postId: number): Observable<{ success: boolean; comments: Comment[] }> {
    return this.http.get<{ success: boolean; comments: Comment[] }>(
      `${this.apiUrl}/posts/${postId}/comments`
    );
  }

  createComment(postId: number, comment: CreateCommentRequest): Observable<{ success: boolean; message: string; commentId: number }> {
    return this.http.post<{ success: boolean; message: string; commentId: number }>(
      `${this.apiUrl}/posts/${postId}/comments`,
      comment
    );
  }
}
