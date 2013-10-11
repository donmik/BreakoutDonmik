// Constructor del bloque.
function Brick(x, y, width, height, life, color) {
	// Valores por defecto.
	var DEFAULTS = {
		x: 0, 
		y: 0,
		width: 24,
		height: 15,
		color: '#00ff00',
		life: 1,
		points_by_hit: 10,
		points_by_death: 20
	};

	// Asignación de valores si existen.
	this.x = (x == undefined) ? DEFAULTS.x : x;
	this.y = (y == undefined) ? DEFAULTS.y : y;
    this.width = (width == undefined) ? DEFAULTS.width : width;
    this.height = (height == undefined) ? DEFAULTS.height : height;
	this.life = (life == undefined) ? DEFAULTS.life : life;

	switch(this.life) {
		case 2:
			this.color = '#ffffff';
			break;

		case 3:
			this.color = '#009999';
			break;
		
		case 1:
		default:
			this.color = '#00ff00';
			break;
	}

	this.points_by_hit = DEFAULTS.points_by_hit;
	this.points_by_death = DEFAULTS.points_by_death;

	this.power = false;

	console.log('Brick created');
};

Brick.prototype = {

	constructor: Brick,

	// Método draw que se encarga de dibujar el bloque.
	draw: function(context) {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	},

	// Este método se encarga de gestionar cuando la bola choca contra un bloque.
	hit: function(game) {
		game.score += this.points_by_hit;
		this.life--;
		if (this.life <= 0) {
			// Bloque destruído.
			// Soltamos el poder si lo hay y lo añadimos a los poderes activos.
			this.releasePower();
			game.score += this.points_by_death;
			return true;
		}

		switch(this.life) {
			case 2:
				this.color = '#ffffff';
				break;

			case 3:
				this.color = '#009999';
				break;
			
			case 1:
			default:
				this.color = '#00ff00';
				break;
		}

		return false;
	},

	// Este método se encarga de añadir un poder a este brick.
	addPower: function(power) {
		this.power = power;
	},

	// Este método se encarga de decir si este brick ya tiene un poder o no.
	hasPower: function() {
		if (this.power) {
			return true;
		}

		return false;
	},

	// Este método "suelta" el poder.
	releasePower: function() {
		if (this.hasPower()) {
			this.power.release();
		}

		return this.power;
	}
};