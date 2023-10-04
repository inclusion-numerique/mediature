'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { useIsDark } from '@codegouvfr/react-dsfr/useIsDark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import NextLink from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { isReminderSoon } from '@mediature/main/src/utils/business/reminder';
import { unprocessedMessagesBadgeAttributes } from '@mediature/main/src/utils/dsfr';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface CaseCardProps {
  caseLink: string;
  case: CaseSchemaType;
  citizen: CitizenSchemaType;
  agent?: AgentSchemaType;
  unprocessedMessages: number;
  assignAction?: () => Promise<void>;
  unassignAction?: () => Promise<void>;
  deleteAction?: () => Promise<void>;
}

export function CaseCard(props: CaseCardProps) {
  const { t } = useTranslation('common');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { isDark } = useIsDark();
  const theme = fr.colors.getHex({ isDark });

  const reminderSoon: boolean = props.case.termReminderAt ? isReminderSoon(props.case.termReminderAt) : false;

  return (
    <Card
      variant="outlined"
      sx={{ position: 'relative', backgroundColor: reminderSoon ? alpha(theme.decisions.background.actionLow.redMarianne.hover, 0.3) : undefined }}
    >
      <CardHeader
        action={
          !!props.assignAction || !!props.assignAction ? (
            <Tooltip title="Options du dossier">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-label="options"
                aria-controls={open ? 'case-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
        sx={{ position: 'absolute', right: 0 }}
      />
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          {!!props.case.termReminderAt && (
            <Grid item xs={12}>
              <Typography component="div" color={isReminderSoon(props.case.termReminderAt) ? 'error' : 'primary'}>
                <Grid container direction="row" alignItems="center">
                  <AccessTimeIcon sx={{ mr: '5px' }} />
                  <span>Échéance : {t('date.short', { date: props.case.termReminderAt })}</span>
                </Grid>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Link component={NextLink} href={props.caseLink} variant="h5" color="inherit" underline="none" style={{ fontWeight: 600 }}>
              {props.citizen.firstname} {props.citizen.lastname}
            </Link>
            <br />
            <Typography component="b" variant="subtitle1" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              Dossier n°{props.case.humanId}
              {!!props.unprocessedMessages && props.unprocessedMessages > 0 && (
                <Badge {...unprocessedMessagesBadgeAttributes} badgeContent={props.unprocessedMessages} />
              )}
              {!!props.agent && (
                <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                  | Assigné à {props.agent.firstname} {props.agent.lastname}
                </Typography>
              )}
            </Typography>
            {!props.case.agentId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Aucun médiateur n&apos;est assigné à ce dossier
              </Alert>
            )}
            {/* TODO: reminder field */}
            <Typography component="div" variant="subtitle1">
              Avancement du dossier :
              <br />
              <CaseStatusChip status={props.case.status} />
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        id="case-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ ...menuPaperProps }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* TODO: onclick for modal to assign a new one */}
        {/* TODO: disable if the case is already closed? */}
        {/* {!!props.assignAction && (
          <MenuItem onClick={props.assignAction}>
            <ListItemIcon>
              <PersonSearchIcon fontSize="small" />
            </ListItemIcon>
            Assigner le dossier à un autre médiateur
          </MenuItem>
        )} */}
        {!!props.unassignAction && (
          <MenuItem onClick={props.unassignAction}>
            <ListItemIcon>
              <PersonRemoveIcon fontSize="small" />
            </ListItemIcon>
            Se désassigner du dossier
          </MenuItem>
        )}
        {!!props.deleteAction && (
          <MenuItem onClick={props.deleteAction}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Supprimer ce dossier
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}
