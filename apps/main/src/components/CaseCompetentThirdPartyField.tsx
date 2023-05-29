import { useColors } from '@codegouvfr/react-dsfr/useColors';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { CreateCaseCompetentThirdPartyItemForm } from '@mediature/main/src/components/CreateCaseCompetentThirdPartyItemForm';
import { EditCaseCompetentThirdPartyItemForm } from '@mediature/main/src/components/EditCaseCompetentThirdPartyItemForm';
import { EditCaseCompetentThirdPartyItemPrefillSchema } from '@mediature/main/src/models/actions/case';
import { CaseCompetentThirdPartyItemSchemaType } from '@mediature/main/src/models/entities/case';
import { useSingletonConfirmationDialog } from '@mediature/ui/src/modal/useModal';

const filter = createFilterOptions<CaseCompetentThirdPartyItemSchemaType>();

export interface ItemActionsProps {
  item: CaseCompetentThirdPartyItemSchemaType;
  authorityId?: string;
  openEditModal: (item: CaseCompetentThirdPartyItemSchemaType) => void;
}

function ItemActions(props: ItemActionsProps) {
  const deleteCaseCompetentThirdPartyItem = trpc.deleteCaseCompetentThirdPartyItem.useMutation();

  const { showConfirmationDialog } = useSingletonConfirmationDialog();

  const deleteCaseCompetentThirdPartyItemAction = async () => {
    showConfirmationDialog({
      description: <>Êtes-vous sûr de vouloir supprimer l&apos;entité tierce &quot;{props.item.name}&quot; ?</>,
      onConfirm: async () => {
        await deleteCaseCompetentThirdPartyItem.mutateAsync({
          authorityId: props.authorityId,
          itemId: props.item.id,
        });
      },
    });
  };

  return (
    <>
      <IconButton
        aria-label="modifier l'entité tierce"
        onClick={() => {
          props.openEditModal(props.item);
        }}
        size="small"
        sx={{ ml: 1 }}
      >
        <EditIcon />
      </IconButton>
      <IconButton aria-label="supprimer l'entité tierce" onClick={deleteCaseCompetentThirdPartyItemAction} size="small">
        <DeleteIcon />
      </IconButton>
    </>
  );
}

