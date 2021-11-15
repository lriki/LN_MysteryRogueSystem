
const _Graphics_centerElemen = Graphics._centerElement;
Graphics._centerElement = function(element) {
    _Graphics_centerElemen.call(this, element);
    element.style.margin = "0px";
};
