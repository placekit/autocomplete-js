import type { PKOptions, PKResult } from '@placekit/client-js';

export default PlaceKitAutocomplete;
export as namespace PlaceKitAutocomplete;

declare function PlaceKitAutocomplete(apiKey?: string, opts?: PKAOptions): PKAClient;

export type PKAState = {
  dirty: boolean;
  empty: boolean;
  freeForm: boolean;
};

export interface PKAClient {
  readonly input: HTMLInputElement;
  readonly options: PKAOptions;
  configure(opts?: PKOptions): PKAClient;
  on(event: 'open', handler?: PKAHandlers['open']): PKAClient;
  on(event: 'close', handler?: PKAHandlers['close']): PKAClient;
  on(event: 'results', handler?: PKAHandlers['results']): PKAClient;
  on(event: 'pick', handler?: PKAHandlers['pick']): PKAClient;
  on(event: 'error', handler?: PKAHandlers['error']): PKAClient;
  on(event: 'dirty', handler?: PKAHandlers['dirty']): PKAClient;
  on(event: 'empty', handler?: PKAHandlers['empty']): PKAClient;
  on(event: 'freeForm', handler?: PKAHandlers['freeForm']): PKAClient;
  on(event: 'state', handler?: PKAHandlers['state']): PKAClient;
  on(event: 'geolocation', handler?: PKAHandlers['geolocation']): PKAClient;
  readonly handlers: Partial<PKAHandlers>;
  readonly state: PKAState;
  readonly hasGeolocation: boolean;
  requestGeolocation(opts?: Object, cancelUpdate?: boolean): Promise<GeolocationPosition>;
  open(): PKAClient;
  close(): PKAClient;
  clear(): PKAClient;
  destroy(): void;
}

export type PKAHandlers = {
  open: () => void;
  close: () => void;
  results: (query: string, results: PKResult[]) => void;
  pick: (value: string, item: PKResult, index: number) => void;
  error: (error: Object) => void;
  dirty: (dirty: boolean) => void;
  empty: (empty: boolean) => void;
  freeForm: (freeForm: boolean) => void;
  state: (state: PKAState) => void;
  geolocation: (hasGeolocation: boolean, position?: GeolocationPosition) => void;
};

export type PKAOptions = PKOptions & {
  target: string | HTMLInputElement;
  offset?: number;
  template?: (item: PKResult) => string;
  formatValue?: (item: PKResult) => string;
  noResults?: string | ((query: string) => string);
  strategy?: 'absolute' | 'fixed';
  flip?: boolean;
  className?: string;
};