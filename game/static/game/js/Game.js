var offlineMode = window.location.pathname.endsWith("debug.html");
//Cross browser compatibility
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//Constants
var VERSION = "0.3.2A";

//Properties
var width;
var height;
var textures;
var thePlayer;
var mouseX = 0
var mouseY = 0;

var stats;

function initGame()
{
    window.addEventListener("resize", onWindowResize, false);

    stats = new Stats();
    stats.showPanel(0);
    $("body").append(stats.dom);

    //Init Properties
    width = window.innerWidth;
    height = window.innerHeight;

    LoadingPage.setText("Initializing textures...");
    textures = ResourceLoader.initTextures(function()
    {
        LoadingPage.setText("Initializing models...");
        ResourceLoader.initModels(function()
        {
            MouseUtil.init();
            Tiles.init();
            Materials.init();
            GameRenderer.init();
            GUIS.init();
            Controls.init();
            GamePadControls.init();

            ResourceLoader.loadWorld(function(data)
            {   
                World.initMap(data["size"], data["size"], data["timeDay"], data["durationDay"], data["seedColor"]);
                var chunkAmount = World.mapWidth * World.mapLength;
                var loadedChunk = 0;

                for(var x = 0; x < World.mapWidth; x++)
                {
                    for(var z = 0; z < World.mapLength; z++)
                    {
                        LoadingPage.setText("Downloading world chunks...");
                       
                        World.getChunkAtChunkCoords(x, z).map = ResourceLoader.uncompress(data["world"][x][z]);
                        loadedChunk++;

                        if(loadedChunk >= chunkAmount)
                        {
                            if(!offlineMode)
                            {
                                PacketsUtil.sendPacket(new PacketReady());
                            }
                            else
                            {
                                thePlayer = new EntityPlayer();
                                thePlayer.setPosition(20, 40, 20);
                                thePlayer.onLogin("OffLineUsername", "cat");
                                thePlayer.spawn();

                                finalizeGame();
                            }
                        }

                    }
                }

            }, function(error)
            {
                alert("Erreur map ! Cf console");
                console.error(error);
            });

        });
    });
}

function finalizeGame()
{
    GUIS.INGAME_GUI.open();
    GUIS.CHAT_GUI.open();
    ChatManager.init();
    World.applyQueue();
    World.renderChunksTimed(function()
    {
        LoadingPage.hide();

        // On effectue le rendu de la scène
        requestAnimationFrame(loopGame);
    });
}

function loopGame(time)
{
    stats.begin();

    TimeManager.calculateTime(time);
    ContainerManager.updatePos();
    Controls.update();
    GamePadControls.update();

    while(TimeManager.shallTick())
    {
        World.update();
        Entities.updateEntities();

        if(!offlineMode && thePlayer.hasMoved())
        {
            PacketsUtil.sendPacket(new PacketMove(thePlayer.x, thePlayer.y, thePlayer.z, thePlayer.pitch, thePlayer.yaw, thePlayer.totalMotionX, thePlayer.totalMotionY, thePlayer.totalMotionZ));
        }
    }
    GameRenderer.update();
    Entities.renderEntities();

    GUIS.updateAllGuis();

    stats.end();
    requestAnimationFrame(loopGame);
}

function onWindowResize()
{
    var oldWidth = width;
    var oldHeight = height;

    width = window.innerWidth;
    height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);

    GameRenderer.onResize();
    GUIS.resizeAllGuis(oldWidth, oldHeight);
}
