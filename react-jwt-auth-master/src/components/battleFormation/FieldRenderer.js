//renders battle field for redactor or battle
//need callback onCellClick(x,y)
import React, { Component } from "react";
import pointImg from '../../images/point.png';
import crossImg from '../../images/cross.png';
import hatchImg from '../../images/hatch.png';
import hatchPointImg from '../../images/hatchPoint.png';

const cellImages=[
    pointImg,
    crossImg,
    hatchImg,
    hatchPointImg
]

export default (props) => {
    let html = [];
    
    for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
            row.push(<td key={i * 10 + j}
                class='awesomeTdFieldFormation'
                className={(!props.cells || !props.cells.length || (props.cells[i][j] == 0))?'awesomeTdFieldFormation' : 'awesomeTdFieldFormation awesomeBorderedTdFieldFormation'}
                >
                <button 
                    class='awesomeButtonCellFieldFormation'
                style={{
                    // "width":"25px","height":"25px",
                    // "border":((!props.cells || !props.cells.length || (props.cells[i][j] == 0))? "1px" : "2px") + " solid "
                    
                }}
                    className={(!props.cells || !props.cells.length || (props.cells[i][j] == 0))?'awesomeButtonCellFieldFormation' : 'awesomeButtonCellFieldFormation awesomeBorderedButtonCellFieldFormation'}

                    onClick={() => { props.onCellClick(j, i) }} 
                    disabled={props.disabled}
                 >
                   
                   {(!props.shots || !props.shots.length || !props.shots[i][j] || props.shots[i][j].type == 0 ? '' : 
                    <img src={cellImages[props.shots[i][j].type-1]}
                        class='awesomeImageInButton'
                        >

                    </img>)}
                    
                    {/* {(!props.cells || !props.cells.length || (props.cells[i][j] == 0) ? '-' : props.cells[i][j])} */}
                </button>
            </td>)
        }
        html.push(<tr>
            {row}
        </tr>)
    }

    return <div><table class='awesomeFieldTable'>
        <tbody>
            {html}
        </tbody>
    </table>
    </div>
}