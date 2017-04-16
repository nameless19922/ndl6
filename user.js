module.exports = class User {
    constructor(id, name, score) {
        this.id = id;
        this.name = name;
        this.score = +score;
    }

    static autoIncrement() {
        let i = 1;

        return () => {
            return i++;
        }
    }

    setUser(name, score) {
        this.name = name;
        this.score = score;

        return this;
    }
}