import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { LoadingArea } from '@mediature/main/src/components/LoadingArea';
import { Main, Root, SideDrawer, SidePanel } from '@mediature/main/src/components/messenger/MessengerLayout';
import { MessengerSidePanel } from '@mediature/main/src/components/messenger/MessengerSidePanel';
import { MessengerViewer } from '@mediature/main/src/components/messenger/MessengerViewer';
import { MessageSchemaType } from '@mediature/main/src/models/entities/messenger';
import { centeredAlertContainerGridProps } from '@mediature/main/src/utils/grid';

export const MessengerContext = createContext({
  ContextualMessengerSidePanel: MessengerSidePanel,
  ContextualMessengerViewer: MessengerViewer,
});

export interface MessengerProps {
  caseId: string;
}

export function Messenger(props: MessengerProps) {
  const { ContextualMessengerSidePanel, ContextualMessengerViewer } = useContext(MessengerContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageSchemaType | null>(null);

  const { data, error, isLoading, refetch } = trpc.listMessages.useQuery(
    {
      orderBy: {},
      filterBy: {
        caseIds: [props.caseId],
      },
    },
    {
      onSuccess: (data) => {
        // Update the selected message in case its data has changed
        if (selectedMessage) {
          const updatedMessage = data.messages.find((message) => {
            return message.id === selectedMessage.id;
          });

          setSelectedMessage(updatedMessage || null);
        }
      },
    }
  );

  const messages = useMemo(() => {
    return data?.messages || [];
  }, [data?.messages]);

  // Select the first in the list at init
  useEffect(() => {
    if (!selectedMessage && !!messages && messages.length > 0) {
      setSelectedMessage(messages[0]);
    }
  }, [selectedMessage, messages]);

  if (error) {
    return (
      <Grid container {...centeredAlertContainerGridProps}>
        <ErrorAlert errors={[error]} refetchs={[refetch]} />
      </Grid>
    );
  } else if (isLoading) {
    return <LoadingArea ariaLabelTarget="messagerie du dossier" />;
  }

  return (
    <>
      {drawerOpen && (
        <SideDrawer onClose={() => setDrawerOpen(false)}>
          <ContextualMessengerSidePanel
            caseId={props.caseId}
            messages={messages}
            selectedMessage={selectedMessage}
            onSelectedMessage={setSelectedMessage}
          />
        </SideDrawer>
      )}
      <Root
        sx={{
          ...(drawerOpen
            ? {
                height: '100vh',
                overflow: 'hidden',
              }
            : {
                height: '100%',
              }),
        }}
      >
        <SidePanel>
          <ContextualMessengerSidePanel
            caseId={props.caseId}
            messages={messages}
            selectedMessage={selectedMessage}
            onSelectedMessage={setSelectedMessage}
          />
        </SidePanel>
        <Main>
          <Button
            onClick={(event) => {
              setDrawerOpen(true);
            }}
            size="large"
            variant="contained"
            fullWidth
            sx={{
              display: {
                md: 'none',
              },
              mb: 2,
            }}
          >
            Ouvrir le menu
          </Button>
          {!!selectedMessage && (
            <ContextualMessengerViewer
              caseId={props.caseId}
              message={selectedMessage}
              sx={{
                height: '100%',
                overflow: 'auto',
              }}
            />
          )}
        </Main>
      </Root>
    </>
  );
}
