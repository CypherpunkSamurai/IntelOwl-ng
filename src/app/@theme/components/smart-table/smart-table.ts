import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Tag } from 'src/app/@core/models/models';

// Job Status Icon Renderer
@Component({
  selector: 'intelowl-job-status-icon',
  template: `
    <nb-icon
      [nbTooltip]="value"
      [icon]="iconName"
      [status]="iconStatus"
    ></nb-icon>
  `,
})
export class JobStatusIconRenderComponent
  implements ViewCell, OnInit, OnChanges {
  iconName: string;
  iconStatus: string;

  @Input() value: string;
  @Input() rowData: any;

  ngOnInit(): void {
    this.getIconNameStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value.previousValue !== changes.value.currentValue) {
      this.getIconNameStatus();
    }
  }

  private getIconNameStatus(): void {
    const value = this.value.toString().toLowerCase();
    if (
      value === 'true' ||
      value === 'success' ||
      value === 'reported_without_fails'
    ) {
      this.iconName = 'checkmark-circle-2-outline';
      this.iconStatus = 'success';
    } else if (value === 'running' || value === 'pending') {
      this.iconName = 'loader-outline';
      this.iconStatus = 'warning';
    } else if (value === 'reported_with_fails') {
      this.iconName = 'alert-triangle-outline';
      this.iconStatus = 'warning';
    } else if (value === 'killed') {
      this.iconName = 'slash';
      this.iconStatus = 'danger';
    } else {
      this.iconName = 'close-circle-outline';
      this.iconStatus = 'danger';
    }
  }
}

// Tick/Cross Render Component
@Component({
  selector: 'intelowl-tick-cross-render',
  template: `
    <nb-icon *ngIf="iconName" [icon]="iconName" [status]="iconStatus"></nb-icon>
    <span *ngIf="!iconName">{{ value }}</span>
  `,
})
export class TickCrossRenderComponent implements ViewCell, OnInit {
  iconName: string;
  iconStatus: string;

  @Input() value: string;
  @Input() rowData: any;

  ngOnInit() {
    const value = this.value.toString();
    if (value && value === 'true') {
      this.iconName = 'checkmark-circle-2-outline';
      this.iconStatus = 'success';
    } else {
      this.iconName = 'close-circle-outline';
      this.iconStatus = 'danger';
    }
  }
}

// Tick/Cross Extra Render Component
@Component({
  template: `
    <nb-icon
      *ngIf="iconName"
      [icon]="iconName"
      [status]="iconStatus"
      [nbTooltip]="tooltip"
      [nbTooltipStatus]="tooltipStatus"
    ></nb-icon>
    <span *ngIf="!iconName">{{ value }}</span>
  `,
})
export class TickCrossExtraRenderComponent implements ViewCell, OnInit {
  iconName: string;
  iconStatus: string;
  tooltip: string;
  tooltipStatus: string;

  @Input() value: any; // some object
  @Input() rowData: any;

  ngOnInit() {
    const tick = this.value.tick;

    if (tick === true) {
      this.tooltip = 'Ready to use!';
      this.iconName = 'checkmark-circle-2-outline';
      this.iconStatus = 'success';
    } else {
      this.tooltip = this.value.tooltip;
      this.tooltipStatus = 'danger';
      this.iconName = 'close-circle-outline';
      this.iconStatus = 'danger';
    }
  }
}

// View Result Button Component
@Component({
  template: `
    <nb-icon
      style="cursor: pointer;"
      (click)="onRowSelect(rowData.id)"
      icon="external-link-outline"
    ></nb-icon>
  `,
})
export class ViewResultButtonComponent implements ViewCell {
  navUri: string = `/pages/scan/result`;
  @Input() value: number;
  @Input() rowData: any;

  constructor(private router: Router) {}

  async onRowSelect(id) {
    try {
      this.router.navigate([`${this.navUri}/${id}/`]).then();
    } catch (e) {
      console.error(e);
    }
  }
}

