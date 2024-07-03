import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      🧪 Experiment by <a href="https://twitter.com/edbzn">Edouard Bozon</a>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
