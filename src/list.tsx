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
import type { NocoBase, Preferences } from './types';
import { baseDashboardUrl, listBases } from './utils/nocodb';

export default function Command() {
  const { hostUrl, apiToken } = getPreferenceValues<Preferences>();
  const [bases, setBases] = useState<NocoBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setBases(await listBases(hostUrl, apiToken));
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Failed to load bases',
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [hostUrl, apiToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search bases...">
      {bases.map((base) => {
        const url = baseDashboardUrl(hostUrl, base.id);

        return (
          <List.Item
            key={base.id}
            title={base.title}
            // The native renderer rejects an explicit "subtitle": null (vs.
            // the key being absent), which is what subtitle={undefined}
            // serializes to — so this prop must be omitted entirely, not
            // just passed an undefined value, when there's no description.
            {...(base.description ? { subtitle: base.description } : {})}
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
