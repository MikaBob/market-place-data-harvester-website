// Make a deep copy of the given object
export function clone(objectToClone){
    var copy = objectToClone.constructor();
    for (var attr in objectToClone) {
        if (objectToClone.hasOwnProperty(attr)) copy[attr] = objectToClone[attr];
    }
    return copy;
}