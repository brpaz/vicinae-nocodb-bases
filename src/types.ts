export interface Preferences {
  hostUrl: string;
  apiToken: string;
}

export interface NocoTableEntry {
  workspaceId: string;
  baseId: string;
  baseTitle: string;
  tableId: string;
  tableTitle: string;
  viewId: string;
}
