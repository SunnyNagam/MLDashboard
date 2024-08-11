import csv
import json
from datetime import datetime
from openai import OpenAI
from os import getenv

# Initialize OpenAI client
openai_api = OpenAI(
    api_key="***",
    base_url="https://openrouter.ai/api/v1"
)

total_prompt_tokens = 0
total_completion_tokens = 0
prompt_price = 0.15          # $0.15 per 1M tokens
completion_price = 0.6        # $0.6 per 1M tokens

parsed_info = {}  # Change to dictionary for easier updates

def getSubject(update):
    subject = update.get('subject')
    if not subject:
        # Look for a subject with a matching relationship
        relationship = update.get('relationship').lower()
        if relationship:
            for key, value in parsed_info.items():
                if 'relationship' in value and relationship in value['relationship']:
                    subject = key
                    break
    return subject

def get_existing_subject_info(subject):
    # Check if the subject is directly in parsed_info
    if subject in parsed_info:
        return parsed_info[subject]
    
    # If not, check if it's a relationship
    subject_lower = subject.lower()
    matching_values = []
    for key, value in parsed_info.items():
        if 'relationship' in value and subject_lower in [rel.lower() for rel in value['relationship']]:
            matching_values.append(value)
    
    # Return the value if there's exactly one match, otherwise return an empty dictionary
    if len(matching_values) == 1:
        return matching_values[0]
    
    return {}

def update_parsed_info(updates, timestamp):
    for update in updates.get('updates', []):
        subject = getSubject(update)
        
        if subject:
            subject = subject.capitalize()
            update_info = {key: value for key, value in update.items() if key not in ['subject']}
            
            if subject not in parsed_info:
                parsed_info[subject] = {}
            
            # Check if keys already exist and append to existing array
            for key, value in update_info.items():
                if key in parsed_info[subject] and value not in parsed_info[subject][key]:
                    parsed_info[subject][key].append(value)
                else:
                    parsed_info[subject][key] = [value]
            
            parsed_info[subject]['last_updated'] = timestamp

def process_notes(csv_file):
    global total_prompt_tokens, total_completion_tokens
    notes = []
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            notes.append({
                'timetaken': row['timetaken'],
                'text': row['text']
            })
    
    # Sort notes by timetaken
    notes.sort(key=lambda x: x['timetaken'])

    for note in notes:
        subject_prompt = f"""
        Analyze the following text and determine the relevant subjects mentioned. You can identify them either by name or by relationship.
        Respond with the json list of subjects and nothing else.
        The text and facts are from the perspective of the User named "Sunny" who is structuring notes on people he knows.
        Example Text: I have a friend named Carlos who is good at cooking and used to be a surfer in 2014, he's now dating my sister.
        Output: {{'subjects': ["Carlos", "Sister"]}}
        Text: {note['text']}
        """
        response = openai_api.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[{"role": "system", "content": subject_prompt}],
            response_format={"type": "json_object"},
            top_p=0.10
        )
        total_prompt_tokens += response.usage.prompt_tokens
        total_completion_tokens += response.usage.completion_tokens
        subjects = json.loads(response.choices[0].message.content)['subjects']
        current_subject_data = {}
        for subject in subjects:
            info = get_existing_subject_info(subject)
            if info:
                current_subject_data[subject] = info

        prompt = f"""
        Analyze the following text and extract facts about people mentioned. 
        Return a JSON object with an 'updates' array containing objects with 'subject' or 'relationship' and other relevant key-value pairs.
        This updates array may be empty if there is no specific person mentioned, or if the text is not relevant.
        Either way only respond with the json object and nothing else.
        The text and facts are from the perspective of the User named "Sunny" who is structuring notes on people he knows.
        Example:
        Text: I have a friend named Carlos who is good at cooking and used to be a surfer in 2014, he's now dating my friend Amy.
        Output:
        {{
            "updates": [
                {{
                "subject": "Carlos",
                "skills": "cooking",
                "relationship": "friend",
                "historical_facts": "used to be surfer in 2014",
                "current_facts": "dating Amy"
                }}
            ]
        }}
        Text: My dad is a fire fighter and he likes cookies. Unlike my mom who is allergic.
        Output:
        {{
            "updates": [
                {{
                "relationship": "father",
                "profession": "fire fighter",
                "likes": "cookies"
                }},
                {{
                "relationship": "mother",
                "allergies": "cookies"
                }}
            ]
        }}
        Current Subject Data: {current_subject_data}
        Text: {note['text']}
        """
        print(prompt)

        response = openai_api.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
            top_p=0.10
        )
        total_prompt_tokens += response.usage.prompt_tokens
        total_completion_tokens += response.usage.completion_tokens
        updates = json.loads(response.choices[0].message.content)
        update_parsed_info(updates, note['timetaken'])
        
        print(f"Time: {note['timetaken']}")
        print(f"Text: {note['text']}")
        print(f"Updates: {json.dumps(updates, indent=2)}")
        print("---")



if __name__ == "__main__":
    process_notes('data.csv')   # go to dynamo table and hit download as csv
    print(parsed_info)
    print(f"Total prompt tokens: {total_prompt_tokens}")
    print(f"Total completion tokens: {total_completion_tokens}")
    print(f"Total cost: ${prompt_price * (total_prompt_tokens / 1000000) + completion_price * (total_completion_tokens / 1000000)}")
    with open('parsed_info.json', 'w') as json_file:
        sorted_parsed_info = {key: dict(sorted(parsed_info[key].items())) for key in sorted(parsed_info)}
        json.dump(sorted_parsed_info, json_file, indent=2)