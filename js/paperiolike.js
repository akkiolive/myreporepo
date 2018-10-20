(function(){
	'use strict';

	//element and context
	var stage = document.getElementById('stage'); //element
	var ctx; //context
	

	//keydown 
	//document.onkeydown = keydown;
	stage.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
	stage.addEventListener('keydown', keydown, {passive:false});

	//canvas size
	var width = 480;
	var height = 260; 

	//return if element not exist
	if(typeof stage.getContext === 'undefined'){
		return;
	}

	//create context instance
	ctx = stage.getContext('2d');

	//setting width and height
	stage.width = width;
	stage.height = height;
	
	//adopt high resolution
	stage.style.width = width + 'px';
	stage.style.height = height + 'px';


	class Field{
		constructor(step, color){
			this.step = step;
			this.width = width;
			this.height = height;
			this.color = color;
		}

		draw_grid(){
			for(var x=0; x<=this.width; x+=this.step){
				ctx.beginPath();
				ctx.strokeStyle = this.color;
				ctx.moveTo(x,this.height);
				ctx.lineTo(x,0);
				ctx.stroke();
			}
			for(var y=0; y<=this.height; y+=this.step){
				ctx.beginPath();
				ctx.strokeStyle = this.color;
				ctx.moveTo(0,y);
				ctx.lineTo(this.width,y);
				ctx.stroke();
			}
		}
	}

	class Point{
		constructor(x,y){
			this.x = x;
			this.y = y;
		}
	}
	

	class Player{
		constructor(x, y, color, field){
			this.x = x;
			this.y = y;
			this.color = color;
			this.field = field;
			this.trajectory = [];
			this.movingflag = 0;
			this.movingflagprev = 0;
			this.movingnum = undefined;
			this.collisionstate = 0;
			this.area = [];
			this.movinginarea = 1;
			this.movinginareaprev = 1;
			for(var i=25; i<30; i++){
				for(var j=10; j<15; j++){
					this.area.push(new Point(i,j));
				}
			}
		}

		draw(){
			//trajectory
			if(this.movingflag){
				for(var i=this.movingnum; i<this.trajectory.length; i++){
					this.draw_point(this.trajectory[i], "gray");
				}
			}
			
			//area
			for(var p of this.area){
				this.draw_point(p, "green");
			}

			//player
			this.draw_point(new Point(this.x, this.y), this.color);
		}

		draw_point(Point, color="gray"){
			ctx.fillStyle = color;
			ctx.fillRect(Point.x*this.field.step, Point.y*this.field.step, this.field.step,this.field.step);
		}
	

		moved(){
			//log trajectry
			this.trajectory.push(new Point(this.x, this.y));

			//collision
			this.movinginarea = 0;
			for(var i=0; i<this.area.length; i++){ //with area ===> expand
				if(this.area[i].x==this.x && this.area[i].y==this.y){
					this.movinginarea = 1;
					if(!this.movinginareaprev){ //collision
						console.log("collision with area ====> expand");
						this.collisionstate = 1;
						this.expand();
						break;
					}

				}
			}
			if(this.movinginareaprev && !this.movinginarea){ //get off the area
				console.log("start tracking");
				this.start_track();
			}
			this.movinginareaprev = this.movinginarea;
			
			for(var i=this.movingnum+1; i<this.trajectory.length-1; i++){ //with trajectroy ===> death
				if(this.movingflag && this.trajectory[i].x==this.x && this.trajectory[i].y==this.y){
					console.log("collision with trajectory ====> death");
					this.collisionstate = -1;
					this.color = "red";
					this.die();
					break;
				}
			}
		}	

		start_track(){
			if(!this.movinginarea)this.movingflag = 1;
			this.trajectory.push(new Point(p.x, p.y));
			this.movingnum = this.trajectory.length-1;
			console.log("movingnum="+this.movingnum);
		}

		die(){
			gameover = 1;
			animateflag = 0;
			this.color = "red";
			console.log("GAME OVER!!");
			console.log("press r key to restart!!");
		}

		expand(){
			for(var t of this.trajectory){
				this.area.push(t);
			}
		}


	}

	let field = new Field(5, "black");
	let p = new Player(27, 13, "black", field);
	var gameover = 0;
	var animateflag = 0;
	var vx = 1;
	var vy = 0;

	function keydown(event) {
		//inhibit scrolling
		event.preventDefault();

		if(gameover){
			if(event.keyCode == 82  || event.keyCode == 13){ //r key
				field = new Field(10, "black");
				p = new Player(27, 13, "black", field);
				gameover = 0;
				animateflag = 0;
				vx = 1;
				vy = 0;
			}
			else return;
		}

		//switch the target
		if(event.keyCode == 32){ //space key
			this.movingflag = 1 - this.movingflag;
			console.log("movingflag="+p.movingflag);
			p.start_track();
		}
		
		//move
		if(!animateflag){
			if(event.keyCode == 37) { //left
				p.x -= 1;
			}
			if(event.keyCode == 38){ //up key
				p.y -= 1;
			}
			if(event.keyCode == 39) { //right key
				p.x += 1;
			}
			if(event.keyCode == 40) { //down key
				p.y += 1;
			}
			if(37<=event.keyCode && event.keyCode<=40){
				p.moved();
			}
		}
		else{
			if(event.keyCode == 37) { //left
				vx = -1;
				vy = 0;
			}
			if(event.keyCode == 38){ //up key
				vx = 0;
				vy = -1;
			}
			if(event.keyCode == 39) { //right key
				vx = 1;
				vy = 0;
			}
			if(event.keyCode == 40) { //down key
				vx = 0;
				vy = 1;
			}

		}

		//draw
		redraw();
		
		//animate
		if(event.keyCode == 13){ //enter key
			animateflag = 1 - animateflag;
			if(animateflag)console.log("start animating!");
			else console.log("stop animating.");
		}
	}

	function redraw(){
		//draw
		ctx.clearRect(0,0,width,height); //clear
		field.draw_grid();
		p.draw();
	}

	function animate(){
		if(!animateflag) return;
		p.x += vx;
		p.y += vy;
		p.moved();
		redraw();
	}

	redraw();
	setInterval(animate, 80);
		

})();