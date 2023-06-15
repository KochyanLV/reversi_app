import { blackPlayerToken, boardArea, boardHeight, boardWidth, whitePlayerToken } from './board';
import { PlayerColour } from './player-colour';

export function getRandomArrayElement(array) {
    if (!array.length) {
        return undefined;
    }
    return array[Math.floor(Math.random() * array.length)];
}

export class Player {
    constructor(colour, game, piecePopulation) {
        let token;
        switch (colour) {
            case PlayerColour.White:
                token = whitePlayerToken;
                break;
            case PlayerColour.Black:
                token = blackPlayerToken;
                break;
            default:
                throw new Error(`Player constructor: Illegal PlayerColour '${PlayerColour[colour]}' (${colour})`);
        }
        this.colour = colour;
        this.piecePopulation = piecePopulation;
        this.token = token;
        this.game = game;
        this.opponent = this;
    }

    findBestMove(nPly, nParentScore = NaN, nBestUncleRecursiveScore = NaN) {
        const returnObject = {
            bestColumn: NaN,
            bestMoves: [],
            bestRow: NaN,
            bestScore: NaN
        };
        let nBestScore = NaN;
        let bestMoves = [];
        let doneSearching = false;
        for (let row = 0; row < boardHeight && !doneSearching; ++row) {
            for (let column = 0; column < boardWidth; ++column) {
                const placePieceResult = this.game.board.placePiece(this, row, column);
                if (typeof placePieceResult === 'undefined') {
                    continue;
                }
                let nScore = placePieceResult.score;
                if (this.opponent.piecePopulation === 0) {
                    nScore = this.game.victoryScore;
                }
                else if (nPly > 1 &&
                    this.piecePopulation + this.opponent.piecePopulation <
                        boardArea) {
                    const childReturnObject = this.opponent.findBestMove(nPly - 1, nScore, nBestScore);
                    nScore -= childReturnObject.bestScore;
                }
                this.game.board.setSquareState(row, column, undefined);
                for (const squareCoordinates of placePieceResult.flippedPieces) {
                    this.game.board.setSquareState(squareCoordinates.row, squareCoordinates.column, this.opponent);
                }
                this.piecePopulation -=
                    placePieceResult.flippedPieces.length + 1;
                this.opponent.piecePopulation +=
                    placePieceResult.flippedPieces.length;
                if (Number.isNaN(nBestScore) || nScore > nBestScore) {
                    nBestScore = nScore;
                    bestMoves = [];
                    bestMoves.push({ row, column });
                    if (!Number.isNaN(nParentScore) &&
                        !Number.isNaN(nBestUncleRecursiveScore) &&
                        nParentScore - nBestScore < nBestUncleRecursiveScore) {
                        doneSearching = true;
                        break;
                    }
                }
                else if (nScore === nBestScore) {
                    bestMoves.push({ row, column });
                }
            }
        }
        const selectedBestMove = getRandomArrayElement(bestMoves);
        if (typeof selectedBestMove !== 'undefined') {
            returnObject.bestRow = selectedBestMove.row;
            returnObject.bestColumn = selectedBestMove.column;
        }
        else {
            nBestScore = 0;
        }
        returnObject.bestScore = nBestScore;
        returnObject.bestMoves = bestMoves;
        return returnObject;
    }
}
