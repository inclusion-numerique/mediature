'use client';

import React, { PropsWithChildren } from 'react';

import { ProvidersContext } from '@mediature/main/src/app/providers';

export function MockProvider(props: PropsWithChildren) {
  return (
    <ProvidersContext.Provider
      value={{
        ContextualSessionProvider: (props: PropsWithChildren) => {
          // The Storybook addon for next-auth requires the removal of the official provider, so replacing it
          return <>{props.children}</>;
        },
      }}
    >
      {props.children}
    </ProvidersContext.Provider>
  );
}
