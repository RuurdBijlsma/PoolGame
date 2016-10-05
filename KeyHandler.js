class KeyHandler {
    constructor(gameLoop) {
        this.keyPressed = [];

        let handler = this;
        document.addEventListener('keydown', function(e) {
            handler.keydown(e, handler);
        }, false);
        document.addEventListener('keyup', function(e) {
            handler.keyup(e, handler);
        }, false);

        this.checkLoop = gameLoop.add(function() {
            for (let checkKey in handler.continuousKeyFunctions)
                if (handler.isPressed(checkKey))
                    handler.continuousKeyFunctions[checkKey](handler.keyPressed[handler.keyPressed.map(k=>k.key).indexOf(checkKey)].event);
        });

        this.singleKeyFunctions = {};
        this.continuousKeyFunctions = {};
    }

    setSingleKey(key, fun) {
        this.singleKeyFunctions[key] = fun;
    }
    deleteSingleKey(key) {
        delete this.singleKeyFunctions[key];
    }
    setContinuousKey(key, fun) {
        this.continuousKeyFunctions[key] = fun;
    }
    deleteContinuousKey(key) {
        delete this.continuousKeyFunctions[key];
    }

    keydown(e, handler) {
        let key = e.key;
        if (!handler.isPressed(key)) {
            handler.keyPressed.push({
                key: key,
                event: e
            });
        }
        for (let checkKey in handler.singleKeyFunctions)
            if (key === checkKey)
                handler.singleKeyFunctions[checkKey](e);
    }

    keyup(e, handler) {
        let key = e.key;
        handler.keyPressed.splice(handler.keyPressed.map(k=>k.key).indexOf(key), 1);
    }

    isPressed(key) {
        return this.keyPressed.map(k=>k.key).includes(key);
    }
}
