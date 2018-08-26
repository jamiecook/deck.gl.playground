import React, { Component } from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer, ScatterplotLayer} from 'deck.gl';
import GL from 'luma.gl/constants';
import logo from './logo.svg';
// import {interpolate} from 'color-interpolate';
import {colorInterpolation} from 'color-interpolator';
import './App.css';

import { Grid, Navbar, Jumbotron, Button } from 'react-bootstrap';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidmxjZGV2ZWxvcGVycyIsImEiOiJjajBkZzNlYzQwMDR1MndvNzhib241N25iIn0.dzM4dSOKiY37YnFhl2KpoA'

export const INITIAL_VIEW_STATE = {
//   latitude: -27.65,
//  longitude: 153.0,
  longitude: -77.02221374027431,
  latitude: 38.9215856,
  zoom: 13.5,
  maxZoom: 16,
  pitch: 30,
  bearing: 0
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this._getColour = this._getColour.bind(this);
    // var colormap = interpolate(['red', 'green']);
    this.state = { points: [] };

    fetch('./positions.json').then( (response) => {
      console.log(response);
      return response.json();
    }).then( (json) => {
      this.setState({
        points: json.features
      });
    });
  }

  _getColour(e) {
    var timestamp = (Date.parse(e.properties.time));
    var proportion = (timestamp - 1351121380000) / (1351122328000-1351121380000);
    var value = colorInterpolation('#ff0000', '#00ff00', proportion);
    console.log(value);
    console.log(hexToRgb(value));
    return hexToRgb(value);
    // return [255, 150, 0];
    // return e.properties.time;
  }

  _renderLayers() {
    const {
      getStrokeWidth = 3
    } = this.props;

    return [
      new ScatterplotLayer({
        id: 'airports',
        data: this.state.points,
        getPosition: d => d.geometry.coordinates,
        getColor: this._getColour, // [255, 140, 0],
        getRadius: d => 10,
        pickable: true
      })
    ];
  }


  render() {
    const {viewState, controller = true, baseMap = true} = this.props;


    return (
      <div>
        <Navbar inverse fixedTop>
          <Grid>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">React App</a>
              </Navbar.Brand>
              <img src={logo} className="App-logo" alt="logo" />
              <Navbar.Toggle />
            </Navbar.Header>
          </Grid>
        </Navbar>

        <Jumbotron>
          <Grid>
            <h1>Welcome to React</h1>
            <p>
              <Button
                bsStyle="success"
                bsSize="large"
                href="http://react-bootstrap.github.io/components.html"
                target="_blank">
                  View React Bootstrap Docs
              </Button>
            </p>
          </Grid>

        </Jumbotron>
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          controller={controller}
          pickingRadius={5}
          parameters={{
            blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
            blendEquation: GL.FUNC_ADD
          }}
            >
            {baseMap && (
                <StaticMap
              reuseMaps
              mapStyle="mapbox://styles/mapbox/light-v9"
              preventStyleDiffing={true}
              mapboxApiAccessToken={MAPBOX_TOKEN}
                />
            )}
        </DeckGL>
      </div>
    );
  }
}

export default App;

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//          To get started, edit <code>src/App.js</code> and save to reload.
//        </p>
//      </div>
//    );
//  }
//}

//export default App;
