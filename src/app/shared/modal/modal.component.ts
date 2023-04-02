import { ModalService } from './../../services/modal.service';
import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() modalId: string = '';

  constructor(public modalService: ModalService, public el: ElementRef) {}

  ngOnInit() {
    this.modalService.register(this.modalId);
    console.log(this.el);
    document.body.appendChild(this.el.nativeElement);
  }

  isModalOpen() {
    return this.modalService.isModalOpen(this.modalId);
  }

  closeModal() {
    if (this.modalService.isModalOpen(this.modalId)) {
      this.modalService.toggleModal(this.modalId);
    }
  }
}
