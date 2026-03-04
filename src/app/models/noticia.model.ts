export interface Noticia {
  id: number;
  titulo: string;
  texto: string;
  imagen: string | null;
  fuente: 'n8n' | 'usuario';
  created_at: string;
  usuario_id: number | null;
  username: string | null;
  comments_count: number;
  likes_count: number;
  user_liked: number;
}

export interface CreateNoticiaRequest {
  usuario_id: number;
  titulo: string;
  texto: string;
  imagen?: string;
}

export interface NoticiaComment {
  id: number;
  texto: string;
  created_at: string;
  usuario_id: number;
  username: string;
}

export interface CreateNoticiaCommentRequest {
  usuario_id: number;
  texto: string;
}
