import { IClip } from 'src/app/models/clip.model';
import { ModalService } from './../../services/modal.service';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() clip: IClip | null = null;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  clipId = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  formGroup: FormGroup = new FormGroup({
    id: this.clipId,
    title: this.title,
  });

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.register('editClip');
  }
  ngOnChanges() {
    if (!this.clip) {
      return;
    }
    this.clipId.setValue(this.clip.id!);
    this.title.setValue(this.clip.title);
  }
  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }
}
