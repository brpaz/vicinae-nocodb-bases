import {
  Action,
  ActionPanel,
  Cache,
  getPreferenceValues,
  Icon,
  Keyboard,
  List,
  showToast,
  Toast,
} from '@vicinae/api';
import { useCallback, useEffect, useState } from 'react';
import type { NocoTableEntry, Preferences } from './types';
import { listTableEntries, tableViewUrl } from './utils/nocodb';

const CACHE_KEY = 'table-entries';
const cache = new Cache({ ttl: 5 * 60 * 1000 });

function readCachedEntries(): NocoTableEntry[] {
  const cached = cache.get(CACHE_KEY);
  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached) as NocoTableEntry[];
  } catch {
    return [];
  }
}

function groupByBase(entries: NocoTableEntry[]): Map<string, NocoTableEntry[]> {
  const groups = new Map<string, NocoTableEntry[]>();

  for (const entry of entries) {
    const group = groups.get(entry.baseTitle) ?? [];
    group.push(entry);
    groups.set(entry.baseTitle, group);
  }

  return groups;
}

export default function Command() {
  const { hostUrl, apiToken } = getPreferenceValues<Preferences>();
  const [entries, setEntries] = useState<NocoTableEntry[]>(readCachedEntries);
  const [isLoading, setIsLoading] = useState(entries.length === 0);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const fresh = await listTableEntries(hostUrl, apiToken);
      setEntries(fresh);
      cache.set(CACHE_KEY, JSON.stringify(fresh));
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Failed to load tables',
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [hostUrl, apiToken]);

  useEffect(() => {
    load();
  }, [load]);

  const entriesByBase = groupByBase(entries);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search tables...">
      {[...entriesByBase.entries()].map(([baseTitle, tables]) => (
        <List.Section key={baseTitle} title={baseTitle}>
          {tables.map((entry) => {
            const url = tableViewUrl(hostUrl, entry);

            return (
              <List.Item
                key={entry.tableId}
                title={entry.tableTitle}
                icon={Icon.AppWindowList}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open in Browser" url={url} />
                    <Action.CopyToClipboard
                      title="Copy Link"
                      content={url}
                      shortcut={Keyboard.Shortcut.Common.Copy}
                    />
                    <Action
                      title="Refresh"
                      icon={Icon.RotateClockwise}
                      shortcut={Keyboard.Shortcut.Common.Refresh}
                      onAction={load}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}
