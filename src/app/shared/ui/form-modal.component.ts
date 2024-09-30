import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, KeyValuePipe, TitleCasePipe],
  template: `
    <header>
      <h2>{{ title() }}</h2>
      <button (click)="close.emit()">close</button>
    </header>
    <section>
      <form [formGroup]="formGroup()" (ngSubmit)="save.emit(); close.emit()">
        @for (control of (formGroup().controls | keyvalue); track control.key) {
        <div>
          <label [for]="control.key">{{ control.key | titlecase }}</label>
          <input
            [id]="control.key"
            type="text"
            [formControlName]="control.key"
          />
        </div>
        }
        <button type="submit">Save</button>
      </form>
    </section>
  `,
  styles: [
    `
      label {
        font-size: 1.25rem;
        font-weight: 600;
        margin-right: 1rem;
      }
      input {
        margin-bottom: 1rem;
        padding: 0.5rem;
      }
    `,
  ],
})
export class FormModalComponent {
  formGroup = input.required<FormGroup>();
  title = input.required<string>();
  save = output();
  close = output();
}
