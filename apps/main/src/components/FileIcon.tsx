import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { DefaultExtensionType, FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';

import { getExtensionsFromMime } from '@mediature/main/src/utils/attachment';

export interface FileIconProps {
  extension?: string;
  contentType?: string;
}

export function FileIcon({ extension, contentType }: FileIconProps) {
  const theme = useColors();

  if (!extension && contentType) {
    const potentialExtensions = getExtensionsFromMime(contentType);

    extension = potentialExtensions[0] || '';
  } else if (!extension) {
    extension = '';
  }

  return (
    <>
      <ReactFileIcon
        fold={true}
        foldColor={theme.decisions.background.contrast.grey.default}
        color={theme.decisions.background.alt.grey.default}
        glyphColor={theme.decisions.border.default.grey.default}
        gradientColor="transparent"
        labelColor={theme.decisions.text.label.blueFrance.default}
        labelTextColor={theme.decisions.background.overlap.grey.default}
        radius={0}
        extension={extension}
        type={defaultStyles[extension as DefaultExtensionType]?.type}
      />
    </>
  );
}
