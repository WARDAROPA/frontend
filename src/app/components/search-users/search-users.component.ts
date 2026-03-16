import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css']
})
export class SearchUsersComponent implements OnInit {
  searchQuery = '';
  users: (User & { isFollowing: boolean })[] = [];
  loading = false;
  currentUser: User | null = null;
  followingIds = new Set<number>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadFollowing();
  }

  loadFollowing(): void {
    this.userService.getFollowing().subscribe({
      next: (response) => {
        if (response.success) {
          this.followingIds = new Set(response.users.map(user => user.id));
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios seguidos:', error);
      }
    });
  }

  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.users = [];
      return;
    }

    this.loading = true;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.users
            .filter(user => user.id !== this.currentUser?.id)
            .map(user => ({
              ...user,
              isFollowing: this.followingIds.has(user.id)
            }));
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al buscar usuarios:', error);
        this.loading = false;
      }
    });
  }

  followUser(user: User): void {
    this.userService.followUser(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.followingIds.add(user.id);
          this.updateUserFollowingStatus(user.id, true);
          alert('Usuario seguido');
        }
      },
      error: (error) => {
        console.error('Error al seguir usuario:', error);
      }
    });
  }

  unfollowUser(user: User): void {
    this.userService.unfollowUser(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.followingIds.delete(user.id);
          this.updateUserFollowingStatus(user.id, false);
          alert('Usuario dejado de seguir');
        }
      },
      error: (error) => {
        console.error('Error al dejar de seguir usuario:', error);
      }
    });
  }

  private updateUserFollowingStatus(userId: number, isFollowing: boolean): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isFollowing = isFollowing;
    }
  }

  viewProfile(user: User): void {
    this.router.navigate(['/profile', user.id]);
  }
}