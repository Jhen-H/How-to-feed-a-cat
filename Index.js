$(document).ready(function() {
    // 瀏覽器暫存空間 檢查是否有紀錄 沒紀錄的話展示資訊
    if (!sessionStorage.getItem('hasSeenCostInfo')) {
        showCostInfo();
    // 展示後設定已有紀錄
        sessionStorage.setItem('hasSeenCostInfo', 'true');
    }
});

function showCostInfo() {
    let costText = `
        <h3 style="color:#f9ca90;">養貓基本須知</h3>
        <p style="text-align:left; font-size:14px;">
            不管是領養還是購買，都需要準備以下花費：<br>
            • 驅蟲：200-500元<br>
            • 體檢：1,500-3,600元<br>
            • 預防針：1,200-1,500元<br>
            • 結紮：1,500-3,000元<br>
            • 晶片：300元<br>
            • 飼料、貓砂、碗、砂盆等：每月固定支出<br>
            <br><strong>粗估初次花費約 $5,000 元！</strong>
        </p>
    `;
    
    $("#megText").html(costText);
    $("#message").fadeIn();
}


let catInterval;
let isProcessing = false;
let isBusy = false;
let currentCat = '#myCat';
const catActions = ['#myCat', '#myCatRight', '#myCatLeft', '#myCatIn', '#myCatUp'];
let gameStats = {
    foodClicks: 0,
    litterClicks: 0,
    totalSpent: 0,
    foodLimit: 5,
    litterLimit: 10,
    isLocked: false
};

// 統計遊戲數據
let hasRecordedLowEnergy = false;
let gameAudit = {
    totalClicks: 0,
    timesSick: 0,
    lowEnergyCount: 0,
    saveData: function () {
        localStorage.setItem('myCatGameStats', JSON.stringify(this));
    },

    loadData: function () {
        const saved = localStorage.getItem('myCatGameStats');
        if (saved) Object.assign(this, JSON.parse(saved));
    }
};

$(document).ready(function() {
    gameAudit.loadData(); // 頁面一載入，馬上把舊紀錄讀進來
    console.log("遊戲紀錄已載入：", gameAudit);
});

function trackEvent(type, value = 1) {
    if (type === 'click') gameAudit.totalClicks += value;
    if (type === 'seedoctor') gameAudit.timesSick += value;
    if (type === 'lowEnergy') gameAudit.lowEnergyCount += value;
    
    // 每發生一次事件，就自動存檔一次
    gameAudit.saveData();
}


function monitorStats() {
    const watchList = ['full', 'health', 'clean', 'happy'];
    let isAnyLow = watchList.some(type => stats[type] < 50);

    if (isAnyLow) {
        if (!hasRecordedLowEnergy) {
            trackEvent('lowEnergy', 1);
            hasRecordedLowEnergy = true; // 鎖定，避免重複加分
        }
    } else {
        hasRecordedLowEnergy = false;
    }
}


function lockGame(msg, reason) {
    gameStats.isLocked = true;
    gameStats.lockReason = reason;
    $("#megText").html(msg);
    $("#message").fadeIn();
}

function unlockGame() {
    gameStats.isLocked = false;
    gameStats.lockReason = null; // 確保原因被清空
    $("#message").fadeOut(100, function () {
        $("#megText").html(""); // 徹底清空視窗內容
    });
}


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
    checkCostButtons();
    catwhere();
}

let stats = {
    full: 80,
    clean: 80,
    health: 80,
    happy: 80,
    money: 5000
};

// 能量更新函式
function updateStats(updates, checkUI = true) {
    for (let type in updates) {
        let change = updates[type];
        if (type === 'money') {
            stats.money += change;
            $("#money").text(stats.money);
            continue;
        }

        let $thisbar = $(`#${type}bar`).closest('.energybar');
        let $fill = $(`#${type}bar`);

        stats[type] = Math.min(100, Math.max(0, stats[type] + change));
        $fill.css("width", stats[type] + "%");

        // 僅保留視覺晃動，不跳視窗
        if (change > 0 && stats[type] > 100) {
            $thisbar.addClass("shaking");
            setTimeout(() => $thisbar.removeClass("shaking"), 300);
        }

        // 危險模式檢查
        if (stats[type] < 30 && ['full', 'health', 'clean', 'happy'].includes(type)) {
            $thisbar.addClass("danger");

            const typeNames = {
                'full': '餓太久',
                'health': '疏於照顧',
                'clean': '環境髒亂',
                'happy': '太憂鬱'
            };

            if (!gameStats.isLocked) {
                gameStats.isLocked = true;
                lockGame("注意！貓咪" + typeNames[type] + "生病了！<br> 請務必帶牠去獸醫檢查", 'sick');
            }
        } else {
            // 這裡不要移除鎖定，因為遊戲被鎖定通常需要手動去看醫生來解鎖
            $thisbar.removeClass("danger");
        }
    }

    // if (checkUI || $(".energybar").hasClass("danger")) {
        checkCostButtons();
        // }
        monitorStats();
        
}

// 物資檢查
function checkStatus(action) {
    if (action === 'eat') {
        gameStats.foodClicks++;
        if (gameStats.foodClicks >= gameStats.foodLimit) {
            lockGame("飼料吃完了！<br> 快幫小貓買新乾乾", 'food');
            return false; // 代表「不能繼續」
        }
    }
    // 檢查貓砂
    if (action === 'clean') {
        gameStats.litterClicks++;
        if (gameStats.litterClicks >= gameStats.litterLimit) {
            lockGame("貓砂不夠了！ <br> 趕快買回來補充", 'litter');
            return false;
        }
    }
    return true; // 代表「可以繼續」
}

