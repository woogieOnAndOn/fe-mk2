/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext } from 'react';
import { Icon, Step } from 'semantic-ui-react'
import { TreeContext } from '../../../contexts/TreeContext';
import { ActionType } from '../../../model/tree.model';

interface PropTypes {  }

const PathSection: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState } = useContext(TreeContext);

  // console.log('path');

  return (
    <Step.Group size='mini'>
      <Step>
        <Icon name='folder open outline' />
        <Step.Content>
          <Step.Title>user</Step.Title>
        </Step.Content>
      </Step>
      {treeState.targetTree?.upperName && treeState.targetTree?.upperName.map((data, index) => (
        <Step key={index}>
          <Icon name='folder open outline' />
          <Step.Content>
            <Step.Title>{data}</Step.Title>
          </Step.Content>
        </Step>
      ))}
      {treeState.targetTree?.name !== 'user' && treeState.targetTree?.name !== '' && 
        <Step active>
          {
            {
              [ActionType.CREATE]: <Icon name='folder open outline' />,
              [ActionType.READ]: <Icon name='file alternate outline' />,
              [ActionType.UPDATE]: <Icon name='write' />
            }[treeState.actionType]
          }
          <Step.Content>
            <Step.Title>{treeState.targetTree?.name}</Step.Title>
          </Step.Content>
        </Step>
      }
    </Step.Group>
  );
};

export default PathSection;