import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => React.createElement('div', { style: { backgroundColor: '#020617', color: '#f8fafc', padding: '2rem', borderRadius: '0.5rem' } }, React.createElement(Story))
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#020617', // slate-950
        },
      ],
    },
    a11y: {
      // 'error' - fail CI on a11y violations
      test: 'error'
    }
  },
};

export default preview;