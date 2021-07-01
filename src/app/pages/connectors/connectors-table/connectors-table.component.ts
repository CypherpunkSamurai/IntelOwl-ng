import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { first } from 'rxjs/operators';
import { IRawConnectorConfig } from 'src/app/@core/models/models';
import { ConnectorConfigService } from 'src/app/@core/services/connector-config.service';
import {
  JSONRenderComponent,
  TickCrossExtraRenderComponent,
  TickCrossRenderComponent,
} from 'src/app/@theme/components/smart-table/smart-table';

@Component({
  templateUrl: './connectors-table.component.html',
})
export class ConnectorsTableComponent implements OnInit {
  // ng2-smart-table data source
  tableSource: LocalDataSource = new LocalDataSource();
  showSpinnerBool: boolean = false;

  // ng2-smart-table settings
  settings = {
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      name: {
        title: 'Name',
        filter: false,
      },
      description: {
        title: 'Description',
        filter: false,
      },
      disabled: {
        title: 'Active',
        filter: false,
        type: 'custom',
        valuePrepareFunction: (c, r) => !c, // disabled = !active
        renderComponent: TickCrossRenderComponent,
      },
      config: {
        title: 'Configurations Added',
        filter: false,
        type: 'custom',
        renderComponent: JSONRenderComponent,
      },
      missing_secrets: {
        title: 'Missing Secrets',
        filter: false,
        type: 'custom',
        valuePrepareFunction: (c, r) => r.verification.missing_secrets,
        renderComponent: JSONRenderComponent,
      },
      configured: {
        title: 'Configured',
        filter: false,
        type: 'custom',
        valuePrepareFunction: (c, r) => ({
          tick: r.verification.configured,
          tooltip: r.verification.error_message,
        }),
        renderComponent: TickCrossExtraRenderComponent,
      },
    },
  };

  constructor(private readonly connectorService: ConnectorConfigService) {}

  ngOnInit(): void {
    this.showSpinnerBool = true; // spinner on
    // rxjs/first() -> take first and complete observable
    this.connectorService.rawConnectorConfig$.pipe(first()).subscribe((res) =>
      this.init(res).then(
        () => (this.showSpinnerBool = false) // spinner off
      )
    );
  }

  private init(res: IRawConnectorConfig): Promise<void> {
    const data: any[] = Object.entries(res).map(([key, obj]) => {
      obj.name = key;
      return obj;
    });
    this.tableSource.load(data);
    // default alphabetically sort.
    this.tableSource.setSort([{ field: 'name', direction: 'asc' }]);
    return Promise.resolve();
  }
}
