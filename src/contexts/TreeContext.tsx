import React, { createContext, useReducer, useContext } from 'react';
import { reducer, initialState } from '../reducer/tree';
import { TreeState } from '../reducer/tree/states';
import PropTypes from 'prop-types';
import store  from '../common/store';

interface TreeContextProps {
  treeState: TreeState;
  treeDispatch: React.Dispatch<any>;
}

export const TreeContext = createContext({} as TreeContextProps);
const TreeDispatchContext = createContext({} as React.Dispatch<any>);

export const TreeProvider: React.FC = ({ children }) => {
  const [treeState, treeDispatch] = useReducer(reducer, initialState);

  if (!store.isReady) {
    store.isReady = true;
    store.dispatch = params => treeDispatch(params);
    Object.freeze(store);
  }

  return (
    <TreeContext.Provider value={{ treeState, treeDispatch }}>
      <TreeDispatchContext.Provider value={treeDispatch}>
        {children}
      </TreeDispatchContext.Provider>
    </TreeContext.Provider>
  );
};

TreeProvider.propTypes = {
  children: PropTypes.node,
}

export const useTreeContext = () => {
  return useContext(TreeContext);
};

export const useTreeDispatch = (): React.Dispatch<any> => {
  return useContext(TreeDispatchContext);
};