import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      🧪 Experiment by
      <a href="https://twitter.com/edbzn">Edouard Bozon</a> using
      <img src="https://raw.githubusercontent.com/nrwl/nx/master/nx-logo.png" />
      +
      <img src="https://assets.rspack.dev/rspack/rspack-logo.svg" />
      +
      <img
        src="https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif"
      />
      +
      <img src="https://module-federation.io/svg.svg" />
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
