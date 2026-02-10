import { Group, SphereGeometry, MeshPhongMaterial, Mesh, TextureLoader, Color, ShaderMaterial, PointsMaterial,
    Vector3, BackSide, AdditiveBlending,    DoubleSide, Quaternion, BufferGeometry, BufferAttribute, Points,
    MeshBasicMaterial, FrontSide, LineDashedMaterial, LineBasicMaterial, LineLoop, Line, PlaneGeometry } from "three";
import { Trail } from 'https://www.hendrikse.name/science/js/three-js-extensions.js';

export const EARTH_SEMI_MAJOR_AXIS = 149598261.;
export const PLANET_SCALE = 0.25E7;  // meters → render units (radius), planet sizes are shrunk by this factor
export const SUN_SCALE = 100 * PLANET_SCALE;
export const AU = 1.496 * 1E11;   // astronomical unit
export const ORBIT_SCALE  = 40;    // additional orbit compression factor for nice visual representation
export const DISTANCE_SCALE = AU / ORBIT_SCALE;
export const SCALE_MOON = 275 ; // scaling factor for semi major axes of some moons

const toRenderUnits = (vector) => vector.clone().multiplyScalar(1000 / DISTANCE_SCALE);

export class SkyDome extends Group {
    constructor({
                    skyRadius = 5000,
                    starDensity = 5,
                    glowStarCount = 2000,
                    pointSize = 4,
                    blinkSpeed = 5
                } = {}) {
        super();

        this._stars = this.#createStars(skyRadius / starDensity); // Non-blinking stars
        this._stars.forEach(star => { star.renderOrder = -1; this.add(star); });
        this._glowStars = this.#createGlowStars(skyRadius, glowStarCount, pointSize, blinkSpeed); // Blinking stars
        this._glowStars.renderOrder = -10; // Sky dome is "infinitely" far away
        this.add(this._glowStars);
    }

    #createGlowStars(skyRadius, starCount, pointSize, blinkSpeed) {
        const positions = new Float32Array(starCount * 3);
        const randomPhases = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = skyRadius;

            positions[3 * i + 0] = r * Math.sin(phi) * Math.cos(theta);
            positions[3 * i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[3 * i + 2] = r * Math.cos(phi);

            randomPhases[i] = Math.random(); // unieke fase voor fonkelen
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        geometry.setAttribute("aRandom", new BufferAttribute(randomPhases, 1));

        const material = new ShaderMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: false,
            blending: AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                pointSize: { value: pointSize },
                blinkSpeed: { value: blinkSpeed }
            },
            vertexShader: `
                attribute float aRandom;
                varying float vRandom;
                uniform float uTime;
                void main() {
                    vRandom = aRandom;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 4.0 + 2.0 * sin(uTime * 5.0 + vRandom * 6.2831);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float halo = exp(-dist * dist * 8.0);

                    // fonkelen
                    float alpha = halo;
                    gl_FragColor = vec4(vec3(1.0), alpha);
                }
            `
        });

        return new Points(geometry, material);
    }

    #createStars(radius) {
        const layers = [
            { count: 250, size: 2, color: 0x555555 },
            { count: 1500, size: 1, color: 0x333333 }
        ];

        const starGroups = [];

        for (let layer = 0; layer < layers.length; layer++) {
            const { count, size, color } = layers[layer];
            const positions = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const vector = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
                    .normalize()
                    .multiplyScalar(radius);

                positions[3 * i + 0] = vector.x;
                positions[3 * i + 1] = vector.y;
                positions[3 * i + 2] = vector.z;
            }

            const geometry = new BufferGeometry();
            geometry.setAttribute("position", new BufferAttribute(positions, 3));

            const material = new PointsMaterial({
                color,
                size,
                sizeAttenuation: false,
                depthWrite: false,
                depthTest: false
            });

            for (let i = 10; i < 30; i++) {
                const stars = new Points(geometry, material);
                stars.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                stars.updateMatrix();
                stars.matrixAutoUpdate = false;
                starGroups.push(stars.clone());
            }
        }

        return starGroups;
    }

    update(time, camera) {
        this.quaternion.copy(camera.quaternion);
        this._glowStars.material.uniforms.uTime.value = time;
        this.position.copy(camera.position);
    }
}