// Tags badges Renderer
@Component({
  selector: 'intelowl-job-tags',
  template: `
    <strong
      style="color: white; background-color: {{ tag?.color }};"
      class="p-1 mx-1 badge cursor-pointer"
      (click)="onTagClick.emit(tag)"
      *ngFor="let tag of value"
    >
      {{ tag?.label }}
    </strong>
  `,
})
export class TagsRenderComponent implements ViewCell {
  @Input() value: any; // this will be an array of tag objects
  @Input() rowData: any = null;
  @Output() onTagClick: EventEmitter<Tag> = new EventEmitter();
}

// JSON Object Renderer
@Component({
  selector: 'intelowl-json-render',
  template: `<pre class="text-json">{{ value | json }}</pre>`,
})
export class JSONRenderComponent implements ViewCell {
  @Input() value: any; // some object
  @Input() rowData: any;

  static filterFunction(cell?: any, search?: string): boolean {
    let ans: boolean = false;
    search = search.toLowerCase();
    Object.entries(cell).forEach(([k, v]: [string, string]) => {
      k = k.toString().toLowerCase();
      v = v.toString().toLowerCase();
      if (k.indexOf(search) !== -1 || v.indexOf(search) !== -1) {
        ans = true;
        return;
      }
    });
    return ans;
  }
}

// Plugin Actions (kill/retry)
@Component({
  template: `
    <div class="d-flex justify-content-around">
      <nb-icon
        class="mr-2"
        [ngStyle]="{ cursor: killIconStatus === 'basic' ? 'auto' : 'pointer' }"
        nbTooltip="kill"
        icon="slash"
        [status]="killIconStatus"
        disabled="true"
      ></nb-icon>
      <nb-icon
        [ngStyle]="{ cursor: retryIconStatus === 'basic' ? 'auto' : 'pointer' }"
        nbTooltip="retry"
        icon="refresh-outline"
        [status]="retryIconStatus"
        disabled="true"
      ></nb-icon>
    </div>
  `,
})
export class PluginActionsRenderComponent
  implements ViewCell, OnInit, OnChanges {
  @Input() value: any;
  @Input() rowData: any;

  killIconStatus: string = 'basic'; // disabled
  retryIconStatus: string = 'basic'; // disabled

  ngOnInit(): void {
    this.getIconStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value.previousValue !== changes.value.currentValue) {
      this.getIconStatus();
    }
  }

  private getIconStatus(): void {
    const status = this.rowData['status'].toLowerCase();
    if (status === 'running' || status === 'pending')
      this.killIconStatus = 'warning';
    if (status === 'failed' || status === 'killed')
      this.retryIconStatus = 'success';
  }
}

// Plugin Health Check Button Renderer
@Component({
  template: ` <div *ngIf="!disabled" style="display: inline-grid;">
    <span style="color: {{ statusColor }}; text-align: center;">{{
      statusText
    }}</span>
    <button
      nbButton
      [disabled]="true"
      (click)="onClick($event)"
      class="mt-2"
      size="tiny"
      status="primary"
    >
      Check
    </button>
  </div>`,
})
export class PluginHealthCheckButtonRenderComponent
  implements ViewCell, OnInit, OnChanges {
  @Input() value: any;
  @Input() rowData: any;

  @Output() emitter: EventEmitter<any> = new EventEmitter();

  statusText: string;
  statusColor: string;
  disabled: boolean;

  ngOnInit(): void {
    this.getIconStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value.previousValue !== changes.value.currentValue) {
      this.getIconStatus();
    }
  }

  private getIconStatus(): void {
    this.disabled = this.value.disabled;
    if (this.value.status === true) {
      this.statusText = 'healthy';
      this.statusColor = '#29D68F';
    } else if (this.value.status === false) {
      this.statusText = 'failing';
      this.statusColor = '#FC3D71';
    } else if (this.value.status === null) {
      this.statusText = 'unknown';
      this.statusColor = 'grey';
    }
  }

  onClick(e) {
    this.emitter.emit(this.rowData);
  }
}

