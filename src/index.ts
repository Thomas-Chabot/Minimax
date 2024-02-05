/*
    Runs the Minimax Algorithm on a genericized board state + transition matrix.

    Takes in two type variables:
        T: The board type; this is the object which will be evaluated.
        U: The transition type; this is how we move from one board state to another.
    
    And the following parameters:
        board: The starting state of the game board.
        maxDepth: The number of levels deep we want to check (every transition is one level).
        calculateTransitions: (board, isOwnTurn); given the board state, returns an array of all transitions we can apply.
        applyTransition: (board, transition); applies the transition to the game board.
        undoTransition: (board, transition); reverses the transition, setting the game board back to its original state.
        calculateBoard: (board); Returns a number, which is some sort of calculation we're looking for on the game board.
            (as an example, this may be the number of kings that we have)
        calculateEndState: (board); Returns a number which must be:
            < 0 if we have lost the game
            > 0 if we have won the game
            = 0 if we have not yet reached an end state.
*/

export type MinimaxResult<U> = {
	Value: number;
	Transition?: U | undefined;
};

export function Minimax<T, U extends defined>(
	board: T,
	maxDepth: number,
	calculateTransitions: (board: T, isOwnTurn: boolean) => U[],
	applyTransition: (board: T, transition: U) => void,
	undoTransition: (board: T, transition: U) => void,
	calculateBoard: (board: T) => number,
	calculateEndState: (board: T) => number,
): U | undefined {
	const [transition, value] = runMinimaxAlgorithm(
		board,
		0,
		maxDepth,
		true,
		-9e9,
		9e9,
		calculateTransitions,
		applyTransition,
		undoTransition,
		calculateBoard,
		calculateEndState,
	);
	print(`Following this move will bring us a value of ${value}.`);
	return transition;
}

function runMinimaxAlgorithm<T, U extends defined>(
	board: T,
	depth: number,
	maxDepth: number,
	isMax: boolean,
	alpha: number,
	beta: number,
	calculateTransitions: (board: T, isOwnTurn: boolean) => U[],
	applyTransition: (board: T, transition: U) => void,
	undoTransition: (board: T, transition: U) => void,
	calculateBoard: (board: T) => number,
	calculateEndState: (board: T) => number,
): LuaTuple<[U | undefined, number]> {
	if (depth === maxDepth) {
		return $tuple(undefined, calculateBoard(board));
	}

	const transitions = calculateTransitions(board, isMax);

	// Check if we reach an end state
	const isEndState = calculateEndState(board);
	if (isEndState < 0) {
		// We lose the game
		return $tuple(undefined, -9e9 + 1);
	} else if (isEndState > 0) {
		// We win the game
		return $tuple(undefined, 9e9 - 1);
	}

	if (transitions.size() === 0) {
		return $tuple(undefined, 0);
	}

	let best = isMax ? -9e9 : 9e9;
	let bestTransitions: U[] = [];
	transitions.forEach((transition) => {
		if (alpha > beta) {
			return;
		}

		// Apply the transition, so that we can evaluate it
		applyTransition(board, transition);

		// Apply the minimax algorithm to calculate the value from this transition
		const [_, calculatedValue] = runMinimaxAlgorithm(
			board,
			depth + 1,
			maxDepth,
			!isMax,
			alpha,
			beta,
			calculateTransitions,
			applyTransition,
			undoTransition,
			calculateBoard,
			calculateEndState,
		);

		// Overwrite our best transition if this one is better
		if (calculatedValue === best) {
			bestTransitions.push(transition);
		} else if ((isMax && calculatedValue > best) || (!isMax && calculatedValue < best)) {
			best = calculatedValue;
			bestTransitions = [transition];

			if (isMax) {
				alpha = math.max(alpha, best);
			} else {
				beta = math.min(beta, best);
			}
		}

		// Undo the change so that we can continue the algorithm on other transitions.
		undoTransition(board, transition);
	});

	if (bestTransitions.size() === 0) {
		return $tuple(undefined, best);
	}

	const result = bestTransitions[math.random(0, bestTransitions.size() - 1)];
	return $tuple(result, best);
}
