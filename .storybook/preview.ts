import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
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