import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';

import Home from './page';

describe('Home', () => {
  it('renders', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /Web/i,
    });

    expect(heading).toBeInTheDocument();
  });
});
