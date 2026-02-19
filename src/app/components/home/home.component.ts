import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isConnected = false;
  posts: Post[] = [];

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
    this.postService.getPosts().subscribe({
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

  likePost(postId: number): void {
    if (!this.currentUser) return;
    
    this.postService.likePost(postId, { usuario_id: this.currentUser.id }).subscribe({
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

  unlikePost(postId: number): void {
    if (!this.currentUser) return;
    
    this.postService.unlikePost(postId, { usuario_id: this.currentUser.id }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPosts();
        }
      },
      error: (error) => {
        console.error('Error al quitar like:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(['/login']);
  }
}
