import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

import { FileIcon } from '@mediature/main/src/components/FileIcon';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';

import { UiAttachmentSchemaType } from '../models/entities/attachment';

// We built this list manually because there is no way to know what the current browser would support
const contentTypesViewableInBrowser: string[] = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'audio/mpeg',
  'video/mp4',
  'video/mpeg',
  'image/png',
  'application/pdf',
  'image/svg+xml',
  'image/svg',
  'text/plain',
  'audio/wav',
  'audio/webm',
  'video/webm',
  'image/webp',
];

export interface FileListItemProps {
  file: UiAttachmentSchemaType;
  onRemove: () => Promise<void>;
  readonly?: boolean;
}

export function FileListItem(props: FileListItemProps) {
  const { t } = useTranslation('common');

  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const isViewable: boolean = props.file.contentType ? contentTypesViewableInBrowser.includes(props.file.contentType) : false;
  const readonly: boolean = props.readonly || false;

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            {/* Didn't find a proper and simple solution to keep IconButton aspect with Link as same time... so maybe not perfect for accessibility */}
            {isViewable && (
              <Link
                component={Link}
                href={props.file.url}
                target="_blank"
                sx={{
                  ml: 2,
                  backgroundImage: 'none !important',
                  '&::after': {
                    display: 'none !important',
                  },
                }}
              >
                <IconButton edge="end" aria-label="visualiser">
                  <VisibilityIcon />
                </IconButton>
              </Link>
            )}
            <Link
              component={Link}
              href={props.file.url}
              // Forcing download only works when serving files from the same domain (so it won't work in Storybook for example)
              // If you encounter issues in other situations, we could try to change the `Content-Disposition` from the frontend with `attachment`
              // To do so... maybe we should append a query parameter for this? like `?download`?
              download
              sx={{
                backgroundImage: 'none !important',
                ml: 2,
              }}
            >
              <IconButton edge="end" aria-label="télécharger">
                <DownloadIcon />
              </IconButton>
            </Link>
            {!readonly && (
              <IconButton
                onClick={async () => {
                  showConfirmationDialog({
                    description: (
                      <>
                        {props.file.name ? (
                          <>
                            Êtes-vous sûr de vouloir supprimer le fichier{' '}
                            <Typography component="span" sx={{ fontWeight: 'bold' }} data-sentry-mask>
                              {props.file.name}
                            </Typography>{' '}
                            ?
                          </>
                        ) : (
                          <>Êtes-vous sûr de vouloir supprimer ce fichier ?</>
                        )}
                      </>
                    ),
                    onConfirm: async () => {
                      await props.onRemove();
                    },
                  });
                }}
                edge="end"
                aria-label="supprimer"
                sx={{ ml: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </>
        }
      >
        {!!props.file.contentType && (
          <ListItemIcon className="disabledA11y" sx={{ minWidth: 0, width: 30, mr: 2 }}>
            <FileIcon contentType={props.file.contentType || undefined} />
          </ListItemIcon>
        )}
        <ListItemText
          primary={props.file.name || 'Nom du fichier inconnu'}
          secondary={!!props.file.size ? t('file.size', { size: props.file.size }) : undefined}
          sx={{
            flexShrink: 0, // Like that if there is an error the block won't compress the filename
          }}
          data-sentry-mask
        />
      </ListItem>
    </>
  );
}
