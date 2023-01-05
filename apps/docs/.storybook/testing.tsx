import { DecoratorFn } from '@storybook/react';
import React from 'react';

export const userAgentNameToBeDetected = 'Storybook Test Runner';

export const withDisablingTestRunner: DecoratorFn = (Story, { parameters }) => {
  if (parameters.testRunner?.disable === true && navigator.userAgent.includes(userAgentNameToBeDetected)) {
    return <>Disabled for Test Runner</>;
  }

  return <Story />;
};