//左側選單切換使用狀態
function checkCostButtons() {
    let isEmergency = $(".energybar").hasClass("danger");
    // 這裡我們直接計算，不用 if 判斷，toggleClass 的第二個參數就是布林值
    $("#buyFood").toggleClass("enabled", gameStats.foodClicks >= gameStats.foodLimit);
    $("#buyLitter").toggleClass("enabled", gameStats.litterClicks >= gameStats.litterLimit);
    $("#doctor").toggleClass("enabled", isEmergency);
}

// 玩耍動畫
function startPlaySequence(onFinished) { //回調函數 確保動畫已結束
    $("#playing, #playing1").stop(true, true).finish();
    $("#playing").css({ display: "none", opacity: 0 });
    //透明度設為1 不透明 避免出現時閃現
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

    if (gameStats.isLocked) {
        let msg = "目前無法進行此動作，請檢查狀態！"; // 預設值

        switch (gameStats.lockReason) {
            case 'food': msg = "飼料吃完了！<br> 快幫小貓買新乾乾"; break;
            case 'litter': msg = "貓砂不夠了！ <br> 趕快買回來補充"; break;
            case 'sick': msg = "貓咪現在生病中，請先去獸醫檢查！"; break;
        }

        $("#megText").html(msg);
        $("#message").fadeIn();
        return;
    }

    //檢查物資是否足夠
    if (!checkStatus(action)) return;

    if (action === 'eat' && stats.full >= 100) {
        $("#megText").html("吃太多囉!!<br>要變阿嬤養的貓了>_<");
        $("#message").fadeIn();
        return;
    }

    if (isBusy) return; // 如果已經有人執行動畫 中斷函式
    isBusy = true;
    resetCat();

    if (action === 'eat') {
        updateStats({ full: 15, health: 5, happy: 3 }, false);
        $("#myCatEat").css({ "left": "54.5%", "bottom": "23%" });
        $("#myCatEat").fadeIn("slow", function () {
            setTimeout(function () {
                $("#myCatEat").fadeOut("slow", function () { finishAction(); });
            }, 2000);
        });
    } else if (action === 'clean') {
        updateStats({ clean: 10, health: 5, happy: 3 }, false);
        $("#myCatPupu").fadeIn("slow", function () {
            setTimeout(function () {
                $("#myCatPupu").fadeOut("slow", function () { finishAction(); });
            }, 2000);
        });
    } else if (action === 'play') {
        updateStats({ happy: 15 });
        // 把 finishAction 傳入，動畫結束時自動觸發
        startPlaySequence(finishAction);
    } else if (action === 'drink') {
        updateStats({ clean: 3, health: 5 });
        $("#myCatEat").css({ "left": "63%", "bottom": "26%", "width": "12%" });
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
    // 動作按鈕
    $('#food').off("click").on("click", () => changeState('eat'));
    $('#clean').off("click").on("click", () => changeState('clean'));
    $('#toy').off("click").on("click", () => changeState('play'));
    $('#water').off("click").on("click", () => changeState('drink'));

    // 購買行為統一處理
    $('#buyFood').off("click").on("click", function () {
        if (isProcessing) return;
        isProcessing = true;
        gameStats.foodClicks = 0;
        unlockGame();
        updateStats({ money: 150 });

        setTimeout(() => {
            checkCostButtons();
        }, 50);

        setTimeout(() => {
            isProcessing = false;
        }, 300);
    });

    $('#buyLitter').off("click").on("click", function () {
        if (isProcessing) return;
        isProcessing = true;
        gameStats.litterClicks = 0;
        unlockGame();
        updateStats({ money: 250 });

        setTimeout(() => {
            checkCostButtons();
        }, 50);

        setTimeout(() => isProcessing = false, 300);
    });

    $('#doctor').off("click").on("click", function () {
        unlockGame();
        updateStats({ full: 100, clean: 100, health: 100, happy: 100 });
        $(".energybar").removeClass("danger");
        updateStats({ money: 1000 });
        setTimeout(() => {
            checkCostButtons();
        }, 50);
        trackEvent('seedoctor', 1);
    });


    // 能量條自動減少
    var energyTypes = ['full', 'clean', 'health', 'happy']; // 對應 stats 的屬性名稱

    energyTypes.forEach(function (type) {
        setInterval(function () {
            if (stats[type] > 0) {
                // 使用動態鍵值(有可能是陣列中任何一項 非固定)傳入能量條更新函式
                let updateObj = {};
                updateObj[type] = -6;
                updateStats(updateObj, false);
            }
        }, 5000);
    });


    $('#myCat').fadeIn("slow");
    currentCat = '#myCat';
    catwhere();





    //結算畫面用
    $('.funButton img').on("click", function () {
        trackEvent('click', 1);
        if (gameAudit.totalClicks >= 30) {
            $("#showReportLink").show();
        }
    });

    $("#showReportLink").on("click", function () {
        // 1. 抓取當前畫面上的錢
        let finalMoney = parseInt($("#money").text());
        // 2. 更新到你的 gameAudit 物件中 (為了存檔)
        gameAudit.totalSpent = finalMoney;
        gameAudit.saveData(); // 儲存更新後的錢

    });


});
