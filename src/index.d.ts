import type { PKOptions, PKResult } from '@placekit/client-js';

export default PlaceKitAutocomplete;
export as namespace PlaceKitAutocomplete;

declare function PlaceKitAutocomplete(apiKey?: string, opts?: PKAOptions): PKAClient;

export type PKAState = {
  dirty: boolean;
  empty: boolean;
  freeForm: boolean;
  geolocation: boolean;
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
  on(event: 'geolocation', handler?: PKAHandlers['geolocation']): PKAClient;
  on(event: 'state', handler?: PKAHandlers['state']): PKAClient;
  readonly handlers: Partial<PKAHandlers>;
  readonly state: PKAState;
  requestGeolocation(opts?: Object, cancelUpdate?: boolean): Promise<GeolocationPosition>;
  open(): PKAClient;
  close(): PKAClient;
  clear(): PKAClient;
  setValue(
    value?: string | null,
    opts?: { notify?: boolean, focus?: boolean },
    state?: Partial<PKAState>
  ): PKAClient;
  destroy(): void;
}

export type PKAHandlers = {
  open: () => void;
  close: () => void;
  results: (query: string, results: PKResult[]) => void;
  pick: (value: string, item: PKResult, index: number) => void;
  error: (error: Object) => void;
  dirty: (bool: boolean) => void;
  empty: (bool: boolean) => void;
  freeForm: (bool: boolean) => void;
  geolocation: (bool: boolean, position?: GeolocationPosition) => void;
  state: (state: PKAState) => void;
};

export type PKAOptions = PKOptions & {
  target: string | HTMLInputElement;
  offset?: number;
  template?: (item: PKResult) => string;
  formatValue?: (item: PKResult) => string;
  noResults?: string | ((query: string) => string);
  strategy?: 'absolute' | 'fixed';
  flip?: boolean;
  countryAutoFill?: boolean;
  className?: string;
};