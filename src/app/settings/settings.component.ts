import { Component, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationSettings } from '@nativescript/core';

@Component({
  selector: 'ns-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SettingsComponent {
  offlineMode = signal<boolean>(false);
  notificationsEnabled = signal<boolean>(true);

  constructor(private router: Router) {
    this.loadSettings();
  }

  loadSettings() {
    this.offlineMode.set(
      ApplicationSettings.getBoolean('offlineMode', false)
    );
    this.notificationsEnabled.set(
      ApplicationSettings.getBoolean('notificationsEnabled', true)
    );
  }

  toggleOfflineMode() {
    const newValue = !this.offlineMode();
    this.offlineMode.set(newValue);
    ApplicationSettings.setBoolean('offlineMode', newValue);
  }

  toggleNotifications() {
    const newValue = !this.notificationsEnabled();
    this.notificationsEnabled.set(newValue);
    ApplicationSettings.setBoolean('notificationsEnabled', newValue);
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}

