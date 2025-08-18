// Angular 20 Compatible Number Extensions
declare global {
    interface Number {
        mod(n: number): number;
        toFixedNumber(digits: number): number;
    }
}

Number.prototype.mod = function (n: number): number {
    return ((this % n) + n) % n;
};

Number.prototype.toFixedNumber = function (digits: number): number {
    return parseFloat(this.toFixed(digits));
};

export { };
