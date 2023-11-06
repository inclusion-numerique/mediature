'use client';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useState } from 'react';

import { useSingletonConfirmationDialog } from '@mediature/main/src/components/modal/useModal';
import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface AgentCardProps {
  agent: AgentSchemaType;
  openCases: number;
  closeCases: number;
  removeAction: () => Promise<void>;
  grantMainAgentAction: () => Promise<void>;
}

export function AgentCard(props: AgentCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const removeAction = async () => {
    showConfirmationDialog({
      description: (
        <>
          Êtes-vous sûr de vouloir supprimer{' '}
          <Typography component="span" sx={{ fontWeight: 'bold' }} data-sentry-mask>
            {props.agent.firstname} {props.agent.lastname}
          </Typography>{' '}
          de la collectivité ?
        </>
      ),
      onConfirm: async () => {
        await props.removeAction();
      },
    });
  };

  const grantMainAgentAction = async () => {
    showConfirmationDialog({
      description: (
        <>
          Le fait de nommer{' '}
          <Typography component="span" sx={{ fontWeight: 'bold' }} data-sentry-mask>
            {props.agent.firstname} {props.agent.lastname}
          </Typography>{' '}
          médiateur principal enlèvera les droits au précédent médiateur principal.
        </>
      ),
      onConfirm: async () => {
        await props.grantMainAgentAction();
      },
    });
  };

  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      <CardHeader
        action={
          <Tooltip title="Options du médiateur">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-label="options"
              aria-controls={open ? 'agent-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{ position: 'absolute', right: 0 }}
      />
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={2} sx={{ pr: '40px' }}>
              {!!props.agent.profilePicture && (
                <Grid item>
                  {/* TODO: use avatar if no picture */}
                  <Image src={props.agent.profilePicture} alt="" width={30} height={30} style={{ objectFit: 'contain' }} data-sentry-block />
                </Grid>
              )}
              <Grid item data-sentry-mask>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Typography component="b" variant="h4">
                      {props.agent.firstname} {props.agent.lastname}
                    </Typography>
                  </Grid>
                  {props.agent.isMainAgent && (
                    <Grid item>
                      <Chip icon={<AdminPanelSettingsIcon fontSize="small" />} label="Médiateur principal" sx={{ my: 1 }} />
                    </Grid>
                  )}
                </Grid>
                <Typography component="span" variant="subtitle1">
                  {props.agent.email}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Alert
              role="none"
              severity="info"
              icon={false}
              sx={{
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center',
                },
              }}
            >
              <Grid container spacing={2} data-sentry-mask>
                <Grid item xs={12} sm={6}>
                  Dossiers en cours : {props.openCases}
                </Grid>
                <Grid item xs={12} sm={6}>
                  Dossiers clos : {props.closeCases}
                </Grid>
              </Grid>
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        id="agent-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ ...menuPaperProps }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={removeAction}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" />
          </ListItemIcon>
          Supprimer de la collectivité
        </MenuItem>
        {!props.agent.isMainAgent && (
          <MenuItem onClick={grantMainAgentAction}>
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            Nommer comme médiateur principal
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}
