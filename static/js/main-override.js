var curr_round = 1;
var remaining_attempts = 10;
var curr_to_guess = "";
var curr_category = "";
var clues = [];
var to_guess_list = [];
var playerName;

function init() {
    hideAllPages();
    hideAIPButtons()
    $("#playername-scr, .info-toggle").show();
    // // $("#ai-prompt").show();
    // $("#ingame-scr").show();
    // $("#submit-ans-form").show();

}

$(document).ready(function() {
    init();

    // Submitted player name (new game):
    $("#player-form").submit(function(e) {
        e.preventDefault();
        playerName = "Player";
        if ($("#mc-playername").val()) playerName = $("#mc-playername").val();
        $("#playername-scr").fadeOut("slow").promise()
        .done(function() {
            $(".info-toggle").fadeOut("slow");
            getRound("new_game");
        });
    });   
    
    // Submitted an answer:
    $("#submit-ans-form").submit(function(e) {
        e.preventDefault();
        answer = $("#answer-input").val();
        $("#answer-input").val("");
        
        $("#answer-input").prop("disabled", true);
        $("#submit-ans-btn").prop("disabled", true);
        checkAnswer(answer);
    });

    // Tester:
    $("#tester-btn").click(function() {
        $("#ingame-scr").fadeTo( "slow" , 0.5, function() {
            // Animation complete.
        });
    });

    $("#aip-confirm-btn").click(function() {
        closeAIPrompt();
        $("#answer-input").prop("disabled", false);
        $("#submit-ans-btn").prop("disabled", false);
        showClues2_fadeIn();
    });

    $("#aip-play-btn").click(function() {
        closeAIPrompt();
        $("#answer-input").prop("disabled", false);
        $("#submit-ans-btn").prop("disabled", false);
        $("#ingame-scr").fadeOut("slow", function() {
            nextRound();
        });
    });

    $("#aip-res-btn").click(function() {
        closeAIPrompt();
        $("#answer-input").prop("disabled", false);
        $("#submit-ans-btn").prop("disabled", false);
        $("#ingame-scr").fadeOut("slow", function() {
            restartGame();
        });
    });

    $("#aip-exit-btn").click(function() {
        closeAIPrompt();
        $("#ingame-scr").fadeOut("slow", function() {
            window.location.replace("/");
        });
    });
});


function hideAllPages() {
    $("#playername-scr, .info-toggle").hide();
    $("#ctg-round-scr").hide();
    $("#ingame-scr").hide();
    $("#ai-prompt").hide();
    $("#submit-ans-form").hide();
}

function hideAIPButtons() {
    $("#aip-confirm-btn").hide();
    $("#aip-play-btn").hide();
    $("#aip-res-btn").hide();
    $("#aip-exit-btn").hide();
}

function getRound(round_type) {
    preload();
    $("#clues-div").empty();

    var ajaxData;
    
    if (round_type == "new_game") ajaxData = JSON.stringify({"type": "nw_game"});
    else if (round_type == "new_round") 
        ajaxData = JSON.stringify({"type": "nw_round", "terms": to_guess_list});

    $.ajax({
        data: ajaxData,
        type: "POST",
        url: "/get-round",
        contentType: "application/json",
        dataType: "json",

        success: function(data) {
            unpreload();
            loadRound(data);
        }
    })
}

function loadRound(data) {
    curr_category = data["category"];
    curr_to_guess = data["to_guess"];
    clues = data["clues"];
    to_guess_list.push(curr_to_guess);

    $("#curr-ctgy").html(curr_category);
    $("#curr-round").html("Round " + curr_round);
    $("#round-curr-ctgy").html(curr_category);
    $("#round-curr-round").html("Round " + curr_round);

    $("#ctg-round-scr").fadeIn("slow").promise()
    .done(function() {
        $("#ctg-round-scr").delay(3000).fadeOut("slow").promise()
        .done(function(){
            $("#ingame-scr").fadeIn("slow").delay(1000).promise()
            .done(function() {
                //showClues();
                showClues2();
            });
        });
    });
}

function showClues() {       
    for (let clue in clues) {
        var clue_element = $(`<h3>${clues[clue]}</h3>`);
        $("#clues-div").append(clue_element);
        clue_element.hide();
        clue_element.attr("id", `cl-elem-${clue}`);
    }

    $("#clues-div h3").each(function(index) {
        $(this).delay(1000*index).fadeIn("slow");
    }).promise().done(function() {
        $("#submit-ans-form").fadeIn("slow");
    });
}

function showClues2() {
    
    for (let clue in clues) {
        var clue_element = $(`<h3>${clues[clue]}</h3>`);
        $("#clues-div").append(clue_element);
        clue_element.hide();
        clue_element.attr("id", `cl-elem-${clue}`);
        
    }
    showClues2_fadeIn();
}

function showClues2_fadeIn() {
   
    var loop_counter;
    loop_counter = 11 - remaining_attempts;
    for (let i = 0; i<loop_counter;i++){
        $("#cl-elem-"+i).delay(1000).fadeIn("slow");
    }
    
    $("#submit-ans-form").fadeIn("slow");
    
}

function checkAnswer(ans_input) {
    remaining_attempts--;
    $.ajax({
        data: JSON.stringify({"ans_input": ans_input, "ans_corr": curr_to_guess, 
        "attempts": remaining_attempts, "player_name": playerName}),
        type: "POST",
        url: "/check-answer",
        contentType: "application/json",
        dataType: "json",

        success: function(data) {
            var bot_msg = data["bot_msg"];
            var result = data["result"];
            wrapperAIPrompt(result, bot_msg);
        }
    })
}

function closeAIPrompt() {
    hideAIPButtons();
    $("#ingame-scr").fadeTo("fast", 1);
    $("#ai-prompt").hide();
}

function wrapperAIPrompt(result, bot_msg) {
    $("#aip-msg").html(bot_msg);

    if (result == "corr_ans") {
        $("#aip-play-btn").show();
        $("#aip-exit-btn").show();
    }

    else if (result == "wr_ans") {
        $("#aip-confirm-btn").show();
    }

    else {
        $("#aip-res-btn").show();
        $("#aip-exit-btn").show();
    }

    $("#ingame-scr").fadeTo("fast", 0.1, function() {
        $("#ai-prompt").fadeIn(50);
    });
}










function restartGame() {
    curr_to_guess = "";
    curr_round = 1;
    curr_category = "";
    remaining_attempts = 10;
    clues = [];
    hideAllPages();
    getRound("new_game");
}

function nextRound() {
    curr_round++;
    curr_to_guess = "";
    curr_category = "";
    remaining_attempts = 10;
    clues = [];
    hideAllPages();
    getRound("new_round");
}

function preload() {
    $("html").addClass('ss-preload');
    $("#loader").fadeIn("slow", function() {
        // will fade out the whole DIV that covers the website.
        $("#preloader").delay(100).fadeIn("slow");
    }); 
    $("#loader").show();
}

function unpreload() {
    $("#loader").fadeOut("slow", function() {
        $("#preloader").delay(100).fadeOut("slow");
    }); 
    
    // for hero content animations 
    $("html").removeClass('ss-preload');
    $("html").addClass('ss-loaded');
}
