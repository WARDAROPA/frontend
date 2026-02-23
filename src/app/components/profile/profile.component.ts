import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User & { bio?: string; avatar?: string } = {
    id: 0,
    username: '',
    email: '',
    bio: '',
    avatar: ''
  };
  
  posts: any[] = [];
  loadingPosts = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient 
  ) {
    const current = this.authService.currentUserValue;
    if (current) {
      this.user = current;
    }
  }

  ngOnInit() {
    if (this.user.id) {
      this.loadPosts();
    }
  }

  loadPosts() {
    this.http.get(`http://localhost:3000/users/${this.user.id}/posts`).subscribe({
      next: (res: any) => {
        this.posts = res.posts || [];
        this.loadingPosts = false;
      },
      error: (err) => {
        console.error('Error cargando posts:', err);
        this.loadingPosts = false;
      }
    });
  }

  deletePost(postId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta prenda de tu armario?')) {
      
      this.http.delete(`http://localhost:3000/posts/${postId}`, {
        body: { usuario_id: this.user.id }
      }).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.posts = this.posts.filter(p => p.id !== postId);
          }
        },
        error: (err) => {
          console.error('Error al borrar el post:', err);
          alert('Hubo un error al borrar la publicación.');
        }
      });
    }
  }
}
