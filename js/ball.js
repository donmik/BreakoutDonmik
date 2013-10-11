// Constructor de la bola.
function Ball(x, y, radius, angle, speed, color) {
	// Valores por defecto.
	var DEFAULTS = {
        x: 150,
        y: 200,
        radius: 5,
        angle: 60,
        speed: 5,
        color: '#ffffff'
    };

    // Asignación de valores si existen.
    this.x = (x == undefined) ? DEFAULTS.x : x;
    this.y = (y == undefined) ? DEFAULTS.y : y;
    this.radius = (radius == undefined) ? DEFAULTS.radius : radius;
    this.angle = (angle == undefined) ? DEFAULTS.angle : angle;
    this.speed = (speed == undefined) ? DEFAULTS.speed : speed;
    this.color = (color == undefined) ? DEFAULTS.color : color;

    // Guardo los valores iniciales para poder reiniciarlos.
    this.initial_data = {
        x: this.x,
        y: this.y,
        angle: this.angle,
        speed: this.speed
    };

    console.log('¡Bola creada!');
};

// Sobreescribimos el prototype para añadir métodos.
Ball.prototype = {

	constructor: Ball,

	// Método draw que se encarga de dibujar la bola.
	draw: function (context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        context.closePath();
        context.fill();
    },

    // Método update que se encarga de actualizar la posición de la bola.
    update: function() {
        if (this.angle >= 360) {
            this.angle -= 360;
        }
        else if (this.angle < 0) {
            this.angle += 360;
        }
        // Calculo el ángulo en radianes.
        this.radians = this.angle * Math.PI/180;
        // Actualizo el movimiento sobre el eje X.
        this.vX = Math.cos(this.radians) * this.speed;
        // Actualizo el movimiento sobre el eje Y.
        this.vY = Math.sin(this.radians) * this.speed;

        // Actualizo la posición (x,y).
        this.x += this.vX;
        this.y += this.vY;
    },

    // Método checkCollisions que se encarga de comprobar las colisiones.
    checkCollisions: function(game) {
        var canvas = game.canvas;
        var paddle = game.paddle;
        var bricks = game.bricks;

        if (canvas !== undefined) {
            // Colisión con la pared derecha o izquierda.
            if ( ((this.x + this.radius) >= canvas.width) || ((this.x - this.radius) <= 0) ) {
                if ((this.x - this.radius) <= 0) {
                    this.x = this.radius;
                } else {
                    this.x = canvas.width - this.radius;
                }
                this.angle = 180 - this.angle;
                this.update();
            }
            // Colisión con la pared inferior o superior.
            else if ( ((this.y + this.radius) >= canvas.height) || ((this.y - this.radius) <= 0) ) {
                if ((this.y - this.radius) <= 0) {
                    this.y = this.radius;
                } else {
                    // Vida perdida.
                    return true;
                }
                this.angle = 360 - this.angle;
                this.update();
            }
        }

        if (paddle !== undefined) {
            this.intercept(paddle, true);
        }

        if (bricks !== undefined) {
            var total_bricks = bricks.length,
                brick;
            while (total_bricks--) {
                brick = bricks[total_bricks];
                if (this.intercept(brick, false)) {
                    game.playSound('hit');
                    if (bricks[total_bricks].hit(game)) {
                        bricks.splice(total_bricks, 1);
                    }
                    game.updateScore();
                }
            }
        }

        return false;
    },

    // Método que se encarga de comprobar si hay colisión entre la bola y un rectángulo.
    intercept: function (rectangle, isPaddle) {
        var distance_sq,
            ballDistance = {
            x: null,
            y: null
        };
        ballDistance.x = Math.abs(this.x - (rectangle.x + (rectangle.width/2)));
        ballDistance.y = Math.abs(this.y - (rectangle.y + (rectangle.height/2)));

        if (ballDistance.x > (rectangle.width/2 + this.radius)) {
            // No colisionan.
            return false;
        }
        if (ballDistance.y > (rectangle.height/2 + this.radius)) {
            // No colisionan.
            return false;
        }

        if (ballDistance.x <= (rectangle.width/2)) {
            // Hay colisión con uno de los bordes superior o inferior.
            if (this.y >= (rectangle.y + (rectangle.height/2))) {
                // Hay colisión con el borde inferior.
                this.y = rectangle.y + rectangle.height + this.radius;
                this.angle = 360 - this.angle;
            }
            else {
                // Hay colisión con el borde superior.
                this.y = rectangle.y - this.radius;
                // Si se trata de una colisión bola-pala, la respuesta a la colisión es la siguente.
                if (isPaddle) {
                    // Si colisiona con el cuadrante izquierdo, invertimos el ángulo hacia ese lado.
                    if (this.angle < 90 && (this.x < (rectangle.x + (rectangle.width/5)))) {
                        this.angle += 180;
                    // Si colisiona con el cuadrante derecho, invertimos hacia ese lado.
                    } else if (this.angle > 90 && (this.x > (rectangle.x + (4*rectangle.width/5)))) {
                        this.angle -= 180;
                    // Si colisiona con el medio de la pala, enderezamos un poco el ángulo.
                    } else if ((this.x > (rectangle.x + (2*rectangle.width/5))) 
                        && (this.x < (rectangle.x + (3*rectangle.width/5)))) {
                        this.angle = 180 - (this.angle*2);
                    // Sino no hacemos nada especial.
                    } else {
                        this.angle = 360 - this.angle;
                    }
                } else {
                    // Si se trata de una colisión bola-bloque, la respuesta es básica.
                    this.angle = 360 - this.angle;
                }
            }
            this.update();
            return true;
        }

        if (ballDistance.y <= (rectangle.height/2)) {
            // Hay colisión con uno de los bordes laterales.
            if (this.x >= (rectangle.x + (rectangle.width/2))) {
                // Hay colisión con el borde derecho.
                this.x = rectangle.x + rectangle.width + this.radius;
            }
            else {
                // Hay colisión con el borde izquierdo.
                this.x = rectangle.x - this.radius;
            }
            this.angle = 180 - this.angle;
            this.update();
            return true;
        }

        distance_sq = (ballDistance.x - (rectangle.width/2)) * (ballDistance.x - (rectangle.width/2)) +
            (ballDistance.y - (rectangle.height/2)) * (ballDistance.y - (rectangle.height/2));

        if (distance_sq <= (this.radius*this.radius)) {
            if (this.x >= (rectangle.x + (rectangle.width/2))) {
                if (this.y >= (rectangle.y + (rectangle.height/2))) {
                    // Hay colisión con esquina inferior derecha.
                    this.x = rectangle.x + rectangle.width + this.radius;
                    this.y = rectangle.y + rectangle.height + this.radius;
                    if (this.angle > 0 && this.angle < 90) {
                        // Imposible.
                    }
                    else if (this.angle > 90 && this.angle < 180) {
                        this.angle += -90;
                    }
                    else if (this.angle > 180 && this.angle < 270) {
                        this.angle += 180;
                    }
                    else if (this.angle > 270 && this.angle < 360) {
                        this.angle += 90;
                    }
                }
                else {
                    // Hay colisión con esquina superior derecha.
                    this.x = rectangle.x + rectangle.width + this.radius;
                    this.y = rectangle.y - this.radius;
                    if (this.angle > 0 && this.angle < 90) {
                        this.angle += -90;
                    }
                    else if (this.angle > 90 && this.angle < 180) {
                        this.angle += 180;
                    }
                    else if (this.angle > 180 && this.angle < 270) {
                        this.angle += 90;
                    }
                    else if (this.angle > 270 && this.angle < 360) {
                        // Imposible.
                    }
                }
            }
            else {
                if (this.y >= (rectangle.y + (rectangle.height/2))) {
                    // Hay colisión con esquina inferior izquierda.
                    this.x = rectangle.x - this.radius;
                    this.y = rectangle.y + rectangle.height + this.radius;
                    if (this.angle > 0 && this.angle < 90) {
                        this.angle += 90;
                    }
                    else if (this.angle > 90 && this.angle < 180) {
                        // Imposible.
                    }
                    else if (this.angle > 180 && this.angle < 270) {
                        this.angle += -90;
                    }
                    else if (this.angle > 270 && this.angle < 360) {
                        this.angle += 180;
                    }
                }
                else {
                    // Hay colisión con esquina superior izquierda.
                    this.x = rectangle.x - this.radius;
                    this.y = rectangle.y - this.radius;
                    if (this.angle > 0 && this.angle < 90) {
                        this.angle += 180;
                    }
                    else if (this.angle > 90 && this.angle < 180) {
                        this.angle += 90;
                    }
                    else if (this.angle > 180 && this.angle < 270) {
                        // Imposible.
                    }
                    else if (this.angle > 270 && this.angle < 360) {
                        this.angle += -90;
                    }
                }
            }
            this.update();
            return true;
        }
    },

    // Este método se encarga de reiniciar a los valores iniciales.
    resetPosition: function() {
        this.x = this.initial_data.x;
        this.y = this.initial_data.y;
        this.speed = this.initial_data.speed;
        this.angle = this.initial_data.angle;
    }
};