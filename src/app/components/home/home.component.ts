import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { User } from '../../models/user.model';
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
  posts: any[] = [];

  constructor(
    private authService: AuthService,
    private wsService: WebSocketService,
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

    this.loadMockPosts();
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
  //ejemplo hardcodeado de posts
  loadMockPosts(): void {
    this.posts = [
      {
        id: 1,
        user: 'alfonsoEstiloso',
        image: 'https://i.blogs.es/458f0c/9078355586_6f550781b5_o/1366_521.jpg',
        description: 'tremendas crocs que me he comprado colega',
        likes: 42,
        comments: 5
      },
      {
        id: 2,
        user: 'maricarmen',
        image: 'https://www.mundodeportivo.com/files/image_449_220/uploads/2022/03/09/62289ee6e964d.png',
        description: 'Mi abrigo de balenciaga, estoy a la ultima',
        likes: 128,
        comments: 12
      },
      {
        id: 3,
        user: 'AmandaModa',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxWz0R5CBimvDLyyv4Yg9i39BnJp3UVPYIvQ&s',
        description: 'Alguien sabe si es original',
        likes: 89,
        comments: 8
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(['/login']);
  }
}
