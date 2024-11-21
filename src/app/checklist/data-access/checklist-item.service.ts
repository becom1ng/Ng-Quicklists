import {
  effect,
  inject,
  Injectable,
  linkedSignal,
  ResourceStatus,
} from '@angular/core';
import {
  AddChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';
import { Subject } from 'rxjs';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import { StorageService } from '../../shared/data-access/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);

  //sources
  loadedChecklistItems = this.storageService.loadChecklistItems();
  add$ = new Subject<AddChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  checklistRemoved$ = new Subject<RemoveChecklist>();

  // state
  checklistItems = linkedSignal({
    source: this.loadedChecklistItems.value,
    computation: (checklistItems) => checklistItems ?? [],
  });

  constructor() {
    // reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
      this.checklistItems.update((checklistItems) => [
        ...checklistItems,
        {
          ...checklistItem.item,
          id: Date.now().toString(),
          checklistId: checklistItem.checklistId,
          checked: false,
        },
      ])
    );

    this.edit$
      .pipe(takeUntilDestroyed())
      .subscribe((update) =>
        this.checklistItems.update((checklistItems) =>
          checklistItems.map((item) =>
            item.id === update.id ? { ...item, title: update.data.title } : item
          )
        )
      );

    this.remove$
      .pipe(takeUntilDestroyed())
      .subscribe((id) =>
        this.checklistItems.update((checklistItems) =>
          checklistItems.filter((item) => item.id !== id)
        )
      );

    this.toggle$
      .pipe(takeUntilDestroyed())
      .subscribe((checklistItemId) =>
        this.checklistItems.update((checklistItems) =>
          checklistItems.map((item) =>
            item.id === checklistItemId
              ? { ...item, checked: !item.checked }
              : item
          )
        )
      );

    this.reset$
      .pipe(takeUntilDestroyed())
      .subscribe((checklistId) =>
        this.checklistItems.update((checklistItems) =>
          checklistItems.map((item) =>
            item.checklistId === checklistId
              ? { ...item, checked: false }
              : item
          )
        )
      );

    this.checklistRemoved$
      .pipe(takeUntilDestroyed())
      .subscribe((checklistId) =>
        this.checklistItems.update((checklistItems) =>
          checklistItems.filter((item) => item.checklistId !== checklistId)
        )
      );

    // effects
    effect(() => {
      const checklistItems = this.checklistItems();
      if (this.loadedChecklistItems.status() === ResourceStatus.Resolved) {
        this.storageService.saveChecklistItems(checklistItems);
      }
    });
  }
}
