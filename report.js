let currentMoney = parseInt($("#money").text());

function resetGame() {
    localStorage.removeItem('myCatGameStats'); // 清除數據
    window.location.href = "index.html";        // 跳轉
}

$("#result").addClass("enabled")
$("#comeback").addClass("enabled").on("click", function () {
    // 檢查是否擁有 enabled class (確保符合你的狀態邏輯)
    resetGame();
});

const knowledgeData = {
    fur: {
        title: "貓咪的小毛球",
        text: ` 愛乾淨的小貓咪會舔毛整理自己，但同時也會吞下貓毛
              這些貓毛無法消化會被吐出來，如過多無法吐出來就會生病
              尤其每年春秋換毛季時更容易吃入過多毛毛
              (包括壓力及身體不舒服也會過度舔毛)
              建議幫貓貓常常梳毛!或者定期餵食化毛膏或貓草幫助排出唷 ̗̀ฅ(´꒳ \`ฅ)ꪆ `,
        img: "img/fur_guide.jpeg"
    },
    nail: {
        title: "剪指甲小撇步",
        text: `貓咪的指甲會不斷生長，避免指甲斷裂或是嵌進肉球裡
        建議半個月至一個月就要幫小貓咪剪一次指甲唷^･ｪ･^ ੭ 
        貓咪前腳有五隻、後腳有四隻指頭
        只需修剪尖端透明的部分，距離粉紅色血管至少 2mm 喔！`,
        img: "img/nail_guide.jpeg"
    },
    vomit: {
        title: "關於嘔吐",
        text: `除了上述的吐毛球之外
        貓咪也會因為吃得太急、對新飼料或罐頭過敏而嘔吐
        如果是頻繁嘔吐或吐出異物，請務必記錄次數並立刻帶小貓去給獸醫師檢查^๑_๑^ ੭ `,
        img: "img/vomit_guide.jpeg"
    },
    pee: {
        title: "尿尿觀察",
        text: `貓咪天生不愛喝水，若飲水不足容易有尿結石或是其他腎臟的疾病
        如果發現小貓頻繁進出貓砂盆卻沒有排尿，就要趕快帶小貓咪去檢查！
        另外貓咪也會因為領地意識、貓砂盆過於髒亂、情緒與壓力等等因素
        在家中意想不到的角落亂尿尿喔!
        (建議不要責罵牠們，耐心找出原因改善₍˄·͈༝·͈˄*₎◞) `,
        img: "img/pee_guide.jpeg"
    },
};



$(document).ready(function () {

    $(".knowledgebtn").on("click", function () {
        const type = $(this).data("type");
        const info = knowledgeData[type];

        $("#knwTitle").text(info.title);

        $("#knwText").html(info.text);

        $("#knwImg").attr("src", info.img);

        $("#knowledge").fadeIn();
    });


    function showFinalReport() {
        // 1. 從 localStorage 讀取數據
        // const data = JSON.parse(localStorage.getItem('finalReport')) || { totalClicks: 0, totalSpent: 0 };

        const savedStats = JSON.parse(localStorage.getItem('myCatGameStats'));

        if (savedStats) {
            // 判斷邏輯
            let score = "";
            if (savedStats.timesSick >= 3 && savedStats.lowEnergyCount > 5) {
                score = "貓貓常常生病இдஇ 目前不適合養貓！";
            } else if (savedStats.lowEnergyCount > 1 || savedStats.timesSick >= 1) {
                score = "有待加強，貓貓常常被疏忽 ꜀(^. .^꜀ )꜆੭...";
            } else {
                score = " 太好了 -ˋˏ ♡ ˎˊ- 貓咪被你寵壞啦！";
            }

            // 將數據與評語填入 #repText
            let reportHTML = `
            <h2>養貓成果報告</h2>
            <p>總互動次數：${savedStats.totalClicks}</p>
            <p>總花費：$${savedStats.totalSpent}</p>
            <p>生病次數：${savedStats.timesSick}</p>
            <p>疏於照顧：${savedStats.lowEnergyCount}</p>
            <h3 style="color:#f9ca90; margin-top:20px;">${score}</h3>
            `;

            $("#repText").html(reportHTML);
        } else {
            $("#repText").html("<p>目前還沒有飼養數據喔！先去照顧貓咪吧！</p>");
        }
        $("#report").fadeIn();
    }


    $("#result").on("click", function () {
        showFinalReport(); // 直接呼叫剛剛寫的函式
    });

    showFinalReport();







})


