'use strict';

export const MOCK_USER = {
  username: '@Wanda_j',
  name: 'Wanda',
  friends: 30,
  streak: 101,
  posts: 3,
};

export const FRIENDS = [
  { id: 'moises', username: '@Moises._', avatar: { skin: '#DD9B6C', hairColor: '#1A1A1A', hairStyle: 'straight', face: 'happy', bgColor: '#E8821E', bodyColor: '#7134D0' } },
  { id: 'lana', username: '@Lana._', avatar: { skin: '#FFBABA', hairColor: '#7134D0', hairStyle: 'curly', face: 'chill', bgColor: '#4B7BE5', bodyColor: '#E8821E' } },
  { id: 'alex', username: '@alex._', avatar: { skin: '#AC7752', hairColor: '#6B3A2A', hairStyle: 'bob', face: 'happy', bgColor: '#7134D0', bodyColor: '#45B8AC' } },
];

export const CHATS = [
  { id: 'andrew', username: '@Andrew', avatar: { skin: '#684328', hairColor: '#1A1A1A', hairStyle: 'straight', face: 'happy', bgColor: '#E8821E', bodyColor: '#1B2A4A' },
    messages: [
      { from: 'them', text: 'Hola!!, ¿Cómo estas?' },
      { from: 'them', text: 'Bien, ¿Cómo te fue en tu entrevista de trabajo?' },
      { from: 'them', text: 'Debió ser difícil.' },
      { from: 'me', text: 'Holi, Bien y tu?', read: true },
      { from: 'me', text: 'muy bien, creo que me pude comunicar bien con los demas.', read: true },
    ],
  },
  { id: 'lana', username: '@Lana._', avatar: FRIENDS[1].avatar, messages: [{ from: 'them', text: '¿Vamos al foro hoy?' }] },
];

export const ARTICLES = [
  {
    id: 'comunicacion',
    title: '¿Cómo mejorar tus habilidades de comunicación?',
    subtitle: 'Utel Universidad con propósito.',
    stars: 100,
    sections: [
      { heading: 'Escuchar es la clave', body: 'La escucha activa demuestra interés genuino. Parafrasea lo que escuchas y evita interrumpir.' },
      { heading: 'Haz preguntas', body: 'Las preguntas abiertas invitan a una conversación más rica y muestran curiosidad.' },
      { heading: 'Comunica con un objetivo claro', body: 'Antes de hablar, define qué quieres lograr: informar, persuadir o conectar.' },
      { heading: 'Mantén el contacto visual', body: 'El contacto visual transmite confianza y atención sin resultar invasivo.' },
      { heading: 'Cuida tu comunicación no verbal', body: 'Postura, gestos y tono de voz refuerzan o contradicen tus palabras.' },
    ],
    link: 'https://utel.edu.mx',
  },
  { id: 'mejora-1', title: 'Mejora tus habilidades', subtitle: 'dir. lorem.', stars: 100, sections: [{ heading: 'Introducción', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }], link: '#' },
  { id: 'mejora-2', title: 'Mejora tus habilidades', subtitle: 'dir. lorem.', stars: 100, sections: [{ heading: 'Introducción', body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' }], link: '#' },
];

export const NOTEBOOK_SEED = [
  { id: 'n1', title: 'Titulo', body: '', createdAt: 3000 },
  { id: 'n2', title: 'Titulo', body: '', createdAt: 2000 },
  { id: 'n3', title: 'Titulo', body: '', createdAt: 1000 },
];

export const FORUM_POSTS = [
  { id: 'p1', username: '@Wanda_j', mood: '😊', text: 'Acaso las personas no entienden cuando no quiero hablar con...', likes: 12 },
  { id: 'p2', username: '@Lana._', mood: '🤔', text: 'Hoy practiqué escucha activa en clase. ¡Se sintió diferente!', likes: 8 },
  { id: 'p3', username: '@Moises._', mood: '💪', text: 'Completé mi primera tarea del nivel 1. ¿Alguien más?', likes: 24 },
];

/** Filas de tareas: cada fila es un carrusel horizontal (3 filas en el diseño) */
export const TASK_ROWS = [
  {
    level: 1,
    tasks: [
      { id: 't1a', title: 'Habla con alguien de tu entorno', date: '06-2025' },
      { id: 't1b', title: 'Habla con alguien de tu entorno', date: '06-2025' },
    ],
  },
  {
    level: 1,
    tasks: [
      { id: 't2a', title: 'Habla con alguien de tu entorno', date: '06-2025' },
      { id: 't2b', title: 'Habla con alguien de tu entorno', date: '06-2025' },
    ],
  },
  {
    level: 1,
    tasks: [
      { id: 't3a', title: 'Habla con alguien de tu entorno', date: '06-2025' },
      { id: 't3b', title: 'Habla con alguien de tu entorno', date: '06-2025' },
    ],
  },
];

export const SEG_QUESTIONS = [
  { q: '¿Cómo te sentiste emocionalmente esta semana?', scale: true },
  { q: '¿Pudiste expresar lo que sentías?', scale: true },
  { q: '¿Interactuaste con personas de tu entorno?', scale: true },
  { q: '¿Te sentiste escuchado/a?', scale: true },
  { q: '¿Evitaste situaciones sociales?', scale: true },
  { q: '¿Practicaste habilidades de comunicación?', scale: true },
  { q: '¿Cómo calificarías tu nivel de ansiedad social?', scale: true },
  { q: '¿Participaste en el foro o chat?', scale: true },
  { q: '¿Completaste alguna tarea asignada?', scale: true },
  { q: '¿Qué aprendiste sobre ti esta semana?', scale: false },
];

export const SIM_CHARACTER = {
  name: 'Andrew',
  avatar: { skin: '#684328', hairColor: '#1A1A1A', hairStyle: 'straight', face: 'chill', bgColor: '#E8821E', bodyColor: '#1B2A4A' },
  /** Mensajes iniciales al abrir el chat (pantallas 2 del Figma) */
  intro: {
    face: 'chill',
    messages: ['Hola!!', '¿De qué te gustaría hablar hoy?'],
  },
  /** Placeholder del input antes de cada turno del usuario (como en Figma) */
  placeholders: [
    'Me encantaría hablar sobre mis estudios',
    'Muy bien en realidad, amo demasiado lo que hago pero eso no le quita lo complicado.',
  ],
  /** Respuestas del bot tras cada mensaje del usuario */
  replies: [
    {
      face: 'wink',
      afterFace: 'happy',
      messages: [
        'Claro!!!',
        '¿Cómo te va con los parciales? me dijeron tu carrera es muy difícil',
      ],
    },
    {
      face: 'surprised',
      messages: [
        'Me alegra tanto por ti ! Mírale, algún día deberíamos estudiar juntos',
      ],
    },
  ],
};
