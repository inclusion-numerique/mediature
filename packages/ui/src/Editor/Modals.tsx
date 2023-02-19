import { INSERT_TABLE_COMMAND } from '@lexical/table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { LexicalEditor } from 'lexical';
import { useCallback, useState } from 'react';

import { INSERT_IMAGE_COMMAND, InsertImagePayload } from './plugins/ImagesPlugin';
import KatexRenderer from './ui/KatexRenderer';

export interface InsertEquationModalProps {
  onConfirm: (equation: string, inline: boolean) => void;
  onClose: () => void;
}

export function InsertEquationModal({ onConfirm, onClose }: InsertEquationModalProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const [equation, setEquation] = useState<string>('');
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Insérer une équation</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <FormControl>
                <FormControlLabel label="Activer l'équation sur plusieurs lignes" control={<Checkbox onChange={onCheckboxChange} />} />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                multiline={!inline}
                label="Équation"
                onChange={(event) => {
                  setEquation(event.target.value);
                }}
                fullWidth
              />
            </Grid>
            {!!equation.length && (
              <Grid item xs={12}>
                <DialogContentText>Rendu final</DialogContentText>
                <KatexRenderer equation={equation} inline={false} onClick={() => null} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              onClick();
              handleClose();
            }}
          >
            Insérer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export interface InsertTableModalProps {
  activeEditor: LexicalEditor;
  onClose: () => void;
}

export function InsertTableModal({ activeEditor, onClose }: InsertTableModalProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const [rows, setRows] = useState('5');
  const [columns, setColumns] = useState('5');

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows });
    onClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Insérer un tableau</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                type="number"
                label="Nombre de lignes"
                value={rows}
                onChange={(event) => {
                  setRows(event.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="number"
                label="Nombre de colonnes"
                value={columns}
                onChange={(event) => {
                  setColumns(event.target.value);
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              onClick();
              handleClose();
            }}
          >
            Insérer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export interface InsertImageModalProps {
  activeEditor: LexicalEditor;
  onClose: () => void;
}

export function InsertImageModal({ activeEditor, onClose }: InsertImageModalProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const [src, setSrc] = useState('');
  const [altText, setAltText] = useState('');

  const isDisabled = src === '';

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Insérer une image depuis une URL</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="URL de l'image"
                value={src}
                onChange={(event) => {
                  setSrc(event.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Texte alternatif"
                value={altText}
                onChange={(event) => {
                  setAltText(event.target.value);
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              onClick({ altText, src });
              handleClose();
            }}
          >
            Insérer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
