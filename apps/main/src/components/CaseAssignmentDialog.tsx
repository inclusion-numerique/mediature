import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { AssignCasePrefillSchemaType, AssignCaseSchema } from '@mediature/main/src/models/actions/case';
import { AgentSchemaType } from '@mediature/main/src/models/entities/agent';
import { CaseSchemaType } from '@mediature/main/src/models/entities/case';

export interface CaseAssignmentDialogProps {
  case: CaseSchemaType;
  currentAgent: AgentSchemaType | null;
  agents: AgentSchemaType[];
  open: boolean;
  onClose: () => void;
}

export function CaseAssignmentDialog(props: CaseAssignmentDialogProps) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const updateCaseAssignation = trpc.assignCase.useMutation();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
    reset,
  } = useForm<AssignCasePrefillSchemaType>({
    resolver: zodResolver(AssignCaseSchema),
    defaultValues: {
      caseId: props.case.id,
      agentId: null,
    },
  });

  const defaultAgentId = useMemo(() => props.case.agentId, [props.case]);

  const closeCallback = () => {
    props.onClose();
  };

  useEffect(() => {
    setValue('agentId', props.case.agentId);
  }, [props.case, setValue]);

  const onSubmit = async (input: AssignCasePrefillSchemaType) => {
    const result = await updateCaseAssignation.mutateAsync({
      caseId: props.case.id,
      agentId: input.agentId,
    });

    closeCallback();
  };

  return (
    <Dialog
      fullWidth
      open={props.open}
      onClose={() => {
        if (updateCaseAssignation.isLoading) {
          // Prevent closing if the user just confirms an action
          return;
        }

        closeCallback();
      }}
    >
      <DialogTitle>Assigner ce dossier</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} control={control} innerRef={formRef} ariaLabel="assigner des agents">
            {props.agents.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <FormControl error={!!errors.agentId}>
                    <FormLabel id="agent-to-assign-radio-buttons-group-label">Agent à assigner</FormLabel>
                    <RadioGroup
                      defaultValue={defaultAgentId}
                      onChange={(event) => {
                        setValue('agentId', event.target.value, {
                          shouldDirty: true,
                        });
                      }}
                      aria-labelledby="agent-to-assign-radio-buttons-group-label"
                      aria-describedby="agent-to-assign-helper-text"
                    >
                      {props.agents.map((agent) => {
                        return (
                          <FormControlLabel
                            key={agent.id}
                            value={agent.id}
                            control={<Radio />}
                            label={`${agent.firstname} ${agent.lastname}`}
                            data-sentry-mask
                          />
                        );
                      })}
                    </RadioGroup>
                    <FormHelperText>{errors?.agentId?.message}</FormHelperText>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item component="p" xs={12}>
                Il n&apos;y a aucun médiateur assignable dans cette collectivité.
              </Grid>
            )}
          </BaseForm>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={async () => {
            closeCallback();
          }}
          disabled={updateCaseAssignation.isLoading}
        >
          Annuler
        </Button>
        {!!props.case.agentId && !!props.currentAgent && (
          <Button
            color="error"
            onClick={() => {
              setValue('agentId', null);
              formRef.current?.requestSubmit();
            }}
            loading={updateCaseAssignation.isLoading}
            variant="contained"
            data-sentry-mask
          >
            Désassigner {props.currentAgent.firstname} {props.currentAgent.lastname}
          </Button>
        )}
        <Button
          color="primary"
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
          loading={updateCaseAssignation.isLoading}
          disabled={!watch('agentId')}
          variant="contained"
        >
          Assigner
        </Button>
      </DialogActions>
    </Dialog>
  );
}
