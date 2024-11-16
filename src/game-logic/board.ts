import { Coordinate } from "./coordinate";
import { Faction, getAttackDamage, getAttackRange, Troop, TroopType } from "./troop";


/*
class Cell {
    coord: Coordinate;
    troop?: Troop;

    constructor(coord: Coordinate, troop?: Troop){
        this.coord = coord;
        this.troop = troop;
    }

    isEmpty(){
        return this.troop === undefined;
    }

    setTroop(troop: Troop){
        this.troop = troop;
    }
}

// a 20 x 20 board
// board will have a initial board formation parser built in

class Board {
    cells : Cell[];
    graph: Graph;

    /// boardFormation is a string of 400 characters, each character represents a cell on the board
    /// the character X to mention that line will be empty starting from that cell
    /// the character i -> Kingdom Infantry (Blue)
    /// the character a -> Kingdom Archer (Blue)
    /// the character c -> Kingdom Cavalry (Blue)
    /// the character I -> Empire Infantry (Red)
    /// the character A -> Empire Archer (Red)
    /// the character C -> Empire Cavalry (Red)
    constructor(boardFormation: string) {
        function addCell(cell: Cell){
            this.cells.push(cell);
            this.graph.setNode(cell.coord.toString(), cell);
        }
    
        function addEdge(cell1: Cell, cell2: Cell){
            this.graph.setEdge(cell1.coord.toString(), cell2.coord.toString());
        }

        this.cells = [];
        this.graph = new Graph();

        // set up the cells
        for(let i = 0; i < 20; i++){
            for(let j = 0; j < 20; j++){
                addCell(new Cell(new Coordinate(i + 1, j + 1)));
            }
        }

        let boardFormationIndex = 0;
        //set the troop within the cell using the boardFormation
        for(let vertical = 0; vertical < 20; vertical++){
            for (let horizontal = 0; horizontal < 20; horizontal++){
                let index = vertical * 20 + horizontal;
                let cell = this.cells[index];      
                let breakloop = false;

                switch(boardFormation[boardFormationIndex++]){
                    case 'i':
                        cell.setTroop(new Troop(0, TroopType.INFANTRY, Faction.KINGDOM));
                        break;
                    case 'a':
                        cell.setTroop(new Troop(0, TroopType.ARCHER, Faction.KINGDOM));
                        break;
                    case 'c':
                        cell.setTroop(new Troop(0, TroopType.CAVALRY, Faction.KINGDOM));
                        break;
                    case 'I':
                        cell.setTroop(new Troop(0, TroopType.INFANTRY, Faction.EMPIRE));
                        break;
                    case 'A':
                        cell.setTroop(new Troop(0, TroopType.ARCHER, Faction.EMPIRE));
                        break;
                    case 'C':
                        cell.setTroop(new Troop(0, TroopType.CAVALRY, Faction.EMPIRE));
                        break;
                    case 'X':
                        breakloop = true;
                        break;
                }

                if(breakloop){
                    break;
                }
            }
        }

        //form graph connections between each cell
        //form left connection (horizontal - 1) only if it is not the first column
        //form right conneciton (horizontal + 1) only if it is not the last column
        //form bottom connection (vertical - 1) only if it is not the first row
        //form top connection (vertical + 1) only if it is not the last row      
        for(let vertical = 0; vertical < 20; vertical++){
            for (let horizontal = 0; horizontal < 20; horizontal++){
                let index = vertical * 20 + horizontal;
                let cell = this.cells[index];      
                let breakloop = false;

                if(horizontal > 0){
                    addEdge(cell, this.cells[index - 1]);
                }

                if(horizontal < 19){
                    addEdge(cell, this.cells[index + 1]);
                }

                if(vertical > 0){
                    addEdge(cell, this.cells[index - 20]);
                }

                if(vertical < 19){
                    addEdge(cell, this.cells[index + 20]);
                }
            }
        }
        
    }

    getCell(coord: Coordinate){
        return this.graph.node(coord.toString());
    }

    simulate(){
        //this.attack()
        this.move()
    }

    move(){
    }

    attack(){

    }
}*/

export class Board{
    troops: Troop[];

