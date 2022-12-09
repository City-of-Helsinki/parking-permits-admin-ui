import { Button, Dialog } from 'hds-react';
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  secondaryMessage?: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleteConfirmation?: boolean;
}

const DIALOG_ID = 'confirm-dialog';
const DIALOG_TITLE_ID = 'confirm-dialog-title';
const DIALOG_DESCRIPTION_ID = 'confirm-dialog-description';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  secondaryMessage,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDeleteConfirmation,
}: ConfirmDialogProps): React.ReactElement => (
  <Dialog
    id={DIALOG_ID}
    aria-labelledby={DIALOG_TITLE_ID}
    aria-describedby={DIALOG_DESCRIPTION_ID}
    isOpen={isOpen}>
    <Dialog.Header id={DIALOG_TITLE_ID} title={title} />
    <Dialog.Content>
      <p id={DIALOG_DESCRIPTION_ID}>{message}</p>
      {secondaryMessage && <p>{secondaryMessage}</p>}
    </Dialog.Content>
    <Dialog.ActionButtons>
      <Button
        variant={isDeleteConfirmation ? 'danger' : 'primary'}
        onClick={() => onConfirm()}>
        {confirmLabel}
      </Button>
      <Button variant="secondary" onClick={() => onCancel()}>
        {cancelLabel}
      </Button>
    </Dialog.ActionButtons>
  </Dialog>
);
export default ConfirmDialog;
