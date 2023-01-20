import { Button } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import * as React from 'react';

export interface AskConfirmationDemoProps {}

export const AskConfirmationDemo = (props: AskConfirmationDemoProps) => {
  const askConfirmation = useConfirm();

  const onClick = async () => {
    try {
      await askConfirmation({});
    } catch (e) {
      return;
    }

    // Do the operation you want...
  };

  return (
    <Button onClick={onClick} variant="contained">
      Afficher la demande de confirmation
    </Button>
  );
};
