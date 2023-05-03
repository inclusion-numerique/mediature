import { usePDF } from '@react-pdf/renderer';
import { StoryFn } from '@storybook/react';
import React from 'react';

export function WithDocumentRenderer(Story: StoryFn) {
  const [instance, updateInstance] = usePDF({
    document: (
      <>
        <Story />
      </>
    ),
  });

  if (instance.loading) {
    return <div>Rendering the PDF...</div>;
  } else if (instance.error) {
    return <div>Something went wrong: {instance.error}</div>;
  } else if (!instance.url) {
    return <div>Initializing the renderer</div>;
  }

  return (
    <iframe
      title="PDF preview"
      src={instance.url}
      style={{
        height: '100%',
      }}
    />
  );
}
