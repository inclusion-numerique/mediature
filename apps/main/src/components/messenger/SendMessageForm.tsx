'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { State as UppyState } from '@uppy/core';
import debounce from 'lodash.debounce';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDeepCompareEffect } from 'react-use';
import { useSessionStorage } from 'usehooks-ts';
import z from 'zod';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { BaseForm } from '@mediature/main/src/components/BaseForm';
import { Uploader } from '@mediature/main/src/components/uploader/Uploader';
import {
  SendMessagePrefillSchemaType,
  SendMessageSchema,
  SendMessageSchemaType,
  sendMessageAttachmentsMax,
} from '@mediature/main/src/models/actions/messenger';
import { AttachmentKindSchema, UiAttachmentSchemaType } from '@mediature/main/src/models/entities/attachment';
import { ContactInputSchemaType } from '@mediature/main/src/models/entities/messenger';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';
import { EditorWrapper } from '@mediature/ui/src/Editor/EditorWrapper';

const emailInputFormatError = `Merci de renseigner une adresse email valide`;

export interface GlobalFormState {
  formState: SendMessageSchemaType | null;
  uploaderState: UppyState | null;
}

export const SendMessageFormContext = createContext({
  ContextualUploader: Uploader,
});

export interface SendMessageFormProps {
  recipientsSuggestions: ContactInputSchemaType[];
  prefill?: SendMessagePrefillSchemaType;
  onSuccess?: () => void;
}

export function SendMessageForm(props: SendMessageFormProps) {
  const { ContextualUploader } = useContext(SendMessageFormContext);

  const sendMessage = trpc.sendMessage.useMutation();

  const [globalFormState, setGlobalFormState] = useSessionStorage<GlobalFormState>(`case_new_message_${props.prefill?.caseId || 'unknown'}`, {
    formState: null,
    uploaderState: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<SendMessageSchemaType>({
    resolver: zodResolver(SendMessageSchema),
    defaultValues: {
      attachments: [],
      ...props.prefill,
      ...(globalFormState.formState || {}),
    },
  });

  const [lastUploaderState, setLastUploaderState] = useState<UppyState | null>(globalFormState.uploaderState);
  const watchedFormValues = watch();

  const handleGlobalFormChange = useMemo(() => {
    return debounce((formState: SendMessageSchemaType | null, uploaderState: UppyState | null) => {
      setGlobalFormState({
        formState: formState,
        uploaderState: uploaderState,
      });
    }, 1000);
  }, [setGlobalFormState]);

  useDeepCompareEffect(() => {
    handleGlobalFormChange(watchedFormValues, lastUploaderState);
  }, [watchedFormValues, lastUploaderState]);

  const onSubmit = async (input: SendMessageSchemaType) => {
    await sendMessage.mutateAsync(input);

    // Empty for cache for the next opening
    setGlobalFormState({
      formState: null,
      uploaderState: null,
    });

    props.onSuccess && props.onSuccess();
  };

  const [selected, setSelected] = useState<string[]>(() => {
    const toList = globalFormState.formState?.to || props.prefill?.to;

    return toList?.map((recipient) => recipient.email as string) || [];
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [emailInputError, setEmailInputError] = useState<string | null>(null);

  useEffect(() => {
    // Commit the component state to the form controller
    setValue(
      'to',
      selected.map((email) => {
        return {
          email: email,
          name: null,
        };
      }),
      {
        shouldValidate: false,
      }
    );
  }, [selected, setValue]);

  function onChange(event: React.SyntheticEvent<Element, Event>, value: string[]) {
    const errorEmail = value.find((email) => !z.string().email().safeParse(email).success);
    if (errorEmail) {
      setInputValue(errorEmail);
      setEmailInputError(emailInputFormatError);
    } else {
      setEmailInputError(null);
    }

    const validEmails = value.filter((email) => z.string().email().safeParse(email).success);

    setSelected(validEmails);
  }

  function onDelete(value: string) {
    const remainingEmails = selected.filter((e) => e !== value);

    setSelected(remainingEmails);
  }

  function onInputChange(event: React.SyntheticEvent<Element, Event>, newValue: string) {
    setInputValue(newValue);
  }

  return (
    <BaseForm handleSubmit={handleSubmit} onSubmit={onSubmit} preventParentFormTrigger control={control} ariaLabel="envoyer un message">
      <Grid item xs={12}>
        <Autocomplete
          multiple
          onChange={onChange}
          onBlur={() => {
            // Reset the error if the user comes back to a normal state
            if (emailInputError && inputValue === '') {
              setEmailInputError(null);
            }

            // For the experience, simulate a "enter press" when leaving the field
            // for people not used to combobox with chips :)
            if (inputValue !== '') {
              if (z.string().email().safeParse(inputValue).success) {
                const emails = [...selected, inputValue];

                setSelected(emails);
                setInputValue('');
                setEmailInputError(null);
              } else {
                setEmailInputError(emailInputFormatError);
              }
            }
          }}
          value={selected}
          inputValue={inputValue}
          onInputChange={onInputChange}
          options={props.recipientsSuggestions.map((recipient) => recipient.email)}
          renderOption={(props, option) => {
            // Redeclare to avoid "spread JSX" error (ref: https://stackoverflow.com/a/75968316/3608410)
            return (
              <li {...props} key={option}>
                {option}
              </li>
            );
          }}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => {
              return <Chip {...getTagProps({ index })} key={option} variant="outlined" label={option} onDelete={() => onDelete(option)} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              type="email"
              label="Destinataire(s)"
              error={!!emailInputError || !!errors.to}
              helperText={emailInputError || errors?.to?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Sujet" {...register('subject')} error={!!errors.subject} helperText={errors?.subject?.message} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <EditorWrapper
          initialEditorState={control._defaultValues.content}
          onChange={(content: string) => {
            setValue('content', content, {
              shouldValidate: false,
            });
          }}
          error={errors?.content?.message}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl error={!!errors.attachments}>
          <ContextualUploader
            attachmentKindRequirements={attachmentKindList[AttachmentKindSchema.Values.MESSAGE_DOCUMENT]}
            initialState={globalFormState.uploaderState || undefined}
            maxFiles={sendMessageAttachmentsMax}
            onCommittedFilesChanged={async (attachments: UiAttachmentSchemaType[]) => {
              setValue(
                'attachments',
                attachments.map((attachment) => attachment.id)
              );
            }}
            onStateChanged={async (state: UppyState) => {
              setLastUploaderState(state);
            }}
            // TODO: enable once https://github.com/transloadit/uppy/issues/4130#issuecomment-1437198535 is fixed
            // isUploadingChanged={setIsUploadingAttachments}
          />
          <FormHelperText>{errors?.attachments?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Button type="submit" loading={sendMessage.isLoading} size="large" variant="contained" fullWidth>
          Envoyer
        </Button>
      </Grid>
    </BaseForm>
  );
}
