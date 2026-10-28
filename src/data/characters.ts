import { CharacterDef } from '../types/game';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'mama_lucha',
    name: 'Mamá Lucha',
    alias: 'La Campeona de los Precios Bajos',
    quote: '¡Los precios bajos siempre ganan y mis catorrazos también!',
    bio: 'Defensora legendaria del bolsillo de las familias mexicanas. Armada con su capa dorada, máscara verde y un carrito de compras supersónico.',
    themeColor: '#16a34a',
    accentColor: '#facc15',
    stats: {
      speed: 4,
      power: 4,
      range: 4,
      defense: 5,
    },
    portrait: 'mama_lucha',
    moves: {
      light: {
        name: 'Manotazo de Oferta',
        command: 'Golpe (J / Num4)',
        description: 'Rápido bofetón de tía enojada con rango implacable.',
        damage: 8,
      },
      heavy: {
        name: 'Patadón Reconciliador',
        command: 'Patada (K / Num5)',
        description: 'Patada frontal con bota dorada que empuja al rival.',
        damage: 15,
      },
      special: {
        name: '¡Carrito Mortal Aurrera!',
        command: 'Especial (L / Num6)',
        description: 'Lanza un carrito de supermercado veloz lleno de víveres que arrolla al oponente.',
        damage: 22,
      },
      super: {
        name: '¡OFERTÓN DEL SIGLO!',
        command: 'Super (U / Num1)',
        description: 'Vuela por los cielos como superheroína y cae en picada con un estruendo de fuegos artificiales.',
        damage: 42,
      },
    },
  },
  {
    id: 'catrina',
    name: 'La Catrina',
    alias: 'La Dama del Mictlán',
    quote: 'Entre flores de cempasúchil tu alma va a descansar.',
    bio: 'Elegante y letal, ataviada con corona de flores de cempasúchil y vestido tradicional bordado. Canaliza los espíritus del Día de Muertos.',
    themeColor: '#ea580c',
    accentColor: '#ec4899',
    stats: {
      speed: 5,
      power: 3,
      range: 5,
      defense: 3,
    },
    portrait: 'catrina',
    moves: {
      light: {
        name: 'Zarpazo Calavera',
        command: 'Golpe (J / Num4)',
        description: 'Corte rápido con uñas afiladas y pétalos dorados.',
        damage: 7,
      },
      heavy: {
        name: 'Patada de Panteón',
        command: 'Patada (K / Num5)',
        description: 'Patada alta con tacón de charol y ráfaga mística.',
        damage: 14,
      },
      special: {
        name: 'Ráfaga de Cempasúchil',
        command: 'Especial (L / Num6)',
        description: 'Dispara un torbellino ardiente de pétalos de cempasúchil que persigue al oponente.',
        damage: 20,
      },
      super: {
        name: '¡DANZA DEL MICHTLÁN!',
        command: 'Super (U / Num1)',
        description: 'Invoca un mar de velas y calaveras que envuelven al rival en una danza letal.',
        damage: 40,
      },
    },
  },
  {
    id: 'catrin',
    name: 'El Catrín',
    alias: 'El Charro del Inframundo',
    quote: '¡Con mariachi y trompetas te canto las golondrinas!',
    bio: 'El elegante esqueleto charro con traje de gala negro y botonadura de oro. Su sombrero y espuelas son armas de leyenda.',
    themeColor: '#1e293b',
    accentColor: '#eab308',
    stats: {
      speed: 3,
      power: 4,
      range: 5,
      defense: 4,
    },
    portrait: 'catrin',
    moves: {
      light: {
        name: 'Puño de Plata',
        command: 'Golpe (J / Num4)',
        description: 'Golpe recto de charro con botonadura metálica.',
        damage: 9,
      },
      heavy: {
        name: 'Espuelazo Charro',
        command: 'Patada (K / Num5)',
        description: 'Patada circular que aprovecha las espuelas de acero.',
        damage: 16,
      },
      special: {
        name: 'Sombrero Búmeran',
        command: 'Especial (L / Num6)',
        description: 'Lanza su gigantesco sombrero charro girando como sierra voladora que va y regresa.',
        damage: 24,
      },
      super: {
        name: '¡ZAPATEADO SÍSMICO!',
        command: 'Super (U / Num1)',
        description: 'Taconea con furia sobre la duela levantando estallidos de pólvora y fuego subterráneo.',
        damage: 44,
      },
    },
  },
  {
    id: 'taquero',
    name: 'Don Chencho',
    alias: 'El Rey del Pastor',
    quote: '¿Con todo joven? ¡Te va con copia de patadas!',
    bio: 'El taquero más respetado del barrio. Maneja el cuchillo taquero como maestro samurái y jamás falla la piña al vuelo.',
    themeColor: '#b91c1c',
    accentColor: '#f97316',
    stats: {
      speed: 3,
      power: 5,
      range: 3,
      defense: 4,
    },
    portrait: 'taquero',
    moves: {
      light: {
        name: 'Corte de Trompo',
        command: 'Golpe (J / Num4)',
        description: 'Tajo horizontal rápido con el cuchillo taquero.',
        damage: 10,
      },
      heavy: {
        name: 'Planchazo de Comal',
        command: 'Patada (K / Num5)',
        description: 'Golpe con el peso del cuerpo que estampa al rival.',
        damage: 17,
      },
      special: {
        name: 'Piña Voladora al Vuelo',
        command: 'Especial (L / Num6)',
        description: 'Corta una rebanada de piña ardiente y la manda volando a toda velocidad.',
        damage: 21,
      },
      super: {
        name: '¡SALSA HABANERA MORTAL!',
        command: 'Super (U / Num1)',
        description: 'Baña el escenario con salsa de molcajete hirviendo en una llamarada colosal.',
        damage: 45,
      },
    },
  },
  {
    id: 'mascara',
    name: 'Santo Plateado',
    alias: 'El Ídolo del Pancracio',
    quote: '¡La justicia y la técnica siempre triunfan en el ring!',
    bio: 'El enmascarado invicto, orgullo de la Arena Coliseo. Su agilidad aérea y llaves quebradoras son patrimonio nacional.',
    themeColor: '#0284c7',
    accentColor: '#e0e7ff',
    stats: {
      speed: 5,
      power: 4,
      range: 3,
      defense: 4,
    },
    portrait: 'mascara',
    moves: {
      light: {
        name: 'Machetazo al Pecho',
        command: 'Golpe (J / Num4)',
        description: 'Golpe de pecho que resuena por toda la arena.',
        damage: 9,
      },
      heavy: {
        name: 'Patada Voladora',
        command: 'Patada (K / Num5)',
        description: 'Patada con ambos pies saltando con gran impulso.',
        damage: 16,
      },
      special: {
        name: 'Tope Suicida',
        command: 'Especial (L / Num6)',
        description: 'Se proyecta en horizontal como bala humana atravesando la pantalla.',
        damage: 25,
      },
      super: {
        name: '¡PLANCHA DESDE LA TERCERA CUERDA!',
        command: 'Super (U / Num1)',
        description: 'Se eleva hasta el techo y cae con plancha descomunal sobre el adversario.',
        damage: 46,
      },
    },
  },
  {
    id: 'zorro_negro',
    name: 'Zorro Negro',
    alias: 'El Justiciero de Sayulita',
    quote: '¡La marca de la Z sella tu destino!',
    bio: 'El legendario espadachín enmascarado con sombrero cordobés, capa carmesí y un florete de plata implacable.',
    themeColor: '#0f172a',
    accentColor: '#dc2626',
    stats: {
      speed: 5,
      power: 4,
      range: 5,
      defense: 3,
    },
    portrait: 'zorro_negro',
    moves: {
      light: {
        name: 'Estocada Fina',
        command: 'Golpe (J / Num4)',
        description: 'Ataque de esgrima ultrarrápido con la punta del florete.',
        damage: 9,
      },
      heavy: {
        name: 'Corte Flamígero',
        command: 'Patada (K / Num5)',
        description: 'Corte horizontal con giro de capa que derriba al rival.',
        damage: 16,
      },
      special: {
        name: 'Corte de la Z',
        command: 'Especial (L / Num6)',
        description: 'Traza una Z luminosa de energía en el aire que sale disparada.',
        damage: 23,
      },
      super: {
        name: '¡JUSTICIA ENMASCARADA!',
        command: 'Super (U / Num1)',
        description: 'Danza de estocadas relámpago con su capa al viento que culmina con la marca de la Z.',
        damage: 45,
      },
    },
  },
  {
    id: 'dafne',
    name: 'Dafne',
    alias: 'La Chica Misterio de Sayulita',
    quote: '¡Un buen misterio y una patada giratoria lo solucionan todo!',
    bio: 'La detective playera de Sayulita, armada con bufanda verde, vestido morado y técnicas de artes marciales impecables.',
    themeColor: '#7c3aed',
    accentColor: '#22c55e',
    stats: {
      speed: 5,
      power: 3,
      range: 4,
      defense: 4,
    },
    portrait: 'dafne',
    moves: {
      light: {
        name: 'Palmazo de Playa',
        command: 'Golpe (J / Num4)',
        description: 'Golpe de palma rápido y elegante.',
        damage: 8,
      },
      heavy: {
        name: 'Patada Escarlata',
        command: 'Patada (K / Num5)',
        description: 'Patada alta con bota de charol lila.',
        damage: 15,
      },
      special: {
        name: 'Tabla Surf Giratoria',
        command: 'Especial (L / Num6)',
        description: 'Arroja una tabla de surf giratoria de Sayulita que barre el suelo.',
        damage: 22,
      },
      super: {
        name: '¡TSUNAMI DE SAYULITA!',
        command: 'Super (U / Num1)',
        description: 'Desata una ola gigante del pacífico con aroma a coco y ceviche.',
        damage: 43,
      },
    },
  },
  {
    id: 'gato_sombra',
    name: 'Gato Sombra',
    alias: 'El Felino Samurái Carmesí',
    quote: '¡Siete vidas no te bastarán para rozar mi armadura!',
    bio: 'Guerrero felino de las sombras con ojos verdes incandescentes, armadura samurái roja y sonrisa desafiante.',
    themeColor: '#991b1b',
    accentColor: '#22c55e',
    stats: {
      speed: 5,
      power: 4,
      range: 3,
      defense: 4,
    },
    portrait: 'gato_sombra',
    moves: {
      light: {
        name: 'Zarpazo Felino',
        command: 'Golpe (J / Num4)',
        description: 'Corte rápido con garras afiladas como navaja.',
        damage: 9,
      },
      heavy: {
        name: 'Patada Samurái',
        command: 'Patada (K / Num5)',
        description: 'Patada giratoria con grebas de armadura roja.',
        damage: 16,
      },
      special: {
        name: 'Shuriken Espectral',
        command: 'Especial (L / Num6)',
        description: 'Dispara una estrella ninja oscura de energía esmeralda.',
        damage: 23,
      },
      super: {
        name: '¡CORTE DE MEDIANOCHE!',
        command: 'Super (U / Num1)',
        description: 'Se desliza en las sombras y despedaza al rival en un parpadeo.',
        damage: 46,
      },
    },
  },
  {
    id: 'conde_vampiro',
    name: 'Conde Cilindro',
    alias: 'El Vampiro de la Noche',
    quote: '¡La sangre y la diversión jamás pasan de moda!',
    bio: 'El carismático conde vampírico de cuerpo cilíndrico, ojos saltones, capa de cuello alto y hebilla de calavera.',
    themeColor: '#450a0a',
    accentColor: '#dc2626',
    stats: {
      speed: 3,
      power: 5,
      range: 4,
      defense: 4,
    },
    portrait: 'conde_vampiro',
    moves: {
      light: {
        name: 'Manotazo Espectral',
        command: 'Golpe (J / Num4)',
        description: 'Zarpazo con dedos huesudos y garras góticas.',
        damage: 9,
      },
      heavy: {
        name: 'Embestida Puntiaguda',
        command: 'Patada (K / Num5)',
        description: 'Golpe con bota puntiaguda de vampiro medieval.',
        damage: 16,
      },
      special: {
        name: 'Enjambre de Murciélagos',
        command: 'Especial (L / Num6)',
        description: 'Invoca una bandada de murciélagos carmesí que vuelan en línea recta.',
        damage: 22,
      },
      super: {
        name: '¡ECLIPSE VAMPIREZCO!',
        command: 'Super (U / Num1)',
        description: 'Envuelve la arena en su capa negra y drena la energía vital del oponente.',
        damage: 44,
      },
    },
  },
  {
    id: 'momia_sacerdotisa',
    name: 'Sacerdotisa Momia',
    alias: 'La Guerrera del Nilo',
    quote: '¡La bendición de Anubis y la furia del desierto caen sobre ti!',
    bio: 'Poderosa guerrera atlética con vendajes místicos sagrados, cinturón del Ankh dorado y poderes de fuego eterno.',
    themeColor: '#581c87',
    accentColor: '#facc15',
    stats: {
      speed: 4,
      power: 4,
      range: 4,
      defense: 4,
    },
    portrait: 'momia_sacerdotisa',
    moves: {
      light: {
        name: 'Zarpazo Dorado',
        command: 'Golpe (J / Num4)',
        description: 'Golpe con garras vendadas infundidas en oro.',
        damage: 9,
      },
      heavy: {
        name: 'Patada de la Esfinge',
        command: 'Patada (K / Num5)',
        description: 'Patada frontal con aura de arena mágica.',
        damage: 16,
      },
      special: {
        name: 'Llamarada de Anubis',
        command: 'Especial (L / Num6)',
        description: 'Proyectil de fuego sagrado azul y dorado.',
        damage: 24,
      },
      super: {
        name: '¡JUICIO DE LAS PIRÁMIDES!',
        command: 'Super (U / Num1)',
        description: 'Invoca la sombra de Anubis que aprisiona al rival en vendas de fuego.',
        damage: 45,
      },
    },
  },
  {
    id: 'guardian_ancestral',
    name: 'Guardián Ancestral',
    alias: 'El Monolito Viviente',
    quote: '¡Siglos de historia pesan sobre cada uno de mis golpes!',
    bio: 'Ser milenario de piedra tallada y vendajes arcaicos con cabeza cúbica y fuerza colosal indestructible.',
    themeColor: '#78350f',
    accentColor: '#ea580c',
    stats: {
      speed: 2,
      power: 5,
      range: 5,
      defense: 5,
    },
    portrait: 'guardian_ancestral',
    moves: {
      light: {
        name: 'Puño de Granito',
        command: 'Golpe (J / Num4)',
        description: 'Impacto seco y pesado con puño de piedra.',
        damage: 10,
      },
      heavy: {
        name: 'Pisotón Sísmico',
        command: 'Patada (K / Num5)',
        description: 'Pisotón demoledor que sacude el suelo.',
        damage: 18,
      },
      special: {
        name: 'Monolito Rodante',
        command: 'Especial (L / Num6)',
        description: 'Dispara una roca tallada con símbolos ancestrales.',
        damage: 25,
      },
      super: {
        name: '¡CATACLISMO ANCESTRAL!',
        command: 'Super (U / Num1)',
        description: 'Invoca columnas de roca y fuego subterráneo que arrasan toda la pantalla.',
        damage: 47,
      },
    },
  },
];

export function getCharacterEmoji(id: string): string {
  switch (id) {
    case 'mama_lucha': return '🦸‍♀️';
    case 'catrina': return '💀';
    case 'catrin': return '🎩';
    case 'taquero': return '🌮';
    case 'mascara': return '🤼';
    case 'zorro_negro': return '🗡️';
    case 'dafne': return '🏄‍♀️';
    case 'gato_sombra': return '🐱';
    case 'conde_vampiro': return '🧛';
    case 'momia_sacerdotisa': return '🏺';
    case 'guardian_ancestral': return '🗿';
    default: return '🥊';
  }
}
