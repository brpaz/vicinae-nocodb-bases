import type { NocoBase } from '../types';

interface ListBasesResponse {
  list: NocoBase[];
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export async function listBases(
  hostUrl: string,
  apiToken: string
): Promise<NocoBase[]> {
  const url = `${trimTrailingSlash(hostUrl)}/api/v2/meta/bases/`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'xc-token': apiToken },
      signal: AbortSignal.timeout(8000),
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
      `NocoDB request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as ListBasesResponse;
  return data.list;
}

export function baseDashboardUrl(hostUrl: string, baseId: string): string {
  return `${trimTrailingSlash(hostUrl)}/dashboard/#/base/${baseId}`;
}
