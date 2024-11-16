import { Coordinate } from "./coordinate";
import { Faction, getAttackDamage, getAttackRange, Troop, TroopType } from "./troop";

export class Board{
    
    troops: Troop[];
    winner: Faction | undefined;

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

    public getWinner(){
        return this.winner;
    }

    getBoardState(){
        let troopStates: { troopId: number; troopType: String; faction: String; hp: number; currentCoordinate: Coordinate; targetCoordinate: Coordinate | undefined; attackingCoordinate: Coordinate | undefined }[] = [];
        this.troops.forEach(troop => {
            troopStates.push(troop.getTroopState());
        });
        
        //console.log(troopStates);
        return troopStates;
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
        this.check_game_over();
    }

    isTaken(coordinate: Coordinate){
        return this.troops.some(troop => troop.currentCoordinate.x == coordinate.x && troop.currentCoordinate.y == coordinate.y);
    }
    
    check_game_over(){
        let kingdomTroops = this.troops.filter(troop => troop.faction == Faction.KINGDOM);
        let empireTroops = this.troops.filter(troop => troop.faction == Faction.EMPIRE);

        if(kingdomTroops.length == 0){
            this.winner = Faction.EMPIRE;
        }else if(empireTroops.length == 0){
            this.winner = Faction.KINGDOM;
        }
    }

    order(player: number, troopId: number, targetCoordinate: Coordinate){
        let troop = this.troops.find(troop => troop.troopId === troopId);

        //check if player and the troop faction is the same
        if (troop === undefined || troop.faction !== (player - 1)){
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
                troop.attackingCoordinate = closestEnemy.currentCoordinate;
            }else{
                troop.attackingTroopId = undefined;
                troop.attackingCoordinate = undefined;
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

            let enemy = this.troops.find(t => t.troopId == troop.attackingTroopId);
            if(enemy === undefined){
                console.log("can't find")
                continue;
            }

            console.log("Being attacked");
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