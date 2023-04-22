import openai, random, os
OPENAI_API_KEY = "[OPEN_API_KEY]" # Note: Use getenv
# openai.api_key = OPENAI_API_KEY
openai.api_key = os.getenv("OPENAI_API_KEY") # Recommended!

def load_category():
    with open("category_list.txt", "r") as file:
        category_list = [line.strip() for line in file]
    category = random.choice(category_list)
    category = ' '.join(word[0].upper() + word[1:] for word in category.split())
    return category

def to_guess_wrapper(category, exist_list, new_game=True):
    string_wrap = f"""You are a guessing game host and called AI.\nHuman: Suggest a {category}, and be specific, one to three words only if possible."""

    if not new_game:
        exist_list = ", ".join(exist_list)
        string_wrap = f"""You are a guessing game host and called AI.\nHuman: Suggest a {category}, but do not include these ({exist_list}) anymore, and be specific, one to three words only if possible."""

    to_guess = get_ai_response(string_wrap)
    to_guess = to_guess.replace("AI: ", "")
    to_guess = to_guess.strip()
    return to_guess

def clues_wrapper(to_guess) -> list[str]:
    string_wrap = f"""Provide 10 short sentences that will serve as clues for someone to guess {to_guess}. Separate using newline."""
    clue = get_ai_response(string_wrap)
    clue = clue.replace("AI: ", "")
    clue = clue.strip()
    clue_list = [x for x in clue.split("\n") if x]
    clue_list = clue_list[:10]
    return clue_list

def validate_wrapper(guess, to_guess):
    string_wrap = f"""You are a guessing game, the term to guess is {to_guess}, and the player's answer is: {guess}. Answer does not need to be exact. Return true or false."""
    valid = get_ai_response(string_wrap)
    valid = valid.replace("AI: ", "")
    valid = valid.strip()
    valid = valid.lower()
    if valid == "true": return True
    elif valid == "false": return False
    else: return False

def attempts_wrapper(player_name, attempts):
    string_wrap = f"""Generate a sentence for an incorrect answer for a player named "{player_name}", then a sentence for attempts remaining, attempts = {attempts}. Omit quotation marks."""
    sentence = get_ai_response(string_wrap)
    sentence = sentence.replace("AI: ", "")
    sentence = sentence.strip()
    return sentence

def congrats_wrapper(player_name):
    string_wrap = f"""Provide a sentence for getting the correct answer. Then a question that asks if a player named "{player_name}" if he/she wants to play again."""
    sentence = get_ai_response(string_wrap)
    sentence = sentence.replace("AI: ", "")
    sentence = sentence.strip()
    return sentence

def gameover_wrapper(player_name, answer):
    string_wrap = f"""Generate a game over, and no more attempts left sentence and the correct answer "{answer}" for a player named "{player_name}"."""
    sentence = get_ai_response(string_wrap)
    sentence = sentence.replace("AI: ", "")
    sentence = sentence.strip()
    return sentence

def get_ai_response(prompt):
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.9,
        max_tokens=2000,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.6,
        stop=[" Human:", " AI:"]
    )
    text = response.get("choices")[0].text
    return text

# Initial tester
# def start_round(round):
#     attempts = INIT_ATTEMPTS
#     category_str = load_category()
#     print("Round " + str(round) + ": " + category_str)
#
#     print("ChatGPT is picking a word for you to guess...", end=" ")
#     to_guess = to_guess_wrapper(category_str)
#     print("OK:", to_guess)
#
#     print("Here are the clues:")
#     clues = clues_wrapper(to_guess)
#     print(clues)
#
#     while attempts > 0:
#         answer = input("You: ")
#         if validate_wrapper(answer, to_guess):
#             print("Prompt: That is correct! Do you want to play again?")
#             if input("You: ").lower() == "yes":
#                 round += 1
#                 start_round(round)
#             else: break
#             # if confirm_replay(): start_game()
#             # else: break
#         else:
#             attempts -= 1
#             print("Prompt:", attempts_wrapper(attempts))
#
#     print("Oops! Game over.")