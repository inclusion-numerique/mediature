import { renderToMjml } from '@luma-team/mjml-react';
import mjml2html from 'mjml-browser';
import { ComponentType, PropsWithChildren, Suspense, lazy, useState, useTransition } from 'react';

export function StorybookRendererLayout(props: PropsWithChildren) {
  const content = props.children as React.ReactElement;
  const mjmlContent = renderToMjml(content);
  const transformResult = mjml2html(mjmlContent);

  if (transformResult.errors) {
    for (const err of transformResult.errors) {
      throw err;
    }
  }

  return <div dangerouslySetInnerHTML={{ __html: transformResult.html }} />;
}
