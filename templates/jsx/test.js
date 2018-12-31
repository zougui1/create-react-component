import React from 'react';
import { render } from 'react-testing-library';
import _component_ from '_testToComponent_';

it('renders "_component_ work!"', () => {
 const { getByText } = render(<_component_ />);
 expect(getByText('_component_ work!')).toBeInTheDocument;
});