export class Orbit {
    constructor(meanAnomaly, eccentricity, semiMajorAxis, inclination, ascension, accuracy=1E2, nPoints=10000) {
        this._nPoints = nPoints; // number of orbit coordinates generated
        this._timescale = (semiMajorAxis / EARTH_SEMI_MAJOR_AXIS) ** 1.5; // rotation period w.r.t. Earth
        const range = this._linSpace(meanAnomaly, 2 * Math.PI + meanAnomaly, nPoints);

        let eccentricAnomaly = range.slice();
        let eccentricAnomalyOld = new Array(nPoints);

        let maxDiff = Infinity;
        while (maxDiff > accuracy) {
            maxDiff = 0;
            eccentricAnomalyOld = eccentricAnomaly.slice(); // copy array

            // Newton–Raphson step
            for (let i = 0; i < nPoints; i++) {
                const f = eccentricAnomalyOld[i] - eccentricity * Math.sin(eccentricAnomalyOld[i]) - range[i];
                const fPrime = 1 - eccentricity * Math.cos(eccentricAnomalyOld[i]);
                eccentricAnomaly[i] = eccentricAnomalyOld[i] - f / fPrime;
                maxDiff = Math.max(maxDiff, Math.abs(eccentricAnomaly[i] - eccentricAnomalyOld[i]));
            }
        }

        this._points = [];
        for (let i = 0; i < nPoints; i++) {
            const theta = 2 * Math.atan2(
                Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly[i] / 2),
                Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly[i] / 2)
            );

            const r = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly[i]));
            const thetaAsc = theta - ascension;

            const x = (Math.cos(ascension) * Math.cos(thetaAsc) -
                Math.sin(ascension) *
                Math.sin(thetaAsc) *
                Math.cos(inclination));

            const z = (Math.sin(ascension) * Math.cos(thetaAsc) +
                Math.cos(ascension) *
                Math.sin(thetaAsc) *
                Math.cos(inclination));

            const y = Math.sin(theta - ascension) * Math.sin(inclination);
            this._points.push(new Vector3(x, y, z).multiplyScalar(r));
        }
    }

    _linSpace(start, stop, num) {
        const result = [];
        const step = (stop - start) / (num - 1);

        for (let i = 0; i < num - 1; i++)
            result.push(start + i * step);

        result.push(stop); // include last point as well
        return result;
    }


    _indexAtTime(tHours) {
        const periodHours = 365.25 * this._timescale * 24;
        const phase = (tHours % periodHours) / periodHours;
        return Math.floor(phase * this._nPoints);
    }

    coordinatesAt(tHours) {
        return this._points[this._indexAtTime(tHours)];
    }

    draw({
             color = 0x666666,
             linewidth = 1,
             opacity = 0.9,
             closed = true,
             scale = 1,
             dashed = false
         } = {}) {
        const positions = new Float32Array(this._points.length * 3);

        this._points.forEach((p, i) => {
            positions[3 * i + 0] = p.x * scale;
            positions[3 * i + 1] = p.y * scale;
            positions[3 * i + 2] = p.z * scale;
        });

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));

        let material;
        if (dashed)
            material = new LineDashedMaterial({color, linewidth, dashSize: 3, gapSize: 2, transparent: true, opacity});
        else
            material = new LineBasicMaterial({color, linewidth, transparent: true, opacity});

        const line = closed
            ? new LineLoop(geometry, material)
            : new Line(geometry, material);

        if (dashed) line.computeLineDistances();

        this._line = line;
        return line;
    }
}

// Abstract base class for celestial bodies, hence should _not_ be instantiated directly!
const TEXTURES_PATH = "https://www.hendrikse.name/science/astrophysics/code/textures/";

const textureLoader = new TextureLoader();
textureLoader.setCrossOrigin("anonymous");
export class CelestialBody extends Group {
    constructor(bodyData, scale, {bumpScale=0.005, identicalBumpMap=false, resolution=32} = {}) {
        super();
        this._name = bodyData.name;
        this._radius = bodyData.radius;
        this._mass = bodyData.mass;
        this._tilt = bodyData.tilt;
        this._spin = bodyData.spin;
        this._scaledRadius = bodyData.radius / scale;

        // Set the axis of rotation (Y-axis) equal to the tilt
        this.quaternion.setFromAxisAngle(new Vector3(0, 0, 1), bodyData.tilt);

        this._geometry = new SphereGeometry(this._scaledRadius, resolution, resolution);
        this._body = new Mesh(this._geometry, this._material(bumpScale, identicalBumpMap));
        this.add(this._body);
        this._body.castShadow = true;
        this._body.receiveShadow = false;
        this._trail = null;
    }

