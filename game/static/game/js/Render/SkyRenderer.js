var starCycleDuration = 3;

function SkyRenderer()
{
    this.hemiLight = null;
    this.sunLight = null;
    this.fogColor = new THREE.Color(34, 153, 255);
    this.skyDome = null;
    this.starFields =  [];

    this.init =
    function init()
    {
        THREE.Color.prototype.toInt = function()
        {
            return this.r << 16 | this.g << 8 | this.b;
        }
        THREE.Color.prototype.lerpRGB = function(color, amount)
        {
            return new THREE.Color(this.r + (color.r - this.r) * amount, this.g + (color.g - this.g) * amount, this.b + (color.b - this.b) * amount);
        }

        scene.fog = new THREE.FogExp2(0xFFFFFF, 0.010);

        //Hemisphere light
        this.hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 1);
        this.hemiLight.color.setHSL(0.6, 0.75, 0.8);
        this.hemiLight.groundColor.setHSL(0.095, 0.5, 0.8);
        this.hemiLight.position.set(0, 500, 0);
        scene.add(this.hemiLight);


        //World light
        scene.add(new THREE.AmbientLight(0x0f0f33));
        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1);
		this.sunLight.color.setHSL(0.1, 1, 0.95);
		this.sunLight.position.set(0, 300, 0);
		this.sunLight.position.multiplyScalar(1);
		scene.add(this.sunLight);


        //SkyDome
        var vertexShader = SkyDomeShader.vertexShader;
        var fragmentShader = SkyDomeShader.fragmentShader;
        var skyGeo = new THREE.SphereGeometry(GameRenderer.renderDistance - 1, 32, 15);
        var skyMat = new THREE.ShaderMaterial({uniforms: SkyDomeShader.uniforms, vertexShader: SkyDomeShader.vertexShader, fragmentShader: SkyDomeShader.fragmentShader, side: THREE.BackSide, fog: false});
        this.skyDome = new THREE.Mesh(skyGeo, skyMat);
        scene.add(this.skyDome);

        this.buildStarField();
    }

    this.update =
    function update()
    {
        var time = (World.time % World.dayDuration) / World.dayDuration;
        var lightAmount = Math.max(Math.min((Math.cos(time * Math.PI * 2 - Math.PI) + 0.5), 1), 0);

        //Sky gradient
        this.skyDome.position.set(camera.position.x, camera.position.y, camera.position.z);
        this.sunLight.intensity = lightAmount;
        this.hemiLight.intensity = lightAmount;
        SkyDomeShader.uniforms.topColor.value = topBlackSkyColor.lerpRGB(topSkyColor, lightAmount);

        if(lightAmount <= 0.10)
        {
            SkyDomeShader.uniforms.bottomColor.value = bottomBlackSkyColor.lerpRGB(orangeSkyColor, lightAmount * 10);
        }
        else if(lightAmount <= 0.25)
        {
            SkyDomeShader.uniforms.bottomColor.value = orangeSkyColor.lerpRGB(bottomSkyColor, lightAmount * 4);
        }
        else
        {
            SkyDomeShader.uniforms.bottomColor.value = SkyDomeShader.uniforms.bottomColor.value.lerpRGB(bottomSkyColor, lightAmount);
        }
        scene.fog.color = SkyDomeShader.uniforms.bottomColor.value;

        //Stars
        var starFieldAngle = (World.time % (World.dayDuration * starCycleDuration)) / (World.dayDuration * starCycleDuration);
        for(var i = 0; i < this.starFields.length; i++)
        {
            this.starFields[i].position.set(camera.position.x, camera.position.y, camera.position.z);
            this.starFields[i].rotation.y = starFieldAngle;
            this.starFields[i].rotation.z = starFieldAngle;
            this.starFields[i].material.opacity = 1 - lightAmount;
        }
    }

    this.buildStarField =
    function buildStarField()
    {
        var radius = GameRenderer.renderDistance - 10;
        for(var size = 0; size < 3; size++)
        {
            var starsGeometry = new THREE.Geometry();
            var amount = 1000 - 400 * size;
            var colors = [];
            for (var i = 0; i <= amount; i++)
            {
            	var star = new THREE.Vector3();

                var phi = Math.random() * 2 * Math.PI;
                var theta = (1 - Math.random()) * Math.PI;

                star.x = radius * Math.cos(phi) * Math.sin(theta);
                star.y = radius * Math.sin(phi) * Math.sin(theta);
                star.z = radius * Math.cos(theta);
            	starsGeometry.vertices.push(star);
                starsGeometry.colors.push(new THREE.Color(Math.random() * 0.1 + 0.3, Math.random() * 0.2 + 0.3, Math.random() * 0.5 + 0.5));
            }

            var starsMaterial = new THREE.PointsMaterial({size: size, sizeAttenuation: false, transparent: true, fog: false, vertexColors: THREE.VertexColors});
            this.starFields.push(new THREE.Points(starsGeometry, starsMaterial));
            this.starFields[size].rotation.x = MathUtil.toRadians(90);

            scene.add(this.starFields[size]);
        }
    }
}

var SkyRenderer = new SkyRenderer();
