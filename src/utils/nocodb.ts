import type { NocoBase, NocoTable } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

interface Workspace {
  id: string;
}

interface BaseApi {
  id: string;
  title: string;
}

interface TableApi {
  id: string;
  title: string;
}

interface ListResponse<T> {
  list: T[];
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

async function nocoFetch<T>(
  hostUrl: string,
  apiToken: string,
  path: string
): Promise<T> {
  const url = `${trimTrailingSlash(hostUrl)}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'xc-token': apiToken },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(
        `Timed out reaching ${hostUrl}. Check the NocoDB URL preference.`
      );
    }
    throw new Error(
      `Could not reach ${hostUrl}. Check the NocoDB URL preference.`
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid API token');
  }

  if (!response.ok) {
    throw new Error(
      `NocoDB request failed: ${response.status} ${response.statusText} (${path})`
    );
  }

  return (await response.json()) as T;
}

/**
 * The "workspace" segment in a dashboard URL is a routing artifact NocoDB
 * keeps even for a single-workspace self-hosted (OSS) instance, so a single
 * workspace id is fetched once here and attached to every base.
 */
export async function listBases(
  hostUrl: string,
  apiToken: string
): Promise<NocoBase[]> {
  const [{ list: workspaces }, { list: bases }] = await Promise.all([
    nocoFetch<ListResponse<Workspace>>(
      hostUrl,
      apiToken,
      '/api/v2/meta/workspaces'
    ),
    nocoFetch<ListResponse<BaseApi>>(hostUrl, apiToken, '/api/v2/meta/bases/'),
  ]);

  const workspaceId = workspaces[0]?.id;
  if (!workspaceId) {
    throw new Error('No NocoDB workspace found');
  }

  return bases.map((base) => ({ id: base.id, title: base.title, workspaceId }));
}

export async function listTables(
  hostUrl: string,
  apiToken: string,
  baseId: string
): Promise<NocoTable[]> {
  const { list: tables } = await nocoFetch<ListResponse<TableApi>>(
    hostUrl,
    apiToken,
    `/api/v2/meta/bases/${baseId}/tables`
  );

  return tables.map((table) => ({ id: table.id, title: table.title }));
}

/**
 * Bare "<workspace>/<base>[/<table>]" path — no "/dashboard/", "#", or "/v/"
 * prefix, and no view id. A path with a view id has no matching server-side
 * route on this NocoDB version and 404s.
 */
export function baseDashboardUrl(hostUrl: string, base: NocoBase): string {
  return `${trimTrailingSlash(hostUrl)}/${base.workspaceId}/${base.id}`;
}

export function tableUrl(
  hostUrl: string,
  base: NocoBase,
  table: NocoTable
): string {
  return `${trimTrailingSlash(hostUrl)}/${base.workspaceId}/${base.id}/${table.id}`;
}
