import { useContext } from 'react';

import { ConfirmationDialog, ConfirmationDialogProps } from '@mediature/main/src/components/ConfirmationDialog';
import { ErrorDialog, ErrorDialogProps } from '@mediature/main/src/components/ErrorDialog';
import { ModalContext } from '@mediature/main/src/components/modal/ModalContext';

export const useSingletonModal = () => {
  return useContext(ModalContext);
};

export type ShowConfirmationDialogProps = Pick<ConfirmationDialogProps, 'title' | 'description' | 'onConfirm' | 'onCancel'>;

export const useSingletonConfirmationDialog = () => {
  const { showModal } = useSingletonModal();

  return {
    showConfirmationDialog(confirmationDialogProps: ShowConfirmationDialogProps) {
      showModal((modalProps) => {
        return <ConfirmationDialog {...modalProps} {...confirmationDialogProps} />;
      });
    },
  };
};

export type ShowErrorDialogProps = Pick<ErrorDialogProps, 'title' | 'description' | 'error'>;

export const useSingletonErrorDialog = () => {
  const { showModal } = useSingletonModal();

  return {
    showErrorDialog(errorDialogProps: ShowErrorDialogProps) {
      showModal((modalProps) => {
        return <ErrorDialog {...modalProps} {...errorDialogProps} />;
      });
    },
  };
};
