import React, { useState } from 'react';
import {
  Modal,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  importModelUiSchema,
  importModelSchema,
  Typography,
} from '@layer5/sistent';
import { RJSFModalWrapper } from '../Modal';
import CsvStepper, { StyledDocsRedirectLink } from './Stepper/CSVStepper';
import { MESHERY_DOCS_URL } from '@/constants/endpoints';
import { getUnit8ArrayDecodedFile } from '@/utils/utils';
import { updateProgress } from 'lib/store';
import { useImportMeshModelMutation } from '@/rtk-query/meshModel';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Modal,
  FormControlLabel,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  importModelUiSchema,
  importModelSchema,
  Typography,
  ModalFooter,
  Box,
} from '@layer5/sistent';
import { RJSFModalWrapper } from '../Modal';
import { updateProgress } from 'lib/store';
import CsvStepper, { StyledDocsRedirectLink } from './Stepper/CSVStepper';
import { MESHERY_DOCS_URL } from '@/constants/endpoints';
import { useContext } from 'react';
import { capitalize } from 'lodash';
import { Loading } from '@/components/DesignLifeCycle/common';
import { NotificationCenterContext } from '../NotificationCenter';
import { OPERATION_CENTER_EVENTS } from 'machines/operationsCenter';
import {
  ModelImportedSection,
  ModelImportMessages,
} from '../NotificationCenter/formatters/model_registration';

import { Button, NoSsr } from '@layer5/sistent';
import { iconSmall } from '../../css/icons.styles';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ImportModelModal from './ImportModelModal';

const FinishDeploymentStep = ({ deploymentType, handleClose }) => {
  const { operationsCenterActorRef } = useContext(NotificationCenterContext);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployEvent, setDeployEvent] = useState();

  useEffect(() => {
    try {
      setIsDeploying(true);
    } catch (error) {
      setIsDeploying(false);
    }
  }, []);
  useEffect(() => {
    const subscription = operationsCenterActorRef.on(
      OPERATION_CENTER_EVENTS.EVENT_RECEIVED_FROM_SERVER,
      (event) => {
        const serverEvent = event.data.event;
        if (serverEvent.action === deploymentType) {
          setIsDeploying(false);
          setDeployEvent(serverEvent);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const progressMessage = `${capitalize(deploymentType)}ing model`;

  if (isDeploying) {
    return <Loading message={progressMessage} />;
  }

  if (!deployEvent) {
    return null;
  }

  return (
    <>
      <Box sx={{ padding: '0.4rem' }}>
        <ModelImportMessages message={deployEvent.metadata?.ModelImportMessage} />
        <ModelImportedSection modelDetails={deployEvent.metadata?.ModelDetails} />
      </Box>
      <ModalFooter
        variant="filled"
        helpText={
          'Click Finish to complete the model import process. The imported model will be available in your Model Registry.'
        }
      >
        <Button variant="contained" color="primary" onClick={handleClose}>
          Finish
        </Button>
      </ModalFooter>
    </>
  );
};

const ImportModelModal = React.memo(({ isImportModalOpen, setIsImportModalOpen }) => {
  const [importModalDescription, setImportModalDescription] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [importModelReq] = useImportMeshModelMutation();
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    }
  };
  const handleGenerateModal = async (data) => {
    const { component_csv, model_csv, relationship_csv, register } = data;
    let requestBody = {
      importBody: {
        model_csv: model_csv,
        component_csv: component_csv,
        relationship_csv: relationship_csv,
      },
      uploadType: 'csv',
      register: register,
    };

    updateProgress({ showProgress: true });
    await importModelReq({ importBody: requestBody });
    updateProgress({ showProgress: false });
  };

  const handleImportModelSubmit = async (data) => {
    const { uploadType, url, file } = data;
    let requestBody = null;

    const fileElement = document.getElementById('root_file');

    switch (uploadType) {
      case 'File Import': {
        const fileName = fileElement.files[0].name;
        const fileData = getUnit8ArrayDecodedFile(file);
        if (fileData) {
          requestBody = {
            importBody: {
              model_file: fileData,
              url: '',
              filename: fileName,
            },
            uploadType: 'file',
            register: true,
          };
        } else {
          console.error('Error: File data is empty or invalid');
          return;
        }
        break;
      }
      case 'URL Import': {
        if (url) {
          requestBody = {
            importBody: {
              url: url,
            },
            uploadType: 'urlImport',
            register: true,
          };
        } else {
          console.error('Error: URL is empty');
          return;
        }
        break;
      }
      case 'CSV Import': {
        setIsImportModalOpen(false);
        setIsCsvModalOpen(true);
        return;
      }
      default: {
        console.error('Error: Invalid upload type');
        return;
      }
    }
    updateProgress({ showProgress: true });
    await importModelReq({ importBody: requestBody });
    updateProgress({ showProgress: false });
  };

  const CustomRadioWidget = (props) => {
    const { options, value, onChange, label, schema } = props;
    const { enumOptions } = options;

    setImportModalDescription(schema.description);

    return (
      <FormControl component="fieldset">
        <RadioGroup
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: '-1.7rem', marginLeft: '-1rem' }}
        >
          <Typography fontWeight={'bold'} fontSize={'1rem'}>
            {label}
          </Typography>

          {enumOptions.map((option, index) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={
                <div>
                  <Typography variant="subtitle1">{option.label}</Typography>
                  <Typography variant="body2" color="textSecondary" textTransform={'none'}>
                    {schema.enumDescriptions[index]}
                  </Typography>
                </div>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  };

  const widgets = {
    RadioWidget: CustomRadioWidget,
  };

  return (
    <>
      <Modal
        open={isImportModalOpen}
        closeModal={() => setIsImportModalOpen(false)}
        maxWidth="sm"
        title="Import Model"
        style={{
          zIndex: 1500,
        }}
      >
        {activeStep === 0 ? (
          <RJSFModalWrapper
            schema={importModelSchema}
            uiSchema={importModelUiSchema}
            handleSubmit={handleImportModelSubmit}
            handleNext={handleNext}
            submitBtnText="Next"
            handleClose={() => setIsImportModalOpen(false)}
            widgets={widgets}
            helpText={
              <p>
                {importModalDescription} <br />
                Learn more about importing Models in our{' '}
                <StyledDocsRedirectLink
                  href={`${MESHERY_DOCS_URL}/guides/configuration-management/importing-models`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  documentation
                </StyledDocsRedirectLink>
                .
              </p>
            }
          />
        ) : (
          <FinishDeploymentStep
            deploymentType="register"
            handleClose={() => setIsImportModalOpen(false)}
          />
        )}
      </Modal>
      <Modal
        open={isCsvModalOpen}
        closeModal={() => setIsCsvModalOpen(false)}
        maxWidth="sm"
        title="Import CSV"
        style={{
          zIndex: 1500,
        }}
      >
        <CsvStepper
          handleGenerateModal={handleGenerateModal}
          handleClose={() => setIsCsvModalOpen(false)}
        />
      </Modal>
    </>
  );
});

ImportModelModal.displayName = 'ImportModelModal';

export default ImportModelModal;
