import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Uppy, { ErrorResponse, FileProgress, FileRemoveReason, SuccessResponse, UploadResult, Uppy as UppyEntity, UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.min.css';
import DragDrop from '@uppy/drag-drop';
import en_US from '@uppy/locales/lib/en_US';
import fr_FR from '@uppy/locales/lib/fr_FR';
import Tus from '@uppy/tus';
import { FileKind, mimeData } from 'human-filetypes';
import { MutableRefObject, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UploaderFileList } from '@mediature/main/src/components/uploader/UploaderFileList';
import '@mediature/main/src/components/uploader/drag-drop.scss';
import { AttachmentKindRequirementsSchemaType, UiAttachmentSchema, UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { mockBaseUrl, shouldTargetMock } from '@mediature/main/src/server/mock/environment';
import { getExtensionsFromFileKinds, getFileIdFromUrl, getFileKindFromMime, getMimesFromFileKinds } from '@mediature/main/src/utils/attachment';
import { bitsFor } from '@mediature/main/src/utils/bits';
import { getBaseUrl } from '@mediature/main/src/utils/url';
import { ErrorAlert } from '@mediature/ui/src/ErrorAlert';

export const UploaderContext = createContext({
  ContextualUploaderFileList: UploaderFileList,
});

export interface UploaderProps {
  attachmentKindRequirements: AttachmentKindRequirementsSchemaType;
  minFiles?: number;
  maxFiles: number;
  onCommittedFilesChanged?: (attachments: UiAttachmentSchemaType[]) => Promise<void>;
  postUploadHook?: (internalId: string) => Promise<void>;
  // TODO: onError (useful if the list is not displayed... the parent can use a custom error) ... throw error if one of the two not enabled
  isUploadingChanged?: (value: boolean) => void;
}

export function Uploader({
  attachmentKindRequirements,
  minFiles,
  maxFiles,
  onCommittedFilesChanged,
  postUploadHook,
  isUploadingChanged,
}: UploaderProps) {
  const { t } = useTranslation('common');
  const { ContextualUploaderFileList } = useContext(UploaderContext);

  const dragAndDropRef = useRef<HTMLElement | null>(null); // This is used to scroll to the error message
  const [globalError, setGlobalError] = useState<Error | null>(null);

  const [uppy, setUppy] = useState<UppyEntity>(setupUppy({ attachmentKindRequirements, minFiles, maxFiles }));
  const [files, setFiles] = useState<UppyFile[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const updateFiles = () => {
      setFiles(uppy.getFiles());
    };

    const handleFileAdded = (file: UppyFile) => {
      updateFiles();
    };

    const handleFileRemoved = (file: UppyFile, reason: FileRemoveReason) => {
      updateFiles();
    };

    const handleUploadProgress = (file: UppyFile | undefined, progress: FileProgress) => {
      updateFiles();
    };

    const handleUploadSuccess = async (file: UppyFile | undefined, response: SuccessResponse) => {
      if (!file || !response.uploadURL) {
        return;
      }

      const internalId = getFileIdFromUrl(response.uploadURL);

      await reusableUploadSuccessCallback(uppy, file, response, internalId, onCommittedFilesChanged, postUploadHook);

      updateFiles();
    };

    const handleUploadError = (file: UppyFile | undefined, error: Error, response: ErrorResponse | undefined) => {
      updateFiles();
    };

    const handleRestrictionFailed = (file: UppyFile | undefined, error: Error) => {
      setGlobalError(error);

      dragAndDropRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInfoVisible = () => {
      const { info } = uppy.getState();

      if (info) {
        console.log(`${info.message} ${info.details}`);
      }
    };

    const handleInfoHidden = () => {
      setGlobalError(null);
    };

    const handleUploadStarts = (data: { id: string; fileIDs: string[] }) => {
      setIsUploading(true);
    };

    const handleAllUploadsComplete = (result: UploadResult) => {
      setIsUploading(false);
    };

    // TODO: notify parent... how to know if it's "is loading" for any file? Watch the progress and parse all files to see if finish or not?
    // Make sure to notify only if it changes... but it rerenders the parent... maybe better to have the reference? not sure...

    const registerListeners = () => {
      // All possibility listed on https://github.com/transloadit/uppy/blob/master/website/src/docs/uppy.md#events
      uppy.on('file-added', handleFileAdded);
      uppy.on('file-removed', handleFileRemoved);
      uppy.on('upload-progress', handleUploadProgress);
      uppy.on('upload-success', handleUploadSuccess);
      uppy.on('upload-error', handleUploadError);
      uppy.on('restriction-failed', handleRestrictionFailed);
      uppy.on('info-visible', handleInfoVisible);
      uppy.on('info-hidden', handleInfoHidden);
      uppy.on('upload', handleUploadStarts);
      uppy.on('complete', handleAllUploadsComplete);
    };

    const unregisterListeners = () => {
      uppy.off('file-added', handleFileAdded);
      uppy.off('file-removed', handleFileRemoved);
      uppy.off('upload-progress', handleUploadProgress);
      uppy.off('upload-success', handleUploadSuccess);
      uppy.off('upload-error', handleUploadError);
      uppy.off('restriction-failed', handleRestrictionFailed);
      uppy.off('info-hidden', handleInfoHidden);
      uppy.off('upload', handleUploadStarts);
      uppy.off('complete', handleAllUploadsComplete);
    };

    setupTus(uppy);
    setupDragDrop(uppy, dragAndDropRef);
    registerListeners();

    return () => {
      unregisterListeners();
      uppy.close({ reason: 'unmount' });
    };
  }, [uppy, onCommittedFilesChanged, postUploadHook]);

  useEffect(() => {
    if (isUploadingChanged) {
      isUploadingChanged(isUploading);
    }
  }, [isUploading, isUploadingChanged]);

  const cancelUpload = useCallback(
    (file: UppyFile) => {
      uppy.removeFile(file.id);
    },
    [uppy]
  );

  const removeFile = useCallback(
    (file: UppyFile) => {
      uppy.removeFile(file.id);
    },
    [uppy]
  );

  const retryUpload = useCallback(
    async (file: UppyFile) => {
      if ((file as any).response.postUploadHookFailure === true) {
        // Reuse the logic after the Uppy logic succeeds
        const internalId = (file as any).meta.internalMeta.id as string;
        await reusableUploadSuccessCallback(
          uppy,
          file,
          file.response as unknown as SuccessResponse,
          internalId,
          onCommittedFilesChanged,
          postUploadHook
        );

        setFiles(uppy.getFiles());
      } else {
        // It was a standard file upload, retry with the Uppy logic
        await uppy.retryUpload(file.id);
      }
    },
    [uppy, onCommittedFilesChanged, postUploadHook]
  );

  const allowedExtensions = getExtensionsFromFileKinds(attachmentKindRequirements.allowedFileTypes);

  return (
    <div>
      {!!uppy && (
        <>
          <Typography component="div" variant="caption">
            Taille maximale : {t('file.size', { size: attachmentKindRequirements.maxSize })}.{' '}
            {t('file.allowedExtensions', { extensions: allowedExtensions.join(', '), count: allowedExtensions.length })}
            {maxFiles > 1 && <> {t('file.upToMaxfiles', { count: maxFiles })}</>}
          </Typography>
          <Box className="uppy-Container">
            <Box ref={dragAndDropRef} />
          </Box>
          {globalError && (
            <>
              <ErrorAlert errors={[globalError]} sx={{ mt: 1 }} />
            </>
          )}
          {files.length > 0 && (
            <>
              <ContextualUploaderFileList files={files} onCancel={cancelUpload} onRemove={removeFile} onRetry={retryUpload} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function setupUppy(props: Pick<UploaderProps, 'attachmentKindRequirements' | 'minFiles' | 'maxFiles'>): UppyEntity {
  return new Uppy({
    id: 'uppy',
    autoProceed: true,
    locale: getLocale(),
    allowMultipleUploads: true,
    debug: false,
    meta: {
      kind: props.attachmentKindRequirements.id,
    },
    restrictions: {
      maxFileSize: props.attachmentKindRequirements.maxSize,
      allowedFileTypes: getMimesFromFileKinds(props.attachmentKindRequirements.allowedFileTypes),
      minNumberOfFiles: props.minFiles || 0,
      maxNumberOfFiles: props.maxFiles,
    },
    // store: null,
  });
}

function setupTus(uppy: UppyEntity) {
  // The maximum chunk size is really important depending on the backend limits:
  // - Google Storage recommends 8 MiB when uploading with chunks directly on them
  // - Istio could have some limitations but we didn't find what they are
  // - Scalingo could have some limitations but we didn't find what they are
  // - Behind a Nginx going over 1 MiB is problematic, it's possible to set the setting `client_max_body_size` but it seems a general one (whereas we would like to adjust the chunk size on a specific endpoint)
  // - Since we use a `tus` server on Scalingo we will set a reasonnable limit (5 MiB)
  const chunkSize = 5 * bitsFor.MiB;

  const baseUrl = shouldTargetMock() ? mockBaseUrl : getBaseUrl();

  uppy.use(Tus, {
    endpoint: `${baseUrl}/api/upload`,
    removeFingerprintOnSuccess: true,
    chunkSize,
    headers: {
      // Authorization: 'WILL_BE_PATCHED_BEFORE_EACH_UPLOAD_IF_NEEDED',
    },
    withCredentials: true,
    allowedMetaFields: ['kind', 'type', 'name'], // Allow only certain metadata to be transmitted
    // autoRetry: true,
    // limit: 0,
    onBeforeRequest: async (req, file) => {
      // Session token is passed through cookie (and `withCredentials`), no need of a `Authorization` header
    },
    // onProgress: () => {},
    // onSuccess: () => {},
    // onError: () => {},
  });
}

function setupDragDrop(uppy: UppyEntity, dragAndDropRef: MutableRefObject<HTMLElement | null>) {
  uppy.use(DragDrop, {
    target: dragAndDropRef.current || undefined,
    height: '100%',
    width: '100%',
  });
}

function getLocale(): any {
  // TODO: if multiple locales allowed, manage switching to another like en_FB...
  return fr_FR;
}

async function reusableUploadSuccessCallback(
  uppy: Uppy,
  file: UppyFile,
  response: SuccessResponse,
  internalId: string,
  onCommittedFilesChanged: UploaderProps['onCommittedFilesChanged'],
  postUploadHook: UploaderProps['postUploadHook']
) {
  if (postUploadHook) {
    try {
      await postUploadHook(internalId);
    } catch (err) {
      // Force an error as if it was part of content upload to reuse the display
      uppy.setFileState(file.id, {
        meta: {
          ...file.meta,
          internalMeta: {
            id: internalId,
          },
        },
        response: {
          status: 500,
          postUploadHookFailure: true,
        },
      });
      return;
    }
  }

  // If everything is good, mark keep the information for later process
  uppy.setFileState(file.id, {
    meta: {
      ...file.meta,
      internalMeta: {
        uploadSuccess: true,
        id: internalId,
      },
    },
  });

  const attachments: UiAttachmentSchemaType[] = await Promise.all(
    uppy
      .getFiles()
      .filter((f) => {
        return (f.meta as any).internalMeta?.uploadSuccess === true;
      })
      .map(async (f) => {
        let localUrl: string | null = null;

        if (file.meta.type && getFileKindFromMime(file.meta.type) === FileKind.Image) {
          const base64 = await convertBlobToBase64(file.data);
          localUrl = base64 as string;
        }

        return {
          id: (f.meta as any).internalMeta?.id,
          url: localUrl || `NOT_AVAILABLE_DUE_TO_UPPY_RESTRICTION_ON_RESPONSE_HEADERS`,
        } as UiAttachmentSchemaType;
      })
  );

  onCommittedFilesChanged && onCommittedFilesChanged(attachments);

  if (postUploadHook) {
    // If we succeed the hook, we can safely remove the file since the parent is supposed to manage the UI
    uppy.removeFile(file.id);
  }
}

async function convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
}
