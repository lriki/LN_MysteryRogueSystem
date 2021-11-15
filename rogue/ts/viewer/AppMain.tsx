import * as React from 'react';
import * as ReactDOM from 'react-dom';

import "./EditorManager"
import "./rmmz/Input"
import "./rmmz/Graphics"
import { Box, Button, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import RootTabs from './RootTabs';
//import {SubComponent} from './sub-component';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

class App extends React.Component {
  
  render() {
    return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Box>
            <RootTabs />
          </Box>
        </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#editorRoot'));

