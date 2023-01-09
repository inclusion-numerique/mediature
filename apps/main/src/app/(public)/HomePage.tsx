'use client';

import Button from '@mui/material/Button';
import * as React from 'react';

import { Button as B } from '@mediature/ui';
import { LottieTest } from '@mediature/ui/src/LottieTest';

export function HomePage() {
  return (
    <div>
      <h1>Web</h1>
      <Button variant="outlined">This is a test</Button>
      <B />
      {/* <LottieTest /> */}
    </div>
  );
}
