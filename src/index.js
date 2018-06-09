import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Properties extends React.Component {
  render() {
    const path = this.props.path;
    const [ key, value ] = path[path.length-1];
    switch (typeof value) {
      case 'string':
        const updateValue = e => {
          const newValue = e.target.value;
          const parent = path[path.length - 2][1];
          delete parent[key];
          parent[key] = newValue;
        };
        return (
          <div>
            <textarea onChange={updateValue}
              onKeyUp={updateValue}>{value}</textarea>
          </div>
        );
      default:
        return (
          <ul className="props">
            {Object.entries(value).map(v =>
              <li key={v[0]}>{this.renderProperty(v[0], v[1])}</li>)}
          </ul>
        );
    }
  }

  renderProperty(key, value) {
    var text = '';
    switch (typeof value) {
      case 'number':
        text = value.toString();
        break;
      case 'string':
        text = '"' + (value.length > 1024 ? value.substr(0, 1024) + '...' : value) + '"';
        break;
      case 'function':
        text = value.toSource().substr(0, 25);
        break;
      case 'object':
        if (value === null) {
          text = null;
        } else if (Array.isArray(value)) {
          text = JSON.stringify(value).substr(0, 1024);
        } else {
          text = JSON.stringify(value).substr(0, 1024);
        }
        break;
      case 'undefined':
        text = 'undefined';
        break;
      default:
        text = value.toString();
        break;
    }

    return <span>{key}: <span className="value"
      onClick={() => {
        this.props.onNavigate(this.props.path.concat([[key, value]]));
      }}>{text}</span></span>
  }
}
  
class Path extends React.Component {
  render() {
    const renderPathItem = (item, index) => (
      <li key={index}>
        <span onClick={() =>
          this.props.onNavigate(this.props.path.slice(0, index+1))}>{item}</span>
      </li>
    );

    const copy = () => {
      const json = JSON.stringify(this.props.path[0][1], null, 2);
      const ta = document.createElement('textarea');
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    };

    return (
      <div className="path">
        <span className="copy" onClick={copy}>
          <i className="fas fa-copy"></i>
        </span>
        <ul>{this.props.path.map(v => v[0]).map(renderPathItem)}</ul>
      </div>
    );
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.model ? {
      model : props.model,
      path : [ ['root', props.model ] ]
    } : { };
  }

  navigate(path) {
    this.setState({ path : path });
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDrop(e) {
    e.preventDefault();

    const updateModelFromFile = file => {
      let reader = new FileReader();
      reader.onload = e => {
        const model = JSON.parse(e.target.result);
        this.setState({ path : [ [ file.name, model ] ] });
      };
      reader.readAsText(file);
    }
  
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          let file = e.dataTransfer.items[i].getAsFile();
          updateModelFromFile(e.dataTransfer.files[i]);
          break;
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        updateModelFromFile(e.dataTransfer.files[i]);
        break;
      }
    }

    if (e.dataTransfer.items) {
      e.dataTransfer.items.clear();
    } else {
      e.dataTransfer.clearData();
    }

  }

  render() {
    const sourceCodeLink = () =>
      <a href="https://github.com/AlexAtNet/modelx">source code</a>;
    const featuresLink = () =>
      <a href="https://github.com/AlexAtNet/modelx/issues?utf8=%E2%9C%93&amp;q=is%3Aissue+is%3Aclosed+is%3Aenhancement">features</a>;
    const issuesLink = () =>
      <a href="https://github.com/AlexAtNet/modelx/issues">issues</a>;
    return (
      <div id="editor"
        onDrop={e => this.onDrop(e)}
        onDragOver={e => this.onDragOver(e)}>
        {
          this.state.path ? (
            <Path path={this.state.path}
              onNavigate={path => this.navigate(path)} />
          ) : null
        }
        {
          this.state.path ? (
            <Properties path={this.state.path}
              onNavigate={path => this.navigate(path)} />
          ) : (
            <div style={{ padding : '1rem' }}>
              <h1>Minimalistic JSON editor</h1>
              <p>Drag'n'drop a JSON file on this page, browse and update it,
                and click <i className="fas fa-copy"></i> to copy the result
                into the clipboard when you finish.</p>
              <p>{sourceCodeLink()} ~ {featuresLink()} ~ {issuesLink()}</p>
            </div>
          )
        }
      </div>
    );
  }
}
  
ReactDOM.render(
  <Editor />,
  document.getElementById('root')
);
  