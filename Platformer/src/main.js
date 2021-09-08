"use strict";

window.addEventListener ("load", () =>
{
		let dataLvls = null;
		let dataAtlas = null;
		let playerAtlas = null;

		// On charge le fichier contenant le niveau
		function loadLvls (filename)
		{
			let lvls = ["lvl1", "lvl2", "lvl3"];
			let lvlsPromises = lvls.map (function (lvl)
			{
				return  new Promise ( (ok, error) =>
				{
					let request = new XMLHttpRequest();
					request.open("GET", "lvl/"+lvl+".json");
					request.onreadystatechange = function ()
					{
						if (request.readyState == 4)
						{
							if (request.status == 200)
							{
								ok (JSON.parse(request.responseText));
							}
							else
							{
								console.log(request.status);
								error ("chargement du fichier json");
							}
						}
					};
					request.send();
				});
			});
			return (Promise.all(lvlsPromises));
		}

		// On charge le fichier contenant l'emplacement des textures
		function loadAtlas(lvls)
		{
			dataLvls = lvls;
			return  new Promise ( (ok, error) =>
			{
				let atlas = new XMLHttpRequest();
				atlas.open("GET", "img/Tiles/atlas.xml");
				atlas.onreadystatechange = function()
				{
					if(atlas.readyState == 4)
					{
						if(atlas.status == 200)
						{
							let atlasParser = new DOMParser();
							let xmlDoc = atlasParser.parseFromString(this.responseText, "text/xml");
							ok(xmlDoc.getElementsByTagName("SubTexture"));
						}
						else
						{
							console.log(atlas.status);
							error ("chargement du fichier json");
						}
					}
				};
				atlas.send();
			});
		}


		// On charge le fichier contenant l'emplacement des textures
		function loadCharacterAtlas(atl)
		{
			return  new Promise ( (ok, error) =>
			{
				let atlas = new XMLHttpRequest();
				atlas.open("GET", "img/Player/p1_spritesheet.json");
				atlas.onreadystatechange = function()
				{
					if(atlas.readyState == 4)
					{
						if(atlas.status == 200)
						{
							ok({ "tiles" : atl, "player" : JSON.parse(atlas.responseText)});
						}
						else
						{
							console.log(atlas.status);
							error ("chargement du fichier json");
						}
					}
				};
				atlas.send();
			});
		}

		// On charge les fichiers images
		function loadImages(atlas)
		{
			dataAtlas = atlas.tiles;
			playerAtlas = atlas.player;

			let images = ["img/Tiles/sheet.png", "img/Player/p1_spritesheet.png"];
			let imgsPromises = images.map (function (url)
			{
				return new Promise ( (ok, error) => {
					var img = new Image();
					img.src = url;
					img.onload = () => ok(img);
				});
			});
			return (Promise.all(imgsPromises))
		}

		// Lancement du jeu
		function startGame(images)
		{
			try
			{
				let world = new World(dataLvls);
				let render = new Renderer(world, dataAtlas, playerAtlas, images);
				render.start();
			}
			catch (e)
			{
				console.log(e);
			}
		}

		var start = Promise.resolve();
		start
		    .then (loadLvls)
		    .then (loadAtlas)
		    .then (loadCharacterAtlas)
		    .then (loadImages)
		    .then (startGame)
});
