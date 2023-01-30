'use client';

import { createMuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { frFR as coreFrFR } from '@mui/material/locale';
// import { DataGrid, frFR as dataGridFrFR } from '@mui/x-data-grid';
import { frFR as datePickerFrFR } from '@mui/x-date-pickers';

export const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
  augmentMuiTheme: ({ nonAugmentedMuiTheme, frColorTheme }) => {
    return {
      ...nonAugmentedMuiTheme,
      components: {
        ...nonAugmentedMuiTheme.components,
        // Bring i18n for components like DatePicker
        ...datePickerFrFR.components,
        // ...dataGridFrFR.components,
        ...coreFrFR.components,
        MuiDialogContent: {
          // TODO: remove once the issue is addressed: https://github.com/mui/material-ui/issues/31185
          styleOverrides: { root: { paddingTop: `1rem !important` } },
        },
      },
    };
  },
});
