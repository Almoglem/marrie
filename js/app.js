var WALL = 'WALL';
var FLOOR = 'FLOOR';
var CAKE = 'CAKE';
var BREAD = 'BREAD';
var GAMER = 'GAMER';
var gAddCakeInterval;
var gAddBreadInterval;
var gCollectCount = 0;

var gGameOn = false;
var gWon = false;
// var gLost = false;

var gBiteSound = new Audio('bite.mp3');
var gGaspSound = new Audio('gasp.wav');
var GAMER_IMG = '<img src="img/gamer.png" />';
var CAKE_IMG = '<img src="img/cake.png" />';
var BREAD_IMG = '<img src="img/bread.png" />';

var gBoard;
var gGamerPos;


function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
}

function startGame() {
	document.querySelector('.end-screen').classList.add('hidden');
	gGameOn = true;
	document.querySelector('.restart').classList.add('hidden');
	gWon = false;
	gLost = false;
	gCollectCount = 0;
	document.querySelector('.collect-count').innerText = `Collect count: ${gCollectCount}`;
	add(CAKE);
	gAddCakeInterval = setInterval(() => {
		add(CAKE);
	}, 2000);
	gAddBreadInterval = setInterval(() => {
		add(BREAD);
	}, 5000);
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(9, 11)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				if (j !== 5 && i !== 4) cell.type = WALL;
			}
			board[i][j] = cell;
		}
	}
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	return board;
}


function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})" >\n`

			switch (currCell.gameElement) {
				case 'GAMER':
					strHTML += GAMER_IMG;
					break;
				case 'CAKE':
					strHTML += CAKE_IMG;
					break;
			}
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}


	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;

}

// Move the player to a specific location
function moveTo(i, j) {
	if (!gGameOn) return;

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the allowed cells
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(targetCell.type === FLOOR && ///is target cell floor? 
			(i === gGamerPos.i || j === gGamerPos.j)) // target cell is same as player's cell
	) {
		if (targetCell.gameElement === BREAD) {
			gGaspSound.play();
			gGameOn = false;
			setTimeout(() => {
				gGameOn = true;
			}, 3000);
		}

		if (targetCell.gameElement === CAKE) {
			gBiteSound.play();
			gCollectCount++;
			document.querySelector('.collect-count').innerText = `Collect count: ${gCollectCount}`;
		}

		// MOVING from current position
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		renderCell(gGamerPos, '');
		// MOVING to selected position
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		renderCell(gGamerPos, GAMER_IMG);
	}

	isWin();
	if (gWon) {
		document.querySelector('.end-screen').classList.remove('hidden');
		gameOver();
	}
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


function add(food) {
	var emptyCells = findEmptyCells();
	var randIdx = getRandomInt(0, emptyCells.length - 1);
	var cell = emptyCells[randIdx];
	var foodIMG = food === CAKE ? CAKE_IMG : BREAD_IMG;
	gBoard[cell.i][cell.j].gameElement = food;
	renderCell(cell, foodIMG);

	if (food === BREAD) {
		setTimeout(() => {
			if (gBoard[cell.i][cell.j].gameElement === GAMER) return;
			gBoard[cell.i][cell.j].gameElement = null;
			renderCell(cell, '');
		}, 3000);
	}
}


// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	var lastColIdx = gBoard[0].length - 1;
	var lastRowIdx = gBoard.length - 1;

	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(i, lastColIdx);
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === lastColIdx) moveTo(i, 0)
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(lastRowIdx, j);
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === lastRowIdx) moveTo(0, j);
			else moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function findEmptyCells() {
	var emptyCells = [];
	for (var i = 1; i < gBoard.length - 1; i++) {
		for (j = 1; j < gBoard[0].length - 1; j++) {
			currCell = gBoard[i][j];
			if (currCell.gameElement === null) emptyCells.push({ i: i, j: j });
		}
	}
	return emptyCells;
}

function isWin() {
	for (var i = 1; i < gBoard.length - 1; i++) {
		for (j = 1; j < gBoard[0].length - 1; j++) {
			currCell = gBoard[i][j];
			if (currCell.gameElement === CAKE) return;
		}
	}
	gWon = true;
}

function gameOver() {
	gGameOn = false;
	clearInterval(gAddCakeInterval);
	clearInterval(gAddBreadInterval);
	gAddCakeInterval = null;
	gAddBreadInterval = null;
	renderBoard(gBoard);
	var elPlayAgain = document.querySelector('.restart');
	elPlayAgain.innerText = 'play again';
	elPlayAgain.classList.remove('hidden');
}