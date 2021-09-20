import * as React from 'react';
import * as ReactDOM from 'react-dom';

import "./EditorManager"
import "./rmmz/Input"
import "./rmmz/Graphics"
import { Button } from '@mui/material';
import RootTabs from './RootTabs';
//import {SubComponent} from './sub-component';

class App extends React.Component {
  render() {
    return (
        <div>
          <RootTabs />
        </div>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#editorRoot'));

