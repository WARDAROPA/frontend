import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
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
  hasLoadedOutfits = false;
  activeTab: 'armario' | 'outfits' = 'armario';
  isOwnProfile = false;

  showCreateOutfit = false;
  newOutfitName = '';
  selectedPostIds: number[] = [];
  showGenerateOutfitIA = false;
  outfitIAPrompt = '';
  generatingOutfitIA = false;
  showTryOnOutfit = false;
  tryingOnOutfit = false;
  selectedOutfitForTryOn: any | null = null;
  tryOnPhoto = '';
  tryOnFileName = '';
  tryOnResultImage = '';
  tryOnResultDescription = '';

  showCreatePost = false;
  newPostDescription = '';
  newGarmentDescription = '';
  newPostPhoto = '';
  selectedFileName = '';

  private readonly apiUrl = 'https://4.233.184.106';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const current = this.authService.currentUserValue;
    if (current) {
      this.user = current;
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.currentUserValue;
    if (id) {
      const userId = +id;
      this.isOwnProfile = currentUser?.id === userId;
      this.userService.getUserById(userId).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.user = res.user;
            this.loadPosts();
          }
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.router.navigate(['/home']);
        }
      });
    } else {
      // Perfil propio
      this.isOwnProfile = true;
      if (currentUser) {
        this.user = currentUser;
        this.loadPosts();
      }
    }
  }

  loadPosts() {
    this.http.get(`${this.apiUrl}/users/${this.user.id}/posts`).subscribe({
      next: (res: any) => {
        this.posts = res.posts || [];
        
        this.posts.forEach(post => {
          this.http.get(`${this.apiUrl}/posts/${post.id}/photo`).subscribe({
            next: (photoRes: any) => {
              if (photoRes.success) {
                post.foto = photoRes.foto;
              }
            },
            error: (err) => console.error(`Error cargando foto ${post.id}:`, err)
          });
        });
        
        this.loadingPosts = false;
      },
      error: (err) => {
        console.error('Error cargando posts:', err);
        this.loadingPosts = false;
      }
    });
  }

  loadOutfits() {
    this.loadingOutfits = true;
    this.http.get(`${this.apiUrl}/users/${this.user.id}/outfits`).subscribe({
      next: (res: any) => {
        this.outfits = res.outfits || [];
        
        this.outfits.forEach(outfit => {
          outfit.prendas.forEach((prenda: any) => {
            this.http.get(`${this.apiUrl}/posts/${prenda.post_id}/photo`).subscribe({
              next: (photoRes: any) => {
                if (photoRes.success) {
                  prenda.foto = photoRes.foto;
                }
              },
              error: (err) => console.error(`Error cargando foto ${prenda.post_id}:`, err)
            });
          });
        });
        
        this.loadingOutfits = false;
        this.hasLoadedOutfits = true;
      },
      error: (err) => {
        console.error('Error cargando outfits:', err);
        this.handleAuthError(err);
        this.loadingOutfits = false;
      }
    });
  }

  setTab(tab: 'armario' | 'outfits') {
    this.activeTab = tab;
    if (tab === 'outfits' && !this.hasLoadedOutfits) {
      this.loadOutfits();
    }
  }

  private handleAuthError(err: any): void {
    if (err?.status === 401 || err?.status === 403) {
      this.authService.logout();
      alert('Sesion expirada. Inicia sesion nuevamente.');
      this.router.navigate(['/login']);
    }
  }

  deletePost(postId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta prenda de tu armario?')) {
      this.http.delete(`${this.apiUrl}/posts/${postId}`).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.loadOutfits();
          }
        },
        error: (err) => {
          console.error('Error al borrar el post:', err);
          this.handleAuthError(err);
          alert('Hubo un error al borrar la publicación.');
        }
      });
    }
  }

  toggleCreatePost() {
    this.showCreatePost = !this.showCreatePost;
    if (!this.showCreatePost) {
      this.newPostDescription = '';
      this.newGarmentDescription = '';
      this.newPostPhoto = '';
      this.selectedFileName = '';
    }
  }

  onFileSelected(event: any) {
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

  createPost() {
    if (!this.newPostPhoto) {
      alert('Debes seleccionar una imagen');
      return;
    }

    this.http.post(`${this.apiUrl}/posts`, {
      descripcion: this.newPostDescription,
      descripcion_prenda: this.newGarmentDescription,
      foto: this.newPostPhoto
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toggleCreatePost();
          this.loadPosts();
        }
      },
      error: (err) => {
        console.error('Error al crear post:', err);
        this.handleAuthError(err);
        alert('Error al crear la publicación.');
      }
    });
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

  openGenerateOutfitIA() {
    this.showGenerateOutfitIA = true;
    this.outfitIAPrompt = '';
  }

  closeGenerateOutfitIA() {
    this.showGenerateOutfitIA = false;
    this.outfitIAPrompt = '';
    this.generatingOutfitIA = false;
  }

  openTryOnOutfit(outfit: any) {
    this.showTryOnOutfit = true;
    this.selectedOutfitForTryOn = outfit;
    this.tryOnPhoto = '';
    this.tryOnFileName = '';
    this.tryOnResultImage = '';
    this.tryOnResultDescription = '';
  }

  closeTryOnOutfit() {
    this.showTryOnOutfit = false;
    this.tryingOnOutfit = false;
    this.selectedOutfitForTryOn = null;
    this.tryOnPhoto = '';
    this.tryOnFileName = '';
    this.tryOnResultImage = '';
    this.tryOnResultDescription = '';
  }

  onTryOnPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.tryOnFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.tryOnPhoto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  generateTryOn() {
    if (!this.selectedOutfitForTryOn) {
      alert('Selecciona un outfit para probar.');
      return;
    }

    if (!this.tryOnPhoto) {
      alert('Debes subir una foto de cuerpo entero.');
      return;
    }

    this.tryingOnOutfit = true;

    this.http.post(`${this.apiUrl}/outfits/${this.selectedOutfitForTryOn.id}/try-on`, {
      foto_usuario: this.tryOnPhoto
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tryOnResultImage = res.imagen_resultado;
          this.tryOnResultDescription = res.descripcion || '';
        }
      },
      error: (err) => {
        console.error('Error al probar outfit:', err);
        this.handleAuthError(err);
        alert(err?.error?.error || 'No se pudo generar la prueba de outfit.');
      },
      complete: () => {
        this.tryingOnOutfit = false;
      }
    });
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
        this.handleAuthError(err);
        alert('No se pudo crear el outfit.');
      }
    });
  }

  generateOutfitWithIA() {
    if (!this.outfitIAPrompt.trim()) {
      alert('Escribe un prompt para generar el outfit.');
      return;
    }

    this.generatingOutfitIA = true;

    this.http.post(`${this.apiUrl}/outfits/ia-generate`, {
      prompt: this.outfitIAPrompt.trim()
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.closeGenerateOutfitIA();
          this.loadOutfits();
          this.activeTab = 'outfits';
        }
      },
      error: (err) => {
        console.error('Error generando outfit IA:', err);
        this.handleAuthError(err);
        alert(err?.error?.error || 'No se pudo generar el outfit con IA.');
      },
      complete: () => {
        this.generatingOutfitIA = false;
      }
    });
  }

  deleteOutfit(outfitId: number) {
    if (!confirm('¿Quieres borrar este outfit?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/outfits/${outfitId}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.outfits = this.outfits.filter((outfit) => outfit.id !== outfitId);
        }
      },
      error: (err) => {
        console.error('Error al borrar outfit:', err);
        this.handleAuthError(err);
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
