import List from '@mui/material/List';
import { UppyFile } from '@uppy/core';

import { UploaderFileListItem } from '@mediature/main/src/components/uploader/UploaderFileListItem';

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
