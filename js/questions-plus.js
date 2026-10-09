/*
 * Pack de questions supplémentaires (activable dans les options ⚙️).
 * Même format que questions.js : [question, [BONNE réponse, mauvaise 1, mauvaise 2, mauvaise 3], difficulté]
 */
(function () {
  const Q = {
    culture: [
      ['Combien de couleurs compte un arc-en-ciel ?', ['7', '5', '6', '8'], 1],
      ['Combien de mois de l\'année comptent 31 jours ?', ['7', '6', '5', '8'], 1],
      ['Quel instrument sert à mesurer la température ?', ['Le thermomètre', 'Le baromètre', 'L\'anémomètre', 'L\'hygromètre'], 1],
      ['Dans quel conte une jeune fille perd-elle une pantoufle de verre ?', ['Cendrillon', 'Blanche-Neige', 'La Belle au bois dormant', 'Raiponce'], 1],
      ['Dans quel musée parisien est exposée « La Joconde » ?', ['Le Louvre', 'Le musée d\'Orsay', 'Le Centre Pompidou', 'Le Grand Palais'], 1],
      ['Qui a écrit « Le Petit Prince » ?', ['Antoine de Saint-Exupéry', 'Jules Verne', 'Albert Camus', 'Marcel Pagnol'], 2],
      ['Dans la mythologie grecque, qui est le roi des dieux ?', ['Zeus', 'Apollon', 'Hermès', 'Poséidon'], 2],
      ['Quel écrivain a créé Sherlock Holmes ?', ['Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Maurice Leblanc'], 2],
      ['Quelle est la pierre précieuse la plus dure ?', ['Le diamant', 'Le rubis', 'L\'émeraude', 'Le saphir'], 2],
      ['Qui a écrit « Le Vieil Homme et la Mer » ?', ['Ernest Hemingway', 'John Steinbeck', 'Mark Twain', 'Herman Melville'], 2],
      ['Quel roman de Chinua Achebe (1958) est un classique de la littérature africaine ?', ['Le monde s\'effondre', 'L\'Enfant noir', 'Une si longue lettre', 'Les Bouts de bois de Dieu'], 3],
      ['Quel architecte a conçu la pyramide du Louvre ?', ['Ieoh Ming Pei', 'Jean Nouvel', 'Frank Gehry', 'Le Corbusier'], 3],
      ['Combien de cases compte une grille de sudoku classique ?', ['81', '64', '100', '72'], 3],
      ['Quel écrivain camerounais a écrit « Une vie de boy » ?', ['Ferdinand Oyono', 'Mongo Beti', 'Calixthe Beyala', 'Léonora Miano'], 3],
      ['Quelle est la seule des Sept Merveilles du monde antique encore debout ?', ['La pyramide de Khéops', 'Le phare d\'Alexandrie', 'Les jardins suspendus de Babylone', 'Le colosse de Rhodes'], 3]
    ],

    cinema: [
      ['Comment s\'appelle le cowboy de « Toy Story » ?', ['Woody', 'Buzz', 'Jessie', 'Rex'], 1],
      ['Dans « La Reine des neiges », quelle reine possède des pouvoirs de glace ?', ['Elsa', 'Anna', 'Ariel', 'Raiponce'], 1],
      ['Quel extraterrestre de Spielberg (1982) veut « téléphoner maison » ?', ['E.T.', 'Alf', 'Stitch', 'Yoda'], 1],
      ['Quel super-héros se cache derrière Peter Parker ?', ['Spider-Man', 'Batman', 'Iron Man', 'Daredevil'], 1],
      ['Dans « Shrek », quel animal accompagne Shrek ?', ['Un âne', 'Un chat', 'Un dragon', 'Un cheval'], 1],
      ['Quel acteur incarne Iron Man dans l\'univers Marvel ?', ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'], 2],
      ['Dans « Le Parrain », quelle famille est au centre de l\'histoire ?', ['Les Corleone', 'Les Soprano', 'Les Tattaglia', 'Les Barzini'], 2],
      ['Quelle actrice joue Hermione Granger dans « Harry Potter » ?', ['Emma Watson', 'Emma Stone', 'Keira Knightley', 'Natalie Portman'], 2],
      ['Quel film de Luc Besson (1997) met en scène Korben Dallas ?', ['Le Cinquième Élément', 'Léon', 'Nikita', 'Lucy'], 2],
      ['Dans quelle ville est décernée la Palme d\'or ?', ['Cannes', 'Venise', 'Berlin', 'Deauville'], 2],
      ['Qui a réalisé « Les Dents de la mer » (1975) ?', ['Steven Spielberg', 'George Lucas', 'Francis Ford Coppola', 'John Carpenter'], 2],
      ['Quel film a reçu le tout premier Oscar du meilleur film (1929) ?', ['Les Ailes', 'Metropolis', 'Le Chanteur de jazz', 'L\'Aurore'], 3],
      ['Quel réalisateur sénégalais est surnommé le « père du cinéma africain » ?', ['Ousmane Sembène', 'Djibril Diop Mambéty', 'Souleymane Cissé', 'Idrissa Ouédraogo'], 3],
      ['Quel acteur a reçu l\'Oscar du meilleur acteur pour « Joker » ?', ['Joaquin Phoenix', 'Adam Driver', 'Leonardo DiCaprio', 'Antonio Banderas'], 3],
      ['Quel film japonais a remporté l\'Oscar du meilleur film d\'animation en 2003 ?', ['Le Voyage de Chihiro', 'Princesse Mononoké', 'Akira', 'Le Château ambulant'], 3],
      ['Quelle actrice française a remporté l\'Oscar pour « La Môme » ?', ['Marion Cotillard', 'Juliette Binoche', 'Audrey Tautou', 'Léa Seydoux'], 3]
    ],

    musique: [
      ['Combien de musiciens compte un quatuor ?', ['4', '3', '5', '6'], 1],
      ['Quelle chanteuse barbadienne a chanté « Umbrella » ?', ['Rihanna', 'Beyoncé', 'Nicki Minaj', 'Ciara'], 1],
      ['Quel chanteur est surnommé « The King » du rock\'n\'roll ?', ['Elvis Presley', 'Chuck Berry', 'Little Richard', 'Johnny Cash'], 1],
      ['De quel instrument joue-t-on avec un archet ?', ['Le violon', 'La guitare', 'La trompette', 'La harpe'], 1],
      ['Quel artiste a chanté « Shape of You » ?', ['Ed Sheeran', 'Justin Bieber', 'Shawn Mendes', 'Bruno Mars'], 1],
      ['Quel groupe marseillais a sorti « L\'École du micro d\'argent » ?', ['IAM', 'NTM', 'Fonky Family', '113'], 2],
      ['Quelle chanteuse sud-africaine était surnommée « Mama Africa » ?', ['Miriam Makeba', 'Angélique Kidjo', 'Brenda Fassie', 'Yvonne Chaka Chaka'], 2],
      ['Quel groupe a chanté « Smells Like Teen Spirit » ?', ['Nirvana', 'Pearl Jam', 'Green Day', 'Foo Fighters'], 2],
      ['Quel artiste a sorti l\'album « Purple Rain » ?', ['Prince', 'Michael Jackson', 'David Bowie', 'Stevie Wonder'], 2],
      ['Quelle chanteuse a interprété « Rolling in the Deep » ?', ['Adele', 'Amy Winehouse', 'Duffy', 'Sia'], 2],
      ['Quel compositeur a écrit l\'opéra « La Flûte enchantée » ?', ['Wolfgang Amadeus Mozart', 'Joseph Haydn', 'Franz Schubert', 'Johann Strauss'], 3],
      ['Combien de lignes compte une portée musicale ?', ['5', '4', '6', '7'], 3],
      ['Quelle chanteuse béninoise a remporté plusieurs Grammy Awards ?', ['Angélique Kidjo', 'Oumou Sangaré', 'Fatoumata Diawara', 'Aya Nakamura'], 3],
      ['En quelle année Bob Marley est-il mort ?', ['1981', '1977', '1985', '1979'], 3],
      ['Quel rappeur a reçu le prix Pulitzer de musique en 2018 ?', ['Kendrick Lamar', 'Drake', 'Kanye West', 'J. Cole'], 3]
    ],

    anime: [
      ['Quel couvre-chef est le symbole de Luffy dans « One Piece » ?', ['Un chapeau de paille', 'Un bandana', 'Une casquette', 'Un chapeau de cowboy'], 1],
      ['Dans « Pokémon », comment s\'appelle l\'équipe de Jessie et James ?', ['La Team Rocket', 'La Team Magma', 'La Team Aqua', 'La Team Galaxie'], 1],
      ['Quel personnage de « Dragon Ball » est le prince des Saiyans ?', ['Vegeta', 'Goku', 'Broly', 'Nappa'], 1],
      ['Comment s\'appelle le village caché de Naruto ?', ['Konoha', 'Suna', 'Kiri', 'Iwa'], 1],
      ['Dans « Death Note », que se passe-t-il quand on écrit un nom dans le cahier ?', ['La personne meurt', 'La personne s\'endort', 'La personne disparaît', 'La personne perd la mémoire'], 1],
      ['Comment s\'appelle le héros de « L\'Attaque des Titans » ?', ['Eren Jäger', 'Livaï', 'Armin Arlert', 'Reiner Braun'], 2],
      ['Dans « One Piece », quel est le rôle de Sanji dans l\'équipage ?', ['Cuisinier', 'Médecin', 'Navigateur', 'Charpentier'], 2],
      ['Dans « Demon Slayer », comment s\'appelle le premier des démons ?', ['Muzan Kibutsuji', 'Akaza', 'Dôma', 'Kokushibô'], 2],
      ['Dans « Hunter x Hunter », à quelle famille d\'assassins appartient Kirua ?', ['Les Zoldyck', 'Les Kurta', 'Les Freecss', 'Les Lucifer'], 2],
      ['Comment s\'appelle le fils aîné de Goku ?', ['Son Gohan', 'Son Goten', 'Trunks', 'Pan'], 2],
      ['Comment s\'appelle le navire actuel de l\'équipage de Luffy ?', ['Le Thousand Sunny', 'Le Vogue Merry', 'Le Moby Dick', 'Le Red Force'], 3],
      ['Qui est le père de Naruto ?', ['Minato Namikaze', 'Jiraiya', 'Hiruzen Sarutobi', 'Kakashi Hatake'], 3],
      ['Dans quel magazine « One Piece » est-il prépublié au Japon ?', ['Weekly Shônen Jump', 'Weekly Shônen Magazine', 'Weekly Shônen Sunday', 'Young Jump'], 3],
      ['Quel film de Katsuhiro Ôtomo (1988) se déroule à Néo-Tokyo ?', ['Akira', 'Ghost in the Shell', 'Cowboy Bebop', 'Paprika'], 3],
      ['Comment s\'appelle le héros chasseur de primes de « Cowboy Bebop » ?', ['Spike Spiegel', 'Jet Black', 'Vicious', 'Faye Valentine'], 3]
    ],

    sport: [
      ['Dans quel sport frappe-t-on une balle avec une batte sur un « diamant » ?', ['Le baseball', 'Le cricket', 'Le golf', 'Le hockey'], 1],
      ['Quelle couleur de maillot porte le leader du Tour de France ?', ['Jaune', 'Vert', 'À pois', 'Blanc'], 1],
      ['Quel sport pratique LeBron James ?', ['Le basket-ball', 'Le football américain', 'Le baseball', 'Le tennis'], 1],
      ['Combien d\'anneaux figurent sur le drapeau olympique ?', ['5', '4', '6', '7'], 1],
      ['Quel footballeur est surnommé « CR7 » ?', ['Cristiano Ronaldo', 'Cristiano Zanetti', 'Carlos Roa', 'Clarence Seedorf'], 1],
      ['Combien de sets faut-il gagner pour remporter un match masculin de Grand Chelem ?', ['3', '2', '4', '5'], 2],
      ['Dans quel sport marque-t-on un « ippon » ?', ['Le judo', 'La boxe', 'L\'escrime', 'La lutte gréco-romaine'], 2],
      ['Quel pays a remporté la Coupe du monde de football 2014 ?', ['L\'Allemagne', 'L\'Argentine', 'Le Brésil', 'Les Pays-Bas'], 2],
      ['Combien de trous compte un parcours de golf standard ?', ['18', '9', '12', '21'], 2],
      ['Quel pays a remporté le plus de Coupes du monde de football ?', ['Le Brésil', 'L\'Allemagne', 'L\'Italie', 'L\'Argentine'], 2],
      ['Quel est le premier pays africain à avoir atteint les demi-finales d\'une Coupe du monde ?', ['Le Maroc', 'Le Sénégal', 'Le Cameroun', 'Le Ghana'], 3],
      ['Dans quelle ville se trouve le stade Maracanã ?', ['Rio de Janeiro', 'São Paulo', 'Buenos Aires', 'Brasília'], 3],
      ['En quelle année le Cameroun est-il devenu le premier pays africain quart de finaliste d\'un Mondial ?', ['1990', '1982', '1994', '2002'], 3],
      ['Quel joueur détient le record de titres du Grand Chelem en simple masculin ?', ['Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Pete Sampras'], 3],
      ['À quelle hauteur se trouve un panier de basket ?', ['3,05 m', '2,85 m', '3,25 m', '2,95 m'], 3]
    ],

    histoire: [
      ['Quelle muraille a été construite pour protéger l\'empire chinois ?', ['La Grande Muraille', 'Le mur d\'Hadrien', 'Le mur des Lamentations', 'Le mur de Berlin'], 1],
      ['Quel monument parisien a été construit pour l\'Exposition universelle de 1889 ?', ['La tour Eiffel', 'L\'Arc de Triomphe', 'Le Sacré-Cœur', 'La tour Montparnasse'], 1],
      ['Quel peuple a construit le Machu Picchu ?', ['Les Incas', 'Les Aztèques', 'Les Mayas', 'Les Olmèques'], 1],
      ['En quelle année s\'est terminée la Seconde Guerre mondiale ?', ['1945', '1944', '1946', '1939'], 1],
      ['Quel navigateur a atteint l\'Amérique en 1492 ?', ['Christophe Colomb', 'Vasco de Gama', 'Magellan', 'Jacques Cartier'], 1],
      ['Quel président américain a proclamé l\'abolition de l\'esclavage ?', ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'Theodore Roosevelt'], 2],
      ['Quel pharaon a un tombeau découvert presque intact en 1922 ?', ['Toutânkhamon', 'Ramsès II', 'Khéops', 'Akhenaton'], 2],
      ['Qui fut le premier homme à voyager dans l\'espace ?', ['Youri Gagarine', 'Neil Armstrong', 'John Glenn', 'Alexeï Leonov'], 2],
      ['Quelle jeune femme a mené les armées françaises pendant la guerre de Cent Ans ?', ['Jeanne d\'Arc', 'Catherine de Médicis', 'Aliénor d\'Aquitaine', 'Marie-Antoinette'], 2],
      ['Quel dirigeant a conduit le Ghana à l\'indépendance en 1957 ?', ['Kwame Nkrumah', 'Jomo Kenyatta', 'Patrice Lumumba', 'Julius Nyerere'], 2],
      ['Qui fut le premier président du Cameroun ?', ['Ahmadou Ahidjo', 'Paul Biya', 'Ruben Um Nyobè', 'John Ngu Foncha'], 2],
      ['Quel traité a mis fin à la Première Guerre mondiale avec l\'Allemagne en 1919 ?', ['Le traité de Versailles', 'Le traité de Westphalie', 'Le traité d\'Utrecht', 'Le traité de Paris'], 3],
      ['Qui fut le premier Premier ministre du Congo indépendant en 1960 ?', ['Patrice Lumumba', 'Mobutu Sese Seko', 'Joseph Kasa-Vubu', 'Moïse Tshombe'], 3],
      ['En quelle année s\'est ouverte la conférence de Berlin sur le partage de l\'Afrique ?', ['1884', '1870', '1898', '1914'], 3],
      ['Quelle civilisation a inventé l\'écriture cunéiforme ?', ['Les Sumériens', 'Les Égyptiens', 'Les Phéniciens', 'Les Grecs'], 3],
      ['Quel roi a unifié la nation zouloue au début du XIXe siècle ?', ['Shaka', 'Cetshwayo', 'Dingane', 'Moshoeshoe'], 3]
    ],

    geo: [
      ['Quelle est la capitale de l\'Espagne ?', ['Madrid', 'Barcelone', 'Séville', 'Valence'], 1],
      ['Quel pays a pour capitale Tokyo ?', ['Le Japon', 'La Chine', 'La Corée du Sud', 'La Thaïlande'], 1],
      ['Sur quel continent se trouve l\'Égypte ?', ['L\'Afrique', 'L\'Asie', 'L\'Europe', 'L\'Océanie'], 1],
      ['Quel est le plus grand continent du monde ?', ['L\'Asie', 'L\'Afrique', 'L\'Amérique', 'L\'Europe'], 1],
      ['Quelle est la capitale du Sénégal ?', ['Dakar', 'Saint-Louis', 'Thiès', 'Bamako'], 1],
      ['Quelle est la capitale du Nigeria ?', ['Abuja', 'Lagos', 'Kano', 'Ibadan'], 2],
      ['Combien de pays africains sont membres de l\'ONU ?', ['54', '48', '52', '56'], 2],
      ['Quelle est la capitale politique de la Côte d\'Ivoire ?', ['Yamoussoukro', 'Abidjan', 'Bouaké', 'San-Pédro'], 2],
      ['Quel est le plus grand pays d\'Afrique par sa superficie ?', ['L\'Algérie', 'La RD Congo', 'Le Soudan', 'La Libye'], 2],
      ['Quelle chaîne de montagnes sépare la France de l\'Espagne ?', ['Les Pyrénées', 'Les Alpes', 'Les Vosges', 'Le Jura'], 2],
      ['Dans quel pays se trouve le Machu Picchu ?', ['Le Pérou', 'La Bolivie', 'Le Chili', 'L\'Équateur'], 2],
      ['Quelle est la capitale de la Nouvelle-Zélande ?', ['Wellington', 'Auckland', 'Christchurch', 'Queenstown'], 3],
      ['Quel est le pays le plus peuplé d\'Afrique ?', ['Le Nigeria', 'L\'Éthiopie', 'L\'Égypte', 'La RD Congo'], 3],
      ['Quelle est la capitale officielle de la Tanzanie ?', ['Dodoma', 'Dar es Salaam', 'Zanzibar', 'Arusha'], 3],
      ['Quel est le plus petit pays d\'Afrique continentale ?', ['La Gambie', 'Djibouti', 'L\'Eswatini', 'Le Rwanda'], 3],
      ['Quel pays compte le plus grand nombre de lacs au monde ?', ['Le Canada', 'La Finlande', 'La Russie', 'La Suède'], 3]
    ],

    sciences: [
      ['Quel astre nous éclaire pendant la journée ?', ['Le Soleil', 'La Lune', 'Mars', 'L\'étoile Polaire'], 1],
      ['Combien de pattes possède une araignée ?', ['8', '6', '10', '4'], 1],
      ['Sous quel état se trouve l\'eau quand elle devient de la glace ?', ['Solide', 'Liquide', 'Gazeux', 'Plasma'], 1],
      ['Quels organes nous permettent de respirer ?', ['Les poumons', 'Le foie', 'L\'estomac', 'Les reins'], 1],
      ['Quel est le satellite naturel de la Terre ?', ['La Lune', 'Le Soleil', 'Mars', 'Titan'], 1],
      ['À quelle température l\'eau bout-elle au niveau de la mer ?', ['100 °C', '90 °C', '80 °C', '120 °C'], 2],
      ['Quel est le plus grand organe du corps humain ?', ['La peau', 'Le foie', 'Les poumons', 'L\'intestin'], 2],
      ['Quel savant a formulé la loi de la gravitation universelle ?', ['Isaac Newton', 'Galilée', 'Johannes Kepler', 'Albert Einstein'], 2],
      ['Quel groupe sanguin est considéré comme donneur universel ?', ['O négatif', 'AB positif', 'A négatif', 'B positif'], 2],
      ['Quel est le plus grand animal du monde ?', ['La baleine bleue', 'L\'éléphant d\'Afrique', 'Le cachalot', 'Le requin-baleine'], 2],
      ['Quel est le symbole chimique du fer ?', ['Fe', 'Fr', 'Ir', 'F'], 3],
      ['Quelle est l\'unité de mesure de la fréquence ?', ['Le hertz', 'Le newton', 'Le pascal', 'Le joule'], 3],
      ['Combien de temps met la lumière du Soleil pour atteindre la Terre ?', ['Environ 8 minutes', 'Environ 8 secondes', 'Environ 1 heure', 'Environ 1 jour'], 3],
      ['Quel scientifique a découvert les rayons X en 1895 ?', ['Wilhelm Röntgen', 'Marie Curie', 'Henri Becquerel', 'Ernest Rutherford'], 3],
      ['Quelle molécule porte l\'information génétique ?', ['L\'ADN', 'L\'ATP', 'L\'hémoglobine', 'Le glucose'], 3]
    ],

    jeux: [
      ['Comment s\'appelle la série de football d\'EA depuis qu\'elle n\'est plus « FIFA » ?', ['EA Sports FC', 'PES', 'eFootball', 'Football Manager'], 1],
      ['Quelle princesse Mario doit-il souvent sauver ?', ['Peach', 'Zelda', 'Daisy', 'Harmonie'], 1],
      ['Comment s\'appelle le gorille de Nintendo ?', ['Donkey Kong', 'King Kong', 'Diddy Kong', 'Funky Kong'], 1],
      ['Quelle entreprise fabrique la Xbox ?', ['Microsoft', 'Sony', 'Nintendo', 'Apple'], 1],
      ['Dans « Pokémon », quel objet sert à capturer les Pokémon ?', ['La Poké Ball', 'La Master Box', 'Le Poké Cube', 'La Capsule'], 1],
      ['Dans « Minecraft », quelle créature verte explose près du joueur ?', ['Le Creeper', 'Le Zombie', 'L\'Enderman', 'Le Squelette'], 2],
      ['Quel personnage Nintendo est une boule rose qui avale ses ennemis ?', ['Kirby', 'Rondoudou', 'Yoshi', 'Toad'], 2],
      ['Dans « Fortnite », comment s\'appelle la zone qui rétrécit ?', ['La tempête', 'Le brouillard', 'Le gaz', 'La vague'], 2],
      ['Dans quelle série de jeux incarne-t-on Lara Croft ?', ['Tomb Raider', 'Uncharted', 'Prince of Persia', 'Resident Evil'], 2],
      ['Quel studio polonais a développé « The Witcher 3 » ?', ['CD Projekt Red', 'Techland', '11 bit studios', 'People Can Fly'], 2],
      ['En quelle année est sorti le premier « Super Mario Bros. » sur NES ?', ['1985', '1983', '1988', '1990'], 3],
      ['Dans quel jeu de Rockstar incarne-t-on Arthur Morgan ?', ['Red Dead Redemption 2', 'GTA V', 'Bully', 'L.A. Noire'], 3],
      ['Quel est le matricule du Master Chief dans « Halo » ?', ['John-117', 'Noble-6', 'Locke-05', 'Fred-104'], 3],
      ['Quel jeu a été élu « Jeu de l\'année » aux Game Awards 2024 ?', ['Astro Bot', 'Black Myth: Wukong', 'Final Fantasy VII Rebirth', 'Metaphor: ReFantazio'], 3],
      ['Comment s\'appelle la ville fictive de « GTA V » ?', ['Los Santos', 'Liberty City', 'Vice City', 'San Fierro'], 3]
    ]
  };

  window.QUIZ_QUESTIONS_PLUS = Object.entries(Q).flatMap(([cat, list]) =>
    list.map(([q, a, d], i) => ({ id: 'plus-' + cat + '-' + i, cat, q, a, d }))
  );
})();
