import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isConnected = false;
  posts: Post[] = [];
  loadingPosts = true;
  loadingMorePosts = false;
  hasMorePosts = true;
  likeLoadingByPost: Record<number, boolean> = {};
  private readonly pageSize = 12;
  private currentOffset = 0;
  isFollowingFeed = false;
  
  showCreatePost = false;
  newPostDescription = '';
  newGarmentDescription = '';
  newPostPhoto = '';
  selectedFileName = '';
  useAIDescription = false;
  
  showCommentsModal = false;
  selectedPost: Post | null = null;
  comments: any[] = [];
  newComment = '';
  matchLoadingByPost: Record<number, boolean> = {};
  matchResultByPost: Record<number, { porcentaje: number; descripcion: string }> = {};

  constructor(
    private authService: AuthService,
    private wsService: WebSocketService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.wsService.connect();
    
    this.wsService.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });

    this.wsService.messages$.subscribe(message => {
      console.log('Mensaje recibido:', message);
    });

    this.loadPosts(true);
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  setFeedMode(following: boolean): void {
    if (this.isFollowingFeed === following) return;
    this.isFollowingFeed = following;
    this.loadPosts(true);
  }

  loadPosts(reset: boolean = false): void {
    const offset = reset ? 0 : this.currentOffset;

    if (reset) {
      this.loadingPosts = true;
    } else {
      this.loadingMorePosts = true;
    }

    const load$ = this.isFollowingFeed
      ? this.postService.getFollowingPosts(this.pageSize, offset)
      : this.postService.getPosts(this.currentUser?.id, this.pageSize, offset);

    load$.subscribe({
      next: (response) => {
        if (response.success) {
          const newPosts = response.posts;
          
          newPosts.forEach(post => {
            this.postService.getPostPhoto(post.id).subscribe({
              next: (photoResponse) => {
                if (photoResponse.success) {
                  post.foto = photoResponse.foto;
                }
              },
              error: (err) => console.error(`Error cargando foto del post ${post.id}:`, err)
            });
          });

          this.posts = reset
            ? newPosts
            : [...this.posts, ...newPosts];
          this.currentOffset = this.posts.length;
          this.hasMorePosts = response.hasMore;
        }
        this.loadingPosts = false;
        this.loadingMorePosts = false;
      },
      error: (error) => {
        console.error('Error al cargar posts:', error);
        this.loadingPosts = false;
        this.loadingMorePosts = false;
      }
    });
  }

  loadMorePosts(): void {
    if (this.loadingPosts || this.loadingMorePosts || !this.hasMorePosts) {
      return;
    }

    this.loadPosts(false);
  }

  toggleLike(post: Post): void {
    if (!this.currentUser) return;
    if (this.likeLoadingByPost[post.id]) return;
    
    const likeRequest = { usuario_id: this.currentUser.id };
    const wasLiked = Boolean(post.user_liked);

    this.likeLoadingByPost[post.id] = true;
    post.user_liked = wasLiked ? 0 : 1;
    post.likes_count = Math.max(0, Number(post.likes_count || 0) + (wasLiked ? -1 : 1));
    
    if (wasLiked) {
      this.postService.unlikePost(post.id, likeRequest).subscribe({
        next: (response) => {
          if (!response.success) {
            post.user_liked = 1;
            post.likes_count = Number(post.likes_count || 0) + 1;
          }
        },
        error: (error) => {
          post.user_liked = 1;
          post.likes_count = Number(post.likes_count || 0) + 1;
          if (error.status !== 400) {
            console.error('Error al quitar like:', error);
          }
        },
        complete: () => {
          this.likeLoadingByPost[post.id] = false;
        }
      });
    } else {
      this.postService.likePost(post.id, likeRequest).subscribe({
        next: (response) => {
          if (!response.success) {
            post.user_liked = 0;
            post.likes_count = Math.max(0, Number(post.likes_count || 0) - 1);
          }
        },
        error: (error) => {
          post.user_liked = 0;
          post.likes_count = Math.max(0, Number(post.likes_count || 0) - 1);
          if (error.status !== 400) {
            console.error('Error al dar like:', error);
          }
        },
        complete: () => {
          this.likeLoadingByPost[post.id] = false;
        }
      });
    }
  }

  toggleCreatePost(): void {
    this.showCreatePost = !this.showCreatePost;
    if (!this.showCreatePost) {
      this.newPostDescription = '';
      this.newGarmentDescription = '';
      this.newPostPhoto = '';
      this.selectedFileName = '';
      this.useAIDescription = false;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.newPostPhoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  createPost(): void {
    if (!this.currentUser || !this.newPostPhoto) {
      alert('Debes seleccionar una imagen');
      return;
    }

    const currentUser = this.currentUser;

    this.postService.createPost({
      usuario_id: currentUser.id,
      descripcion: this.newPostDescription,
      descripcion_prenda: this.newGarmentDescription,
      foto: this.newPostPhoto
    }).subscribe({
      next: (response) => {
        if (response.success) {
          if (this.useAIDescription) {
            this.postService.generatePostDescriptionWithIA(response.postId, {
              usuario_id: currentUser.id
            }).subscribe({
              error: (iaError) => {
                console.error('Error al solicitar descripcion IA:', iaError);
                alert('La prenda se publico, pero fallo la solicitud de descripcion con IA.');
              }
            });
          }

          this.toggleCreatePost();
          this.loadPosts(true);
        }
      },
      error: (error) => {
        console.error('Error al crear post:', error);
        alert('Error al crear el post');
      }
    });
  }

  openComments(post: Post): void {
    this.selectedPost = post;
    this.showCommentsModal = true;
    this.loadComments(post.id);
  }

  closeComments(): void {
    this.showCommentsModal = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  loadComments(postId: number): void {
    this.postService.getComments(postId).subscribe({
      next: (response) => {
        if (response.success) {
          this.comments = response.comments;
        }
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
      }
    });
  }

  addComment(): void {
    if (!this.currentUser || !this.selectedPost || !this.newComment.trim()) {
      return;
    }

    this.postService.createComment(this.selectedPost.id, {
      usuario_id: this.currentUser.id,
      texto: this.newComment
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.newComment = '';
          this.loadComments(this.selectedPost!.id);
          const targetPost = this.posts.find((post) => post.id === this.selectedPost!.id);
          if (targetPost) {
            targetPost.comments_count = Number(targetPost.comments_count || 0) + 1;
          }
        }
      },
      error: (error) => {
        console.error('Error al añadir comentario:', error);
      }
    });
  }

  getPostMatch(post: Post): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesion para calcular el match.');
      return;
    }

    const currentUser = this.currentUser;
    this.matchLoadingByPost[post.id] = true;

    this.postService.getPostMatch(post.id, {
      usuario_id: currentUser.id
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.matchResultByPost[post.id] = {
            porcentaje: response.porcentaje,
            descripcion: response.descripcion
          };
        }
      },
      error: (error) => {
        console.error('Error al calcular match:', error);
        alert('No se pudo calcular el match de esta prenda.');
      },
      complete: () => {
        this.matchLoadingByPost[post.id] = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(['/login']);
  }

  deletePost(post: Post): void {
    if (!this.currentUser || post.usuario_id !== this.currentUser.id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

    this.postService.deletePost(post.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPosts(true);
        }
      },
      error: (error) => {
        console.error('Error al borrar post:', error);
        alert('Error al borrar la publicación');
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('¿Seguro que quieres borrar este comentario?')) {
      return;
    }

    this.postService.deleteComment(commentId).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Quitamos el comentario de la lista
          this.comments = this.comments.filter(c => c.id !== commentId);
          
          // Actualizamos el contador visual en el post
          if (this.selectedPost && this.selectedPost.comments_count > 0) {
            this.selectedPost.comments_count--;
            // Opcional: recargar todos los posts para asegurar sincronización
            // this.loadPosts(); 
          }
        }
      },
      error: (error: any) => {
        console.error('Error al borrar el comentario:', error);
        alert('No se pudo borrar el comentario.');
      }
    });
  }
}
