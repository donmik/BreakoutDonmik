var Game;

(function() {

	// Variable que contendrá la instancia
	var instance;

	/**
	 * Clase Game - Singleton
	 * Sólo puede haber una instancia de esta clase.
	 **/
	Game = {
		// Valores por defecto.
		Defaults: {
			// Configuración por defecto
			config: {
				canvasId: 'canvas'
			},

			// Estados del juego.
			states: {
				initial: 1, // Estado inicial del juego.

				GAME_INIT: 1, // ESTADO INICIAL DEL JUEGO - Pantalla de inicio.
				GAME_PLAYING: 2, // ESTADO JUGANDO AL JUEGO - Pantalla de juego.
				GAME_OVER: 3, // ESTADO GAME OVER DEL JUEGO - Pantalla Game Over.
				GAME_WIN: 4, // ESTADO GAME WIN DEL JUEGO - Pantalla Game Win.
				GAME_LIFELOST: 5, // ESTADO VIDA PERDIDA.
				GAME_PAUSE: 6, // ESTADO PAUSA DEL JUEGO.
				GAME_WIN_END: 7 // ESTADO DE FIN DEL JUEGO - Pantalla Game Win total.
			},

			// Puntuación.
			score: {
				initial: 0
			},

			// Vidas.
			lives: {
				initial: 3,
				max: 10
			},

			// Powers.
			powers: {
				types: {
					POWERUP_BIGGER: 1,
					POWERUP_EXTRABALL: 2,
					POWERUP_LIFE: 3,
					POWERDOWN_SMALLER: 4,
				},

				// Power Up
				num_powerup: 0,
				max_powerup: 3,
				prob_powerup: 0.01,
				// Power Down
				num_powerdown: 0,
				max_powerdown: 2,
				prob_powerdown: 0.02
			},

			// Sonidos.
			sounds: [
				{ name: 'hit', src: ['./sounds/hit.ogg', './sounds/hit.wav'] },
				{ name: 'lose', src: ['./sounds/lifelost.ogg', './sounds/lifelost.wav'] },
				{ name: 'win', src: ['./sounds/gamewin.ogg', './sounds/gamewin.wav'] }
			]
		},

		// Teclas.
		KEYS: {
			KEY_SPACEBAR: 32,
			KEY_LEFT: 37,
			KEY_RIGHT: 39
		},

		// Constructor.
		initialize: function(config) {
			if (instance) {
				return instance;
			}
			instance = this;

			// Asignamos los valores por defecto.
			this.game = this;
			this.config = (config==undefined) ? this.Defaults.config : config;
			this.canvas = document.getElementById(this.config.canvasId);
			this.context = this.canvas.getContext('2d');
			this.states = this.Defaults.states;
			this.actualstate = this.Defaults.states.initial;
			this.score = this.Defaults.score.initial;
			this.lives = this.Defaults.lives.initial;
			this.powers = this.Defaults.powers;
			this.level = 0;
			// Cargamos los sonidos.
			this.loadSounds();
			// Esto es necesario para el gameloop.
			window.game = this;
			// Añadimos eventos click al menú.
			this.addEvents();
			// Arrancamos el bucle del juego.
			this.gameloop();
		},

		loadSounds: function() {
			this.sounds = [];
			var sounds = this.Defaults.sounds;
			var temp;
			for (var i = 0; i < sounds.length; i++) {
				this.sounds[sounds[i].name] = new Howl({
					urls: sounds[i].src,
					autoplay: false
				});
			}

			return;
		},

		// Este método se encarga de añadir los eventos del menú.
		// El click sobre le play, el click sobre el resume y pulsar la barra espaciadora.
		addEvents: function() {
			var self = this;

			// Al hacer click en Play, iniciamos el juego.
			utils.addListener(document.getElementById('button_play'), 'click', function(e) {
				if (self.actualstate == self.states.GAME_INIT
					|| self.actualstate == self.states.GAME_OVER
					|| self.actualstate == self.states.GAME_WIN) {
					self.startGame();
				}
				e.preventDefault();
			});

			// Al hacer click en Resume, seguimos con el juego.
			utils.addListener(document.getElementById('button_resume'), 'click', function(e) {
				if (self.actualstate == self.states.GAME_PAUSE) {
					self.resumeGame();
				}
				e.preventDefault();
			});

			// Al hacer click en Quit, reiniciamos el juego.
			utils.addListener(document.getElementById('button_quit'), 'click', function(e) {
				if (self.actualstate == self.states.GAME_PAUSE
						|| self.actualstate == self.states.GAME_WIN_END) {
					self.actualstate = self.states.GAME_INIT;
					self.resetAll();
					self.level = 0;
				}
				e.preventDefault();
			});

			// Al hacer click en Next Level, pasamos al siguiente nivel.
			utils.addListener(document.getElementById('button_next_level'), 'click', function(e) {
				if (self.actualstate == self.states.GAME_WIN) {
					self.startLevel();
				}
				e.preventDefault();
			});

			// Al pulsar la barra espaciadora, pausamos el juego.
			utils.addListener(window, 'keydown', function(e) {
				if (e.keyCode == self.KEYS.KEY_SPACEBAR) {
					if (self.actualstate == self.states.GAME_PLAYING) {
						self.pauseGame();
					}
					else if (self.actualstate == self.states.GAME_PAUSE) {
						self.resumeGame();
					} 
					else if (self.actualstate == self.states.GAME_INIT
								|| self.actualstate == self.states.GAME_OVER) {
						self.startGame();						
					}
					else if (self.actualstate == self.states.GAME_WIN) {
						self.startLevel();
					}
				}
			});
		},

		// Este método es el bucle del juego.
		gameloop: function() {
			// Es necesario guardar la instancia en una variable para poder utilizar en la 
			// función requestAnimationFrame. En esta función, no puedo utilizar this, ya que 
			// el contexto sería window y this se refiere a window.
			var self = this.game;
			window.requestAnimationFrame(self.gameloop);

			switch(self.actualstate) {
				// El jugador está jugando.
				case self.states.GAME_PLAYING:
					// Actualizar posiciones.
					self.updateAll();
					// Comprobar colisiones.
					self.checkCollisions();
					if (self.actualstate == self.states.GAME_PLAYING) {
						// Dibujar todo.
						self.drawAll();
					}
					break;

				// Al principio del juego o cuando se pausa, se muestra el menú.
				case self.states.GAME_INIT:
				case self.states.GAME_PAUSE:
				case self.states.GAME_OVER:
				case self.states.GAME_WIN:
				default: 
					self.showMenu();
					break;
			}
		},

		// Este método se encarga de mostrar el menú.
		showMenu: function() {
			document.querySelector('#menu').style.display = 'block';

			switch(this.actualstate) {
				case this.states.GAME_INIT:
					document.getElementById('button_play').style.display = 'block';
					document.getElementById('button_resume').style.display = 'none';
					document.getElementById('button_next_level').style.display = 'none';
					document.getElementById('button_quit').style.display = 'none';

					document.getElementById('gameover').style.display = 'none';
					document.getElementById('gamewin').style.display = 'none';
					document.getElementById('message').style.display = 'none';
					break;

				case this.states.GAME_PAUSE:
					document.getElementById('button_play').style.display = 'none';
					document.getElementById('button_resume').style.display = 'block';
					document.getElementById('button_next_level').style.display = 'none';
					document.getElementById('button_quit').style.display = 'block';

					document.getElementById('gameover').style.display = 'none';
					document.getElementById('gamewin').style.display = 'none';
					document.getElementById('message').style.display = 'none';
					break;

				case this.states.GAME_OVER:
					document.getElementById('button_play').style.display = 'block';
					document.getElementById('button_resume').style.display = 'none';
					document.getElementById('button_next_level').style.display = 'none';
					document.getElementById('button_quit').style.display = 'none';

					document.getElementById('gameover').style.display = 'block';
					document.getElementById('gamewin').style.display = 'none';
					document.getElementById('message').style.display = 'none';
					break;

				case this.states.GAME_WIN:
					document.getElementById('button_play').style.display = 'none';
					document.getElementById('button_resume').style.display = 'none';
					document.getElementById('button_next_level').style.display = 'block';
					document.getElementById('button_quit').style.display = 'none';

					document.getElementById('gameover').style.display = 'none';
					document.getElementById('gamewin').style.display = 'block';
					document.getElementById('message').style.display = 'none';
					break;

				case this.states.GAME_WIN_END:
					document.getElementById('button_play').style.display = 'none';
					document.getElementById('button_resume').style.display = 'none';
					document.getElementById('button_next_level').style.display = 'none';
					document.getElementById('button_quit').style.display = 'block';

					document.getElementById('gameover').style.display = 'none';
					document.getElementById('gamewin').style.display = 'block';
					document.getElementById('message').style.display = 'none';
					break;
			}
		},

		// Este método se encarga de ocultar el menú.
		hideMenu: function() {
			document.querySelector('#menu').style.display = 'none';
		},

		// Este método se encarga de reanudar el juego.
		resumeGame: function() {
			// Nuevo estado => Jugando.
			this.actualstate = this.states.GAME_PLAYING;

			// Oculto el menú.
			this.hideMenu();
		},

		// Este método se encarga de pausar el juego.
		pauseGame: function() {
			// Nuevo estado => Jugando.
			this.actualstate = this.states.GAME_PAUSE;

			// Mostramos el menú.
			this.showMenu();
		},

		// Este método se encarga de iniciar el juego.
		startGame: function() {
			// Nuevo estado => Jugando.
			this.actualstate = this.states.GAME_PLAYING;

			// Oculto el menú.
			this.hideMenu();

			// Start level.
			this.startLevel();

			this.score = this.Defaults.score.initial;
			this.lives = this.Defaults.lives.initial;

			this.updateScore();
			this.updateLives();
		},

		updateScore: function() {
			var score_ant = document.getElementById('score').innerHTML;
			var divider_ant = Math.floor(score_ant/1000);
			var divider = Math.floor(this.score/1000);
			if (divider > 0 && divider_ant != divider) {
				this.lives++;
				this.updateLives();
			}
			document.getElementById('score').innerHTML = this.score;
		},

		updateLives: function() {
			document.getElementById('lives').innerHTML = this.lives;
		},

		// Este método se encarga de actualizar las posiciones de los elementos del juego.
		updateAll: function() {
			// Actualizar posiciones...
			// Actualizar la posición de los poderes.
			if (this.powers.items) {
				var total_powers = this.powers.items.length;
				while (total_powers--) {
					this.powers.items[total_powers].update();
					if (this.powers.items[total_powers].y > this.canvas.height) {
						// El poder desaparece.
						this.powers.items.splice(total_powers, 1);
					}
				}
			}
			// Actualizar la posición de las bolas
			if (this.balls) {
				var total_balls = this.balls.length;
				while (total_balls--) {
					this.balls[total_balls].update();
				}
			}
			// Actualizar la posición de la pala.
			this.paddle.update();
		},

		// Este método se encarga de gestionar las colisiones del juego.
		checkCollisions: function() {
			// Comprobar colisiones...
			// Comprobar colisiones pala-paredes y pala-poderes.
			this.paddle.checkCollisions(this.game);
			// Comprobar colisiones bola-paredes y bola-pala.
			// this.ball.checkCollisions(this.canvas, this.paddle, this.bricks);
			if (this.balls) {
				var total_balls = this.balls.length;
				while (total_balls--) {
					if (this.balls[total_balls].checkCollisions(this.game)) {
						// Ball lost.
						this.balls.splice(total_balls, 1);
					}
				}
				if (this.balls.length == 0) {
					this.lose();
				}
			}
			// Comprobar si el usuario ha ganado.
			if (this.bricks && this.bricks.length <= 0) {
				this.gamewin();
			}
		},

		// Este método se encarga de dibujar los elementos del juego.
		drawAll: function() {
			// Dibujar todo...
			// Borro el canvas.
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			// Dibujar bola.
			if (this.balls) {
				var total_balls = this.balls.length;
				while (total_balls--) {
					this.balls[total_balls].draw(this.context);
				}	
			}
			// Dibujar pala.
			if (this.paddle) {
				this.paddle.draw(this.context);
			}
			// Dibujar los bloques.
			if (this.bricks) {
				var total_bricks = this.bricks.length;
				while (total_bricks--) {
					this.bricks[total_bricks].draw(this.context);
				}	
			}
			// Dibujar los poderes.
			if (this.powers.items) {
				var total_powers = this.powers.items.length;
				while (total_powers--) {
					this.powers.items[total_powers].draw(this.context);
				}
			}
		},

		lose: function() {
			// Estado vida perdida.
			this.actualstate = this.states.GAME_LIFELOST;

			this.lives--;
			this.updateLives();
			// Sonido de perder una vida.
			this.playSound('lose');

			if (this.lives <= 0) {
				this.gameover();
			} else {
				// Reset ball.
				this.balls.push(new Ball());
				// Reset paddle.
				this.paddle.resetPosition();
				// Pausamos el juego.
				this.pauseGame();	
			}
		},

		gameover: function() {
			this.actualstate = this.states.GAME_OVER;
			this.resetAll();
			this.level = 0;
		},

		gamewin: function() {
			this.actualstate = this.states.GAME_WIN;
			// Sonido de ganar.
			this.playSound('win');
			this.resetAll();
			this.level++;
			if (this.level >= Levels.length) {
				// Juego terminado.
				this.actualstate = this.states.GAME_WIN_END;
			}
		},

		resetAll: function() {
			this.balls = null;
			this.powers.items = null;
			this.powers.num_powerup = 0;
			this.powers.num_powerdown = 0;
			this.bricks = null;
			this.paddle = null;
			this.drawAll();
		},

		playSound: function(soundtoplay) {
			this.sounds[soundtoplay].play();
		},

		startLevel: function() {
			// Nuevo estado => Jugando.
			this.actualstate = this.states.GAME_PLAYING;

			// Oculto el menú.
			this.hideMenu();

			// Creo una bola.
			this.balls = [];
			var ball = new Ball(); 
			this.balls.push(ball);
			// Creo una pala.
			this.paddle = new Paddle();
			// Creo un array para los poderes.
			this.powers.items = [];
			// Creo los bloques.
			// En este array almaceno los bloques.
			this.bricks = [];
			var level = Levels[this.level].bricks;
			var level_length = level.length;
			var line;
			var x_init = 13,
				y_init = 0;
			var new_brick;
			for (var i=0; i < level_length; i++) {
				if (level[i] != '') {
					line = level[i];
					for (var j=0; j < line.length; j++) {
						if (line[j] > 0) {
							new_brick = new Brick(x_init, y_init, 24, 15, parseInt(line[j]));
							new_brick.addPower(this.tryCreatePower(new_brick, this.bricks.length));
							this.bricks.push(new_brick);
						}
						x_init += 25;
					}
					x_init = 13;
				}
				y_init += 16;
			}

			console.log(this.powers.items);
		},

		tryCreatePower: function(brick, num_bricks) {
			var power = false;
			// Si no tenemos el máximo de power up.
			if (this.powers.num_powerup < this.powers.max_powerup) {
				// Intentamos crear otro.
				if (Math.random() < (this.powers.prob_powerup*num_bricks)) {
					// El tipo es aleatorio entre 1 y 3.
					var type = Math.floor(Math.random()*3)+1;
					power = new Power(brick.x, brick.y, brick.width, brick.height, type);
					this.powers.items.push(power);
					this.powers.num_powerup++;
					return power;
				}
			}

			// Si no tenemos el máximo de power down.
			if (this.powers.num_powerdown < this.powers.max_powerdown) {
				// Intentamos crear otro.
				if (Math.random() < (this.powers.prob_powerup*num_bricks)) {
					power = new Power(brick.x, brick.y, brick.width, brick.height, this.powers.types.POWERDOWN_SMALLER);
					this.powers.items.push(power);
					this.powers.num_powerdown++;
					return power;
				}
			}

			return false;
		}
	};
}());

var Breakout = Game.initialize();