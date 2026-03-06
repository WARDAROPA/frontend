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
  private static readonly MAX_UPLOAD_BYTES = 850_000;

  currentUser: User | null = null;
  isConnected = false;
  posts: Post[] = [];
  
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

    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  loadPosts(): void {
    const userId = this.currentUser?.id;
    this.postService.getPosts(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.posts = response.posts;
        }
      },
      error: (error) => {
        console.error('Error al cargar posts:', error);
      }
    });
  }

  toggleLike(post: Post): void {
    if (!this.currentUser) return;
    
    const likeRequest = { usuario_id: this.currentUser.id };
    
    if (post.user_liked) {
      this.postService.unlikePost(post.id, likeRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPosts();
          }
        },
        error: (error) => {
          console.error('Error al quitar like:', error);
        }
      });
    } else {
      this.postService.likePost(post.id, likeRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPosts();
          }
        },
        error: (error) => {
          console.error('Error al dar like:', error);
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
    const file = event?.target?.files?.[0] as File | undefined;
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen valido.');
      return;
    }

    this.selectedFileName = file.name;

    this.compressImageFile(file, 1600, 0.85, HomeComponent.MAX_UPLOAD_BYTES)
      .then((compressedDataUrl) => {
        const sizeBytes = this.dataUrlSizeBytes(compressedDataUrl);
        if (sizeBytes > HomeComponent.MAX_UPLOAD_BYTES) {
          alert('La imagen sigue siendo demasiado grande. Prueba con una imagen mas ligera.');
          this.newPostPhoto = '';
          return;
        }

        this.newPostPhoto = compressedDataUrl;
      })
      .catch((error) => {
        console.error('Error al procesar imagen:', error);
        alert('No se pudo procesar la imagen seleccionada.');
      });
  }

  private async compressImageFile(
    file: File,
    maxDimension: number,
    initialQuality: number,
    maxBytes: number
  ): Promise<string> {
    const originalDataUrl = await this.fileToDataUrl(file);
    const image = await this.loadImage(originalDataUrl);
    const size = this.scaleDimensions(image.width, image.height, maxDimension);

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext('2d');
    if (!context) {
      return originalDataUrl;
    }

    context.drawImage(image, 0, 0, size.width, size.height);

    let quality = initialQuality;
    let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

    while (this.dataUrlSizeBytes(compressedDataUrl) > maxBytes && quality > 0.45) {
      quality -= 0.08;
      compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    return compressedDataUrl;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
  }

  private scaleDimensions(width: number, height: number, maxDimension: number): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
      return { width, height };
    }

    const ratio = width / height;
    if (ratio >= 1) {
      return { width: maxDimension, height: Math.round(maxDimension / ratio) };
    }

    return { width: Math.round(maxDimension * ratio), height: maxDimension };
  }

  private dataUrlSizeBytes(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1] || '';
    const paddingMatch = base64.match(/=*$/);
    const padding = paddingMatch ? paddingMatch[0].length : 0;

    return Math.floor((base64.length * 3) / 4) - padding;
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
          this.loadPosts();
        }
      },
      error: (error) => {
        console.error('Error al crear post:', error);

        if (error?.status === 413) {
          alert('La imagen supera el limite del servidor (413). Elige una imagen mas pequena.');
          return;
        }

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
          this.loadPosts();
        }
      },
      error: (error) => {
        console.error('Error al añadir comentario:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(['/login']);
  }
}
