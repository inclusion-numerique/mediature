'use client';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Card, CardContent, CardHeader, Grid, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { CaseSchemaType } from '@mediature/main/src/models/entities/case';
import { CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';
import { CaseStatusChip } from '@mediature/ui/src/CaseStatusChip';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface CaseCardProps {
  case: CaseSchemaType;
  citizen: CitizenSchemaType;
  assignAction: (agentId: string) => Promise<void>;
}

export function CaseCard(props: CaseCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      <CardHeader
        action={
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
        }
        sx={{ position: 'absolute', right: 0 }}
      />
      <CardContent>
        <Grid container direction={'column'} spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">
              {props.citizen.firstname} {props.citizen.lastname}
            </Typography>
            <Typography variant="subtitle1">Dossier n°{props.case.humanId}</Typography>
            {/* TODO: reminder field + status with i18n */}
            <Typography variant="subtitle1">
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
        <MenuItem>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" />
          </ListItemIcon>
          {/* TODO: disable if the case is already closed? */}
          Assigner le dossier à un autre médiateur
        </MenuItem>
      </Menu>
    </Card>
  );
}
