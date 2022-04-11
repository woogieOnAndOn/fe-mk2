/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// import githubLogo from '/public/GitHub-Mark-64px.png';
import './AuthPage.css';
import React, { useState, useEffect, ReactElement, useRef, SyntheticEvent } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Dropdown, DropdownItemProps, DropdownProps, List, ListItemProps, Label, Header, Message } from 'semantic-ui-react'

const AuthPage: React.FC = (): ReactElement => {
  const handleOnclickLogin = () => {
    window.location.href = `${process.env.REACT_APP_SPRING_URL}/oauth2/authorization/github`;
  }

  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h2' color='teal' textAlign='center'>
          <Image src='img/GitHub-Mark-64px.png' /> Available only with Github
        </Header>
        <Form size='large'>
          {/* <Segment stacked> */}
            {/* <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' />
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
            /> */}

            <Button color='teal' fluid size='large' onClick={handleOnclickLogin}>
              Login
            </Button>
          {/* </Segment> */}
        </Form>
        {/* <Message>
          New to us? <a href='#'>Sign Up</a>
        </Message> */}
      </Grid.Column>
    </Grid>
  )
}

export default AuthPage;