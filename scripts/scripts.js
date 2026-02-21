const newGameList = Array.from({ length: 12 }, (_, i) => ({ id: i, showMole: false, MoleLife: 0 }));

class GameModel {
	#score
	#gameBoard
	#time
	#interval
	#snake
	constructor(newGameList) {
		this.#score = 0;
		this.#gameBoard = newGameList;
		this.#time = 30;
		this.#snake = {
			id: null,
			life: 0,
		}
	}
	getScore() {
		return this.#score
	}
	getGameBoard() {
		return this.#gameBoard
	}
	getEmptySpace() {
		// get space without mole and snake
		return this.#gameBoard.filter(item => !item.showMole && item.id != this.getSnakeId())
	}
	getTime() {
		return this.#time
	}
	getCurrMole() {
		return this.#gameBoard.filter(item => item.showMole == true).length
	}
	getSnakeId() {
		return this.#snake.id
	}
	getSnakeLife() {
		return this.#snake.life
	}
	setMole(selectId) {
		const snakeId = this.getSnakeId()
		const newList = this.getGameBoard().map(item => {
			if (item.id == snakeId) {
				// if snake appear, original mole will gone.
				return {
					...item,
					showMole: false,
					MoleLife: 0
				}
			}
			if (item.id == selectId) {
				return {
					...item,
					showMole: true,
					MoleLife: 2000
				}
			}
			if (item.showMole && item.MoleLife == 2000) {
				return {
					...item,
					MoleLife: 1000,
				}
			}
			if (item.showMole && item.MoleLife == 1000) {
				return {
					...item,
					showMole: false,
					MoleLife: 0
				}
			}
			return item;
		})
		this.#gameBoard = newList;
	}
	incrementScore(id) {
		if (this.#gameBoard.find(item => item.id == id && item.showMole)) {
			this.#score += 1;
			this.#gameBoard = this.#gameBoard.map(item => {
				if (item.id == id) {
					return {
						...item,
						showMole: false,
						MoleLife: 0
					}
				}
				return item
			})
		}
	}
	decreaseTime() {
		this.#time -= 1
	}
	setIntervalId(id) {
		this.#interval = id;
	}
	getIntervalId() {
		return this.#interval;
	}
	reduceSnakeLife() {
		this.#snake.life -= 1000
	}
	createSnake() {
		while (true) {
			let newSnakeId = Math.floor(Math.random() * 12)
			// snack cannot been same position
			if (newSnakeId == this.getSnakeId()) continue;
			this.#snake = {
				id: newSnakeId,
				life: 2000
			}
			break;
		}
	}
	newGame() {
		this.#score = 0
		this.#gameBoard = newGameList
		this.#time = 30
		this.#snake = {
			id: null,
			life: 1000
		}
		clearInterval(this.getIntervalId());
		this.#interval = null
	}
}

class GameView {
	constructor() {
		this.dom = {
			gameBoardContainer: document.querySelector('.game_board'),
			startBtn: document.querySelector('.game_start_btn'),
			score: document.querySelector('.game_score'),
			timer: document.querySelector('.timer')
		}
	}

	getTempView(gameBoard, snakeId) {
		let result = ''
		gameBoard.forEach(item => {
			if (item.id == snakeId) {
				result += `<div id=${item.id}>
				<img id=${item.id} src="images/snake.jpeg" alt="snake" width="200" height="200">
				</div>`
			}
			else if (item.showMole) {
				result += `<div id=${item.id}>
				<img id=${item.id} src="images/mole.jpeg" alt="mole" width="200" height="200">
				</div>`
			} else {
				result += `<div id=${item.id}></div>`
			}
		})
		return result;
	}

	renderScore(score) {
		this.dom.score.textContent = score;
	}

	renderTimer(time) {
		this.dom.timer.textContent = time
	}
	renderGameBoard(list, snakeId) {
		const view = this.getTempView(list, snakeId)
		this.dom.gameBoardContainer.innerHTML = view
	}

	renderAlert(message) {
		alert(message);
	}
}



class GameControler {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}
	startGame() {
		if (this.model.getIntervalId()) return;

		const id = setInterval(() => {
			if (this.model.getTime() <= 0) {
				this.model.newGame();
				this.view.renderScore(this.model.getScore())
				this.view.renderGameBoard(this.model.getGameBoard(), this.model.getSnakeId())
				this.view.renderTimer(this.model.getTime())
				this.view.renderAlert("Time is Over !");
				return;
			}
			if (this.model.getSnakeLife() == 0) {
				this.model.createSnake()
			} else {
				this.model.reduceSnakeLife()
				if (this.model.getSnakeLife() == 0) this.model.createSnake()
			}
			if (this.model.getCurrMole() < 3) { // we can remove this condition after extra point part
				const selectIndex = Math.floor(Math.random() * (11 - this.model.getCurrMole())); // snack take one space, total 11
				const selectId = this.model.getEmptySpace()[selectIndex].id
				this.model.setMole.call(this.model, selectId);
			}
			this.model.decreaseTime();
			this.view.renderGameBoard(this.model.getGameBoard(), this.model.getSnakeId());
			this.view.renderTimer(this.model.getTime())
			this.model.setIntervalId(id);
		}, 1000);
	}
	getPoint(event) {
		const target = event.target.id
		if (target == this.model.getSnakeId()) {
			this.model.newGame();
			this.view.renderScore(this.model.getScore())
			this.view.renderGameBoard(this.model.getGameBoard(), this.model.getSnakeId())
			this.view.renderTimer(this.model.getTime())
			this.view.renderAlert("Game Over !");
			return;
		}
		this.model.incrementScore(target)
		this.view.renderScore(this.model.getScore())
		this.view.renderGameBoard(this.model.getGameBoard(), this.model.getSnakeId())
	}
	init() {
		this.view.renderScore(this.model.getScore())
		this.view.renderTimer(this.model.getTime())
		this.view.renderGameBoard(this.model.getGameBoard(), this.model.getSnakeId())
		const { startBtn, gameBoardContainer } = this.view.dom
		startBtn.addEventListener('click', this.startGame.bind(this))
		gameBoardContainer.addEventListener('click', (event) => this.getPoint.call(this, event))
	}
}

const model = new GameModel(newGameList);
const view = new GameView();
const controler = new GameControler(model, view)
controler.init()