import { Component, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../shared/ui/modal.component';
import { Checklist } from '../shared/interfaces/checklist';
import { FormBuilder } from '@angular/forms';
import { FormModalComponent } from '../shared/ui/form-modal.component';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { ChecklistListComponent } from './ui/checklist-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ModalComponent, FormModalComponent, ChecklistListComponent],
  template: `
    <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>

    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="
            checklistBeingEdited()?.title
              ? checklistBeingEdited()!.title!
              : 'Add Checklist'
          "
          [formGroup]="checklistForm"
          (close)="checklistBeingEdited.set(null)"
          (save)="
            checklistBeingEdited()?.id
              ? checklistService.edit$.next({
                  id: checklistBeingEdited()!.id!,
                  data: checklistForm.getRawValue()
                })
              : checklistService.add$.next(checklistForm.getRawValue())
          "
        >
        </app-form-modal>
      </ng-template>
    </app-modal>

    <section>
      <h2>Your checklists</h2>
      <app-checklist-list
        [checklists]="checklistService.checklists()"
        (edit)="checklistBeingEdited.set($event)"
        (delete)="checklistService.remove$.next($event)"
      />
    </section>
  `,
  styles: [
    `
      section h2 {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export default class HomeComponent {
  checklistService = inject(ChecklistService);
  formBuider = inject(FormBuilder);

  checklistBeingEdited = signal<Partial<Checklist> | null>(null);

  checklistForm = this.formBuider.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();

      if (!checklist) {
        this.checklistForm.reset();
      } else {
        this.checklistForm.patchValue({
          title: checklist.title,
        });
      }
    });
  }
}
