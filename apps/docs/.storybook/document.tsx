import { PDFViewer } from '@react-pdf/renderer';
import { StoryFn } from '@storybook/react';
import React from 'react';

export function withDocumentRenderer(Story: StoryFn) {
  return (
    <PDFViewer className="pdfViewer disabledA11y" style={{ height: '100%' }} showToolbar={false}>
      <Story />
    </PDFViewer>
  );
}
