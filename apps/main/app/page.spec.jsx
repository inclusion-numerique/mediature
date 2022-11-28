import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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
