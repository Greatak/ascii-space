var LaunchPad = (function(doc,win,undefined){
	var construction = doc.getElementById("construction"),
		characters = [],
		height = win.innerHeight*0.9,
		startButton = doc.getElementById("fly");
	
	function Rocket(){
		this.characters = charPosition();
		this.graph = createGraph(this.characters);
		this.mass = this.characters.length;
		this.x = 0;
		this.y = 0;
		this.dir = [0,0];
		this.angle = [0,0];
		for(var i = this.characters.length;i--;){
			this.x += this.characters[i].x;
			this.y += this.characters[i].y;
		}
		this.x /= this.characters.length;
		this.y /= this.characters.length;
		this.prepParts();
		for(var i = this.characters.length;i--;){
			var dx = this.x - this.characters[i].x,
				dy = this.y - this.characters[i].y;
			this.characters[i].dist = Math.sqrt((dx*dx)+(dy*dy));
			console.log(this.characters[i].key,this.characters[i].direction);
			switch(this.characters[i].direction){
				case 0:
					this.characters[i].dir = [0,-1];
					break;
				case 1:
					this.characters[i].dir = [.707,-.707];
					break;
				case 2:
					this.characters[i].dir = [1,0];
					break;
				case 3:
					this.characters[i].dir = [.707,.707];
					break;
				case 4:
					this.characters[i].dir = [0,1];
					break;
				case 5:
					this.characters[i].dir = [-.707,.707];
					break;
				case 6:
					this.characters[i].dir = [-1,0];
					break;
				case 7:
					this.characters[i].dir = [-.707,-.707];
					break;
				default:
					this.characters[i].dir = [0,0];
					break;
			}
		}
		win.requestAnimationFrame(loop);
	}
	function update(dt){
		var fx = 0,
			fy = 0,
			tx = 0,
			ty = 0;
		for(var i = this.characters.length;i--;){
			fy += 100;
			if(pressedKeys[this.characters[i].key.toLowerCase()]){
				var f = 1000;
				if(this.characters[i].upper) f *= 2;
				fx += f*this.characters[i].dir[0] || 0;
				fy += f*this.characters[i].dir[1] || 0;
			}
		}
		var ax = fx/this.mass,
			ay = fy/this.mass;
		this.x += (fx/this.mass)*dt || 0;
		this.y += (fy/this.mass)*dt || 0;
		if(this.y > height)this.y = height;
		//console.log(ax,ay);
		
		construction.style.cssText = "transform:translate("+this.x+"px,"+this.y+"px)";
	}
	Rocket.prototype.update = update;
	
	function prepParts(){
		var mass = 0;
		for(var i = this.characters.length;i--;){
			this.characters[i].mass = 1;
			mass += this.characters[i].mass;
			var dirs = ["up","right","down","left"];
			this.characters[i].direction = -1;
			if(this.characters[i].edges.length > 1){
				var d1 = dirs.indexOf(this.characters[i].edges[0].direction),
					d2 = dirs.indexOf(this.characters[i].edges[1].direction);
				if(d1 == 0){
					if(d2 == 1) this.characters[i].direction = 1;
					if(d2 == 3) this.characters[i].direction = 7;
					if(d2 == 2){
						var d3 = dirs.indexOf(this.characters[i].edges[2].direction);
						if(d3 == 1) this.characters[i].direction = 3;
						if(d3 == 3) this.characters[i].direction = 1;
					}
				}else if(d1 == 1){
					if(d2 == 0) this.characters[i].direction = 1;
					if(d2 == 2) this.characters[i].direction = 3;
					if(d2 == 3){
						var d3 = dirs.indexOf(this.characters[i].edges[2].direction);
						if(d3 == 0) this.characters[i].direction = 2;
						if(d3 == 2) this.characters[i].direction = 0;
					}
				}else if(d1 == 2){
					if(d2 == 1) this.characters[i].direction = 3;
					if(d2 == 3) this.characters[i].direction = 5;
					if(d2 == 0){
						var d3 = dirs.indexOf(this.characters[i].edges[2].direction);
						if(d3 == 1) this.characters[i].direction = 3;
						if(d3 == 3) this.characters[i].direction = 1;
					}
				}else if(d1 == 3){
					if(d2 == 0) this.characters[i].direction = 7;
					if(d2 == 2) this.characters[i].direction = 5;
					if(d2 == 1){
						var d3 = dirs.indexOf(this.characters[i].edges[2].direction);
						if(d3 == 0) this.characters[i].direction = 2;
						if(d3 == 2) this.characters[i].direction = 0;
					}
				}
			}else{
				this.characters[i].direction = dirs.indexOf(this.characters[i].edges[0].direction)*2;
			}
		}
	}
	Rocket.prototype.prepParts = prepParts;
	
	function charPosition(){
		prepInput();	
	
		var sel = win.getSelection(),
			range = sel.getRangeAt(0),
			printed = [];
		for(var j = construction.childNodes.length;j--;){
			for(var i = construction.childNodes[j].textContent.length;i--;){
				range.setStart(construction.childNodes[j].childNodes[0]||construction.childNodes[j],i);
				range.setEnd(construction.childNodes[j].childNodes[0]||construction.childNodes[j],i+1);
				if(/\s/.test(range.toString())) continue;
				range.surroundContents(document.createElement("span"));
			}
		}
		var t = construction.getElementsByTagName("span")
		for(var i = t.length;i--;){
			var s = {};
			s.key = t[i].textContent;
			s.edges = [];
			s.upper = s.key == s.key.toUpperCase()?true:false;
			s.x = t[i].offsetLeft + (t[i].offsetWidth/2);
			s.y = t[i].offsetTop + (t[i].offsetHeight/2);
			printed.push(s);
		}
		return printed;
	}
	function createGraph(array){
		var lines = construction.childNodes,
			nodes = [],
			edges = [],
			index = 0;
		for(var i = lines.length;i--;){
			var t = lines[i].textContent;
			nodes[i] = [];
			for(var j = lines[i].textContent.length;j--;){
				if(/\s/.test(t[j])) continue;
				nodes[i][j] = index;
				if(nodes[i][j+1] != undefined){
					edges.push([nodes[i][j],nodes[i][j+1]]);
					array[nodes[i][j]].edges.push({nodes:edges[edges.length-1],direction:"right"});
					array[nodes[i][j+1]].edges.push({nodes:edges[edges.length-1],direction:"left"});
				}
				if(nodes[i+1] && nodes[i+1][j] != undefined){
					edges.push([nodes[i][j],nodes[i+1][j]]);
					array[nodes[i][j]].edges.push({nodes:edges[edges.length-1],direction:"down"});
					array[nodes[i+1][j]].edges.push({nodes:edges[edges.length-1],direction:"up"});
				}
				index++;
			}
		}
		return {nodes:nodes,edges:edges};
	}
	function prepInput(){
		var lines = construction.childNodes,
			div = doc.createElement("div");
		div.textContent = lines[0].textContent;
		lines[0].parentNode.removeChild(lines[0]);
		construction.insertBefore(div,construction.firstChild);
	}
	
	var pressedKeys = [];
	win.addEventListener("keydown",function(e){pressedKeys[keyCodes[e.keyCode].toLowerCase()] = true;});
	win.addEventListener("keyup",function(e){pressedKeys[keyCodes[e.keyCode].toLowerCase()] = false;});
	
	var oldTime = 0;
	function loop(time){
		var dt = (time - oldTime)/1000;
		oldTime = time;
		rocket.update(dt);
		win.requestAnimationFrame(loop);
	}
	var rocket;
	function build(){
		rocket = new Rocket();
		construction.className = "active";
		startButton.style.display = "none";
	}
	startButton.addEventListener("click",build);
	
	return build;
})(document,window);

