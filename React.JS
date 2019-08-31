{
  const BOARD_SIZE = 90; // the size of the square field 
  const GAME_FIELD_CLASSES = ['open', 'wall', 'hero', 'enemy', 'weapon', 'health', 'teleport']; // classes for styling game field
  const GAME_FIELD_SYMBOLS = [' ', '#', '@', '', '!', '+', ' ']; // symbols to put in game field cells
  const GAME_OBJECTS_NUMERALS = {
    'open':     0,
    'wall':     1,
    'hero':     2,
    'enemy':    3,
    'weapon':   4,
    'health':   5,
    'teleport': 6,
    'bigboss':  7
  };
  
  const MAX_GAME_LEVELS = 4; // maximum dungeons in the game (the last contains the big boss), count starts from 1
  // weapons names that are shown in the game view  
  const WEAPON_NAMES = {
    '0':  'grass leaf',
    '1':  'bronze stick',
    '2':  'stained knife',
    '3':  'shortgun',
    '4':  'bazooka'
  };
  
  // the size of the game view
  const VIEW_MAX_COLS = 30;
  const VIEW_MAX_ROWS = 20; 
   
  // LEVEL CREATION
  class Dungeon {
    constructor (levelNumber) {
      this._levelNumber = levelNumber;
      this._boardSize = BOARD_SIZE;
      this._levelBoard = [];
      this._enemiesCountRange = [5, 10]; // how many enemies will be on the map
      this._enemiesCoordsArray = []; // array where the enemies' coordinates are held
      this._healthCountRange = [5, 7]; // how many health points will be on the map
      this._weaponCount = 1; // one weapon per level
      if (levelNumber === MAX_GAME_LEVELS) {
        this._teleportCount = 0;
        this._bigBoss = 1;
      } else {
        this._teleportCount = 1; // one teleport to the next level
        this._bigBoss = 0;
      }
    }
    
    // getters
    get enemiesArray () { return this._enemiesCoordsArray; }
    get ifBigBossPresent () { return this._bigBoss === 0 ? false : true; }
    
    // helpers
    // getting the array of a random board coordinates
    _getRandCoords () {
      return [Math.floor(Math.random() * (this._levelBoard.length - 1) + 1),
              Math.floor(Math.random() * (this._levelBoard.length - 1) + 1)];
    }
    // check if rectangle fits in the board
    _checkIfRoomFits (roomDimensions, startPosition) {
      // check if conflicta with boundaries
      if ((roomDimensions[0] + startPosition[0]) > this._boardSize - 1 || 
          (roomDimensions[1] + startPosition[1]) > this._boardSize - 1) {
        return false;
      }
      // check if it will touch the other room
      for (let i = startPosition[0] - 1; i <= startPosition[0] + roomDimensions[0] + 2; i++) {
        for (let j = startPosition[1] - 1; j <= startPosition[1] + roomDimensions[1] + 2; j++) {
          if (this._levelBoard[i][j] !== GAME_OBJECTS_NUMERALS['open']) {
            return false;
          }
        }
      }
      return true;
    };
    // function to place game stuff
    _placeGameStuff (stuffNumber, howMuchRange) {
      let itemsCount;
      if (Array.isArray(howMuchRange)) {
        itemsCount = Math.floor(Math.random() * (howMuchRange[1] - howMuchRange[0])) + howMuchRange[0];
      } else {
        itemsCount = howMuchRange;
      }
      
      // for big boss is different -- placing a square of 4 cells
      if (stuffNumber === GAME_OBJECTS_NUMERALS['bigboss']) {
        for (let num = 0; num < itemsCount; num++) {
          let bigBossSize = [2,2]; // square 2x2
          let ifPlaced = false;
          let foundCoords = [];
          while (!ifPlaced) {
            let randBossCoords = this._getRandCoords();
            if (this._checkIfRoomFits(bigBossSize, randBossCoords)) {
              ifPlaced = true;
              foundCoords = randBossCoords;
            }
          }
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
              this._levelBoard[foundCoords[0] + i][foundCoords[1] + j] = stuffNumber;
            }
          }
        }
      } else {
        for (let i = 0; i < itemsCount; i++) {
          let placed = false;
          while (!placed) {
            let randCoords = this._getRandCoords();
            if (this._levelBoard[randCoords[0]][randCoords[1]] === GAME_OBJECTS_NUMERALS['open']) {
              this._levelBoard[randCoords[0]][randCoords[1]] = stuffNumber;
              if (stuffNumber === GAME_OBJECTS_NUMERALS['enemy']) {
                this._enemiesCoordsArray.push([randCoords[0], randCoords[1]]);
              }
              placed = true;
            }
          }
        }
      }
    }
    
    _makeLevelBoard () {
      // making walls
      for (let i = 0; i < this._boardSize; i++) {
        let row = [];
        for (let j = 0; j < this._boardSize; j++) {
          if (i === 0 || i === this._boardSize - 1) {
            row.push(GAME_OBJECTS_NUMERALS['wall']);
          } else if (j === 0 || j === this._boardSize - 1) {
            row.push(GAME_OBJECTS_NUMERALS['wall']);
          } else {
            row.push(GAME_OBJECTS_NUMERALS['open']);
          }
        }
        this._levelBoard.push(row);
      }
      
      // making 'maze'
      for (let counter = 0; counter < 60; counter++) {
        let randWidth = Math.floor(Math.random() * 7) + 2;
        let randHeight = Math.floor(Math.random() * 7) + 2;
        // random start point of a room
        let randRoomPos = [];
        let ifFits = false;
        while (!ifFits) {
          var ranCoords = this._getRandCoords();
          ifFits = this._checkIfRoomFits([randWidth, randHeight], ranCoords);
        }
        randRoomPos = ranCoords;

        // placing the room and modifying the board
        for (let i = randRoomPos[0]; i <= randRoomPos[0] + randWidth; i++) {
          for (let j = randRoomPos[1]; j <= randRoomPos[1] + randHeight; j++) {
            this._levelBoard[i][j] = GAME_OBJECTS_NUMERALS['wall'];
          }
        }
      }
      
      // placing the game stuff on the board
      this._placeGameStuff(GAME_OBJECTS_NUMERALS['enemy'], this._enemiesCountRange);
      this._placeGameStuff(GAME_OBJECTS_NUMERALS['health'], this._healthCountRange);
      this._placeGameStuff(GAME_OBJECTS_NUMERALS['weapon'], this._weaponCount);
      this._placeGameStuff(GAME_OBJECTS_NUMERALS['teleport'], this._teleportCount);
      this._placeGameStuff(GAME_OBJECTS_NUMERALS['bigboss'], this._bigBoss);
    }
    
    makeLevelBoard () {
      this._makeLevelBoard();
      return this._levelBoard;
    }
  }
  
  // CREATING A HERO
  class Hero {
    constructor (dungeonClass) {   
      this._heroStats = {
        level:        1,
        weaponNumber: 0,
        healthPoints: 20,
        attackPoints: 10,
        dungeonLevel: 1,
        xpPoints:     0,
        won: false
      };
      this._heroPosition = [];
      this._dungeonClass = dungeonClass;
      this._dungeon = new this._dungeonClass(this._heroStats.dungeonLevel);
      this._initLevel();
    }
    
    // getters
    get position ()         { return this._heroPosition;  }
    get board ()            { return this._gameBoard;     }
    get heroStats ()        { return this._heroStats;     }
    
    // init function
    _initLevel () {
      this._gameBoard = this._dungeon.makeLevelBoard();
      
      // trying to place a hero at an open space
      let successPlaced = false;
      while (!successPlaced) {
        let randCoordsArr = this._getRandCoords();
        if (this._gameBoard[randCoordsArr[0]][randCoordsArr[1]] === GAME_OBJECTS_NUMERALS['open']) {
          this._heroPosition = [randCoordsArr[0], randCoordsArr[1]];
          this._gameBoard[randCoordsArr[0]][randCoordsArr[1]] = GAME_OBJECTS_NUMERALS['hero'];
          successPlaced = true;
        }
      }
      // preparing an enemies array with attack, health, etc points for each enemy
      this._prepareEnemies();
    }
    
    // helpers
    _getRandCoords () {
      return [Math.floor(Math.random() * (this._gameBoard.length - 1) + 1),
              Math.floor(Math.random() * (this._gameBoard.length - 1) + 1)];
    }
    // get random range for enemies' attacks, health, etc points
    _getRandPoint (maxValue) {
      return Math.floor(Math.random() * 3) + maxValue - 2;
    }
    // prepare the enemies (attacks, health points, xp points they give)
    _prepareEnemies () {
      // array for enemies fight
      this._enemiesStats = {};
      this._bigBossStats = {};
      this._enemiesStats = {
        'thisLevelattack': this._heroStats.dungeonLevel * 10,
        'thisLevelselfHealth': this._heroStats.dungeonLevel * 20,
        'thisLevelxpPoints': this._heroStats.dungeonLevel * 30,
        'thisLevelEnemies': []
      };

      this._dungeon.enemiesArray.map((value, index) => {
        this._enemiesStats.thisLevelEnemies.push({
          coords: value,
          attack: this._getRandPoint(this._enemiesStats.thisLevelattack),
          selfHealth: this._getRandPoint(this._enemiesStats.thisLevelselfHealth),
          xpPoints: this._getRandPoint(this._enemiesStats.thisLevelxpPoints)
        });
      });
      
      // checking if there is any big boss
      if (this._dungeon.ifBigBossPresent) {
        this._bigBossStats = {
          selfHealth: 250,
          attack: this._heroStats.dungeonLevel * 20
        };
      }
    }
    
    // function realizing an attack on an ordinary enemy
    _attackEnemy (atPosition) {
      // find an enemy's id
      let attackedEnemyIndex;
      this._enemiesStats.thisLevelEnemies.map((value, index) => {
        if (value.coords[0] === atPosition[0] && value.coords[1] === atPosition[1]) {
          attackedEnemyIndex = index;
        }
      });
      // first hero damages an enemy depending on heroe's attack
      let damageToEnemy = this._getRandPoint(this._heroStats.attackPoints) + this._heroStats.xpPoints * 0.02;
      this._enemiesStats.thisLevelEnemies[attackedEnemyIndex].selfHealth -= damageToEnemy;
      if (this._enemiesStats.thisLevelEnemies[attackedEnemyIndex].selfHealth > 0) {
        // enemy replies
        let damageToHero = this._getRandPoint(this._enemiesStats.thisLevelEnemies[attackedEnemyIndex].attack);
        this._heroStats.healthPoints -= damageToHero;
        if (this._heroStats.healthPoint <= 0) {
          // a hero is dead -- just remove his icon from the board
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
          this._gameBoard[atPosition[0]][atPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
        }
      } else {
        // enemy is destroyed -- refresh a board (I don't delete an enemy from the list)
        this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
        this._heroPosition = atPosition;
        this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['hero'];
        this._heroStats.xpPoints += this._enemiesStats.thisLevelEnemies[attackedEnemyIndex].xpPoints;
        this._heroStats.level = this._getHeroesLevel(this._heroStats.xpPoints);
      }
    }
    
    // big boss attack -- slightly different algotythm
    _attackBigBoss () {
      // hero attacks
      let damageToBigBoss = this._getRandPoint(this._heroStats.attackPoints) + this._heroStats.level * 3;
      this._bigBossStats.selfHealth -= damageToBigBoss;
      if (this._bigBossStats.selfHealth < 0) {
        // hero won
        this._heroStats.won = true;
      } else {
        // bb attacks
        let damageToHero = this._bigBossStats.attack - this._heroStats.level * 2.5;
        this._heroStats.healthPoints -= damageToHero;
      }
    }
    
    // funny function to get the heroe's level based on his xp points
    _getHeroesLevel (xp) {
      if (xp > 1000) {
        return 4;
      } else if (xp > 100) {
        return 3;
      } else if (xp > 10) {
        return 2;
      } else {
        return 1;
      }
    }
    
    // moving hero
    makeMove (newPosition) {
      switch (this._gameBoard[newPosition[0]][newPosition[1]]) {
        case GAME_OBJECTS_NUMERALS['open']:
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
          this._heroPosition = newPosition;
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['hero'];
          break;
        case GAME_OBJECTS_NUMERALS['enemy']:
          this._attackEnemy(newPosition);
          break;
        case GAME_OBJECTS_NUMERALS['bigboss']:
          this._attackBigBoss();
          break;
        case GAME_OBJECTS_NUMERALS['weapon']:
          // weapon
          this._heroStats.weaponNumber++;
          this._heroStats.attackPoints += 10;
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
          this._heroPosition = newPosition;
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['hero'];
          break;
        case GAME_OBJECTS_NUMERALS['health']:
          // health
          this._heroStats.healthPoints += 20 * this._heroStats.level;
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['open'];
          this._heroPosition = newPosition;
          this._gameBoard[this._heroPosition[0]][this._heroPosition[1]] = GAME_OBJECTS_NUMERALS['hero'];
          break;
        case GAME_OBJECTS_NUMERALS['teleport']:
          // teleport -- move to another level
          this._heroStats.dungeonLevel++;
          this._dungeon = new this._dungeonClass(this._heroStats.dungeonLevel);
          this._initLevel();
          break;
      }
    }
    
    // switch to move hero depending on what key pressed
    moveHero (stringWhere) {
      switch (stringWhere) {
        case 'ArrowUp':
          this.makeMove([this._heroPosition[0] - 1, this._heroPosition[1]]);
          break;
        case 'ArrowDown':
          this.makeMove([this._heroPosition[0] + 1, this._heroPosition[1]]);
          break;
        case 'ArrowLeft':
          this.makeMove([this._heroPosition[0], this._heroPosition[1] - 1]);
          break;
        case 'ArrowRight':
          this.makeMove([this._heroPosition[0], this._heroPosition[1] + 1]);
          break;
      }
    }
  }
  
  // the view component
  var GameFieldComponent = React.createClass({
    render: function () {
      let thisBoard = this.props.board;
      let rowsCount = 0;
      let colsCount = 0;
      let currentHeroPosition = this.props.heroPosition;
      let startRow = currentHeroPosition[0];
      let startCol = currentHeroPosition[1];

      if (startRow < VIEW_MAX_ROWS / 2) {
        startRow = 0;
      } else if (startRow >= (thisBoard.length - 1 - VIEW_MAX_ROWS / 2)) {
        startRow = thisBoard.length - 1 - VIEW_MAX_ROWS;
      } else {
        startRow = currentHeroPosition[0] - VIEW_MAX_ROWS / 2;
      }
      
      if (startCol < VIEW_MAX_COLS / 2) {
        startCol = 0;
      } else if (startCol >= (thisBoard.length - 1 - VIEW_MAX_COLS / 2)) {
        startCol = thisBoard.length - 1 - VIEW_MAX_COLS;
      } else {
        startCol = currentHeroPosition[1] - VIEW_MAX_COLS / 2;
      }
      
      // for putting a random letter into enemy field
      var getRandEnemySymbol = function () {
        let randLetterCode = Math.floor(Math.random() * 25) + 65;
        return <span>{String.fromCharCode(randLetterCode)}</span>;
      };
      
      // 'shadow' function
      var ifShadowed = function (coords, heroPosition) {
        // a shape of a shadow here
        // start comment here to remove shadowing function
        if (coords[0] < heroPosition[0] - 5 || coords[0] > heroPosition[0] + 5) {
          return true;
        }
        if (coords[0] === heroPosition[0] - 5 || coords[0] === heroPosition[0] + 5) {
          if (coords[1] !== heroPosition[1]) {
            return true;
          }
        }
        if (coords[0] === heroPosition[0] - 4 || coords[0] === heroPosition[0] + 4) {
          if (coords[1] < heroPosition[1] - 1 || coords[1] > heroPosition[1] + 1) {
            return true;
          }
        }
        if (coords[0] === heroPosition[0] - 3 || coords[0] === heroPosition[0] + 3) {
          if (coords[1] < heroPosition[1] - 2 || coords[1] > heroPosition[1] + 2) {
            return true;
          }
        }
        if (coords[0] === heroPosition[0] - 2 || coords[0] === heroPosition[0] + 2) {
          if (coords[1] < heroPosition[1] - 3 || coords[1] > heroPosition[1] + 3) {
            return true;
          }
        }
        if (coords[0] === heroPosition[0] - 1 || coords[0] === heroPosition[0] + 1) {
          if (coords[1] < heroPosition[1] - 4 || coords[1] > heroPosition[1] + 4) {
            return true;
          }
        }
        if (coords[0] === heroPosition[0] || coords[0] === heroPosition[0]) {
          if (coords[1] < heroPosition[1] - 5 || coords[1] > heroPosition[1] + 5) {
            return true;
          }
        }
        // stop commenting here to remoe shadow function
        return false;
      };
      
      return (
        <table id="game-area">
          <tbody>
            {
              thisBoard.map((value, index) => {
                // mapping rows
                if (index >= startRow && rowsCount <= VIEW_MAX_ROWS) {
                  let oneCell = [];
                  colsCount = 0;
                  value.map((cell, indexTwo) => {
                    // mapping cells in a row (by columns)
                    if (indexTwo >= startCol && colsCount <= VIEW_MAX_COLS) {
                      if (!ifShadowed([index, indexTwo], currentHeroPosition)) {
                        if (GAME_FIELD_CLASSES[cell] === 'enemy') {
                          GAME_FIELD_SYMBOLS[cell] = getRandEnemySymbol();
                        }
                        oneCell.push(<td key={indexTwo} className={GAME_FIELD_CLASSES[cell]}>{GAME_FIELD_SYMBOLS[cell]}</td>);
                      } else {
                        oneCell.push(<td key={indexTwo} className='shadow'></td>);
                      }
                      colsCount++;
                    }
                  });
                  let oneRow = <tr key={index}>{oneCell}</tr>;
                  rowsCount++;
                  return oneRow;
                }
              })       
            }
          </tbody>
        </table>
      );
    }
  });
  
  // main component 
  var MainComponent = React.createClass({
    // initial state of the game
    getInitialState: function () {
      return {
        board: [],
        heroPosition: [],
        dungeonLevel: 0
      }
    },
    // bebore mounting -- create a game (first level)
    componentWillMount: function () {
      this.gameHero = new Hero(Dungeon);
      this.setState({
        board: this.gameHero.board,
        heroPosition: this.gameHero.position,
        heroStats: this.gameHero.heroStats
      });
    },
    // when user presses key
    keyPressed: function (event) {
      this.gameHero.moveHero(event.key);
      // check if the hero is dead
      if (this.gameHero.heroStats.healthPoints <= 0) {
        alert("You're dead");
        // need to restart the whole game
        this.gameHero = new Hero(Dungeon);
      }
      // also an alert for winning game
      if (this.gameHero.heroStats.won) {
        alert("You WIN!!!");
        this.gameHero = new Hero(Dungeon);
      }
      this.setState({
        board: this.gameHero.board,
        heroPosition: this.gameHero.position,
        heroStats: this.gameHero.heroStats
      });
    },
    
    render: function () {
      return (
        <div className="container-fluid" tabIndex="1" onKeyDown={this.keyPressed}>
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6 col-xs-12" id="game-container">
              <table id="game-info">
                <tbody>
                  <tr>
                    <td>Dungeon:  {this.state.heroStats.dungeonLevel}</td>
                    <td>Health:   {this.state.heroStats.healthPoints}</td>
                    <td>Level:    {this.state.heroStats.level}</td>
                    <td>XP:       {this.state.heroStats.xpPoints}</td>
                    <td>Weapon:   {WEAPON_NAMES[this.state.heroStats.weaponNumber]}</td>
                    <td>Attack:   {this.state.heroStats.attackPoints}</td>
                  </tr>
                </tbody>
              </table>
              <GameFieldComponent heroPosition={this.state.heroPosition} board={this.state.board}/>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      );
    }
  });
 
  ReactDOM.render(
    <MainComponent />,
    document.getElementById('mount')
  );
  
}
