import type { NocoTableEntry } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

interface Workspace {
  id: string;
}

interface Base {
  id: string;
  title: string;
}

interface Table {
  id: string;
  title: string;
}

interface View {
  id: string;
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
 * Flattens every table across every base into one searchable list, each
 * carrying its default view's id — the "workspace" segment in a dashboard
 * URL is a routing artifact NocoDB keeps even for a single-workspace
 * self-hosted (OSS) instance, so a single workspace id is fetched once and
 * applied to every base/table (no per-base workspace lookup needed here).
 */
export async function listTableEntries(
  hostUrl: string,
  apiToken: string
): Promise<NocoTableEntry[]> {
  const [{ list: workspaces }, { list: bases }] = await Promise.all([
    nocoFetch<ListResponse<Workspace>>(
      hostUrl,
      apiToken,
      '/api/v2/meta/workspaces'
    ),
    nocoFetch<ListResponse<Base>>(hostUrl, apiToken, '/api/v2/meta/bases/'),
  ]);

  const workspaceId = workspaces[0]?.id;
  if (!workspaceId) {
    throw new Error('No NocoDB workspace found');
  }

  const entriesByBase = await Promise.all(
    bases.map(async (base) => {
      const { list: tables } = await nocoFetch<ListResponse<Table>>(
        hostUrl,
        apiToken,
        `/api/v2/meta/bases/${base.id}/tables`
      );

      const entries = await Promise.all(
        tables.map(async (table): Promise<NocoTableEntry | null> => {
          const { list: views } = await nocoFetch<ListResponse<View>>(
            hostUrl,
            apiToken,
            `/api/v2/meta/tables/${table.id}/views`
          );
          const defaultView = views[0];
          if (!defaultView) {
            return null;
          }

          return {
            workspaceId,
            baseId: base.id,
            baseTitle: base.title,
            tableId: table.id,
            tableTitle: table.title,
            viewId: defaultView.id,
          };
        })
      );

      return entries.filter((entry): entry is NocoTableEntry => entry !== null);
    })
  );

  return entriesByBase.flat();
}

export function tableViewUrl(hostUrl: string, entry: NocoTableEntry): string {
  return `${trimTrailingSlash(hostUrl)}/dashboard/#/v/${entry.workspaceId}/${entry.baseId}/${entry.tableId}/${entry.viewId}/`;
}
