import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChecklistHeaderComponent } from './ui/checklist-header.component';
import { ChecklistItemService } from './data-access/checklist-item.service';
import { FormBuilder } from '@angular/forms';
import { ChecklistItem } from '../shared/interfaces/checklist-item';
import { ModalComponent } from '../shared/ui/modal.component';
import { FormModalComponent } from '../shared/ui/form-modal.component';
import { ChecklistItemListComponent } from './ui/checklist-item-list.component';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ],
  template: `
    @if (checklist(); as checklist) {
    <app-checklist-header
      [checklist]="checklist"
      [totalItems]="items().length"
      [completedItems]="completedItems()"
      (resetChecklist)="checklistItemService.reset$.next($event)"
      (addItem)="checklistItemBeingEdited.set({})"
    />
    }

    <app-checklist-item-list
      [checklistItems]="items()"
      (edit)="checklistItemBeingEdited.set($event)"
      (delete)="checklistItemService.remove$.next($event)"
      (toggle)="checklistItemService.toggle$.next($event)"
    />

    <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <app-form-modal
          title="Create Item"
          [formGroup]="checklistItemForm"
          (close)="checklistItemBeingEdited.set(null)"
          (save)="
            checklistItemBeingEdited()?.id
            ? checklistItemService.edit$.next({
              id: checklistItemBeingEdited()!.id!,
              data: checklistItemForm.getRawValue(),
            })
            : checklistItemService.add$.next({
              item: checklistItemForm.getRawValue(),
              checklistId: checklist()?.id!,
            })
          "
        ></app-form-modal>
      </ng-template>
    </app-modal>
  `,
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id'))
  );

  items = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  completedItems = computed(
    () => this.items().filter((item) => item.checked === true).length
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if (!checklistItem) {
        this.checklistItemForm.reset();
      } else {
        this.checklistItemForm.patchValue({
          title: checklistItem.title,
        });
      }
    });
  }
}
