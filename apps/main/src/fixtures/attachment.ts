import { UppyFile } from '@uppy/core';
import { base64StringToBlob } from 'blob-util';

const contentType = 'image/png';
const b64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const blob = base64StringToBlob(b64Data, contentType);

export const uppyFiles: UppyFile[] = [
  {
    source: 'Dashboard',
    id: 'uppy-a/jpg-1e-image/jpeg-16171-1556651302320',
    name: 'sample-1.jpg',
    extension: 'jpg',
    meta: {
      kind: 'AUTHORITY_LOGO',
      relativePath: null,
      name: 'sample-1.jpg',
      type: 'image/jpeg',
    },
    type: 'image/jpeg',
    data: blob,
    progress: {
      uploadStarted: 1676453657332,
      uploadComplete: true,
      percentage: 100,
      bytesUploaded: 16171,
      bytesTotal: 16171,
    },
    size: 16171,
    isRemote: false,
    preview: 'blob:http://localhost:3000/13422339-278f-400d-9b25-5399e9fe623d',
    response: {
      body: {},
      status: 200,
      uploadURL: 'http://localhost:3000/api/upload/e44117d7-ef80-4cd4-bb1a-8378adbf8bb2',
    },
    isPaused: false,
  },
];
