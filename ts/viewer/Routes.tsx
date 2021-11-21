import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AppNavigator } from './AppNavigator';
import { DatabaseNavigator } from './data/DatabaseNavigator';
import LandViewer from './data/LandViewer';
import StateDataEditor from './data/StateDataEditor';
import TraitViewer from './data/TraitViewer';
import { ErrorPage } from './ErrorPage';

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/index.html">
                    <AppNavigator />
                </Route>
                <Route exact path="/database/states"><StateDataEditor /></Route>
                <Route exact path="/database/traits"><TraitViewer /></Route>
                <Route exact path="/database/lands" component={LandViewer} />
                <Route exact path="/database/lands/:id" component={LandViewer} />
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
