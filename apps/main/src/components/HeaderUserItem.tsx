'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Grid, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { EventEmitter } from 'eventemitter3';
import { PropsWithChildren, useEffect, useState } from 'react';

import { TokenUserSchemaType } from '@mediature/main/src/models/entities/user';
import { logout } from '@mediature/main/src/utils/auth';
import { Avatar } from '@mediature/ui/src/Avatar';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface HeaderUserItemProps {
  user: TokenUserSchemaType;
  eventEmitter: EventEmitter;
}

export function HeaderUserItem(props: PropsWithChildren<HeaderUserItemProps>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    props.eventEmitter.on('click', (event) => {
      if (open) {
        handleClose();
      } else {
        handleClick(event);
      }
    });

    return function cleanup() {
      props.eventEmitter.removeAllListeners();
    };
  });

  return (
    <Box aria-label="options" aria-controls={open ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
      <Grid container direction="row" alignItems="center" spacing={1}>
        <Grid item>
          <Avatar fullName={`${props.user.firstname} ${props.user.lastname}`} />
        </Grid>
        <Grid item>
          {props.user.firstname} {props.user.lastname}
        </Grid>
      </Grid>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ ...menuPaperProps }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ zIndex: 2000 }} // Needed to be displayed over the navbar on mobile devices
      >
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Paramètres
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Se déconnecter
        </MenuItem>
      </Menu>
    </Box>
  );
}