    get scaledRadius() { return this._scaledRadius; }
    get tilt() { return this._tilt; }
    get radius() { return this._radius; }
    get mass() { return this._mass; }
    get axis() { new Vector3(0, 0, 1).applyQuaternion(this.quaternion).normalize(); }
    //get name() { return this._name; }

    _material(bumpScale, identicalBumpMap) { throw new Error("Abstract class: implement material!"); }

    updateRotation(tHours) { this._body.rotation.y = this._spin * tHours; } // Spin the body along the axis with tilt

    enableTrail({ maxPoints=1000, color=0xffff00, lineWidth=1, trailStep=10 } = {}) {
        this._trail = new Trail(this);
        this._trail.enable({maxPoints, color, lineWidth, trailStep });
    }

    updateTrail(dt) { this._trail?.update(dt); }
    disposeTrail() { this._trail?.dispose(); }
}

export class Planet extends CelestialBody {
    constructor(planetData, {bumpScale=0.005, identicalBumpMap=false} = {}) {
        super(planetData, PLANET_SCALE, {bumpScale: bumpScale, identicalBumpMap: identicalBumpMap});
        this._body.castShadow = true;
        this._body.receiveShadow = false;

        this._orbit = new Orbit(
            planetData.mean_anomaly,
            planetData.e,
            planetData.a,
            planetData.inclination,
            planetData.right_ascension
        );
    }

    _material(bumpScale, identicalBumpMap) {
        const bumpMap = TEXTURES_PATH + this._name + (identicalBumpMap ? "map.jpg" : "bump.jpg");
        return new MeshPhongMaterial({
            map: textureLoader.load(`${TEXTURES_PATH}` + this._name + "map.jpg"),
            bumpMap: textureLoader.load(bumpMap),
            bumpScale: bumpScale,
            shininess: 0
        });
    }

    coordinatesAt(t) { return this._orbit.coordinatesAt(t); }
    renderedOrbit(color) { return this._orbit.draw({
        color: color,
        opacity: 0.4,
        scale: 1000 / DISTANCE_SCALE
    }); }

    update(t) {
        this.updateTrail();
        this.updateRotation(t);
    }
}

export class Satellite extends CelestialBody {
    constructor(moonData, planet, scale) {
        super(moonData, scale, {resolution: 32});
        this._planet = planet;
        this._angle = 0;
        this._a = moonData.a; // semi-major axis
        this._e = moonData.e;

        this._timescale = moonData.period / 365.25;  // rotation period w.r.t Earth
        this._lock = moonData.tidal_lock;
        this._body.castShadow = false;
        this._body.receiveShadow = true;

        this._orbit = new Orbit(
            moonData.mean_anomaly,
            this._e,
            this._a,
            planet.tilt +
            moonData.inclination,
            moonData.right_ascension);
    }

    coordinatesAt(t) { return this._orbit.coordinatesAt(t); }

    update(t) {
        this.updateTrail();
        if (this._lock) {
            const planetWorldPos = this._planet.getWorldPosition(new Vector3());
            this.lookAt(planetWorldPos);
            // Correct fixed phase fase-offset if needed (texture-orientation)
            this.rotateY(Math.PI); // of rotateZ, dependent on texture
        } else
            this.updateRotation(t);
    }
}

export class PlanetMoonSystem extends Group {
    constructor(planet, moons = []) {
        super();
        this._planet = planet;
        this._moons = moons;

        this.add(planet);
        moons.forEach(moon => this.add(moon));
    }

    get mass() {
        let M = this._planet.mass;
        for (const moon of this._moons)
            M += moon.mass;
        return M;
    }

