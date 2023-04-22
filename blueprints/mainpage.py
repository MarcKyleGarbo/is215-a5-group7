from flask import Blueprint, render_template, request, jsonify
import gpt

mainpage = Blueprint("mainpage", __name__)

@mainpage.route("/")
def index():
    return render_template("index.html")

@mainpage.route("/get-round", methods=["POST"])
def get_round():
    dataset = {}
    response = request.get_json()
    category = gpt.load_category()
    if response["type"] == "nw_game": to_guess = gpt.to_guess_wrapper(category, None, new_game=True)
    else: to_guess = gpt.to_guess_wrapper(category, response["terms"], new_game=False)
    clues = gpt.clues_wrapper(to_guess)
    dataset["category"] = category
    dataset["to_guess"] = to_guess
    dataset["clues"] = clues

    # Debug
    print(category)
    print(to_guess)
    print(clues)
    print(len(clues))

    return jsonify(dataset)

@mainpage.route("/check-answer", methods=["POST"])
def check_answer():
    dataset = {}
    response = request.get_json()
    corr_answer = response["ans_corr"]
    inp_answer = response["ans_input"]
    attempts = int(response["attempts"])
    player_name = response["player_name"]
    is_valid = gpt.validate_wrapper(inp_answer, corr_answer)

    if is_valid:
        dataset["result"] = "corr_ans"
        dataset["bot_msg"] = gpt.congrats_wrapper(player_name)
    elif not is_valid and attempts >= 1:
        dataset["result"] = "wr_ans"
        dataset["bot_msg"] = gpt.attempts_wrapper(player_name, attempts)
    elif not is_valid and attempts < 1:
        dataset["result"] = "no_att"
        dataset["bot_msg"] = gpt.gameover_wrapper(player_name, response["ans_corr"])

    return jsonify(dataset)

# @mainpage.route("/fetch-clue", methods=["POST"])
# def fetch_clue():
#     response = request.get_json()
#     print(response)
#     clues = gpt_test.clues_wrapper(response)
#     print(clues)
#     return jsonify(clues)