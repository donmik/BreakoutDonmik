// Constructor de la pala.
function Paddle (x, y, width, height, color) {
	// Valores por defecto.
	var DEFAULTS = {
		x: 185,
		y: 425,
		width: 50,
		height: 10,
		color: '#ff0000',
		speed: 5
	};

	// Asignación de valores si existen.
	this.x = (x == undefined) ? DEFAULTS.x : x;
    this.y = (y == undefined) ? DEFAULTS.y : y;
    this.width = (width == undefined) ? DEFAULTS.width : width;
    this.height = (height == undefined) ? DEFAULTS.height : height;
    this.color = (color == undefined) ? DEFAULTS.color : color;

    // move_left y move_right se utilizarán para comprobar la dirección 
    // en la que mover la pala.
    this.move_left = false;
    this.move_right = false;
    // Velocidad a la que se moverá la pala.
    this.speed = DEFAULTS.speed;
    this.vX = 0;

    // Valores iniciales de la pala.
    this.initial_data = {
        x: this.x,
        y: this.y,
        width: this.width,
        speed: this.speed
    };

    this.maxWidth = 75;
    this.minWidth = 35;

    // Iniciamos los eventos de teclado.
    this.initEvents();

    console.log('¡Pala creada!');
};

Paddle.prototype = {

	constructor: Paddle,

	// Método initEvents que se encarga de iniciar la captura de eventos.
	initEvents: function () {
		var self = this;

		// Si el usuario pulsa una tecla.
	    utils.addListener(window, 'keydown', function(e) {
	    	// Tecla flecha izquierda.
	    	if (e.keyCode == Game.KEYS.KEY_LEFT) {
	    		self.move_left = true;
	    		self.update();
	    	}
	    	// Tecla flecha derecha.
	    	else if (e.keyCode == Game.KEYS.KEY_RIGHT) {
	    		self.move_right = true;
	    		self.update();
	    	}
	    });

	    // Si el usuario suelta una tecla.
	    utils.addListener(window, 'keyup', function(e) {
	    	// Tecla flecha izquierda.
	    	if (e.keyCode == Game.KEYS.KEY_LEFT) {
	    		self.move_left = false;
	    		self.update();
	    	}
	    	// Tecla flecha derecha.
	    	else if (e.keyCode == Game.KEYS.KEY_RIGHT) {
	    		self.move_right = false;
	    		self.update();
	    	}
	    });
	},

	// Método draw que se encarga de dibujar la pala.
	draw: function (context) {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	},

	// Método update que se encarga de actualizar la posición de la pala.
	update: function () {
		// Si el movimiento es hacia la izquierda y vX es positivo.
		if (this.move_left && this.vX >= 0) {
			// Cambio el signo de vX.
			this.vX = this.speed * -1;
		}
		// Si el movimiento es a la derecha y vX es negativo.
		else if (this.move_right && this.vX <= 0) {
			// Cambio el signo de vX.
			this.vX = this.speed;
		}

		// Si no hay que ir ni a izquierda ni a derecha. vX = 0.
		if (!this.move_left && !this.move_right) {
			this.vX = 0;
		}

		// Actualizamos la posición en el eje X.
		this.x += this.vX;
	},

	// Método checkCollisions que se encarga de gestionar las colisiones entre bola y paredes.
	checkCollisions: function(game) {
		if (game === undefined) {
			return;
		};

		var canvas = game.canvas;

		// Comprobar si colisiona con pared derecha.
		if ((this.x + this.width) >= canvas.width) {
			this.x = canvas.width - this.width;
		}
		// Comprobar si colisiona con pared izquierda.
		else if (this.x <= 0) {
			this.x = 0;
		};

		// Colisión con poderes.
		var powers = game.powers.items;
		if (powers) {
			var total_powers = powers.length;
			var actual_power;
			while (total_powers--) {
				actual_power = powers[total_powers];
				if (this.x + this.width < actual_power.x) {
					// No hay colisión.
					continue;
				}
				if (this.y + this.height < actual_power.y) {
					// No hay colisión.
					continue;
				}
				if (this.x > actual_power.x + actual_power.width) {
					// No hay colisión.
					continue;
				}
				if (this.y > actual_power.y + actual_power.height) {
					// No hay colisión.
					continue;
				}

				// Llegamos aquí, hay colisión.
				// Borramos el poder del array de poderes.
				powers.splice(total_powers, 1);
				// Ejecutamos el poder.
				actual_power.hit(game);
			}
		}
	},

	// Este método se encarga de reiniciar la pala a sus valores iniciales.
    resetPosition: function() {
        this.x = this.initial_data.x;
        this.y = this.initial_data.y;
        this.width = this.initial_data.width;
        this.speed = this.initial_data.speed;
    },

    grow: function() {
		this.width = this.maxWidth;
    },

    reduce: function() {
    	this.width = this.minWidth;
    }
};