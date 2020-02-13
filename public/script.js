console.log("test");

var canvas = $("#canvas");

var ctx = canvas[0].getContext("2d");
ctx.lineCap = "round";

ctx.beginPath();
canvas.on("mousedown", event => {
    var draw = true;
    if (draw) {
        ctx.moveTo(event.offsetX, event.offsetY);
    }
    canvas.on("mousemove", event => {
        if (draw) {
            var ctx = canvas[0].getContext("2d");
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    });
    canvas.on("mouseup", () => {
        draw = false;
        $("input[name='sig']").val(canvas[0].toDataURL());
    });
});
