import List from '@mui/material/List';
import { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.min.css';
import '@uppy/progress-bar/dist/style.min.css';

import { UploaderFileListItem } from '@mediature/main/src/components/uploader/UploaderFileListItem';
import '@mediature/main/src/components/uploader/drag-drop.scss';

export interface UploaderFileListProps {
  files: UppyFile[];
  onCancel: (file: UppyFile) => void;
  onRemove: (file: UppyFile) => void;
  onRetry: (file: UppyFile) => void;
}

export function UploaderFileList(props: UploaderFileListProps) {
  return (
    <>
      <List dense={true}>
        {props.files.map((file) => {
          const cancel = () => {
            props.onCancel(file);
          };

          const remove = () => {
            props.onRemove(file);
          };

          const retry = () => {
            props.onRetry(file);
          };

          return <UploaderFileListItem key={file.id} file={file} onCancel={cancel} onRemove={remove} onRetry={retry} />;
        })}
      </List>
    </>
  );
}
