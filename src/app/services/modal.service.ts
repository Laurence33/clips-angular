import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  public register(id: string) {
    const found = this.getModalById(id);
    if (!found) {
      this.modals.push({
        id,
        visible: false,
      });
      console.log(this.modals);
    }
  }

  isModalOpen(id: string): boolean {
    const modal = this.getModalById(id);
    return !!modal?.visible;
  }

  toggleModal(id: string): void {
    const modal = this.getModalById(id);
    if (modal) {
      modal.visible = !modal.visible;
    }
  }

  private getModalById(id: string) {
    return this.modals.find((modal) => modal.id === id);
  }

  unregister(id: string) {
    this.modals = this.modals.filter((modal) => modal.id !== id);
  }
}
