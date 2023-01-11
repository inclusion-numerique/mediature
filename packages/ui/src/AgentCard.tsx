'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Alert, Card, CardContent, CardHeader, Grid, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import Image from 'next/image';
import { useState } from 'react';

import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';

export interface AgentCardProps {
  agent: AgentSchemaType;
  openCases: number;
  closeCases: number;
  removeAction: () => Promise<void>;
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

  const askRemovalConfirmation = useConfirm();

  const removeAction = async () => {
    try {
      await askRemovalConfirmation({
        description: (
          <>
            Êtes-vous sûr de vouloir supprimer{' '}
            <b>
              {props.agent.firstname} {props.agent.lastname}
            </b>{' '}
            de la collectivité ?
          </>
        ),
      });
    } catch (e) {
      return;
    }

    await props.removeAction();
  };

  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      <CardHeader
        action={
          <Tooltip title="Options de l'agent">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-label="options"
              aria-controls={open ? 'account-menu' : undefined}
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
                  <Image src={props.agent.profilePicture} alt="" width={30} height={30} style={{ objectFit: 'contain' }} />
                </Grid>
              )}
              <Grid item>
                <Typography variant="h4">
                  {props.agent.firstname} {props.agent.lastname}
                </Typography>
                <Typography variant="subtitle1">{props.agent.email}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info" icon={false}>
              <Grid container spacing={2}>
                {/* TODO: the subcomponent of the alert should be "width: 100%" */}
                <Grid item xs={12} sm={6}>
                  Dossiers en cours : {props.openCases}
                </Grid>
                <Grid item xs={12} sm={6}>
                  Dossiers clôs : {props.closeCases}
                </Grid>
              </Grid>
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={removeAction}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" />
          </ListItemIcon>
          Supprimer de la collectivité
        </MenuItem>
      </Menu>
    </Card>
  );
}