    /// boardFormation is a string of maximum 400 characters, each character represents a cell on the board
    /// the character X to mention that line will be empty starting from that cell
    /// the character i -> Kingdom Infantry (Blue)
    /// the character a -> Kingdom Archer (Blue)
    /// the character c -> Kingdom Cavalry (Blue)
    /// the character I -> Empire Infantry (Red)
    /// the character A -> Empire Archer (Red)
    /// the character C -> Empire Cavalry (Red)
    constructor(boardFormation: string){
        this.troops = [];
        let boardFormationIndex = 0;
        let idIndex = 0;
        for(let vertical = 0; vertical < 20; vertical++){
            for (let horizontal = 0; horizontal < 20; horizontal++){
                let breakloop = false;
                switch(boardFormation[boardFormationIndex++]){
                    case 'i':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.INFANTRY, Faction.KINGDOM, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'a':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.ARCHER, Faction.KINGDOM, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'c':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.CAVALRY, Faction.KINGDOM, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'I':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.INFANTRY, Faction.EMPIRE, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'A':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.ARCHER, Faction.EMPIRE, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'C':
                        idIndex++;
                        this.troops.push(new Troop(idIndex, TroopType.CAVALRY, Faction.EMPIRE, new Coordinate(horizontal + 1, vertical + 1)));
                        break;
                    case 'X':
                        breakloop = true;
                        break;
                    case 'x':
                        break;
                }

                if(breakloop){
                    break;
                }
            }
        }
    }

    getBoardState(){
        let troopStates: { troopId: number; troopType: String; faction: String; hp: number; currentCoordinate: Coordinate; targetCoordinate: Coordinate | undefined; attackingCoordinate: Coordinate | undefined }[] = [];
        this.troops.forEach(troop => {
            troopStates.push(troop.getTroopState());
        });
        return JSON.stringify(troopStates);
    }

    updateOrder(troopId: number, targetCoordinate: Coordinate){
        let troop = this.troops.find(troop => troop.troopId === troopId);
        if(troop === undefined){
            return;
        }

        troop.targetCoordinate = targetCoordinate;
    }

    simulate(){
        this.attack();
        this.move();
        this.find_targets();
    }

    isTaken(coordinate: Coordinate){
        return this.troops.some(troop => troop.currentCoordinate.x == coordinate.x && troop.currentCoordinate.y == coordinate.y);
    }
    
    order(troopId: number, targetCoordinate: Coordinate){
        let troop = this.troops.find(troop => troop.troopId === troopId);
        if(troop === undefined){
            return;
        }

        troop.targetCoordinate = targetCoordinate;
    }

    find_targets(){
        //for all the troops, find the closest enemy that is within the attack range
        for(let i = 0; i < this.troops.length; i++){
            let troop = this.troops[i];
            if(troop.targetCoordinate !== undefined){
                continue;
            }

            let troopType = troop.troopType;
            let attackRange = getAttackRange(troopType);
            
            let faction = troop.faction;
            let closestEnemy: Troop | undefined = undefined;
            let closestDistance = 9999999;
            for(let j = 0; j < this.troops.length; j++){
                let enemy = this.troops[j];
                if(enemy.faction === faction){
                    continue;
                }

                let distance = troop.currentCoordinate.distanceTo(enemy.currentCoordinate);
                if(distance < closestDistance && distance <= attackRange){
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }

            if(closestEnemy !== undefined){
                troop.attackingTroopId = closestEnemy.troopId;
                troop.targetCoordinate = closestEnemy.currentCoordinate;
            }
        }
    }   

    attack(){
        ///each troop attacks and reduce the troop.attackingTroopId hp every tick
        for(let i = 0; i < this.troops.length; i++){
            let troop = this.troops[i];
            if(troop.attackingTroopId === undefined){
                continue;
            }

            let enemy = this.troops.find(troop => troop.troopId === troop.attackingTroopId);
            if(enemy === undefined){
                continue;
            }

            let attack_damage = getAttackDamage(troop.troopType, enemy.troopType);
            enemy.hp -= attack_damage;

            if(enemy.hp <= 0){
                this.troops = this.troops.filter(troop => troop.troopId !== enemy.troopId);
            }
        }
    }

    move(){
        //copy the value of troops into a variable call newTroops without referencing them
        //for each troop, get the move coordinate
        //if the move coordinate is not undefined, check if the move coordinate is empty
        //if it is empty, move the troop to the move coordinate
        //if it is not empty, check if the troop is from the same faction
        //if it is from the same faction, do nothing
        //if it is from a different faction, attack
        //remove the move tick
        //let newTroops: Troop[] = []
        //this.troops.forEach(val => newTroops.push(Object.assign({}, val)));

        for(let i = 0; i < this.troops.length; i++){
            let troop = this.troops[i];
            if(troop.moveIn > 0){
                troop.removeMoveTick();
                continue;
            }

            let moveCoordinate = troop.getMoveCoordinate();
            if(moveCoordinate === undefined){
                continue;
            }

            let isTaken = this.isTaken(moveCoordinate);
            if (isTaken){
                troop.removeMoveTick();
                continue;
            }

            this.troops[i].move(moveCoordinate);
        }
    }
}