    update(t) {
        // 1. barycentric position (sun-centric)
        const baryPosition = this._planet.coordinatesAt(t).clone();

        // 2. total mass
        const M = this.mass;

        // 3. barycentric correction
        const correction = new Vector3();
        for (const moon of this._moons)
            correction.add(moon.coordinatesAt(t).clone().multiplyScalar(moon.mass / M));

        // 4. planet position
        this._planet.position.copy(toRenderUnits(baryPosition.clone().sub(correction)));

        // 5. moon positions
        for (const moon of this._moons)
            moon.position.copy(toRenderUnits(baryPosition.clone().add(moon.coordinatesAt(t))));

        // 6. rotations
        this._planet.update(t);
        for (const moon of this._moons)
            moon.update(t);
    }
}

export class Sun extends CelestialBody {
    constructor(bodyData) {
        super(bodyData, SUN_SCALE, {resolution: 64});

        this._body.castShadow = false;
        this._body.receiveShadow = false;
        this._spin = bodyData.spin;

        // 🌞 inner glow (FrontSide, harsher, brighter)/
        const innerGlowMaterial = this._createAtmosphereMaterial(true, false, 0xffffcc, 0.3, 2.0);
        innerGlowMaterial.side = FrontSide;
        this._innerGlow = new Mesh(this._geometry.clone(), innerGlowMaterial);
        this._innerGlow.scale.multiplyScalar(1.01);
        this._innerGlow.material.blending = AdditiveBlending;

        // 🌞 outer glow (BackSide, softer, bigger)
        const outerGlowMaterial = this._createAtmosphereMaterial(false, false, 0xffe066, 0.3, 4.0);
        outerGlowMaterial.side = BackSide;
        this._outerGlow = new Mesh(this._geometry.clone(), outerGlowMaterial);
        this._outerGlow.scale.multiplyScalar(1.22);

        this.add(this._innerGlow, this._outerGlow);
    }

    _material(bumpScale, identicalBumpMap) {
        return new MeshBasicMaterial({
            map: textureLoader.load(`${TEXTURES_PATH}` + "sunmap.jpg"),
            transparent: false
        })
    }

    update(t) {
        this._body.rotation.y = this._spin * t * .1; // make it spin even slower for additional realism
        const s =
            1.22 +
            0.035 * Math.sin(t * 0.02) +
            0.015 * Math.sin(t * 0.037);
        this._outerGlow.scale.setScalar(s);
        this._outerGlow.material.uniforms.power.value =
            4.0 + 0.3 * Math.sin(t * 0.015);
    }

