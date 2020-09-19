import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import CreateButton from 'src/component/button-fab';
import Skeleton from 'src/component/skeleton';
import TemplateCardlet from 'src/component/template-cardlet';
import TemplateVersionListItem from 'src/component/template-version-list-item';
import {
  TemplateVersion,
  deleteTemplateVersion,
  updateTemplate,
  useTemplate,
  useTemplateVersionList,
} from 'src/service/server';
import { getRoute as getTemplateVersionCreatePath } from 'src/view/template-version-create';
import { getRoute as getTemplateVersionEditionPath } from 'src/view/template-version-edition';

type LocationParams = {
  templateId: string;
};

export const getRoute = (params: LocationParams) => `/templates/${params.templateId}`;

export const ROUTE = getRoute({ templateId: ':templateId' });

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
  editor: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
}));

const TemplateEditionView: React.FC<any> = () => {
  const classes = useStyles();
  const { templateId } = useParams<LocationParams>();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    data: versions = [],
    isValidating: loadingVersionList,
    revalidate: reloadVersionList,
  } = useTemplateVersionList(templateId);
  const { data: template, isValidating: loadingTemplate, revalidate: reloadTemplate } = useTemplate(templateId);

  const handleClickCreate = useCallback(() => history.push(getTemplateVersionCreatePath({ templateId })), [
    history,
    templateId,
  ]);
  const handleClickVersion = useCallback(
    (version: TemplateVersion) =>
      history.push(
        getTemplateVersionEditionPath({
          templateId,
          versionId: version.id,
        }),
      ),
    [history, templateId],
  );
  const handleClickDelete = useCallback(
    (version: TemplateVersion) => {
      setLoading(true);
      deleteTemplateVersion(templateId, version.id)
        .then(() => reloadVersionList())
        .finally(() => setLoading(false));
    },
    [reloadVersionList, setLoading, templateId],
  );
  const handleClickDuplicate = useCallback((version: TemplateVersion) => {
    console.log(version);
  }, []);
  const handleClickSetToDefault = useCallback(
    (version: TemplateVersion) => {
      setLoading(true);
      updateTemplate(templateId, { currentVersionId: version.id })
        .then(() => reloadTemplate())
        .finally(() => setLoading(false));
    },
    [reloadTemplate, setLoading, templateId],
  );

  return (
    <Skeleton backButtonVisible loading={loading || loadingVersionList || loadingTemplate} mainClassName={classes.root}>
      <Grid container spacing={1} justify="center">
        {template ? (
          <Grid item xs={12} sm={10} md={8}>
            <TemplateCardlet template={template} />
          </Grid>
        ) : null}
        <Grid item xs={12} sm={10} md={8}>
          <Card>
            <List subheader={<ListSubheader>Available versions</ListSubheader>}>
              {versions.map((version) => (
                <TemplateVersionListItem
                  key={version.id}
                  currentVersion={version.id === template?.currentVersionId}
                  onClick={handleClickVersion}
                  onDelete={handleClickDelete}
                  onDuplicate={handleClickDuplicate}
                  onSetToDefault={handleClickSetToDefault}
                  version={version}
                />
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
      {!!versions ? (
        <CreateButton extended={versions.length === 0} label="Create a version" onClick={handleClickCreate} />
      ) : null}
    </Skeleton>
  );
};

export default TemplateEditionView;