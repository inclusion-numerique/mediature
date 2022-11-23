import { DocsContainer } from '@storybook/addon-docs';
import addons from '@storybook/addons';
import { themes } from '@storybook/theming';
import React from 'react';
import { DARK_MODE_EVENT_NAME, UPDATE_DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

const channel = addons.getChannel();

export const parameters = {
  darkMode: {
    current: 'light',
    stylePreview: true,
    dark: { ...themes.dark },
    light: { ...themes.light },
  },
  docs: {
    container: (props) => {
      const [isDark, setDark] = React.useState();

      const onChangeHandler = () => {
        channel.emit(UPDATE_DARK_MODE_EVENT_NAME);
      };

      React.useEffect(() => {
        channel.on(DARK_MODE_EVENT_NAME, setDark);
        return () => channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
      }, [channel, setDark]);

      return (
        <div>
          <input type="checkbox" onChange={onChangeHandler} />
          <DocsContainer {...props} />
        </div>
      );
    },
  },
};
