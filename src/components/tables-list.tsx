import {
  Action,
  ActionPanel,
  getPreferenceValues,
  Icon,
  Keyboard,
  List,
  showToast,
  Toast,
} from '@vicinae/api';
import { useCallback, useEffect, useState } from 'react';
import type { NocoBase, NocoTable, Preferences } from '../types';
import { listTables, tableUrl } from '../utils/nocodb';

interface Props {
  base: NocoBase;
}

export default function TablesList({ base }: Props) {
  const { hostUrl, apiToken } = getPreferenceValues<Preferences>();
  const [tables, setTables] = useState<NocoTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setTables(await listTables(hostUrl, apiToken, base.id));
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Failed to load tables',
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [hostUrl, apiToken, base.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <List
      isLoading={isLoading}
      navigationTitle={base.title}
      searchBarPlaceholder={`Search tables in ${base.title}...`}
    >
      {tables.map((table) => {
        const url = tableUrl(hostUrl, base, table);

        return (
          <List.Item
            key={table.id}
            title={table.title}
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
    </List>
  );
}
