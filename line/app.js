import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';
import GL from 'luma.gl/constants';

// Set your mapbox token here
// const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmxjZGV2ZWxvcGVycyIsImEiOiJjajBkZzNlYzQwMDR1MndvNzhib241N25iIn0.dzM4dSOKiY37YnFhl2KpoA'

// Source data CSV
const DATA_URL = {
  AIRPORTS: './airports.json',
  FLIGHT_PATHS: './heathrow-flights.json'
};

export const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('mid') >= 0) {
    return 50;
  }
  if (type.search('small') >= 0) {
    return 20;
  }
  return 600;
}

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredObject: null
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{left: x, top: y}}>
          <div>{hoveredObject.country || hoveredObject.abbrev}</div>
          <div>{hoveredObject.type}</div>
          <div>{hoveredObject.name.indexOf('0x') >= 0 ? '' : hoveredObject.name}</div>
        </div>
      )
    );
  }

  _renderLayers() {
    const {
      airports = DATA_URL.AIRPORTS,
      flightPaths = DATA_URL.FLIGHT_PATHS,
      getStrokeWidth = 3
    } = this.props;

    return [
      new ScatterplotLayer({
        id: 'airports',
        data: airports,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: [255, 140, 0],
        getRadius: d => getSize(d.type),
        pickable: true,
        onHover: this._onHover
      }),
      new LineLayer({
        id: 'flight-paths',
        data: flightPaths,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor,
        getStrokeWidth,
        pickable: true,
        onHover: this._onHover
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
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

        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
