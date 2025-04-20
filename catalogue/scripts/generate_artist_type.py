import json

# Chemins des fichiers
artist_fixtures_path = r'c:\Users\khali\reservationsDjango\catalogue\fixtures\ArtistFixtures.json'
artist_type_path = r'c:\Users\khali\reservationsDjango\catalogue\fixtures\artist_type.json'

# Charger les artistes depuis ArtistFixtures.json
with open(artist_fixtures_path, 'r') as artist_file:
    artist_data = json.load(artist_file)

# Créer un mapping {("firstname", "lastname"): id}
artist_mapping = {
    (artist['fields']['firstname'], artist['fields']['lastname']): artist['pk']
    for artist in artist_data
}

# Charger les types existants depuis artist_type.json
with open(artist_type_path, 'r') as artist_type_file:
    artist_type_data = json.load(artist_type_file)

# Mettre à jour les références dans artist_type.json
for entry in artist_type_data:
    if 'fields' in entry and 'artist' in entry['fields']:
        firstname, lastname = entry['fields']['artist']
        artist_id = artist_mapping.get((firstname, lastname))
        if artist_id:
            entry['fields']['artist'] = artist_id
        else:
            print(f"Artiste non trouvé : {firstname} {lastname}")

# Sauvegarder les données mises à jour dans artist_type.json
with open(artist_type_path, 'w') as artist_type_file:
    json.dump(artist_type_data, artist_type_file, indent=2, ensure_ascii=False)

print("artist_type.json a été mis à jour avec les IDs des artistes.")