function sortAndFlattenGroupItems(items: CaseCompetentThirdPartyItemSchemaType[]): CaseCompetentThirdPartyItemSchemaType[] {
  const finalItems: CaseCompetentThirdPartyItemSchemaType[] = [];

  items
    .filter((item) => {
      return item.parentId === null;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => {
      finalItems.push(item);

      items
        .filter((iterableItem) => {
          return iterableItem.parentId === item.id;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((iterableItem) => {
          finalItems.push(iterableItem);
        });
    });

  return finalItems;
}

export const CaseCompetentThirdPartyFieldContext = createContext({
  ContextualCreateCaseCompetentThirdPartyItemForm: CreateCaseCompetentThirdPartyItemForm,
  ContextualEditCaseCompetentThirdPartyItemForm: EditCaseCompetentThirdPartyItemForm,
});

export interface CaseCompetentThirdPartyFieldProps {
  authorityId?: string;
  value?: CaseCompetentThirdPartyItemSchemaType | null;
  onChange: (item: CaseCompetentThirdPartyItemSchemaType | null) => void;
  editMode?: boolean;
  errorMessage?: string;
}

export function CaseCompetentThirdPartyField(props: CaseCompetentThirdPartyFieldProps) {
  const { ContextualCreateCaseCompetentThirdPartyItemForm, ContextualEditCaseCompetentThirdPartyItemForm } =
    useContext(CaseCompetentThirdPartyFieldContext);
  const theme = useColors();
  const { onChange } = props;

  const { data, error, isLoading, isSuccess, refetch } = trpc.getCaseCompetentThirdPartyItems.useQuery({
    authorityId: props.authorityId || null,
  });

  const editMode: boolean = props.editMode || false;
  let errorMessage: string | undefined;

  if (!!error) {
    errorMessage = `Une erreur est survenue en récupérant la liste des entités tierces compétentes, cliquez sur le bouton rouge à droite de la liste pour réessayer. Détails : ${error}`;
  } else if (!!props.errorMessage) {
    errorMessage = props.errorMessage;
  }

  const [value, setValue] = useState<CaseCompetentThirdPartyItemSchemaType | null>(props.value || null);
  const [inputValue, setInputValue] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalItem, setEditModalItem] = useState<CaseCompetentThirdPartyItemSchemaType | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  const competentThirdParties = useMemo(() => {
    return data?.items || [];
  }, [data?.items]);
  const availableParentItems = useMemo(() => {
    return competentThirdParties.filter((item) => !item.parentId);
  }, [competentThirdParties]);

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditModalItem(null);
  };

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    // By default the `Autocomplete` component does not refresh the selected input (even if deleted in the list or edited on the same key)
    // so we try to get new information from the current value if any
    const foundItem = competentThirdParties.find((item) => {
      return item.id === value?.id;
    });

    setValue(foundItem || null);
  }, [competentThirdParties, value, isSuccess]);

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            if (!editMode) return;

            // When input and "enter" pressed
            setCreateModalOpen(true);
            setInputValue(newValue);
          } else if (newValue && (newValue as any).inputValue) {
            if (!editMode) return;

            setCreateModalOpen(true);
            setInputValue((newValue as any).inputValue);
          } else {
            // Item selected
            setValue(newValue);
            onChange(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          // Filtering is done but we want to display parent item on children ones, and all children for parent remaining ones
          let finalOptions = competentThirdParties.filter((item) => {
            // Item is kept by the filtering logic
            if (filtered.includes(item)) {
              return true;
            }

            // Is parent of a filtered one?
            if (
              !!filtered.find((iterableItem) => {
                return iterableItem.parentId === item.id;
              })
            ) {
              return true;
            }

            // Is child of a filtered one?
            if (
              !!filtered.find((iterableItem) => {
                return iterableItem.id === item.parentId;
              })
            ) {
              return true;
            }

            return false;
          });

          // Since the MUI `filter()` outputs a different ordering from the initial input, we reapply sorting
          finalOptions = sortAndFlattenGroupItems(finalOptions);

          if (editMode && params.inputValue !== '') {
            // We put another item but casting the type since it's not the right list format
            finalOptions.push({
              inputValue: params.inputValue,
              name: `Ajouter "${params.inputValue}"`,
            } as any);
          }

          return finalOptions;
        }}
        id="competent-third-party-autocomplete"
        options={sortAndFlattenGroupItems(competentThirdParties)}
        loading={isLoading}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            // Value selected with enter, right from the input
            return option;
          } else if ((option as any).inputValue !== undefined) {
            // Final "add xxx" item
            return (option as any).inputValue;
          }

          // Item selected
          if (!!option.parentName) {
            return `${option.parentName}  →  ${option.name}`;
          } else if (!!option.parentId) {
            const parentItem =
              competentThirdParties.find((iterableItem) => {
                return iterableItem.id === option.parentId;
              }) || null;

            return `${parentItem?.name || 'error'}  →  ${option.name}`;
          } else {
            return option.name;
          }
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(renderProps, option) => {
          if ((option as any).inputValue !== undefined) {
            return (
              <li {...renderProps} key="add_item">
                {option.name}
              </li>
            );
          } else {
            if (!!option.parentId) {
              return (
                <li {...renderProps} key={option.id}>
                  <SubdirectoryArrowRightIcon
                    fontSize="small"
                    sx={{
                      color: theme.decisions.text.actionHigh.blueFrance.default,
                      mx: 1,
                    }}
                  />
                  {option.name}
                  {editMode && (!props.authorityId || !!option.authorityId) && (
                    <ItemActions
                      item={option}
                      authorityId={props.authorityId}
                      openEditModal={(item) => {
                        setEditModalItem(item);
                        setEditModalOpen(true);
                      }}
                    />
                  )}
                </li>
              );
            } else {
              return (
                <Typography
                  component="li"
                  {...renderProps}
                  key={option.id}
                  sx={{
                    position: 'sticky',
                    top: '-8px',
                    backgroundColor: theme.decisions.background.default.grey.default,
                    '&:hover': {
                      backgroundColor: theme.decisions.background.default.grey.hover,
                    },
                    zIndex: 1,
                  }}
                >
                  {option.name}
                  {editMode && (!props.authorityId || !!option.authorityId) && (
                    <ItemActions
                      item={option}
                      authorityId={props.authorityId}
                      openEditModal={(item) => {
                        setEditModalItem(item);
                        setEditModalOpen(true);
                      }}
                    />
                  )}
                </Typography>
              );
            }
          }
        }}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Entité compétente"
            error={!!errorMessage}
            helperText={errorMessage}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {!!error && (
                    <IconButton
                      color="error"
                      aria-label="réessayer"
                      onClick={() => {
                        refetch();
                      }}
                      sx={{ ml: 1 }}
                    >
                      <SyncProblemIcon />
                    </IconButton>
                  )}
                  {isLoading && <CircularProgress color="inherit" size={20} aria-label="chargement de la liste des entités tierces compétentes" />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Dialog open={createModalOpen} onClose={handleCloseCreateModal}>
        <DialogTitle>
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs="auto">
              Ajout d&apos;une entité tierce compétente
            </Grid>
            <Grid item xs="auto">
              <IconButton aria-label="fermer" onClick={handleCloseCreateModal} size="small">
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          {!!props.authorityId && (
            <Typography component="div" sx={{ pb: 3 }}>
              L&apos;ajout d&apos;entités tierces propres à la collectivité complique les statistiques au niveau national, merci de bien vérifier
              qu&apos;une entité similaire n&apos;existe pas déja. Voire même n&apos;hésitez pas à demander au support si une entité tierce que vous
              estimez justifié peut être ajoutée au niveau national.
            </Typography>
          )}
          <ContextualCreateCaseCompetentThirdPartyItemForm
            availableParentItems={availableParentItems}
            prefill={{
              authorityId: props.authorityId,
              name: inputValue,
            }}
            onSuccess={handleCloseCreateModal}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={editModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs="auto">
              Modification de l&apos;entité tierce
            </Grid>
            <Grid item xs="auto">
              <IconButton aria-label="fermer" onClick={handleCloseEditModal} size="small">
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Typography component="div" sx={{ pb: 3 }}>
            La modification du libellé de cette entité tierce aura aussi effet sur les dossiers déjà attachés à cette entité.
          </Typography>
          {!!editModalItem && (
            <ContextualEditCaseCompetentThirdPartyItemForm
              availableParentItems={availableParentItems}
              prefill={EditCaseCompetentThirdPartyItemPrefillSchema.parse({
                itemId: editModalItem.id,
                parentId: editModalItem.parentId,
                name: editModalItem.name,
              })}
              onSuccess={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