// TLP Render Component
export const tlpColors = {
  WHITE: '#FFFFFF',
  GREEN: '#33FF00',
  AMBER: '#FFC000',
  RED: '#FF0033',
};
@Component({
  template: `
    <nb-tag
      size="tiny"
      status="basic"
      appearance="outline"
      [text]="value"
      [ngStyle]="{ color: tlpColors[value] }"
    ></nb-tag>
  `,
})
export class TLPRenderComponent implements ViewCell {
  @Input() value: string;
  @Input() rowData: any;

  tlpColors = tlpColors;
}

// Component to render the `secrets` dict
@Component({
  selector: 'intelowl-secrets-dict-render',
  template: `
    <div>
      <ul class="p-1" *ngIf="isConfigValid()">
        <li
          *ngFor="let secret of value | keyvalue; trackBy: trackByFn"
          [nbTooltip]="secret.value.description"
        >
          {{ secret.key }}
          &nbsp;
          <small class="text-muted"
            >({{ secret.value.env_var_key }}: <em>{{ secret.value.type }}</em
            >)</small
          >
        </li>
      </ul>
      <span *ngIf="!isConfigValid()" class="font-italic text-muted">null</span>
    </div>
  `,
})
export class SecretsDictCellComponent implements ViewCell {
  @Input() value: any;
  @Input() rowData: any;

  isConfigValid = () => Object.keys(this.value).length;
  trackByFn = (_index, item) => item.key;
}

// Component to render a list
@Component({
  template: `<ul class="p-1">
    <li *ngFor="let secret of value">
      {{ secret }}
    </li>
  </ul>`,
})
export class ListCellComponent implements ViewCell {
  @Input() value: any;
  @Input() rowData: any;
}

// Component to render the `description` dict
@Component({
  template: `<div>
    <small [innerHTML]="urlifiedDescription"></small>
  </div>`,
})
export class DescriptionRenderComponent implements ViewCell {
  @Input() value: string;
  @Input() rowData: any;

  get urlifiedDescription(): string {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return this.value.replace(
      urlRegex,
      (url) => `<a target="_blank"  href="${url}">${url}</a>`
    );
  }
}

// Component to render card with plugin info
@Component({
  template: `<div>
    <nb-icon
      nbPopoverTrigger="hover"
      nbPopoverPlacement="top"
      [nbPopover]="templateRef"
      icon="info-outline"
      status="primary"
      class="d-flex justify-content-center mx-auto"
    ></nb-icon>
    <ng-template #templateRef>
      <nb-card class="bg-dark mb-0">
        <nb-card-header>
          <span>{{ rowData?.name }} </span>
          <code class="font-italic small">
            ( {{ rowData?.python_module }} )
          </code>
        </nb-card-header>
        <nb-card-body>
          <div>
            <h6>Description</h6>
            <p [innerHTML]="urlifiedDescription"></p>
          </div>
          <div>
            <h6>Configuration Parameters</h6>
            <intelowl-json-render
              [rowData]="rowData"
              [value]="rowData?.config"
            ></intelowl-json-render>
          </div>
          <div>
            <h6>Secrets</h6>
            <intelowl-secrets-dict-render
              [rowData]="rowData"
              [value]="rowData?.secrets"
            ></intelowl-secrets-dict-render>
          </div>
          <div>
            <h6>
              Verification
              <intelowl-tick-cross-render
                [value]="rowData?.verification?.configured"
                [rowData]="rowData"
              ></intelowl-tick-cross-render>
            </h6>
            <div
              *ngIf="rowData?.verification?.error_message"
              class="text-danger"
            >
              {{ rowData?.verification?.error_message }}
            </div>
          </div>
        </nb-card-body>
      </nb-card>
    </ng-template>
  </div>`,
})
export class TooltipOnCellHoverComponent implements ViewCell {
  @Input() value: any;
  @Input() rowData: any;

  get urlifiedDescription(): string {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return this.rowData?.description.replace(
      urlRegex,
      (url) => `<a target="_blank" href="${url}">${url}</a>`
    );
  }
}
