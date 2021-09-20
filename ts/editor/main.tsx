import * as React from 'react';
import * as ReactDOM from 'react-dom';

import "./EditorManager"
import "./rmmz/Input"
import "./rmmz/Graphics"
//import {SubComponent} from './sub-component';

class App extends React.Component {
  render() {
    return (
        <div>
          <h1>Hello React!</h1>
        </div>
    );
  }
}

ReactDOM.render(<App/>, document.querySelector('#editorRoot'));

