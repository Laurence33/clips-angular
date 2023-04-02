import { TabComponent } from './../tab/tab.component';
import {
  Component,
  ContentChildren,
  AfterContentInit,
  QueryList,
} from '@angular/core';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs?: QueryList<TabComponent>;

  ngAfterContentInit() {
    let activeTabs = this.tabs?.filter((tab) => tab.active);
    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs!.first);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabs?.forEach((current) => {
      current.active = false;
    });
    tab.active = true;
    return false;
  }

  getClasses(tab: TabComponent) {
    return {
      active: tab.active,
      'hover:text-indigo-400': !tab.active,
      'hover:text-white text-white bg-indigo-400': tab.active,
    };
  }
}