    _createAtmosphereMaterial(depthTest=true, depthWrite=false, glowColor = 0xffff00, coef = 0.5, power = 2.0) {
        return new ShaderMaterial({
            uniforms: {
                glowColor: { value: new Color(glowColor) },
                coeficient: { value: coef },
                power: { value: power }
            },
            vertexShader: `
            varying vec3 vVertexWorldPosition;
            varying vec3 vVertexNormal;

            void main() {
                vVertexNormal = normalize(normalMatrix * normal);
                vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
            fragmentShader: `
            uniform vec3 glowColor;
            uniform float coeficient;
            uniform float power;
            varying vec3 vVertexNormal;
            varying vec3 vVertexWorldPosition;
            void main() {
                vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
                vec3 viewCameraToVertex = (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
                viewCameraToVertex = normalize(viewCameraToVertex);
                float intensity = pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);
                intensity = clamp(intensity, 0.0, 0.5); // maximaal 0.5 voor subtiele halo
                gl_FragColor = vec4(glowColor, intensity);
            }
        `,
            transparent: true,
            depthWrite: depthWrite,
            depthTest: depthTest
        });
    }
}

export class Moon extends Satellite {
    constructor(moonData, planet) {
        super(moonData, planet, PLANET_SCALE);
    }

    _material(bumpScale, identicalBumpMap) {
        return new MeshPhongMaterial({
            map: textureLoader.load(`${TEXTURES_PATH}moonmap1k.jpg`),
            bumpMap: textureLoader.load(`${TEXTURES_PATH}moonbump1k.jpg`),
            bumpScale: 0.002,
            emissiveIntensity: 0.1,
            shininess: 0
        });
    }

    renderedOrbit(color) { return this._orbit.draw({
        color: color,
        opacity: 0.4,
        scale: 1000 / DISTANCE_SCALE
    }); }
}

export class EarthClouds extends Mesh {
    constructor(radius, spin) {

        const geometry = new SphereGeometry(radius * 1.01, 32, 32);

        const material = new MeshPhongMaterial({
            map: textureLoader.load(`${TEXTURES_PATH}earthcloudmap.jpg`),
            alphaMap: textureLoader.load(`${TEXTURES_PATH}earthcloudmaptrans.jpg`),

            transparent: true,
            opacity: 0.75,

            depthWrite: false,   // prevents harsh borders
            side: FrontSide,

            emissive: new Color(0x222222),
            emissiveIntensity: 0.25,

            shininess: 5
        });

        super(geometry, material);

        this._spin = spin;
        this.castShadow = false;
        this.receiveShadow = false;
    }

    update(t) {
        this.rotation.y = this._spin * t * 0.75;
    }
}

export class EarthEquatorialPlane extends Mesh {
    constructor(earth, {
        sizeFactor = 6,
        opacity = 0.15,
        color = 0x00ffff
    } = {}) {

        const geometry = new PlaneGeometry(earth.scaledRadius * sizeFactor, earth.scaledRadius * sizeFactor);
        const material = new MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            side: DoubleSide,
            depthWrite: false
        });
        super(geometry, material);

        this.rotateX(Math.PI / 2);
        const tiltQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), earth.tilt);
        this.applyQuaternion(tiltQuat);
    }
}

export class Earth extends Planet {
    constructor(planetData={
        "name": "earth",
        "a": EARTH_SEMI_MAJOR_AXIS,
        "e": 0.01671123,
        "inclination": 0.,
        "right_ascension": 0.,
        "mean_anomaly": 6.2398515744,
        "radius": 6371010, // meters
        "mass": 5.97219e+24,
        "spin": 2 * Math.PI / 24.,
        "tilt": 23 * Math.PI / 180
    }) {
        super(planetData);
        this._timescale = 1; // rotation period w.r.t. Earth
        this._clouds = new EarthClouds(this._geometry.parameters.radius, this._spin);
        this.add(this._clouds);
        this._equatorialPlane = new EarthEquatorialPlane(this, {
            innerRadiusFactor: 1.3,
            outerRadiusFactor: 3.0,
            opacity: 0.12
        });
        this._equatorialPlane.visible = false;
        this.add(this._equatorialPlane);
    }

    get equatorialPlane() { return this._equatorialPlane; }
    get clouds() { return this._clouds; }

    update(t) {
        super.update(t);
        this._clouds?.update(t);
    }

    _material(bumpScale, identicalBumpMap) {
        return new MeshPhongMaterial({
            map: textureLoader.load(`${TEXTURES_PATH}earthmap1k.jpg`),
            bumpMap: textureLoader.load(`${TEXTURES_PATH}earthbump1k.jpg`),
            bumpScale: 0.05,
            specularMap: textureLoader.load(`${TEXTURES_PATH}earthspec1k.jpg`),
            specular: new Color(0x333333),
            emissive: new Color(0x112244),
            emissiveIntensity: 0.05,
            shininess: 3
        });
    }
}

// Port to new Three.js from https://github.com/jeromeetienne/threex.planets/blob/master/threex.planets.js
const PlanetRingGeometry = function (innerRadius, outerRadius, thetaSegments) {

    innerRadius   = innerRadius || 0;
    outerRadius   = outerRadius || 1;
    thetaSegments = Math.max(3, Math.floor(thetaSegments || 8));

    // number of vertices = 4 per segment
    const vertexCount = thetaSegments * 4;
    const positionArray = new Float32Array(vertexCount * 3);
    const normalArray   = new Float32Array(vertexCount * 3);
    const uvArray       = new Float32Array(vertexCount * 2);
    const indexArray    = new Uint16Array(thetaSegments * 6);

    let pPos = 0, pNorm = 0, pUV = 0, pIdx = 0;
    let vertexIndex = 0;

    for (let i = 0; i < thetaSegments; i++) {

        const angleLo = (i / thetaSegments) * Math.PI * 2;
        const angleHi = ((i + 1) / thetaSegments) * Math.PI * 2;

        // calculate positions
        const x1 = Math.cos(angleLo), y1 = Math.sin(angleLo);
        const x2 = Math.cos(angleHi), y2 = Math.sin(angleHi);

        // 4 vertices per ring segment
        const positions = [
            innerRadius * x1, innerRadius * y1, 0,
            outerRadius * x1, outerRadius * y1, 0,
            innerRadius * x2, innerRadius * y2, 0,
            outerRadius * x2, outerRadius * y2, 0,
        ];

        // normals (all Z = +1)
        const normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];

        // UVs as in original code
        const uvs = [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ];

        // Fill buffers
        for (let j = 0; j < 4; j++) {
            positionArray[pPos++] = positions[j * 3 + 0];
            positionArray[pPos++] = positions[j * 3 + 1];
            positionArray[pPos++] = positions[j * 3 + 2];

            normalArray[pNorm++]   = normals[j * 3 + 0];
            normalArray[pNorm++]   = normals[j * 3 + 1];
            normalArray[pNorm++]   = normals[j * 3 + 2];

            uvArray[pUV++] = uvs[j * 2 + 0];
            uvArray[pUV++] = uvs[j * 2 + 1];
        }

        // indices (2 triangles)
        indexArray[pIdx++] = vertexIndex + 0;
        indexArray[pIdx++] = vertexIndex + 1;
        indexArray[pIdx++] = vertexIndex + 2;

        indexArray[pIdx++] = vertexIndex + 2;
        indexArray[pIdx++] = vertexIndex + 1;
        indexArray[pIdx++] = vertexIndex + 3;

        vertexIndex += 4;
    }

    // Create geometry
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    geometry.setAttribute('normal',   new BufferAttribute(normalArray, 3));
    geometry.setAttribute('uv',       new BufferAttribute(uvArray, 2));
    geometry.setIndex(new BufferAttribute(indexArray, 1));
    geometry.computeBoundingSphere();

    return geometry;
};

export class Saturn extends Planet {
    constructor(planetData={
        "name": "saturn",
        'a': 1433449370.,
        'e': 0.055723219,
        'inclination': 2.49 * Math.PI / 180.,
        'right_ascension': 1.98,
        'mean_anomaly': 5.5911055356,
        'radius': 60000. * 1e3,
        "mass": 5.68319e+26,
        'tilt': 27 * Math.PI / 180.,
        'spin': 2 * Math.PI / 10.66 }) {
        super(planetData, {bumpScale: 0.05, identicalBumpMap: true});

        const innerRingRadius = 1.11 * planetData.radius;
        const outerRingRadius = 2.1 * planetData.radius;
        const ringMesh = this.#createRings(
            innerRingRadius / PLANET_SCALE,
            outerRingRadius / PLANET_SCALE);
        this.add(ringMesh);
    }

    #createRings(innerRadius, outerRadius) {
        const geometry = new PlanetRingGeometry(innerRadius, outerRadius, 128);
        const texture = new TextureLoader().load(`${TEXTURES_PATH}saturnringcolor.jpg`);
        const material = new MeshPhongMaterial({
            map: texture,
            side: DoubleSide,
            transparent: true,
            opacity: 0.85
        });

        const rings = new Mesh(geometry, material);
        rings.rotation.x = Math.PI / 2; // Ring lies in XY plane → tilt to XZ
        this.rotation.z = this._tilt; // Axial tilt (set only once!)
        return rings;
    }
}

export class Uranus extends Planet {
    constructor(planetData={
        "name": "uranus",
        'a': 2876679082.,
        'e': 0.044405586,
        'inclination': 0.77 * Math.PI / 180.,
        'right_ascension': 1.2908891856,
        'mean_anomaly': 2.4950479462,
        'radius': 25600. * 1E3,
        "mass": 8.68103E25,
        'tilt': 98 * Math.PI / 180.,
        'spin': -2 * Math.PI / 17.24}) {
        super(planetData, {identicalBumpMap: true, bumpScale: 0.05});

        const inner = 1.5 * planetData.radius / PLANET_SCALE;
        const outer = 1.8 * planetData.radius / PLANET_SCALE;

        const geometry = new PlanetRingGeometry(inner, outer, 128);
        const texture = new TextureLoader().load(`${TEXTURES_PATH}uranusringcolour.jpg`);

        const material = new MeshPhongMaterial({
            map: texture,
            side: DoubleSide,
            transparent: true,
            opacity: 0.2,          // subtle
            depthWrite: false       // prevent z-fighting
        });

        const rings = new Mesh(geometry, material);

        rings.rotation.x = Math.PI / 2;
        this.rotation.z = this._tilt; // Uranus ~98°

        this.add(rings);
    }
}
