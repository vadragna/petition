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
    canvas.on("mousemove", e => {
        if (draw) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
    canvas.on("mouseup", () => {
        draw = false;
        $("input[name='sig']").val(canvas[0].toDataURL());
    });
});

$("#submit").on("click", () => {
    var sigCode = $("input[name='sig']").val(canvas[0].toDataURL());
    var sig = $("input#sig").html();
    var first = $("#first").val();
    var last = sigCode[0].value;
    console.log(sig, "sig", "first", first, "last", last);
    console.log("clicked on submit button");
});
