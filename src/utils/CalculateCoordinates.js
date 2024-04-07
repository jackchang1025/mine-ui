class CalculateCoordinates {
    constructor() {
        this.resetCoordinates();
    }

    calculateCoordinates(results) {

        this.resetCoordinates();

        for (const result of results.split('')) {
            if (result === 'T') {
                // 平局不改变X和Y的坐标,只记录结果
                this.coordinates.push({ x: this.x, y: this.y, result: result });
                continue;
            }

            if (result === this.lastResult) {
                if (this.y > this.minX ) {
                    this.y--;
                } else {
                    this.x++;
                }
                [this.x, this.y] = this.checkAndSetCoordinate(this.x, this.y);
            } else {
                if (this.lastResult !== '') {
                    this.x = this.startXCoordinates[this.lastResult] + 1;
                    this.y = 6;
                }
                this.minX = 1;
                this.startXCoordinates[result] = this.x;
            }

            [this.x, this.y] = this.checkAndSetCoordinate(this.x, this.y);
            this.lastResult = result;
            this.coordinates.push({ x: this.x, y: this.y, result: result });
        }

        return this.coordinates;
    }

    calculateCoordinatesWithArray(results) {

        // 判断results是否为数组
        if (!results.isArray()){
            throw new Error('results is not array');
        }

        this.resetCoordinates();

        for (const result of results) {

            if (!result.transformationResult) {
                continue;
            }

            if (result.transformationResult === 'T') {
                // 平局不改变X和Y的坐标,只记录结果
                result.x = this.x;
                result.y = this.y;
                continue;
            }

            if (result.transformationResult === this.lastResult) {
                if (this.y > this.minX ) {
                    this.y--;
                } else {
                    this.x++;
                }
                [this.x, this.y] = this.checkAndSetCoordinate(this.x, this.y);
            } else {
                if (this.lastResult !== '') {
                    this.x = this.startXCoordinates[this.lastResult] + 1;
                    this.y = 6;
                }
                this.minX = 1;
                this.startXCoordinates[result.transformationResult] = this.x;
            }

            [this.x, this.y] = this.checkAndSetCoordinate(this.x, this.y,results);
            this.lastResult = result.transformationResult;

            result.x = this.x;
            result.y = this.y;
        }

        return results;
    }

    resetCoordinates() {
        this.lastResult = '';
        this.coordinates = [];
        this.startXCoordinates = { B: 1, P: 1 }; // 记录每个结果序列起始的X坐标
        this.x = 1;
        this.minX = 1;
        this.y = 6;
    }

    checkAndSetCoordinate(x, y,results) {
        for (const coordinate of results) {
            if (coordinate.x === x && coordinate.y === y && coordinate.result !== 'T') {
                // 防止Y坐标小于1
                this.minX = x;
                return this.checkAndSetCoordinate(x + 1, y + 1);
            }
        }

        return [x, y];
    }
}

export default CalculateCoordinates;