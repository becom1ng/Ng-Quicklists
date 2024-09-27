import { Component, input, output } from '@angular/core';
import { Checklist } from '../../shared/interfaces/checklist';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checklist-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist().title }}
      </h1>
      <div>
        <button (click)="addItem.emit()">Add Item</button>
      </div>
    </header>
  `,
})
export class ChecklistHeaderComponent {
  checklist = input.required<Checklist>();
  addItem = output();
}
