import { ModalService } from './../services/modal.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  private modalId: string = 'auth';

  constructor(public modalService: ModalService, public authService: AuthService) {}

  ngOnInit(): void {}

  openModal($event: Event) {
    $event.preventDefault();
    this.modalService.toggleModal(this.modalId);
  }

  async logout(event: Event){
    event.preventDefault();
    await this.authService.logout();
  }
}
