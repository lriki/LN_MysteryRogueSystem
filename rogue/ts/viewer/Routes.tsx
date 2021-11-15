import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppNavigator } from './AppNavigator';
import { DatabaseNavigator } from './data/DatabaseNavigator';
import StateDataEditor from './data/StateDataEditor';
import { ErrorPage } from './ErrorPage';
import RootTabs from './RootTabs';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/index.html">
                    <AppNavigator />
                </Route>
                <Route exact path="/database/states">
                    <StateDataEditor />
                </Route>
                <Route exact path="/database">
                    <DatabaseNavigator />
                </Route>
                <Route>
                    <ErrorPage />
                </Route>
            </Switch>
        </BrowserRouter>
    );
}
