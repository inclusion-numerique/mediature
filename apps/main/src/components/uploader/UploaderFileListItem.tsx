import { useColors } from '@codegouvfr/react-dsfr/useColors';
import DeleteIcon from '@mui/icons-material/Delete';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ReplayIcon from '@mui/icons-material/Replay';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.min.css';
import '@uppy/progress-bar/dist/style.min.css';
import { useMemo, useRef } from 'react';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';
import { useTranslation } from 'react-i18next';

import '@mediature/main/src/components/uploader/drag-drop.scss';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';

export interface UploaderFileListItemProps {
  file: UppyFile;
  onCancel: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

export function UploaderFileListItem(props: UploaderFileListItemProps) {
  const { t } = useTranslation('common');
  const theme = useColors();

  const itemRef = useRef<HTMLLIElement | null>(null); // This is used to scroll to the error messages

  const { error } = useMemo(() => {
    // Ideally this should be taken from the `upload-error` specific error... but it's unclear how they are formatted (and they are not accessible from `file`)

    let usableError: Error | null = null;

    if (props.file.response && props.file.response.status >= 500) {
      usableError = new Error(`Une erreur s'est produite au moment de transférer ce fichier, vous pouvez retenter le transfert.`);

      itemRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return {
      error: usableError,
    };
  }, [props.file.response]);

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            {props.file.progress && props.file.progress.percentage < 100 ? (
              <>
                <IconButton edge="end" aria-label={`fichier en cours de transmission`} sx={{ ml: 2 }}>
                  {/* TODO: `IconButton` should be `ListItemIcon` here but struggled to make it aligned so leaving it for now */}
                  {/* Sometimes, either because the file is too little or because of server configuration
                  no update of the progress is done. So we consider showing an infinite loader if 0%.

                  Like that if no update will appear until 100% there is a sense of loading, and if there is a progress update
                  the determinate loader should move fast from 0% to get simulate a smooth progress. */}
                  <CircularProgress
                    size={24}
                    aria-label={`fichier en cours de transmission`}
                    {...(props.file.progress.percentage > 0
                      ? {
                          variant: 'determinate',
                          value: props.file.progress.percentage,
                        }
                      : {})}
                  />
                </IconButton>
                <IconButton onClick={props.onCancel} edge="end" aria-label="annuler" sx={{ ml: 2 }}>
                  <HighlightOffIcon />
                </IconButton>
              </>
            ) : (
              <>
                {error && (
                  <IconButton onClick={props.onRetry} edge="end" aria-label="réessayer" sx={{ ml: 2 }}>
                    <ReplayIcon />
                  </IconButton>
                )}
                <IconButton onClick={props.onRemove} edge="end" aria-label="supprimer" sx={{ ml: 2 }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </>
        }
        ref={itemRef}
      >
        <ListItemIcon sx={{ minWidth: 0, width: 30, mr: 2 }}>
          <FileIcon
            fold={true}
            foldColor={theme.decisions.background.contrast.grey.default}
            color={theme.decisions.background.alt.grey.default}
            glyphColor={theme.decisions.border.default.grey.default}
            gradientColor="transparent"
            labelColor={theme.decisions.text.label.blueFrance.default}
            labelTextColor={theme.decisions.background.overlap.grey.default}
            radius={0}
            extension={props.file.extension}
            type={defaultStyles[props.file.extension as DefaultExtensionType]?.type}
          />
        </ListItemIcon>
        <ListItemText
          primary={props.file.name}
          secondary={t('file.size', { size: props.file.size })}
          sx={{
            flexShrink: 0, // Like that if there is an error the block won't compress the filename
          }}
        />
        {error && (
          <ErrorAlert
            errors={[error]}
            sx={{
              ml: 3,
              mr: 7, // Since with an error there is 2 icons in the "absolute area" we adjust manually
            }}
          />
        )}
      </ListItem>
    </>
  );
}
