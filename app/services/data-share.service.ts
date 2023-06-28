import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  private unsavedChanges = new BehaviorSubject<boolean>(false);
  unsaved = this.unsavedChanges.asObservable()
  constructor() { }
  changeUnsaved(unsaved: boolean) {
    this.unsavedChanges.next(unsaved);
  }

}


