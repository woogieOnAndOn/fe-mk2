/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

import { MainPage, KanbanPage, ComicPage } from './pages';
import { TreeContext, TreeProvider } from './contexts/TreeContext';
import { useContext } from 'react';

const App = () => {
  const { treeState, treeDispatch } = useContext(TreeContext);

  return (
    <Router>
      <Switch>
        <TreeContext.Provider value={{ treeState, treeDispatch }}>
          <TreeProvider>
            <Route path="/main" component={MainPage}></Route>
          </TreeProvider>
        </TreeContext.Provider>
      </Switch>
      <Switch>
        <Route path="/kanban" component={KanbanPage}></Route>
      </Switch>
      <Switch>
        <Route path="/comic" component={ComicPage}></Route>
      </Switch>
    </Router>
  );
}

export default App;