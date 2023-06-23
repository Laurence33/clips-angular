import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
})
export class ClipComponent implements OnInit {
  id: string = '';
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // this.id = this.route.snapshot.params['id'];
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
    });
  }
}
