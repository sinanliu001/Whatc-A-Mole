const newGameList = Array.from({ length: 12 }, (_, i) => ({ id: i, showMole: false }));

class GameModel {
	#score
	#gameBoard
	#time
	#interval
	constructor(newGameList) {
		this.#score = 0;
		this.#gameBoard = newGameList;
		this.#time = 30;
	}
	getScore() {
		return this.#score
	}
	getGameBoard() {
		return this.#gameBoard
	}
	getNotMole() {
		return this.#gameBoard.filter(item => !item.showMole)
	}
	getTime() {
		return this.#time
	}
	getCurrMole() {
		return this.#gameBoard.filter(item => item.showMole == true).length
	}
	setMole(selectId) {
		const newList = this.getGameBoard().map(item => {
			if (item.id == selectId) {
				return {
					id: item.id,
					showMole: true,
				}
			}
			return item;
		})
		this.#gameBoard = newList;
	}
	incrementScore(id) {
		if (this.#gameBoard.find(item => item.id == id)) {
			this.#score += 1;
			this.#gameBoard = this.#gameBoard.map(item => {
				if (item.id == id) return {
					id: item.id,
					showMole: false
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
	newGame() {
		this.#score = 0
		this.#gameBoard = newGameList
		this.#time = 30
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

	getTempView(gameBoard) {
		let result = ''
		gameBoard.forEach(item => {
			if (item.showMole) {
				result += `<div id=${item.id}>
				<img id=${item.id} src="images/mole.jpeg" alt="mole" width="200" height="200">
				</div>`
			} else {
				result += `<div id=${item.id}></div>`
			}
		})
		return result;
	}

	render(score, list, time) {
		this.dom.gameBoardContainer.innerHTML = list
		this.dom.score.textContent = score;
		this.dom.timer.textContent = time
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
				clearInterval(this.model.getIntervalId());
				this.model.newGame();
				this.view.render(this.model.getScore(), this.view.getTempView(this.model.getGameBoard()), model.getTime())
				alert("Time is Over !");
				return;
			}
			if (this.model.getCurrMole() < 3) {
				const selectIndex = Math.floor(Math.random() * (12 - this.model.getCurrMole()));
				const selectId = this.model.getNotMole()[selectIndex].id
				this.model.setMole.call(this.model, selectId);
			}
			this.model.decreaseTime();
			this.view.render(this.model.getScore(), this.view.getTempView(this.model.getGameBoard()), model.getTime());
			this.model.setIntervalId(id);
		}, 1000);
	}
	getPoint(event) {
		const target = event.target.id
		this.model.incrementScore.call(this.model, target)
		this.view.render(this.model.getScore(), this.view.getTempView(this.model.getGameBoard()), this.model.getTime())
	}
	init() {
		this.view.render(this.model.getScore(), this.view.getTempView(this.model.getGameBoard()), this.model.getTime())
		const { startBtn, gameBoardContainer } = this.view.dom
		startBtn.addEventListener('click', this.startGame.bind(this))
		gameBoardContainer.addEventListener('click', (event) => this.getPoint.call(this, event))
	}
}

const model = new GameModel(newGameList);
const view = new GameView();
const controler = new GameControler(model, view)
controler.init()