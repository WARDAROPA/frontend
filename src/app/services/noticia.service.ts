import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Noticia, NoticiaComment, CreateNoticiaRequest, CreateNoticiaCommentRequest } from '../models/noticia.model';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {
  private apiUrl = 'https://4.233.184.106';

  constructor(private http: HttpClient) {}

  getNoticias(usuarioId?: number, fuente?: string): Observable<{ success: boolean; noticias: Noticia[] }> {
    const params: any = {};
    if (usuarioId) params.usuario_id = usuarioId.toString();
    if (fuente) params.fuente = fuente;
    return this.http.get<{ success: boolean; noticias: Noticia[] }>(
      `${this.apiUrl}/noticias`,
      Object.keys(params).length ? { params } : {}
    );
  }

  getNoticia(id: number, usuarioId?: number): Observable<{ success: boolean; noticia: Noticia }> {
    const params: any = {};
    if (usuarioId) params.usuario_id = usuarioId.toString();
    return this.http.get<{ success: boolean; noticia: Noticia }>(
      `${this.apiUrl}/noticias/${id}`,
      Object.keys(params).length ? { params } : {}
    );
  }

  createNoticia(noticia: CreateNoticiaRequest): Observable<{ success: boolean; message: string; noticiaId: number }> {
    return this.http.post<{ success: boolean; message: string; noticiaId: number }>(
      `${this.apiUrl}/noticias`,
      noticia
    );
  }

  deleteNoticia(id: number, usuarioId: number): Observable<{ success: boolean; message: string }> {
    return this.http.request<{ success: boolean; message: string }>(
      'DELETE',
      `${this.apiUrl}/noticias/${id}`,
      { body: { usuario_id: usuarioId } }
    );
  }

  likeNoticia(id: number, usuarioId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/noticias/${id}/like`,
      { usuario_id: usuarioId }
    );
  }

  unlikeNoticia(id: number, usuarioId: number): Observable<{ success: boolean; message: string }> {
    return this.http.request<{ success: boolean; message: string }>(
      'DELETE',
      `${this.apiUrl}/noticias/${id}/like`,
      { body: { usuario_id: usuarioId } }
    );
  }

  getComments(noticiaId: number): Observable<{ success: boolean; comments: NoticiaComment[] }> {
    return this.http.get<{ success: boolean; comments: NoticiaComment[] }>(
      `${this.apiUrl}/noticias/${noticiaId}/comments`
    );
  }

  createComment(noticiaId: number, comment: CreateNoticiaCommentRequest): Observable<{ success: boolean; message: string; commentId: number }> {
    return this.http.post<{ success: boolean; message: string; commentId: number }>(
      `${this.apiUrl}/noticias/${noticiaId}/comments`,
      comment
    );
  }
}
