// Constuctor del poder.
function Power(x, y, width, height, type) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.type = type;
	this.hidden = true;

	switch (type) {
		// Aumenta el tamaño de la pala.
		case Game.powers.types.POWERUP_BIGGER:
			this.color = '#00ffff';
			this.speed = 1;
			this.points_by_hit = 10;
			break;

		// Bola extra.
		case Game.powers.types.POWERUP_EXTRABALL:
			this.color = '#ffff00';
			this.speed = 2;
			this.points_by_hit = 50;
			break;

		// Disminuye el tamaño de la pala.
		case Game.powers.types.POWERDOWN_SMALLER:
			this.color = '#ff0000';
			this.speed = 0.5;
			this.points_by_hit = 100;
			break;

		// Vida extra.
		case Game.powers.types.POWERUP_LIFE:
		default:
			this.color = '#00ff00';
			this.speed = 3;
			this.points_by_hit = 10;
			break;

	}
	
	console.log('Power created!');
}

Power.prototype = {

	constructor: Power,

	// Método que se encarga de dibujar el poder.
	draw: function(context) {
		if (this.hidden) {
			return;
		}
		context.fillStyle = '#aaaaaa';
		context.fillRect(this.x, this.y, this.width, this.height);
		context.strokeStyle = this.color;
		context.lineWidth = 3;
		context.strokeRect(this.x, this.y, this.width, this.height);
	},

	// Este método se encarga de mover el poder.
	update: function() {
		if (this.hidden) {
			return;
		}
		this.y += this.speed;
	},

	// Este método se encarga de lanzar el poder.
	release: function() {
		this.hidden = false;
	},

	// Método que se encarga de gestionar la colisión pala-poder y ejecuta el poder.
	hit: function(game) {
		game.score += this.points_by_hit;
		game.updateScore();
		switch (this.type) {
			case Game.powers.types.POWERUP_BIGGER:
				// Aumenta el tamaño de la pala.
				game.paddle.grow();
				break;

			case Game.powers.types.POWERUP_EXTRABALL:
				// Bola extra.
				game.balls.push(new Ball());
				break;

			case Game.powers.types.POWERDOWN_SMALLER:
				// Reduce el tamaño de la pala.
				game.paddle.reduce();
				break;

			case Game.powers.types.POWERUP_LIFE:
			default:
				// Vida extra.
				game.lives++;
				game.updateLives();
				break;

		}
	}
}