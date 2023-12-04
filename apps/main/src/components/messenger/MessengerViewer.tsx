import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ForwardToInboxRoundedIcon from '@mui/icons-material/ForwardToInboxRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { EventEmitter } from 'eventemitter3';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { Avatar } from '@mediature/main/src/components/Avatar';
import { ErrorAlert } from '@mediature/main/src/components/ErrorAlert';
import { FileList } from '@mediature/main/src/components/FileList';
import { LexicalRenderer } from '@mediature/main/src/components/LexicalRenderer';
import { MessengerSender } from '@mediature/main/src/components/messenger/MessengerSender';
import { useSingletonErrorDialog } from '@mediature/main/src/components/modal/useModal';
import { BusinessError } from '@mediature/main/src/models/entities/errors';
import { MessageSchemaType } from '@mediature/main/src/models/entities/messenger';

export const MessengerViewerContext = createContext({
  ContextualMessengerSender: MessengerSender,
});

export interface MessengerViewerProps {
  caseId: string;
  message: MessageSchemaType;
  sx?: PaperProps['sx'];
}

export function MessengerViewer({ caseId, message, sx }: MessengerViewerProps) {
  const { ContextualMessengerSender } = useContext(MessengerViewerContext);
  const { t } = useTranslation('common');
  const { showErrorDialog } = useSingletonErrorDialog();

  const updateMessageMetadata = trpc.updateMessageMetadata.useMutation();

  const [senderModalEventEmitter, setSenderModalEventEmitter] = useState<EventEmitter>(() => new EventEmitter());

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        ...(sx || {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} data-sentry-mask>
          <Avatar fullName={message.from.name || message.from.email} size={40} />
          <Box
            sx={{
              ml: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                textColor: 'text.primary',
                mb: 0.5,
              }}
            >
              {message.from.name || message.from.email}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textColor: 'text.tertiary',
              }}
            >
              {t('date.longWithTime', { date: message.createdAt })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', height: '32px', flexDirection: 'row', gap: 2 }}>
          {message.consideredAsProcessed !== null && (
            <Button
              onClick={async () => {
                try {
                  await updateMessageMetadata.mutateAsync({
                    caseId: caseId,
                    messageId: message.id,
                    markAsProcessed: !message.consideredAsProcessed,
                  });
                } catch (error) {
                  showErrorDialog({
                    description: <>Une erreur est survenue au moment de changer le statut du message.</>,
                    error: error as unknown as Error,
                  });

                  // If not a `BusinessError` nor an error coming from the server (that should have been already reported from there), forward it as unexpected
                  if (!(error instanceof BusinessError) && !(error instanceof Error && error.name === 'TRPCClientError')) {
                    throw error;
                  }
                }
              }}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={message.consideredAsProcessed ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            >
              Traité
            </Button>
          )}
          <ContextualMessengerSender
            caseId={caseId}
            eventEmitter={senderModalEventEmitter}
            prefillRecipients={[message.from]}
            prefillSubject={message.subject}
          />
          <Button
            onClick={(event) => {
              senderModalEventEmitter.emit('click', event);
            }}
            variant="outlined"
            color="primary"
            size="small"
          >
            Répondre
          </Button>
        </Box>
      </Box>
      <Divider variant="fullWidth" sx={{ p: 0, mt: 2 }} />
      <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography
          variant="h5"
          sx={{
            textColor: 'text.primary',
          }}
          data-sentry-mask
        >
          {message.subject}
        </Typography>
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              component="span"
              variant="body2"
              sx={{
                textColor: 'text.secondary',
                mr: 1,
                display: 'inline-block',
              }}
            >
              De
            </Typography>
            <Chip label={message.from.email} size="small" variant="outlined" data-sentry-mask />
          </Box>
          <Box>
            <Typography
              component="span"
              variant="body2"
              sx={{
                textColor: 'text.secondary',
                mr: 1,
                display: 'inline-block',
              }}
            >
              à
            </Typography>
            {message.to.map((recipient) => {
              return <Chip key={recipient.id} label={recipient.email} size="small" variant="outlined" sx={{ mr: 1 }} data-sentry-mask />;
            })}
          </Box>
        </Box>
      </Box>
      <Divider variant="fullWidth" sx={{ p: 0 }} />
      <Box sx={{ py: 2 }} data-sentry-mask>
        {message.errors.length > 0 && (
          <ErrorAlert
            errors={message.errors.map((error) => {
              return new Error(t(`file.error.enum.${error}`));
            })}
            sx={{ mb: 2 }}
          />
        )}
        <LexicalRenderer inlineEditorState={message.content} />
      </Box>
      {message.attachments && message.attachments.length > 0 && (
        <>
          <Divider variant="fullWidth" sx={{ p: 0 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'md',
              textColor: 'text.primary',
              mt: 2,
              mb: 2,
            }}
          >
            {t('file.attachment', { count: message.attachments.length })}
          </Typography>
          <FileList files={message.attachments} onRemove={async (file) => {}} readonly />
        </>
      )}
    </Paper>
  );
}
