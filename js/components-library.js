export class MatlabAxes {
    constructor(parentGroup, gridSize=4, gridDivisions=10) {
        this.group = new THREE.Group();
        parentGroup.add(this.group);

        this.allGrids = [].concat(
            this.#xyPlane(gridSize, gridDivisions, new THREE.Vector3(.5 * gridSize, 0, .5 * gridSize)),
            this.#yzPlane(gridSize, gridDivisions, new THREE.Vector3(0, .5 * gridSize, .5 * gridSize)),
            this.#zxPlane(gridSize, gridDivisions, new THREE.Vector3(.5 * gridSize, .5 * gridSize, 0))
        );
        this.tickLabels = this.#createTickLabels(gridSize, gridDivisions);
        this.axisLabels = this.#createAxisLabels(gridSize);
        this.allGrids.forEach(obj => this.group.add(obj));
        this.tickLabels.forEach(obj => this.group.add(obj));
        this.axisLabels.forEach(obj => this.group.add(obj));
    }

    #createPlane(size, divisions, position, colour) {
        const grid = new THREE.GridHelper(size, divisions, 0x333333, 0x333333);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.MeshPhongMaterial({ color: colour, transparent:true, opacity:0.1, side:THREE.DoubleSide })
        );
        plane.position.copy(position);
        grid.position.copy(position);
        return [grid, plane];
    }

    #xyPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0x4444ff);
        gridPlane[1].rotateX(Math.PI/2);
        gridPlane[0].rotateY(Math.PI/2);
        return gridPlane;
    }

    #yzPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0x44ff44);
        gridPlane[1].rotateY(Math.PI/2);
        gridPlane[0].rotateZ(Math.PI/2);
        return gridPlane;
    }

    #zxPlane(size, divisions, position) {
        const gridPlane = this.#createPlane(size, divisions, position, 0xff4444);
        gridPlane[1].rotateZ(Math.PI/2);
        gridPlane[0].rotateX(Math.PI/2);
        return gridPlane;
    }

    #makeLabel(text, pos, color="yellow") {
        const div = document.createElement("div");
        div.style.color = color;
        div.style.fontSize = "15px";
        div.textContent = text;
        const label = new CSS2DObject(div);
        label.position.copy(pos);
        return label;
    }

    #createTickLabels(size, divisions) {
        const labels = [];
        const step = (2 * size) / divisions;
        const offset = 0.1;

        for (let v = 0; v <= size; v += step) {
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(v, 0, size + offset)));
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(0, v, size + offset)));
            labels.push(this.#makeLabel(v.toFixed(1), new THREE.Vector3(size + offset, 0, v)));
        }
        return labels;
    }

    #createAxisLabels(size) {
        const offset = 0.2 * size;
        return [
            this.#makeLabel("X-axis", new THREE.Vector3(size + offset, 0, .5 * size), "white"),
            this.#makeLabel("Y-axis", new THREE.Vector3(0, size + offset * .5, 0), "white"),
            this.#makeLabel("Z-axis", new THREE.Vector3(.5 * size, 0 ,size + offset), "white"),
        ];
    }

    setTickLabelVisibilityTo(checked) {
        this.tickLabels.forEach(label => label.visible = checked);
    }

    setPlaneVisibilityTo(checked) {
        this.allGrids.forEach(grid => grid.visible = checked);
    }

    setAxesLabelVisibilityTo(checked) {
        this.axisLabels.forEach(label => label.visible = checked);
    }
}
