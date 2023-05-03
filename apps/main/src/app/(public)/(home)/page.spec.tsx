import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { HomePage } from '@mediature/main/src/app/(public)/(home)/HomePage';

describe.skip('HomePage', () => {
  it('renders', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', {
      name: /médiature/i,
      level: 1,
    });

    expect(heading).toBeInTheDocument();
  });
});
