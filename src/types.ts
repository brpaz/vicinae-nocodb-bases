export interface NocoBase {
  id: string;
  title: string;
  description?: string;
}

export interface Preferences {
  hostUrl: string;
  apiToken: string;
}
