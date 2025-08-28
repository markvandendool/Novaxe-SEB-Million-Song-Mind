import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openApp(appType: string, event?: Event) {
    const routes: { [key: string]: string } = {
      'obsidian': '/home',
      'msm': '/score/new_score',
      'chordcubes': '/chord-detect',
      'unity': '/learn-fifths',
      'sales': '/home',
      'demo': '/score/new_score'  // Direct to new score bypassing credentials
    };

    const route = routes[appType] || '/home';

    // Add loading animation effect
    if (event) {
      const button = (event.target as Element)?.closest('button') || (event.target as Element)?.closest('.platform-card');
      if (button) {
        (button as HTMLElement).style.transform = 'scale(0.95)';
        setTimeout(() => {
          (button as HTMLElement).style.transform = '';
        }, 150);
      }
    }

    // Navigate to route with delay for animation
    setTimeout(() => {
      this.router.navigate([route]);
    }, 200);
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const target = document.querySelector(`#${sectionId}`);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  toggleMobileMenu() {
    const nav = document.querySelector('.nav-links') as HTMLElement;
    if (nav) {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
  }
}
