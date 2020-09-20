import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IAnalyzersList, IRawAnalyzerConfig } from '../models/models';
import { saved_analyzer_config_json } from 'src/assets/analyzers_list';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerConfigService {
  public rawAnalyzerConfig: IRawAnalyzerConfig = {};
  private _analyzersList$: ReplaySubject<IAnalyzersList> = new ReplaySubject(1);

  constructor() {
    this.init().then();
  }

  get analyzersList$() {
    return this._analyzersList$.asObservable();
  }

  private async init(): Promise<void> {
    try {
      this.rawAnalyzerConfig = saved_analyzer_config_json;
      this.makeAnalyzersList();
    } catch (e) {
      console.error(e);
    }
  }

  private makeAnalyzersList(): void {
    const analyzers: IAnalyzersList = {
      ip: [],
      hash: [],
      domain: [],
      url: [],
      file: [],
    };

    Object.entries(this.rawAnalyzerConfig).forEach(([key, obj]) => {
      if (obj['type'] === 'file') {
        analyzers['file'].push(key);
        if (obj['run_hash']) {
          analyzers['hash'].push(key);
        }
      } else {
        if (obj['observable_supported'].includes('ip')) {
          analyzers['ip'].push(key);
        }
        if (obj['observable_supported'].includes('url')) {
          analyzers['url'].push(key);
        }
        if (obj['observable_supported'].includes('domain')) {
          analyzers['domain'].push(key);
        }
        if (obj['observable_supported'].includes('hash')) {
          analyzers['hash'].push(key);
        }
      }
    });
    this._analyzersList$.next(analyzers);
  }

  constructTableData(): any[] {
    return Object.entries(this.rawAnalyzerConfig).map(([key, obj]) => {
      obj['name'] = key;
      if (obj.hasOwnProperty('observable_supported')) {
        obj['supports'] = obj['observable_supported'];
      } else {
        obj['supports'] = obj['supported_filetypes'];
      }
      if (!obj.hasOwnProperty('external_service')) {
        obj['external_service'] = false;
      }
      if (!obj.hasOwnProperty('requires_configuration')) {
        obj['requires_configuration'] = false;
      }
      if (!obj.hasOwnProperty('leaks_info')) {
        obj['leaks_info'] = false;
      }
      return obj;
    });
  }
}
