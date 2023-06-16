import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';
  userClips$: Observable<IClip[]>;
  currentClip: IClip | null = null;
  sort$: BehaviorSubject<string>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject<string>('1');
    this.userClips$ = this.clipService.getUserClips(this.sort$);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
      this.sort$.next(this.videoOrder);
    });
  }
  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;
    // this.router.navigateByUrl(`/manage?sort=${value}`);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }
  openModal(event: Event, clip: IClip) {
    event.preventDefault();
    this.currentClip = clip;
    this.modalService.toggleModal('editClip');
  }

  async deleteClip(event: Event, clip: IClip) {
    event.preventDefault();
    if (await this.clipService.deleteClip(clip)) {
      console.log('delete success');
    } else {
      console.log('delete error');
    }
  }
}
