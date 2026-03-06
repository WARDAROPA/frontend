import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule, FormsModule],
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
  outfits: any[] = [];
  loadingOutfits = true;
  activeTab: 'armario' | 'outfits' = 'armario';

  showCreateOutfit = false;
  newOutfitName = '';
  selectedPostIds: number[] = [];

  private readonly apiUrl = 'https://4.233.184.106';

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
      this.loadOutfits();
    }
  }

  loadPosts() {
    this.http.get(`${this.apiUrl}/users/${this.user.id}/posts`).subscribe({
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

  loadOutfits() {
    this.http.get(`${this.apiUrl}/users/${this.user.id}/outfits`).subscribe({
      next: (res: any) => {
        this.outfits = res.outfits || [];
        this.loadingOutfits = false;
      },
      error: (err) => {
        console.error('Error cargando outfits:', err);
        this.loadingOutfits = false;
      }
    });
  }

  setTab(tab: 'armario' | 'outfits') {
    this.activeTab = tab;
  }

  deletePost(postId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta prenda de tu armario?')) {
      
      this.http.delete(`${this.apiUrl}/posts/${postId}`, {
        body: { usuario_id: this.user.id }
      }).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.loadOutfits();
          }
        },
        error: (err) => {
          console.error('Error al borrar el post:', err);
          alert('Hubo un error al borrar la publicación.');
        }
      });
    }
  }

  openCreateOutfit() {
    this.showCreateOutfit = true;
    this.newOutfitName = '';
    this.selectedPostIds = [];
  }

  closeCreateOutfit() {
    this.showCreateOutfit = false;
    this.newOutfitName = '';
    this.selectedPostIds = [];
  }

  togglePostSelection(postId: number) {
    const exists = this.selectedPostIds.includes(postId);
    if (exists) {
      this.selectedPostIds = this.selectedPostIds.filter((id) => id !== postId);
      return;
    }

    if (this.selectedPostIds.length >= 4) {
      alert('Solo puedes seleccionar 4 prendas por outfit.');
      return;
    }

    this.selectedPostIds = [...this.selectedPostIds, postId];
  }

  isSelected(postId: number): boolean {
    return this.selectedPostIds.includes(postId);
  }

  createOutfit() {
    if (this.selectedPostIds.length !== 4) {
      alert('Debes seleccionar exactamente 4 prendas.');
      return;
    }

    this.http.post(`${this.apiUrl}/outfits`, {
      usuario_id: this.user.id,
      nombre: this.newOutfitName,
      post_ids: this.selectedPostIds
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.closeCreateOutfit();
          this.loadOutfits();
          this.activeTab = 'outfits';
        }
      },
      error: (err) => {
        console.error('Error al crear outfit:', err);
        alert('No se pudo crear el outfit.');
      }
    });
  }

  deleteOutfit(outfitId: number) {
    if (!confirm('¿Quieres borrar este outfit?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/outfits/${outfitId}`, {
      body: { usuario_id: this.user.id }
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.outfits = this.outfits.filter((outfit) => outfit.id !== outfitId);
        }
      },
      error: (err) => {
        console.error('Error al borrar outfit:', err);
        alert('No se pudo borrar el outfit.');
      }
    });
  }

  getOutfitSlots(outfit: any): any[] {
    const slots = [null, null, null, null];
    (outfit.prendas || []).forEach((prenda: any) => {
      const index = Number(prenda.slot) - 1;
      if (index >= 0 && index < 4) {
        slots[index] = prenda;
      }
    });
    return slots;
  }
}
