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
  
  showCreatePost = false;
  newPostDescription = '';
  newPostPhoto = '';
  selectedFileName = '';
  
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
      this.newPostPhoto = '';
      this.selectedFileName = '';
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

    this.postService.createPost({
      usuario_id: this.currentUser.id,
      descripcion: this.newPostDescription,
      foto: this.newPostPhoto
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.toggleCreatePost();
          this.loadPosts();
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
