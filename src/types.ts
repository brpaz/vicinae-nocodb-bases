export interface Preferences {
  hostUrl: string;
  apiToken: string;
}

export interface NocoBase {
  id: string;
  title: string;
  workspaceId: string;
}

export interface NocoTable {
  id: string;
  title: string;
}
