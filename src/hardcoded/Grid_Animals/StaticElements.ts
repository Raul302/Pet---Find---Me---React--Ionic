const animalsJson =

[
  {
    "name": "Luna",
    "description": "Perrita mestiza, muy tranquila y sociable.",
    "reward": true,
    "particular_signs": ["Pelaje blanco con manchas negras", "Collar azul", "Oreja derecha caída"],
    "last_seen_place": "Parque Fundadores, Torreón, Coahuila",
    "photo": "https://placedog.net/400/300?id=1",
    "keywords": ["perrita", "mestiza", "tranquila", "sociable", "pelaje blanco", "manchas negras", "collar azul", "oreja derecha caída"]
  },
  {
    "name": "Max",
    "description": "Perro labrador juguetón, de 3 años.",
    "reward": false,
    "particular_signs": ["Pelaje dorado", "Cojera leve en pata trasera", "Sin collar"],
    "last_seen_place": "Colonia Roma, CDMX",
    "photo": "https://placedog.net/400/300?id=2",
    "keywords": ["perro", "labrador", "juguetón", "3 años", "pelaje dorado", "cojera leve", "sin collar"]
  },
  {
    "name": "Maya",
    "description": "Gatita gris muy cariñosa, esterilizada.",
    "reward": true,
    "particular_signs": ["Ojos verdes", "Mancha blanca en la frente", "Collar rosa con cascabel"],
    "last_seen_place": "Barrio San Isidro, Toluca",
    "photo": "https://placekitten.com/400/300",
    "keywords": ["gata", "gris", "cariñosa", "esterilizada", "ojos verdes", "mancha blanca", "collar rosa"]
  },
  {
    "name": "Toby",
    "description": "Perro pequeño tipo salchicha, muy activo.",
    "reward": false,
    "particular_signs": ["Pelaje marrón oscuro", "Pata delantera con vendaje", "Sin placa"],
    "last_seen_place": "Plaza de Armas, Saltillo",
    "photo": "https://placedog.net/400/300?id=3",
    "keywords": ["perro", "pequeño", "salchicha", "activo", "pelaje marrón", "vendaje", "sin placa"]
  },
  {
    "name": "Nina",
    "description": "Coneja blanca, muy dócil y tranquila.",
    "reward": true,
    "particular_signs": ["Orejas largas", "Mancha gris en la espalda", "Collar amarillo"],
    "last_seen_place": "Jardines del Sur, Mérida",
    "photo": "https://loremflickr.com/400/300/rabbit",
    "keywords": ["coneja", "blanca", "dócil", "tranquila", "orejas largas", "mancha gris", "collar amarillo"]
  },
  {
    "name": "Simón",
    "description": "Gato negro de ojos amarillos, tímido.",
    "reward": false,
    "particular_signs": ["Cola larga", "Oreja izquierda rasgada", "Sin collar"],
    "last_seen_place": "Centro Histórico, Puebla",
    "photo": "https://placekitten.com/401/300",
    "keywords": ["gato", "negro", "tímido", "ojos amarillos", "cola larga", "oreja rasgada", "sin collar"]
  },
  {
    "name": "Coco",
    "description": "Perico verde que repite palabras.",
    "reward": true,
    "particular_signs": ["Plumas amarillas en la cabeza", "Pico curvo", "Dice 'Hola Coco'"],
    "last_seen_place": "Colonia Del Valle, Monterrey",
    "photo": "https://loremflickr.com/400/300/parrot",
    "keywords": ["perico", "verde", "repite palabras", "plumas amarillas", "pico curvo"]
  },
  {
    "name": "Bruno",
    "description": "Perro pastor alemán, entrenado.",
    "reward": true,
    "particular_signs": ["Pelaje negro y café", "Collar metálico", "Obedece comandos"],
    "last_seen_place": "Bosque de Chapultepec, CDMX",
    "photo": "https://placedog.net/400/300?id=4",
    "keywords": ["pastor alemán", "entrenado", "obediente", "pelaje negro y café", "collar metálico"]
  },
  {
    "name": "Lola",
    "description": "Gata blanca con ojos azules, muy curiosa.",
    "reward": false,
    "particular_signs": ["Cola corta", "Mancha gris en la nariz", "Collar con GPS"],
    "last_seen_place": "Zona Centro, Guadalajara",
    "photo": "https://placekitten.com/402/300",
    "keywords": ["gata", "blanca", "ojos azules", "curiosa", "cola corta", "collar con GPS"]
  },
  {
    "name": "Rocky",
    "description": "Perro pitbull, muy cariñoso.",
    "reward": true,
    "particular_signs": ["Pelaje gris", "Collar rojo", "Cicatriz en la pata"],
    "last_seen_place": "Colonia Las Fuentes, León",
    "photo": "https://placedog.net/400/300?id=5",
    "keywords": ["pitbull", "cariñoso", "pelaje gris", "collar rojo", "cicatriz en la pata"]
  },
  {
    "name": "Kiwi",
    "description": "Gato naranja, muy travieso.",
    "reward": false,
    "particular_signs": ["Rayas en el lomo", "Sin collar", "Maúlla fuerte"],
    "last_seen_place": "Fraccionamiento El Refugio, Querétaro",
    "photo": "https://placekitten.com/403/300",
    "keywords": ["gato", "naranja", "travieso", "rayas", "sin collar", "maúlla fuerte"]
  },
  {
    "name": "Daisy",
    "description": "Perrita chihuahua, muy nerviosa.",
    "reward": true,
    "particular_signs": ["Pelaje beige", "Collar rosa", "Tiembla al caminar"],
    "last_seen_place": "Zona Dorada, Mazatlán",
    "photo": "https://placedog.net/400/300?id=6",
    "keywords": ["perrita", "chihuahua", "nerviosa", "pelaje beige", "collar rosa", "tiembla"]
  },
  {
    "name": "Leo",
    "description": "Gato gris, muy tranquilo.",
    "reward": false,
    "particular_signs": ["Ojos verdes", "Collar azul", "Sin placa"],
    "last_seen_place": "Colonia Americana, Guadalajara",
    "photo": "https://placekitten.com/404/300",
    "keywords": ["gato", "gris", "tranquilo", "ojos verdes", "collar azul"]
  },
  {
    "name": "Mimi",
    "description": "Coneja gris, muy juguetona.",
    "reward": true,
    "particular_signs": ["Orejas cortas", "Mancha blanca en la nariz", "Collar con cascabel"],
    "last_seen_place": "Parque Hundido, CDMX",
    "photo": "https://loremflickr.com/400/300/rabbit",
    "keywords": ["coneja", "gris", "juguetona", "orejas cortas", "mancha blanca", "collar con cascabel"]
  },
  {
    "name": "Thor",
    "description": "Perro husky, muy energético.",
    "reward": true,
    "particular_signs": ["Ojos azules", "Pelaje blanco y gris", "Collar negro"],
    "last_seen_place": "Colonia San Benito, Hermosillo",
    "photo": "https://placedog.net/400/300?id=7",
    "keywords": ["husky", "energético", "ojos azules", "pelaje blanco y gris", "collar negro"]
  },
  {
    "name": "Bella",
    "description": "Gata tricolor, muy cariñosa.",
    "reward": false,
    "particular_signs": ["Pelaje blanco, negro y naranja", "Collar morado", "Sin placa"],
    "last_seen_place": "Zona Centro, Morelia",
    "photo": "https://placekitten.com/405/300",
    "keywords": ["gata", "tricolor", "cariñosa", "pelaje tricolor", "collar morado"]
  },
  {
    "name": "Rex",
    "description": "Perro rottweiler, muy obediente.",
    "reward": true,
    "particular_signs": ["Pelaje negro con café", "Collar grueso", "Corte en la oreja"],
    "last_seen_place": "Colonia Mirador, Chihuahua",
    "photo": "https://placedog.net/400/300?id=8",
    "keywords": ["rottweiler", "obediente", "pelaje negro", "collar grueso", "corte en la oreja"]
  },
  {
    "name": "Nube",
    "description": "Gata blanca, muy tímida.",
    "reward": false,
    "particular_signs": ["Pelaje largo", "Ojos celestes", "Sin collar"],
    "last_seen_place": "Colonia Reforma, Oaxaca",
    "photo": "https://placekitten.com/406/300",
    "keywords": ["gata", "blanca", "tímida", "pelaje largo", "ojos celestes"]
  },
  {
    "name": "Chispa",
    "description": "Perro mestizo, muy activo.",
    "reward": true,
    "particular_signs": ["Pelaje café claro", "Collar verde", "Cicatriz en el lomo"],
    "last_seen_place": "Colonia Centro, San Luis Potosí",
    "photo": "https://placedog.net/400/300?id=9",
    "keywords": ["perro", "mestizo", "activo", "pelaje café", "collar verde", "cicatriz en el lomo"]
  }
]



export { animalsJson }
