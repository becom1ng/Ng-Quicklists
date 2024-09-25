import { Dialog } from '@angular/cdk/dialog';
import {
  Component,
  contentChild,
  effect,
  inject,
  input,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  template: `<div></div> `,
})
export class ModalComponent {
  dialog = inject(Dialog);
  isOpen = input.required<boolean>();
  template = contentChild.required(TemplateRef);

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();

      if (isOpen) {
        this.dialog.open(this.template(), { panelClass: 'dialog-container' });
      } else {
        this.dialog.closeAll();
      }
    });
  }
}
