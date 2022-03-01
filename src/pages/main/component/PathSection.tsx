/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from 'react';
import { Icon, Step } from 'semantic-ui-react'
import { TreeContext } from '../../../contexts/TreeContext';
import { ActionType } from '../../../model/tree.model';
import { findTreePathById } from '../../../util/Tree.util';

interface PropTypes {  }

const PathSection: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState } = useContext(TreeContext);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const result: string[] = findTreePathById(treeState.datas, treeState.targetTree.id);
    setPaths(result);
  },[treeState.targetTree]);

  return (
    <Step.Group size='mini'>
      <Step>
        <Icon name='folder open outline' />
        <Step.Content>
          <Step.Title>user</Step.Title>
        </Step.Content>
      </Step>
      {paths && paths.map((data, index) => (
        <Step key={index}>
          <Icon name='folder open outline' />
          <Step.Content>
            <Step.Title>{data}</Step.Title>
          </Step.Content>
        </Step>
      ))}
      {treeState.targetTree.name !== '' && 
        <Step active>
          {
            {
              [ActionType.CREATE]: <Icon name='folder open outline' />,
              [ActionType.READ]: <Icon name='file alternate outline' />,
              [ActionType.UPDATE]: <Icon name='write' />
            }[treeState.actionType]
          }
          <Step.Content>
            <Step.Title>{treeState.targetTree.name}</Step.Title>
          </Step.Content>
        </Step>
      }
    </Step.Group>
  );
};

export default PathSection;