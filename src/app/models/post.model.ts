export interface Post {
  id: number;
  descripcion: string;
  foto: string;
  created_at: string;
  usuario_id: number;
  username: string;
  likes_count: number;
  comments_count: number;
  user_liked: number;
}

export interface Comment {
  id: number;
  texto: string;
  created_at: string;
  usuario_id: number;
  username: string;
}

export interface CreatePostRequest {
  usuario_id: number;
  descripcion: string;
  foto: string;
}

export interface CreateCommentRequest {
  usuario_id: number;
  texto: string;
}

export interface LikeRequest {
  usuario_id: number;
}
