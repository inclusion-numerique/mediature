'use client';

import { useColors } from '@codegouvfr/react-dsfr/useColors';
import { Avatar, Chip } from '@mui/material';

import { CaseStatusSchema, CaseStatusSchemaType } from '@mediature/main/src/models/entities/case';

export interface CaseStatusChipProps {
  status: CaseStatusSchemaType;
}

export function CaseStatusChip(props: CaseStatusChipProps) {
  // TODO: translate the text with i18n feature
  // Main colors with different shades: green, blue, yellow, red
  let statusNumber: number | '#' = 0;
  let statusNumberColor = 'black';
  let statusColor = 'black';
  let statusText = props.status;

  const theme = useColors();

  switch (props.status) {
    case CaseStatusSchema.Values.TO_PROCESS:
      statusNumber = 1;
      statusNumberColor = theme.options.success._950_100.hover;
      statusColor = theme.options.success._950_100.default;
      break;
    // TODO: 2 (green) (theme.options.success._950_100.default)
    case CaseStatusSchema.Values.MAKE_XXX_CALL:
      statusNumber = 3;
      statusNumberColor = theme.options.success._975_75.default;
      statusColor = theme.options.success._975_75.default;
      break;
    case CaseStatusSchema.Values.SYNC_WITH_CITIZEN:
      statusNumber = 4;
      statusNumberColor = theme.options.blueFrance._850_200.default;
      statusColor = theme.options.blueFrance._850_200.default;
      break;
    case CaseStatusSchema.Values.SYNC_WITH_ADMINISTATION:
      statusNumber = 5;
      statusNumberColor = theme.options.blueFrance._925_125.hover;
      statusColor = theme.options.blueFrance._925_125.default;
      break;
    case CaseStatusSchema.Values.ABOUT_TO_CLOSE:
      statusNumber = 6;
      statusNumberColor = theme.options.blueFrance._950_100.hover;
      statusColor = theme.options.blueFrance._950_100.default;
      break;
    // TODO: 7 (yellow) (theme.decisions.border.actionLow.yellowTournesol.default)
    case CaseStatusSchema.Values.STUCK:
      statusNumber = '#';
      statusNumberColor = theme.options.error._950_100.hover;
      statusColor = theme.options.error._950_100.default;
      break;
  }

  return (
    <Chip
      avatar={<Avatar sx={{ backgroundColor: statusNumberColor }}>{statusNumber}</Avatar>}
      label={statusText}
      sx={{ backgroundColor: statusColor }}
    />
  );
}
