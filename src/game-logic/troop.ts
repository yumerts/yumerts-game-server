import { Coordinate } from "./coordinate";

export enum TroopType{
    INFANTRY, //highest damage unit on the battlefield
    ARCHER, //longest range unit on the battlefield
    CAVALRY //fastest moving unit on the battlefiled
}

export enum Faction{
    KINGDOM,    //Blue team
    EMPIRE      //Red team
}


/// <summary>
/// returns the attack range of a particular troopType
/// </summary>
export function getAttackRange(troopType: TroopType){
    switch(troopType){
        case TroopType.INFANTRY:
            return 2;
        case TroopType.ARCHER:
            return 5;
        case TroopType.CAVALRY:
            return 2;
    }
}

/// <summary>
/// returns the movement tickRate of a particular troopType
/// </summary>
export function getMovementTickRate(troopType: TroopType){
    switch(troopType){
        case TroopType.INFANTRY:
            return 4; //infantry moves every 4 ticks
        case TroopType.ARCHER:
            return 3; //archer moves every 3 ticks
        case TroopType.CAVALRY:
            return 1; //cavalry moves every 1 tick
    }
}

/// <summary>
/// get the attack damage of each individual troopType against another troopType
/// </summary>
export function getAttackDamage(attacker: TroopType, defender: TroopType) {
    switch(attacker){
        case TroopType.INFANTRY:
            switch(defender){
                case TroopType.INFANTRY:
                    return 5;
                case TroopType.ARCHER:
                    return 100;
                case TroopType.CAVALRY:
                    return 50;
            }
        case TroopType.ARCHER:
            switch(defender){
                case TroopType.INFANTRY:
                    return 5;
                case TroopType.ARCHER:
                    return 20;
                case TroopType.CAVALRY:
                    return 5;
            }
        case TroopType.CAVALRY:
            switch(defender){
                case TroopType.INFANTRY:
                    return 10;
                case TroopType.ARCHER:
                    return 100;
                case TroopType.CAVALRY:
                    return 20;
            }
    }
}

/// <summary>
/// The troop instance that will be spawned on the battlefield
/// </summary>
export class Troop {
    troopId: number;
    troopType: TroopType;
    faction: Faction;
    moveIn: number;
    hp: number;

    //if the targetCoordinate is undefined, then stay where it is at
    currentCoordinate: Coordinate
    targetCoordinate?: Coordinate;

    constructor(troopId: number, troopType: TroopType, faction: Faction, startingCoordinate: Coordinate){
        this.troopId = troopId;
        this.troopType = troopType;
        this.faction = faction;
        this.moveIn = 0;
        this.hp = 100;
        this.currentCoordinate = startingCoordinate;
        this.targetCoordinate = undefined;
    }

    getMoveCoordinate(){
        if(this.targetCoordinate == undefined){
            return undefined;
        }

        if(this.currentCoordinate == this.targetCoordinate){
            this.targetCoordinate = undefined;
            return undefined;
        }

        let xDiff = this.targetCoordinate.x - this.currentCoordinate.x;
        let yDiff = this.targetCoordinate.y - this.currentCoordinate.y;

        if(this.moveIn != 0){
            return undefined;
        }

        let tickCoordinate = new Coordinate(this.currentCoordinate.x, this.currentCoordinate.y);
        if(xDiff > 0){
            tickCoordinate.x++;
        } else if(xDiff < 0){
            tickCoordinate.x--;
        } else if(yDiff > 0){
            tickCoordinate.y++;
        } else if(yDiff < 0){
            tickCoordinate.y--;
        }
        return tickCoordinate;
    }

    removeMoveTick(){
        if(this.moveIn != 0){
            this.moveIn--;
        }
    }

    move(coordinate: Coordinate){
        if(this.targetCoordinate == undefined){
            return;
        }

        if(this.currentCoordinate == this.targetCoordinate){
            this.targetCoordinate = undefined;
            return;
        }

        this.removeMoveTick();

        this.currentCoordinate = coordinate;
        this.moveIn = getMovementTickRate(this.troopType);
    }

    getTroopState(){
        return {
            troopId: this.troopId,
            troopType: this.troopType.toString(),
            faction: this.faction.toString(),
            hp: this.hp,
            currentCoordinate: this.currentCoordinate,
            targetCoordinate: this.targetCoordinate
        }
    }
}