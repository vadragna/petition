console.log("test2");

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
        console.log("sig", sig);
        draw = false;
        $("input[name='sig']").val(canvas[0].toDataURL());
    });
});

$("#submit").on("click", () => {
    console.log("clicked");
    console.log("sig", sig);
    console.log('$("#message").html()', $("#message").html());
    var sig = $("input#sig").html();
    if (sig != "") {
        var sigCode = $("input[name='sig']").val(canvas[0].toDataURL());
        var first = $("#first").val();
        var last = sigCode[0].value;
        console.log(sig, "sig", "first", first, "last", last);
        console.log("clicked on submit button");
    } else {
        if ($("#message").html().length == 0) {
            $("#message").append(
                "<h5>You must sign to send your subscription!</h5>"
            );
        }
    }
});
