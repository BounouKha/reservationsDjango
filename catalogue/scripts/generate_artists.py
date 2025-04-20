import json
import random

# Charger les artistes existants depuis le fichier JSON
with open('c:\\Users\\khali\\reservationsDjango\\catalogue\\fixtures\\ArtistFixtures.json', 'r') as file:
    data = json.load(file)

# Générer des prénoms et noms fictifs
firstnames = [
    "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack",
    "Karen", "Leo", "Mona", "Nina", "Oscar", "Paul", "Quincy", "Rachel", "Steve", "Tina",
    "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zane"
]
lastnames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
]

# Déterminer le prochain ID disponible
next_pk = max(item['pk'] for item in data) + 1

# Générer 100 artistes supplémentaires
for _ in range(100):
    artist = {
        "model": "catalogue.artist",
        "pk": next_pk,
        "fields": {
            "firstname": random.choice(firstnames),
            "lastname": random.choice(lastnames)
        }
    }
    data.append(artist)
    next_pk += 1

# Sauvegarder les artistes dans le fichier JSON
with open('c:\\Users\\khali\\reservationsDjango\\catalogue\\fixtures\\ArtistFixtures.json', 'w') as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("100 artistes supplémentaires ont été ajoutés avec succès !")