/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactElement } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
import { useDrag } from 'react-dnd'
import { 
  ComponentType, 
  Issue,
} from '../../../model/issue.model'

interface ItemProps {
  issue: Issue;
  showActionBtns: boolean;
}

const MovableItem: FC<ItemProps> = (props: ItemProps): ReactElement => {
  const {
    issue,
    showActionBtns
  } = props;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ComponentType.ISSUE,
    item: { issueId: issue.issueId, issueName: issue.issueName, issueState: issue.issueState, useTime: issue.useTime },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <>
    <Message color='brown'>
      <Label color='teal' floating>{issue.useTime}</Label>
      <div ref={drag} style={{ opacity }}>
        <Message.Header>{issue.issueName}</Message.Header>
      </div>
    </Message>
    {showActionBtns && 
      <div style={{marginTop: '-12px', float: 'right' }}>
        <Button.Group basic size='mini'>
          <Button icon='edit outline' />
          <Button icon='trash alternate outline' />
        </Button.Group>
      </div>
    }
    </>
  )
}

export default MovableItem;