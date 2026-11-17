// Catálogo inicial de Vitalia (precios y duraciones de demostración: editables desde el panel administrativo).
export const INITIAL_SERVICES = [
  // 1. MANICURE (6)
  {
    id: 'srv-1',
    category: 'Manicure',
    name: 'Manicure Tradicional',
    description: 'Limpieza estética, exfoliación suave e hidratación con esmaltado tradicional de alto brillo.',
    duration: 45,
    price: 40000,
    active: true,
    moods: ['Natural', 'Elegante'],
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-2',
    category: 'Manicure',
    name: 'Manicure Semipermanente',
    description: 'Esmaltado en gel curado en lámpara LED con duración de hasta 21 días y brillo espejo.',
    duration: 60,
    price: 65000,
    active: true,
    moods: ['Elegante', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6c97d34?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-3',
    category: 'Manicure',
    name: 'Uñas Acrílicas',
    description: 'Esculpido profesional de extensión y estructura personalizada con acabado impecable.',
    duration: 120,
    price: 125000,
    active: true,
    moods: ['Atrevida', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-4',
    category: 'Manicure',
    name: 'Uñas en Gel',
    description: 'Sistema ligero y flexible de construcción en gel constructor con acabado natural y resistente.',
    duration: 105,
    price: 115000,
    active: true,
    moods: ['Natural', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-5',
    category: 'Manicure',
    name: 'Nail Art y Diseños Personalizados',
    description: 'Arte editorial a mano alzada, efectos cromados, aura nails, pedrería y diseños exclusivos.',
    duration: 90,
    price: 85000,
    active: true,
    moods: ['Creativa', 'Atrevida'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-6',
    category: 'Manicure',
    name: 'Retiro de Esmalte',
    description: 'Remoción segura y cuidadosa de sistemas semipermanentes, gel o acrílico con hidratación.',
    duration: 30,
    price: 25000,
    active: true,
    moods: ['Natural'],
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80'
  },

  // 2. PEDICURE (5)
  {
    id: 'srv-7',
    category: 'Pedicure',
    name: 'Pedicure Tradicional',
    description: 'Cuidado completo de uñas y pies con exfoliación suavizante y esmaltado clásico.',
    duration: 50,
    price: 48000,
    active: true,
    moods: ['Natural', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1519415387722-a1c38ef0ef48?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-8',
    category: 'Pedicure',
    name: 'Pedicure Semipermanente',
    description: 'Limpieza profunda y esmaltado en gel LED de larga duración con acabado luminoso.',
    duration: 65,
    price: 70000,
    active: true,
    moods: ['Elegante', 'Sofisticada'],
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Manicure_closeup.jpg?width=800'
  },
  {
    id: 'srv-9',
    category: 'Pedicure',
    name: 'Cuidado Estético de Uñas',
    description: 'Protocolo especializado de perfilado, nutrición de cutícula y fortalecimiento ungueal.',
    duration: 45,
    price: 55000,
    active: true,
    moods: ['Natural', 'Elegante'],
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Manicure_closeup.jpg?width=800'
  },
  {
    id: 'srv-10',
    category: 'Pedicure',
    name: 'Decoración de Uñas (Pedicure Art)',
    description: 'Diseños minimalistas, francesa glam, destellos y acentos personalizados para tus pies.',
    duration: 60,
    price: 68000,
    active: true,
    moods: ['Creativa', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-11',
    category: 'Pedicure',
    name: 'Experiencia de Pedicure y Relajación',
    description: 'Ritual spa con sales minerales, mascarilla hidratante, masaje relajante y esmaltado.',
    duration: 80,
    price: 95000,
    active: true,
    moods: ['Elegante', 'Sofisticada', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },

  // 3. MAQUILLAJE (6)
  {
    id: 'srv-12',
    category: 'Maquillaje',
    name: 'Maquillaje Social',
    description: 'Look equilibrado y luminoso diseñado para celebraciones, reuniones y ocasiones especiales.',
    duration: 60,
    price: 110000,
    active: true,
    moods: ['Elegante', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-13',
    category: 'Maquillaje',
    name: 'Maquillaje de Día',
    description: 'Acabado piel fresca y radiante con tonos suaves, iluminación natural y larga duración.',
    duration: 50,
    price: 90000,
    active: true,
    moods: ['Natural', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-14',
    category: 'Maquillaje',
    name: 'Maquillaje de Noche',
    description: 'Definición intensa de mirada, contorno esculpido y acabado glam de alto impacto.',
    duration: 75,
    price: 135000,
    active: true,
    moods: ['Atrevida', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-15',
    category: 'Maquillaje',
    name: 'Maquillaje para Eventos',
    description: 'Preparación de piel premium, blindaje de larga duración y pestañas punto a punto.',
    duration: 90,
    price: 165000,
    active: true,
    moods: ['Elegante', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-16',
    category: 'Maquillaje',
    name: 'Maquillaje de Fantasía',
    description: 'Propuestas artísticas con pigmentos neón, cristales, delineados gráficos e iridiscencia.',
    duration: 105,
    price: 180000,
    active: true,
    moods: ['Creativa', 'Atrevida'],
    image: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-17',
    category: 'Maquillaje',
    name: 'Maquillaje Personalizado (Beauty Lab)',
    description: 'Recreamos exactamente el diseño de rostro y maquillaje que creaste en Vitalia Beauty Lab.',
    duration: 85,
    price: 150000,
    active: true,
    moods: ['Creativa', 'Elegante', 'Atrevida'],
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
  },

  // 4. CABELLO (11)
  {
    id: 'srv-18',
    category: 'Cabello',
    name: 'Cortes para Mujeres',
    description: 'Asesoría de visagismo, lavado revitalizante, corte de precisión y styling finalizado.',
    duration: 60,
    price: 75000,
    active: true,
    moods: ['Elegante', 'Natural'],
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-19',
    category: 'Cabello',
    name: 'Cortes para Hombres',
    description: 'Corte contemporáneo o clásico adaptado a tu fisonomía con ritual de limpieza capilar.',
    duration: 45,
    price: 50000,
    active: true,
    moods: ['Natural', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-20',
    category: 'Cabello',
    name: 'Cortes Modernos y Personalizados',
    description: 'Diseños en capas, butterfly cut, bob editorial y texturizados de tendencia.',
    duration: 70,
    price: 85000,
    active: true,
    moods: ['Atrevida', 'Creativa'],
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-21',
    category: 'Cabello',
    name: 'Tinturas y Cambios de Color',
    description: 'Coloración global de alta cosmética con brillo intenso, cobertura uniforme y protección.',
    duration: 130,
    price: 185000,
    active: true,
    moods: ['Atrevida', 'Sofisticada'],
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-22',
    category: 'Cabello',
    name: 'Mechas y Balayage',
    description: 'Iluminación multidimensional personalizada con transiciones suaves y matiz luminoso.',
    duration: 180,
    price: 290000,
    active: true,
    moods: ['Sofisticada', 'Elegante', 'Creativa'],
    image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-23',
    category: 'Cabello',
    name: 'Tratamientos Capilares',
    description: 'Reconstrucción molecular profunda para devolver fuerza, elasticidad y salud a la hebra.',
    duration: 75,
    price: 120000,
    active: true,
    moods: ['Natural', 'Elegante'],
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-24',
    category: 'Cabello',
    name: 'Hidratación',
    description: 'Infusión intensiva de activos botánicos y ácido hialurónico capilar contra el frizz.',
    duration: 60,
    price: 95000,
    active: true,
    moods: ['Natural', 'Romántica'],
    image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-25',
    category: 'Cabello',
    name: 'Alisados',
    description: 'Alisado progresivo libre de formol para una melena sedosa, disciplinada y con brillo espejo.',
    duration: 150,
    price: 240000,
    active: true,
    moods: ['Sofisticada', 'Elegante'],
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-26',
    category: 'Cabello',
    name: 'Peinados',
    description: 'Cepillado profesional, volumen controlado y estilismo pulido para cualquier ocasión.',
    duration: 50,
    price: 65000,
    active: true,
    moods: ['Elegante', 'Natural'],
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-27',
    category: 'Cabello',
    name: 'Ondas y Recogidos',
    description: 'Ondas Hollywood, semirecogidos románticos o moños estructurados de alta fijación.',
    duration: 65,
    price: 85000,
    active: true,
    moods: ['Romántica', 'Elegante'],
    image: 'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'srv-28',
    category: 'Cabello',
    name: 'Peinados para Eventos',
    description: 'Diseño de peinado de gala con preparación térmica y acabado de alfombra roja.',
    duration: 75,
    price: 105000,
    active: true,
    moods: ['Elegante', 'Sofisticada', 'Atrevida'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
  }
];
