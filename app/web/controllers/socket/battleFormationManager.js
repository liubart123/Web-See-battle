


copyDoubleArray=(cells)=>{
    let res = [];
    for (let i = 0; i < cells.length; i++) {
        res[i] = [...cells[i]]
    }
    return res;
}
//if valid return null, else return error_message
module.exports.checkBfIsValid = checkBfIsValid=(cells, rules)=>{
    let ships = []; //count of ships of every size. Index = size of ship -1
    cells = copyDoubleArray(cells);
    ships[3] = 1;
    ships[2] = 2;
    ships[1] = 3;
    ships[0] = 4;

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (cells[i][j] != 0) {
                cells[i][j] = 0;
                let isRight = false;
                let isDown = false;

                //#region defining direction of the ship
                if (j == 9 && i == 9) {
                    //ships[0]--;
                } else if (j == 9) {
                    if (cells[i + 1][j] != 0) {
                        isDown = true;
                    }
                } else if (i == 9) {
                    if (cells[i][j + 1] != 0) {
                        isRight = true;
                    }
                } else {
                    if (cells[i + 1][j] != 0) {
                        isDown = true;
                    }
                    if (cells[i][j + 1] != 0) {
                        isRight = true;
                    }
                }
                //#endregion

                let shipSize = 1;
                if (isDown && isRight) {
                    return "invalid ship foramtion!"
                }
                else if (!isDown && !isRight)
                    ships[0]--;
                else {
                    //#region defining size of the ship
                    let cycleEnd = true;
                    while (cycleEnd) {
                        let newX,newY;
                        newX = j + (isRight ? shipSize : 0);
                        newY = i + (isDown ? shipSize : 0);
                        if (newX<0||newX>=10||newY<0||newY>=10)
                            break;
                        if (cells[newY][newX] != 0) {
                            cells[newY][newX] = 0;
                            shipSize++;
                        } else {
                            cycleEnd = false;
                        }
                    }
                    if (shipSize > 4)
                        return "ship size max is 4..."
                    else {
                        ships[shipSize - 1]--;
                    }
                    //#endregion
                }

                //#region make neighbour cells empty
                for (let a = 0; a < shipSize; a++){
                    for (let angle = 0; angle<Math.PI*2;angle+=Math.PI/4){
                        let newX, newY;
                        newX = Math.round(Math.cos(angle)) + j;
                        newY = Math.round(Math.sin(angle)) + i;
                        if (newX>=0&&newX<10&&newY>=0&&newY<10){
                            if (cells[newY][newX] != 0)
                                return 'invalid ship foramtion!';
                        }
                    }
                }
                //#endregion

            }
        }
    }

    for (let i = 0; i < 4; i++) {
        if (ships[i] != 0) {
            return 'invalid ship foramtion!'
        }
    }

}


