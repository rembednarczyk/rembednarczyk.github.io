import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import React from 'react';
import { MotionProvider } from '../src/components/MotionProvider';

const preview: Preview = {
  decorators: [
    // The app sets motion up once at its root, and `m` renders nothing
    // without it. A story mounts a component on its own, so it has to
    // supply the same wrapper or every animated component throws here
    // while working perfectly on the page. It is the app's own wrapper
    // rather than a copy of it, so a story cannot animate differently
    // from the page — which is how the reduced-motion answer went missing.
    (Story) => React.createElement(
      MotionProvider,
      null,
      React.createElement('div', { style: { backgroundColor: '#020617', color: '#f8fafc', padding: '2rem', borderRadius: '0.5rem' } }, React.createElement(Story)),
    ),
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