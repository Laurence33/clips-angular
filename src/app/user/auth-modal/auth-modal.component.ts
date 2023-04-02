import { ModalService } from './../../services/modal.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent implements OnInit, OnDestroy {
  modalId = 'auth';

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {}

  ngOnDestroy() {
    this.modalService.unregister(this.modalId);
  }
}
