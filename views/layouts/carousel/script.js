(function() {
    var kitties = document.getElementsByTagName("img");
    var cur = 0;
    var dots = document.getElementsByClassName("dot");
    var timer;
    var inTrans;

    function moveKitties(nextKitti) {
        //il codice va riscritto per renderlo flessibile. No for loop but recursion
        inTrans = true;
        console.log("cur", cur);
        kitties[cur].classList.remove("onscreen");
        dots[cur].classList.remove("on");
        kitties[cur].classList.add("offscreen-left");
        if (typeof nextKitti != "undefined") {
            cur = nextKitti;
        } else {
            cur++;
            if (cur >= kitties.length) {
                cur = 0;
            }
        }
        kitties[cur].classList.add("onscreen");
        dots[cur].classList.add("on");
    }

    timer = setTimeout(moveKitties, 1000);

    for (let i = 0; i < dots.length; i++) {
        (function() {
            dots[i].addEventListener("click", function() {
                if (cur == i) {
                    return;
                }
                if (inTrans) {
                    return;
                }
                clearTimeout(timer);
                moveKitties(i);
                // // clearTimeout(timer);
                // console.log("timer in event", timer);
                // dots[cur].classList.remove("on");
                // kitties[cur].classList.remove("onscreen");
                // kitties[cur].classList.remove("offscreen-left");
                // cur = i;
                // console.log("i", i);
                // dots[cur].classList.add("on");
                // kitties[cur].classList.add("onscreen");
                // // setTimeout(moveKitties(i), 1000);
                // console.log("i: ", i);
            });
        })(i);
    }

    cur;

    document.addEventListener("transitionend", function(e) {
        // var con = e.target.classList.contains("offscreen-left");
        // console.log("e.target.classList.value", con);
        if (e.target.classList.contains("offscreen-left")) {
            e.target.classList.remove("offscreen-left");
            clearTimeout(timer);
            timer = setTimeout(moveKitties, 1000);
            console.log("inTrans", inTrans);
            inTrans = false;
            console.log("in Trans after", inTrans);
            console.log("timer: ", timer);
        }
    });
})();
