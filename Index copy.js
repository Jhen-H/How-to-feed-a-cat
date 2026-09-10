let catInterval;
let isBusy = false;
let currentCat = '#myCat';
const catActions = ['#myCat', '#myCatRight', '#myCatLeft', '#myCatIn', '#myCatUp'];


function resetCat() {
    $(".allCat").not("#playing").not("#playing1").stop(true, true).hide();
    // clearInterval(catInterval);
    // $(".allCat").stop(true, true).hide();
}

function finishAction() {
    $("#playing, #playing1").stop(true, true).hide();
    isBusy = false;
    resetCat();
    $('#myCat').fadeIn("slow");
    currentCat = '#myCat';
    catwhere();
}

let stats = {
    full: 80,
    clean: 80,
    health: 80,
    happy: 80,
    money: 0
};

// 能量更新函式
function updateStats(updates) {
    for (let type in updates) {
        if (type === 'money') {
            stats.money += updates[type];
            $("#money").text(stats.money);
        } else {
            let change = updates[type]; // 這是本次要變動的量
            let $container = $(`#${type}bar`).closest('.energybar');

            // 只有在「增加」且「已經滿了」的時候才警告
            if (change > 0 && stats[type] === 100) {
                $container.addClass("shaking");

                if (type === 'full') {
                    $("#megText").html("吃太多囉!!<br>要變阿嬤養的貓了>_<");
                    $("#message").fadeIn();
                }

                setTimeout(function () {
                    $container.removeClass("shaking");
                }, 300);

                continue; // 只有增加時才擋住
            }

            // 執行扣減或正常的增加
            stats[type] = Math.min(100, Math.max(0, stats[type] + change));
            $(`#${type}bar`).css("width", stats[type] + "%");
        }
    }
}

// 玩耍動畫
function startPlaySequence(onFinished) { //回調函數 確保動畫已結束
    $("#playing, #playing1").stop(true, true).finish();
    $("#playing").css({ display: "none", opacity: 0 });
    //透明度設為不透明 避免出現時閃現
    $("#playing1").css({ display: "none", opacity: 1 }).removeClass("blur-wiggle");

    $("#playing")
        .css({ bottom: "-20%", display: "block", transform: "translateX(-50%) scale(0.8)" })
        .animate({
            bottom: "27%"
        }, 500, "swing"); //緩動函數 動畫會先慢、中間快、最後慢

    $("#playing").animate({ opacity: 1 }, {
        step: function (now, fx) { //現在屬性值,動畫的進度
            let scaleValue = 1.0 + (0.05 * fx.pos); // 從 1 變到 1.05
            $(this).css('transform', 'translateX(-50%) scale(' + scaleValue + ')');
        },
        duration: 500
    });

    setTimeout(function () {
        $("#playing").fadeOut("fast", function () {
            $("#playing1")
                .css({ bottom: "12%", left: "50%", opacity: 1, display: "block", transform: "translateX(-50%)" })
                .animate({ left: "68%" }, 400, function () {
                    // 加入晃動特效
                    $(this).addClass("blur-wiggle");

                    setTimeout(function () {
                        $("#playing1")
                            .removeClass("blur-wiggle")
                            .fadeOut("slow", function () {
                                $(this).css({ display: "none", transform: "translateX(-50%)" });
                                if (typeof onFinished === 'function') onFinished(); //確保是可執行的函式
                            });
                    }, 2000);
                });
        });
    }, 900);
}

// 貓咪狀態轉換
function changeState(action) {
    if (isBusy) return; // 如果已經有人執行動畫 中斷函式
    isBusy = true; 
    resetCat();

    if (action === 'eat') {
        updateStats({ full: 15, health: 5 ,happy: 3 });
        $("#myCatEat").css({ "left": "54.5%", "bottom": "23%" });
        $("#myCatEat").fadeIn("slow", function () {
            setTimeout(function () {
                $("#myCatEat").fadeOut("slow", function () { finishAction(); });
            }, 2000);
        });
    } else if (action === 'clean') {
        updateStats({ clean: 10, health: 5 ,happy: 3});
        $("#myCatPupu").fadeIn("slow", function () {
            setTimeout(function () {
                $("#myCatPupu").fadeOut("slow", function () { finishAction(); });
            }, 2000);
        });
    } else if (action === 'play') {
        updateStats({ happy: 20 });
        // 把 finishAction 傳入，動畫結束時自動觸發
        startPlaySequence(finishAction);
    } else if (action === 'drink') {
    updateStats({ clean: 10, health: 5 });
    $("#myCatEat").css({ "left": "63%", "bottom": "26%" , "width": "12%"});
    $("#myCatEat").fadeIn("slow", function () {
        setTimeout(function () {
            $("#myCatEat").fadeOut("slow", function () {
                $(this).css("width", "11%");
                finishAction();
            });
        }, 2000);
    });
}

}



// 貓咪輪播函式
function catwhere() {
    clearInterval(catInterval);

    catInterval = setInterval(function () {
        if (isBusy) return;
        $(".allCat").stop(true, true).fadeOut("fast");
        
        let nextCat;
        do {
            const randomIndex = Math.floor(Math.random() * catActions.length);
            nextCat = catActions[randomIndex];
        } while (nextCat === currentCat); // 如果貓咪一樣就重做一次迴圈
        currentCat = nextCat;
        $(nextCat).fadeIn("slow");
    }, 6000);
}


$(document).ready(function () {
    // 箭頭函式 省略function
    $('#food').on("click", () => changeState('eat'));
    $('#clean').on("click", () => changeState('clean'));
    $('#toy').on("click", () => changeState('play'));
    $('#water').on("click", () => changeState('drink'));


    // 能量條自動減少
    var energyTypes = ['full', 'clean', 'health', 'happy']; // 對應 stats 的屬性名稱

    energyTypes.forEach(function (type) {
        setInterval(function () {
            if (stats[type] > 0) {
                // 使用動態鍵值(有可能是陣列中任何一項 非固定)傳入能量條更新函式
                let updateObj = {};
                updateObj[type] = -3;
                updateStats(updateObj);
            }
        }, 5000);
    });


    $('#myCat').fadeIn("slow");
    currentCat = '#myCat';
    catwhere();
});
