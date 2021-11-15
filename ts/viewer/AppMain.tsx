import * as React from 'react';
import * as ReactDOM from 'react-dom';

import "./EditorManager"
import "./rmmz/Input"
import "./rmmz/Graphics"
import { Box, Button, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppRoutes } from './Routes';
import { theme } from './Theme';
//import {SubComponent} from './sub-component';


class App extends React.Component {
  
  render() {
    return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppRoutes />
        </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#editorRoot'));

