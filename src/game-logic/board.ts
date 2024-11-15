import { Coordinate } from "./coordinate";
import { Faction, Troop, TroopType } from "./troop";

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
        let troopStates: { troopId: number; troopType: String; faction: String; hp: number; currentCoordinate: Coordinate; targetCoordinate: Coordinate | undefined; }[] = [];
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
        this.move();
    }

    isTaken(coordinate: Coordinate){
        return this.troops.some(troop => troop.currentCoordinate === coordinate);
    }
    
    order(troopId: number, targetCoordinate: Coordinate){
        let troop = this.troops.find(troop => troop.troopId === troopId);
        if(troop === undefined){
            return;
        }

        troop.targetCoordinate = targetCoordinate;
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