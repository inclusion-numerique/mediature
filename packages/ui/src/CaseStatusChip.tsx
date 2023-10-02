'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { useIsDark } from '@codegouvfr/react-dsfr/useIsDark';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

import { CaseStatusSchema, CaseStatusSchemaType } from '@mediature/main/src/models/entities/case';

export interface CaseStatusChipProps {
  status: CaseStatusSchemaType;
}

export function CaseStatusChip(props: CaseStatusChipProps) {
  const { t } = useTranslation('common');

  // Different colors and shades
  let statusNumber: number | '#' = 0;
  let statusNumberColor = 'black';
  let statusColor = 'black';
  let statusText = t(`model.case.status.enum.${props.status}`);

  const { isDark } = useIsDark();
  const theme = fr.colors.getHex({ isDark });

  switch (props.status) {
    case CaseStatusSchema.Values.TO_PROCESS:
      statusNumber = 1;
      statusNumberColor = theme.options.greenTilleulVerveine._950_100.hover;
      statusColor = theme.options.greenTilleulVerveine._950_100.default;
      break;
    case CaseStatusSchema.Values.CONTACT_REQUESTER:
      statusNumber = 2;
      statusNumberColor = theme.options.greenEmeraude._950_100.hover;
      statusColor = theme.options.greenEmeraude._950_100.default;
      break;
    case CaseStatusSchema.Values.WAITING_FOR_REQUESTER:
      statusNumber = 3;
      statusNumberColor = theme.options.greenEmeraude._925_125.hover;
      statusColor = theme.options.greenEmeraude._925_125.default;
      break;
    case CaseStatusSchema.Values.CONTACT_ADMINISTRATION:
      statusNumber = 4;
      statusNumberColor = theme.options.blueFrance._950_100.hover;
      statusColor = theme.options.blueFrance._950_100.default;
      break;
    case CaseStatusSchema.Values.WAITING_FOR_ADMINISTATION:
      statusNumber = 5;
      statusNumberColor = theme.options.blueFrance._925_125.hover;
      statusColor = theme.options.blueFrance._925_125.default;
      break;
    case CaseStatusSchema.Values.ABOUT_TO_CLOSE:
      statusNumber = 6;
      statusNumberColor = theme.options.pinkTuile._950_100.hover;
      statusColor = theme.options.pinkTuile._950_100.default;
      break;
    case CaseStatusSchema.Values.CLOSED:
      statusNumber = '#';
      statusNumberColor = theme.options.brownOpera._925_125.hover;
      statusColor = theme.options.brownOpera._925_125.default;
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
