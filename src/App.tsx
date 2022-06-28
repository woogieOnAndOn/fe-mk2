/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { TreeProvider } from './contexts/TreeContext';

import { MainPage, KanbanPage, AuthPage } from './pages';

const App = () => {

  return (
    <Router>
      <Switch>
        <TreeProvider>
          <Route path="/main" component={MainPage}></Route>
        </TreeProvider>
      </Switch>
      <Switch>
        <Route path="/kanban" component={KanbanPage}></Route>
      </Switch>
      <Switch>
        <Route path="/auth" component={AuthPage}></Route>
      </Switch>
    </Router>
  );
}

export default App;