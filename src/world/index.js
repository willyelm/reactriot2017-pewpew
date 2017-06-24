import React from 'react';

import TileMap from '../tile-map';
import Frog from '../common/frog';
import Bullet from '../common/bullet';
import Opponents from '../opponents';
import GLOBAL from '../constants';

import {
  detectCollision
} from '../utils/geometry';

const tileObject = {
  0: {},
  1: {},
  2: {
    rigid: true
  },
  3: {
    rigid: true
  },
};

export default class World extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      visibleTileMap: [],
      cameraFocusPoint: {},

      bulletFired: false,

      player: {
        relativePosition: {},
        position: {}
      },

      opponents: [
        {x: 1, y: 1},
        {x: 3, y: 3},
        {x: 5, y: 5}
      ]

    };

    this.screenDimensions = {};
    this.cameraBarrierPoints = {};
    this.mapStartPoints = {};

    this.setVisibleMap = this.setVisibleMap.bind(this);
    this.setScreenDimensions = this.setScreenDimensions.bind(this);
    this.setScreenDimensions = this.setScreenDimensions.bind(this);
    this.setKeyBindings = this.setKeyBindings.bind(this);
    this.setPlayerPosition = this.setPlayerPosition.bind(this);
    this.checkFrogCollision = this.checkFrogCollision.bind(this);
  }

  updatePosition = (index) => {
    var cloneState = Object.assign({}, this.state);
    cloneState.opponents = cloneState.opponents.slice();
    cloneState.opponents[index] = Object.assign({}, cloneState.opponents[index]);
    if (cloneState.opponents[index].y > 20) {
      cloneState.opponents[index].x += 1;
    } else {
      cloneState.opponents[index].y += 1;
    }
    this.setState(cloneState);
  };

  componentDidMount() {
    this.setScreenDimensions({size: 5});
    this.setKeyBindings();
    let startingPlayerPosition = {
      x: 2,
      y: 2
    };
    this.setCameraFocus(startingPlayerPosition);
    this.setPlayerPosition(startingPlayerPosition);
  }

  getRelativePosition({x, y}) {
    return {
      x: x - this.mapStartPoints.x || 0,
      y: y - this.mapStartPoints.y || 0
    };
  }

  async setPlayerPosition({x, y}) {
    //BOUNDARY LIMIT VALIDATION
    if (x < 0 || x > (this.props.worldMap[0].length - 1) || y < 0 || y > (this.props.worldMap.length - 1)) {
      return;
    }
    let position = {
      x: x,
      y: y
    };
    if (this.checkFrogCollision(position)) {
      return;
    }
    await this.setState({
      player: {
        position,
        relativePosition: this.getRelativePosition(position)
      }
    });
    this.setCameraFocus(position);
  }

  setScreenDimensions({size}) {
    this.screenDimensions = {
      size: size,
      radius: (size - 1) / 2
    };
    this.cameraBarrierPoints = {
      left: this.screenDimensions.radius,
      right: (this.props.worldMap[0].length - this.screenDimensions.radius - 1),
      top: this.screenDimensions.radius,
      bottom: (this.props.worldMap.length - this.screenDimensions.radius - 1)
    };
  }

  setKeyBindings() {
    document.onkeydown = (e) => {
      e = e || window.event;
      let playerPosition = Object.assign({}, this.state.player.position);
      switch (e.which || e.keyCode) {
        case 37:
          playerPosition.x -= 0.25;
          break;

        case 39:
          playerPosition.x += 0.25;
          break;

        case 38:
          playerPosition.y -= 0.25;
          break;

        case 40:
          playerPosition.y += 0.25;
          break;

        default:
          return;
      }
      this.setPlayerPosition(playerPosition);
    }
  }

  setCameraFocus({x, y}) {
    let cameraFocus = {};
    let cameraBarrierPoints = this.cameraBarrierPoints;

    cameraFocus.x = (x > cameraBarrierPoints.left) ? x : cameraBarrierPoints.left;
    cameraFocus.x = (x < cameraBarrierPoints.right) ? cameraFocus.x : cameraBarrierPoints.right;
    cameraFocus.y = (y > cameraBarrierPoints.top) ? y : cameraBarrierPoints.top;
    cameraFocus.y = (y < cameraBarrierPoints.bottom) ? cameraFocus.y : cameraBarrierPoints.bottom;

    this.state.cameraFocusPoint = cameraFocus;
    this.setState({
      cameraFocusPoint: this.state.cameraFocusPoint
    });
    this.setVisibleMap();
  }

  async setVisibleMap() {
    this.mapStartPoints = {
      x: (this.state.cameraFocusPoint.x - this.screenDimensions.radius),
      y: (this.state.cameraFocusPoint.y - this.screenDimensions.radius),
    };

    let visibleTileMap = this.props.worldMap.slice(this.mapStartPoints.y, (this.mapStartPoints.y + this.screenDimensions.size)).map((row) => {
      return row.slice(this.mapStartPoints.x, (this.mapStartPoints.x + this.screenDimensions.size));
    });
    await this.setState({
      visibleTileMap: visibleTileMap
    });
  }


  checkFrogCollision({x, y}) {
    let frogDimensions = {
      x: x * GLOBAL.CELL_SIZE,
      y: y * GLOBAL.CELL_SIZE,
      width: (GLOBAL.CELL_SIZE/4),
      height: (GLOBAL.CELL_SIZE/4)
    };
    for (let i = 0; i < this.state.visibleTileMap.length; i++) {
      let tileRow = this.state.visibleTileMap[i];
      for (let j = 0; j < tileRow.length; j++) {
        let tileCell = tileRow[j];
        let tileCellObject = tileObject[tileCell];
        if (tileCellObject && tileCellObject.rigid) {
          let tileDimensions = {
            x: i * GLOBAL.CELL_SIZE,
            y: j * GLOBAL.CELL_SIZE,
            width: GLOBAL.CELL_SIZE,
            height: GLOBAL.CELL_SIZE
          };
          if(detectCollision(tileDimensions, frogDimensions)) {
            console.log(tileDimensions, frogDimensions)
            return true;
            break;
          }
        }
      }
    }
    return false;
  }

  fireBullet = () =>{
    this.setState({bulletFired: true});
  };

  killBullet = () =>{
    this.setState({bulletFired: false});
  };

  render() {
    return (
      <div className="world-container">
        <TileMap tileMap={this.state.visibleTileMap}/>
        <Frog position={this.state.player.relativePosition} fireBullet={this.fireBullet}/>
        {/*{this.state.opponents.map((position, index) =>*/}
        {/*<Opponents key={index} updatePosition= {this.updatePosition}*/}
        {/*index={index} position={this.getRelativePosition(position)}/>)*/}
        {/*}*/}
        {this.state.bulletFired ?
          <Bullet position={this.state.player.relativePosition} killBullet={this.killBullet}/> : null
        }
      </div>
    )
  }
}
