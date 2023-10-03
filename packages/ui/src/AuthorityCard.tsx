'use client';

import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Alert from '@mui/material/Alert';
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
import Image from 'next/image';
import NextLink from 'next/link';
import { useState } from 'react';

import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { AuthoritySchemaType } from '@mediature/main/src/models/entities/authority';
import { ulComponentResetStyles } from '@mediature/main/src/utils/grid';
import { menuPaperProps } from '@mediature/ui/src/utils/menu';

export interface AuthorityCardProps {
  authority: AuthoritySchemaType;
  mainAgent: AgentSchemaType | null;
  agents: AgentSchemaType[] | null;
  openCases: number;
  closeCases: number;
  authorityAgentsManagementLink: string;
  authorityEditLink: string;
}

export function AuthorityCard(props: AuthorityCardProps) {
  const agentsExceptMainOne = props.agents ? props.agents.filter((agent) => agent.id !== props.mainAgent?.id) : null;

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
          <Tooltip title="Options de la collectivité">
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
            <Grid container alignItems="center" spacing={2}>
              {!!props.authority.logo && (
                <Grid item>
                  <Image src={props.authority.logo.url} alt="" width={50} height={30} style={{ objectFit: 'contain' }} />
                </Grid>
              )}
              <Grid item>
                <Link
                  component={NextLink}
                  href={props.authorityAgentsManagementLink}
                  variant="h5"
                  color="inherit"
                  underline="none"
                  style={{ fontWeight: 600 }}
                >
                  {props.authority.name}
                </Link>
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  Dossiers en cours : {props.openCases}
                </Grid>
                <Grid item xs={12} sm={6}>
                  Dossiers clos : {props.closeCases}
                </Grid>
              </Grid>
            </Alert>
          </Grid>
          <Grid item xs={12}>
            {!!props.mainAgent ? (
              <>
                <Typography sx={{ fontWeight: 'bold' }}>Médiateur principal :</Typography> {props.mainAgent.firstname} {props.mainAgent.lastname}
              </>
            ) : (
              <>Aucun médiateur principal</>
            )}
          </Grid>
          <Grid item xs={12}>
            {!!agentsExceptMainOne && agentsExceptMainOne.length ? (
              <>
                <Typography sx={{ fontWeight: 'bold' }}>Liste des médiateurs :</Typography>
                <Grid container component="ul" spacing={1} sx={ulComponentResetStyles}>
                  {agentsExceptMainOne.map((agent) => (
                    <Grid key={agent.id} item component="li" xs={12} sm={6}>
                      {agent.firstname} {agent.lastname}
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>Aucun médiateur associé</>
            )}
          </Grid>
        </Grid>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        id="authority-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{ ...menuPaperProps }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={NextLink} href={props.authorityEditLink}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Modifier les informations
        </MenuItem>
      </Menu>
    </Card>
  );
}
