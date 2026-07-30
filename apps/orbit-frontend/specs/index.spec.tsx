import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Smoke test on a pure (WebGL-free) primitive. The landing page itself mounts
// three.js/WebGL which can't render under jsdom, so we assert a representative
// component renders instead.
describe('orbit-frontend', () => {
  it('renders a UI primitive successfully', () => {
    const { getByRole } = render(<Button>Launch</Button>);
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Launch');
  });
});
