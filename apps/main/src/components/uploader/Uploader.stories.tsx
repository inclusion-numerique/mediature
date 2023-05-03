import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { rest } from 'msw';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Uploader } from '@mediature/main/src/components/uploader/Uploader';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { mockBaseUrl } from '@mediature/main/src/server/mock/environment';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';

type ComponentType = typeof Uploader;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/Uploader',
  component: Uploader,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      rest.post(`${mockBaseUrl}/api/upload`, (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.set(
            'Access-Control-Expose-Headers',
            'Authorization, Content-Type, Location, Tus-Extension, Tus-Max-Size, Tus-Resumable, Tus-Version, Upload-Concat, Upload-Defer-Length, Upload-Length, Upload-Metadata, Upload-Offset, X-HTTP-Method-Override, X-Requested-With, X-Forwarded-Host, X-Forwarded-Proto, Forwarded'
          ),
          ctx.set('Content-Length', '0'),
          ctx.set('Location', `${mockBaseUrl}/api/upload/00000000-0000-0000-0000-000000000000`),
          ctx.set('Tus-Resumable', '1.0.0')
        );
      }),
      rest.head(`${mockBaseUrl}/api/upload/:uploadId`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.set(
            'Access-Control-Expose-Headers',
            'Authorization, Content-Type, Location, Tus-Extension, Tus-Max-Size, Tus-Resumable, Tus-Version, Upload-Concat, Upload-Defer-Length, Upload-Length, Upload-Metadata, Upload-Offset, X-HTTP-Method-Override, X-Requested-With, X-Forwarded-Host, X-Forwarded-Proto, Forwarded'
          ),
          ctx.set('Content-Length', '16171'),
          ctx.set('Upload-Offset', '36'),
          ctx.set('Upload-Length', '16171'),
          ctx.set(
            'Upload-Metadata',
            'caption ,filename bG9sLmpwZw==,filetype aW1hZ2UvanBlZw==,name bG9sLmpwZw==,relativePath bnVsbA==,type aW1hZ2UvanBlZw=='
          ),
          ctx.set('Tus-Resumable', '1.0.0')
        );
      }),
      rest.patch(`${mockBaseUrl}/api/upload/:uploadId`, (req, res, ctx) => {
        return res(
          ctx.delay(1000), // Set a delay so the loader can be seen
          ctx.status(204),
          ctx.set(
            'Access-Control-Expose-Headers',
            'Authorization, Content-Type, Location, Tus-Extension, Tus-Max-Size, Tus-Resumable, Tus-Version, Upload-Concat, Upload-Defer-Length, Upload-Length, Upload-Metadata, Upload-Offset, X-HTTP-Method-Override, X-Requested-With, X-Forwarded-Host, X-Forwarded-Proto, Forwarded'
          ),
          ctx.set('Upload-Offset', '16171'),
          ctx.set('Tus-Resumable', '1.0.0')
        );
      }),
      rest.options(`${mockBaseUrl}/api/upload/:uploadId`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.set('Content-Type', 'application/offset+octet-stream'),
          ctx.set('Upload-Offset', '0'),
          ctx.set('Tus-Resumable', '1.0.0')
        );
      }),
      rest.delete(`${mockBaseUrl}/api/upload/:uploadId`, (req, res, ctx) => {
        return res(
          ctx.status(204),
          ctx.set(
            'Access-Control-Expose-Headers',
            'Authorization, Content-Type, Location, Tus-Extension, Tus-Max-Size, Tus-Resumable, Tus-Version, Upload-Concat, Upload-Defer-Length, Upload-Length, Upload-Metadata, Upload-Offset, X-HTTP-Method-Override, X-Requested-With, X-Forwarded-Host, X-Forwarded-Proto, Forwarded'
          ),
          ctx.set('Content-Length', '0'),
          ctx.set('Tus-Resumable', '1.0.0')
        );
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <Uploader {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  attachmentKindRequirements: attachmentKindList[AttachmentKindSchema.Values.AUTHORITY_LOGO],
  maxFiles: 1,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button');
};

export const Normal = prepareStory(NormalStory);
