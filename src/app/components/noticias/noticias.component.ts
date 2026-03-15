import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { NoticiaService } from '../../services/noticia.service';
import { User } from '../../models/user.model';
import { Noticia } from '../../models/noticia.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {
  currentUser: User | null = null;
  noticias: Noticia[] = [];
  filteredNoticias: Noticia[] = [];
  loadingNoticias = true;
  likeLoadingByNoticia: Record<number, boolean> = {};
  activeFilter: 'todas' | 'n8n' | 'usuario' = 'todas';

  // Create news modal
  showCreateModal = false;
  newTitulo = '';
  newTexto = '';
  newImagen = '';
  selectedFileName = '';

  // Comments modal
  showCommentsModal = false;
  selectedNoticia: Noticia | null = null;
  comments: any[] = [];
  newComment = '';

  // Detail modal
  showDetailModal = false;
  detailNoticia: Noticia | null = null;

  constructor(
    private authService: AuthService,
    private noticiaService: NoticiaService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadNoticias();
  }

  loadNoticias(): void {
    this.loadingNoticias = true;
    const userId = this.currentUser?.id;
    this.noticiaService.getNoticias(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.noticias = response.noticias;
          this.applyFilter();
        }
        this.loadingNoticias = false;
      },
      error: (error) => {
        console.error('Error al cargar noticias:', error);
        this.loadingNoticias = false;
      }
    });
  }

  applyFilter(): void {
    if (this.activeFilter === 'todas') {
      this.filteredNoticias = this.noticias;
    } else {
      this.filteredNoticias = this.noticias.filter(n => n.fuente === this.activeFilter);
    }
  }

  setFilter(filter: 'todas' | 'n8n' | 'usuario'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  // --- Create News ---
  toggleCreateModal(): void {
    this.showCreateModal = !this.showCreateModal;
    if (!this.showCreateModal) {
      this.newTitulo = '';
      this.newTexto = '';
      this.newImagen = '';
      this.selectedFileName = '';
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.newImagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  createNoticia(): void {
    if (!this.currentUser || !this.newTitulo.trim() || !this.newTexto.trim()) {
      alert('Título y texto son obligatorios');
      return;
    }

    this.noticiaService.createNoticia({
      usuario_id: this.currentUser.id,
      titulo: this.newTitulo,
      texto: this.newTexto,
      imagen: this.newImagen || undefined
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.toggleCreateModal();
          this.loadNoticias();
        }
      },
      error: (error) => {
        console.error('Error al crear noticia:', error);
        alert('Error al crear la noticia');
      }
    });
  }

  // --- Detail ---
  openDetail(noticia: Noticia): void {
    this.detailNoticia = noticia;
    this.showDetailModal = true;
    this.loadCommentsForDetail(noticia.id);
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.detailNoticia = null;
    this.comments = [];
    this.newComment = '';
  }

  loadCommentsForDetail(noticiaId: number): void {
    this.noticiaService.getComments(noticiaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.comments = response.comments;
        }
      },
      error: (error) => console.error('Error al cargar comentarios:', error)
    });
  }

  addComment(): void {
    if (!this.currentUser || !this.detailNoticia || !this.newComment.trim()) return;

    this.noticiaService.createComment(this.detailNoticia.id, {
      usuario_id: this.currentUser.id,
      texto: this.newComment
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.newComment = '';
          this.loadCommentsForDetail(this.detailNoticia!.id);
          this.loadNoticias();
        }
      },
      error: (error) => console.error('Error al añadir comentario:', error)
    });
  }

  // --- Like ---
  toggleLike(noticia: Noticia, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.currentUser) return;
    if (this.likeLoadingByNoticia[noticia.id]) return;

    const wasLiked = Boolean(noticia.user_liked);
    this.likeLoadingByNoticia[noticia.id] = true;
    noticia.user_liked = wasLiked ? 0 : 1;
    noticia.likes_count = Math.max(0, Number(noticia.likes_count || 0) + (wasLiked ? -1 : 1));

    if (this.detailNoticia?.id === noticia.id) {
      this.detailNoticia.user_liked = noticia.user_liked;
      this.detailNoticia.likes_count = noticia.likes_count;
    }

    if (wasLiked) {
      this.noticiaService.unlikeNoticia(noticia.id, this.currentUser.id).subscribe({
        error: (error) => {
          noticia.user_liked = 1;
          noticia.likes_count = Number(noticia.likes_count || 0) + 1;
          if (this.detailNoticia?.id === noticia.id) {
            this.detailNoticia.user_liked = noticia.user_liked;
            this.detailNoticia.likes_count = noticia.likes_count;
          }
          console.error('Error al quitar like:', error);
        },
        complete: () => {
          this.likeLoadingByNoticia[noticia.id] = false;
        }
      });
    } else {
      this.noticiaService.likeNoticia(noticia.id, this.currentUser.id).subscribe({
        error: (error) => {
          noticia.user_liked = 0;
          noticia.likes_count = Math.max(0, Number(noticia.likes_count || 0) - 1);
          if (this.detailNoticia?.id === noticia.id) {
            this.detailNoticia.user_liked = noticia.user_liked;
            this.detailNoticia.likes_count = noticia.likes_count;
          }
          console.error('Error al dar like:', error);
        },
        complete: () => {
          this.likeLoadingByNoticia[noticia.id] = false;
        }
      });
    }
  }

  // --- Delete ---
  deleteNoticia(noticia: Noticia, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.currentUser) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return;

    this.noticiaService.deleteNoticia(noticia.id, this.currentUser.id).subscribe({
      next: () => {
        this.loadNoticias();
        if (this.showDetailModal && this.detailNoticia?.id === noticia.id) {
          this.closeDetail();
        }
      },
      error: (error) => console.error('Error al eliminar noticia:', error)
    });
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  truncateText(text: string, maxLength: number = 150): string {
    // Strip HTML tags for the card preview
    const stripped = text.replace(/<[^>]*>/g, '');
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getSafeImageUrl(base64: string): SafeUrl {
    if (!base64) return '';
    // If it already has a data URI prefix, use as-is
    if (base64.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(base64);
    }
    // Otherwise, assume JPEG and add prefix
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + base64);
  }
}