var keyCodes = ["","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\n","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""," ","¡","¢","£","¤","¥","¦","§","¨","©","ª","«","¬","­","®","¯","°","±","²","³","´","µ","¶","·","¸","¹","º","»","¼","½","¾","¿","À","Á","Â","Ã","Ä","Å","Æ","Ç","È","É","Ê","Ë","Ì","Í","Î","Ï","Ð","Ñ","Ò","Ó","Ô","Õ","Ö","×","Ø","Ù","Ú","Û","Ü","Ý","Þ","ß","à","á","â","ã","ä","å","æ","ç","è","é","ê","ë","ì","í","î","ï","ð","ñ","ò","ó","ô","õ","ö","÷","ø","ù","ú","û","ü","ý","þ","ÿ","Ā","ā","Ă","ă","Ą","ą","Ć","ć","Ĉ","ĉ","Ċ","ċ","Č","č","Ď","ď","Đ","đ","Ē","ē","Ĕ","ĕ","Ė","ė","Ę","ę","Ě","ě","Ĝ","ĝ","Ğ","ğ","Ġ","ġ","Ģ","ģ","Ĥ","ĥ","Ħ","ħ","Ĩ","ĩ","Ī","ī","Ĭ","ĭ","Į","į","İ","ı","Ĳ","ĳ","Ĵ","ĵ","Ķ","ķ","ĸ","Ĺ","ĺ","Ļ","ļ","Ľ","ľ","Ŀ","ŀ","Ł","ł","Ń","ń","Ņ","ņ","Ň","ň","ŉ","Ŋ","ŋ","Ō","ō","Ŏ","ŏ","Ő","ő","Œ","œ","Ŕ","ŕ","Ŗ","ŗ","Ř","ř","Ś","ś","Ŝ","ŝ","Ş","ş","Š","š","Ţ","ţ","Ť","ť","Ŧ","ŧ","Ũ","ũ","Ū","ū","Ŭ","ŭ","Ů","ů","Ű","ű","Ų","ų","Ŵ","ŵ","Ŷ","ŷ","Ÿ","Ź","ź","Ż","ż","Ž","ž","ſ","ƀ","Ɓ","Ƃ","ƃ","Ƅ","ƅ","Ɔ","Ƈ","ƈ","Ɖ","Ɗ","Ƌ","ƌ","ƍ","Ǝ","Ə","Ɛ","Ƒ","ƒ","Ɠ","Ɣ","ƕ","Ɩ","Ɨ","Ƙ","ƙ","ƚ","ƛ","Ɯ","Ɲ","ƞ","Ɵ","Ơ","ơ","Ƣ","ƣ","Ƥ","ƥ","Ʀ","Ƨ","ƨ","Ʃ","ƪ","ƫ","Ƭ","ƭ","Ʈ","Ư","ư","Ʊ","Ʋ","Ƴ","ƴ","Ƶ","ƶ","Ʒ","Ƹ","ƹ","ƺ","ƻ","Ƽ","ƽ","ƾ","ƿ","ǀ","ǁ","ǂ","ǃ","Ǆ","ǅ","ǆ","Ǉ","ǈ","ǉ","Ǌ","ǋ","ǌ","Ǎ","ǎ","Ǐ","ǐ","Ǒ","ǒ","Ǔ","ǔ","Ǖ","ǖ","Ǘ","ǘ","Ǚ","ǚ","Ǜ","ǜ","ǝ","Ǟ","ǟ","Ǡ","ǡ","Ǣ","ǣ","Ǥ","ǥ","Ǧ","ǧ","Ǩ","ǩ","Ǫ","ǫ","Ǭ","ǭ","Ǯ","ǯ","ǰ","Ǳ","ǲ","ǳ","Ǵ","ǵ","Ƕ","Ƿ","Ǹ","ǹ","Ǻ","ǻ","Ǽ","ǽ","Ǿ","ǿ","Ȁ","ȁ","Ȃ","ȃ","Ȅ","ȅ","Ȇ","ȇ","Ȉ","ȉ","Ȋ","ȋ","Ȍ","ȍ","Ȏ","ȏ","Ȑ","ȑ","Ȓ","ȓ","Ȕ","ȕ","Ȗ","ȗ","Ș","ș","Ț","ț","Ȝ","ȝ","Ȟ","ȟ","Ƞ","ȡ","Ȣ","ȣ","Ȥ","ȥ","Ȧ","ȧ","Ȩ","ȩ","Ȫ","ȫ","Ȭ","ȭ","Ȯ","ȯ","Ȱ","ȱ","Ȳ","ȳ","ȴ","ȵ","ȶ","ȷ","ȸ","ȹ","Ⱥ","Ȼ","ȼ","Ƚ","Ⱦ","ȿ","ɀ","Ɂ","ɂ","Ƀ","Ʉ","Ʌ","Ɇ","ɇ","Ɉ","ɉ","Ɋ","ɋ","Ɍ","ɍ","Ɏ","ɏ","ɐ","ɑ","ɒ","ɓ","ɔ","ɕ","ɖ","ɗ","ɘ","ə","ɚ","ɛ","ɜ","ɝ","ɞ","ɟ","ɠ","ɡ","ɢ","ɣ","ɤ","ɥ","ɦ","ɧ","ɨ","ɩ","ɪ","ɫ","ɬ","ɭ","ɮ","ɯ","ɰ","ɱ","ɲ","ɳ","ɴ","ɵ","ɶ","ɷ","ɸ","ɹ","ɺ","ɻ","ɼ","ɽ","ɾ","ɿ","ʀ","ʁ","ʂ","ʃ","ʄ","ʅ","ʆ","ʇ","ʈ","ʉ","ʊ","ʋ","ʌ","ʍ","ʎ","ʏ","ʐ","ʑ","ʒ","ʓ","ʔ","ʕ","ʖ","ʗ","ʘ","ʙ","ʚ","ʛ","ʜ","ʝ","ʞ","ʟ","ʠ","ʡ","ʢ","ʣ","ʤ","ʥ","ʦ","ʧ","ʨ","ʩ","ʪ","ʫ","ʬ","ʭ","ʮ","ʯ","ʰ","ʱ","ʲ","ʳ","ʴ","ʵ","ʶ","ʷ","ʸ","ʹ","ʺ","ʻ","ʼ","ʽ","ʾ","ʿ","ˀ","ˁ","˂","˃","˄","˅","ˆ","ˇ","ˈ","ˉ","ˊ","ˋ","ˌ","ˍ","ˎ","ˏ","ː","ˑ","˒","˓","˔","˕","˖","˗","˘","˙","˚","˛","˜","˝","˞","˟","ˠ","ˡ","ˢ","ˣ","ˤ","˥","˦","˧","˨","˩","˪","˫","ˬ","˭","ˮ","˯","˰","˱","˲","˳","˴","˵","˶","˷","˸","˹","˺","˻","˼","˽","˾","˿","̀","́","̂","̃","̄","̅","̆","̇","̈","̉","̊","̋","̌","̍","̎","̏","̐","̑","̒","̓","̔","̕","̖","̗","̘","̙","̚","̛","̜","̝","̞","̟","̠","̡","̢","̣","̤","̥","̦","̧","̨","̩","̪","̫","̬","̭","̮","̯","̰","̱","̲","̳","̴","̵","̶","̷","̸","̹","̺","̻","̼","̽","̾","̿","̀","́","͂","̓","̈́","ͅ","͆","͇","͈","͉","͊","͋","͌","͍","͎","͏","͐","͑","͒","͓","͔","͕","͖","͗","͘","͙","͚","͛","͜","͝","͞","͟","͠","͡","͢","ͣ","ͤ","ͥ","ͦ","ͧ","ͨ","ͩ","ͪ","ͫ","ͬ","ͭ","ͮ","ͯ","Ͱ","ͱ","Ͳ","ͳ","ʹ","͵","Ͷ","ͷ","͸","͹","ͺ","ͻ","ͼ","ͽ",";","Ϳ","΀","΁","΂","΃","΄","΅","Ά","·","Έ","Ή","Ί","΋","Ό","΍","Ύ","Ώ","ΐ","Α","Β","Γ","Δ","Ε","Ζ","Η","Θ","Ι","Κ","Λ","Μ","Ν","Ξ","Ο","Π","Ρ","΢","Σ","Τ","Υ","Φ","Χ","Ψ","Ω","Ϊ","Ϋ","ά","έ","ή","ί","ΰ","α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","ς","σ","τ","υ","φ","χ","ψ","ω","ϊ","ϋ","ό","ύ","ώ","Ϗ","ϐ","ϑ","ϒ","ϓ","ϔ","ϕ","ϖ","ϗ","Ϙ","ϙ","Ϛ","ϛ","Ϝ","ϝ","Ϟ","ϟ","Ϡ","ϡ","Ϣ","ϣ","Ϥ","ϥ","Ϧ","ϧ","Ϩ"]
