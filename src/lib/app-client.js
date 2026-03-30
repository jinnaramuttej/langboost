import { initialAppData } from "@/src/lib/mock-data";

const STORAGE_KEY = "languageboost.demo-data.v1";
const AUTH_CHANGE_EVENT = "languageboost-auth-changed";
const DEFAULT_DEMO_PASSWORD_HASH = "ZGVtbzEyMzQ=";

let memoryStore = structuredClone(initialAppData);

const clone = (value) => structuredClone(value);

const hasWindow = () => typeof window !== "undefined" && !!window.localStorage;

const cloneUser = (user) => ({
  ...user,
  passwordHash: user?.passwordHash || DEFAULT_DEMO_PASSWORD_HASH,
  role: user?.role || "user",
});

const normalizeStore = (store) => {
  const users = (store?.users || []).map(cloneUser);
  const currentUserId = store?.currentUser?.id;
  const currentUser = currentUserId
    ? cloneUser(users.find((user) => user.id === currentUserId) || store.currentUser || users[0])
    : cloneUser(store?.currentUser || users[0] || {});

  return {
    ...structuredClone(initialAppData),
    ...store,
    users,
    currentUser,
    session: store?.session || null,
    analyticsEvents: Array.isArray(store?.analyticsEvents) ? store.analyticsEvents : [],
  };
};

const notifyAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
};

const makeSession = (userId) => ({
  userId,
  token: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
});

const readStore = () => {
  if (!hasWindow()) {
    return clone(memoryStore);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = normalizeStore(clone(initialAppData));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    memoryStore = clone(seeded);
    return seeded;
  }

  try {
    const parsed = normalizeStore(JSON.parse(raw));
    memoryStore = clone(parsed);
    return parsed;
  } catch {
    const seeded = normalizeStore(clone(initialAppData));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    memoryStore = clone(seeded);
    return seeded;
  }
};

const writeStore = (nextStore) => {
  const normalizedStore = normalizeStore(nextStore);
  memoryStore = clone(normalizedStore);
  if (hasWindow()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedStore));
  }
};

const collectionMap = {
  Lesson: "lessons",
  Flashcard: "flashcards",
  VocabularyEntry: "vocabularyEntries",
  ForumThread: "forumThreads",
  ForumReply: "forumReplies",
  UserProgress: "userProgress",
  User: "users",
};

const idPrefixMap = {
  Lesson: "lesson",
  Flashcard: "flashcard",
  VocabularyEntry: "vocab",
  ForumThread: "thread",
  ForumReply: "reply",
  UserProgress: "progress",
  User: "user",
};

const sortItems = (items, order = "-created_date") => {
  const key = order.startsWith("-") ? order.slice(1) : order;
  const direction = order.startsWith("-") ? -1 : 1;

  return [...items].sort((left, right) => {
    const a = left?.[key];
    const b = right?.[key];

    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    if (typeof a === "number" && typeof b === "number") {
      return (a - b) * direction;
    }

    const aDate = Date.parse(a);
    const bDate = Date.parse(b);
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return (aDate - bDate) * direction;
    }

    return String(a).localeCompare(String(b)) * direction;
  });
};

const limitItems = (items, limit) => {
  if (!limit || limit < 0) return items;
  return items.slice(0, limit);
};

const makeId = (entityName) => {
  const prefix = idPrefixMap[entityName] || "item";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
};

const updateCurrentUserRecord = (store, partial) => {
  store.currentUser = { ...store.currentUser, ...partial, updated_date: new Date().toISOString() };
  store.users = store.users.map((user) =>
    user.id === store.currentUser.id ? { ...user, ...partial } : user
  );
};

const entityApi = (entityName) => {
  const collectionKey = collectionMap[entityName];

  return {
    async list(order = "-created_date", limit = 50) {
      const store = readStore();
      return limitItems(sortItems(store[collectionKey] || [], order), limit);
    },

    async filter(criteria = {}, order = "-created_date", limit = 50) {
      const store = readStore();
      const items = (store[collectionKey] || []).filter((item) =>
        Object.entries(criteria).every(([key, value]) => item?.[key] === value)
      );
      return limitItems(sortItems(items, order), limit);
    },

    async create(data) {
      const store = readStore();
      const timestamp = new Date().toISOString();
      const item = {
        id: makeId(entityName),
        created_date: timestamp,
        updated_date: timestamp,
        ...data,
      };

      store[collectionKey] = [item, ...(store[collectionKey] || [])];
      if (entityName === "ForumThread") {
        item.reply_count = item.reply_count || 0;
        item.upvotes = item.upvotes || 0;
        item.view_count = item.view_count || 0;
      }
      writeStore(store);
      return item;
    },

    async update(id, data) {
      const store = readStore();
      let updatedItem = null;

      store[collectionKey] = (store[collectionKey] || []).map((item) => {
        if (item.id !== id) return item;
        updatedItem = { ...item, ...data, updated_date: new Date().toISOString() };
        return updatedItem;
      });

      writeStore(store);
      return updatedItem;
    },

    async delete(id) {
      const store = readStore();
      store[collectionKey] = (store[collectionKey] || []).filter((item) => item.id !== id);
      writeStore(store);
      return { id };
    },
  };
};

const vocabularyLookup = {
  hola: {
    definition: "A common Spanish greeting used in casual and neutral settings.",
    translation: "hello",
    phonetic: "OH-la",
    example_sentence: "Hola, mucho gusto en conocerte.",
  },
  bonjour: {
    definition: "A standard French greeting used during the day.",
    translation: "good day",
    phonetic: "bon-ZHOOR",
    example_sentence: "Bonjour, je voudrais un cafe.",
  },
  arigato: {
    definition: "A polite Japanese thank-you used in everyday conversation.",
    translation: "thank you",
    phonetic: "ah-ree-GAH-toh",
    example_sentence: "Arigato for your help today.",
  },
};

const quizBank = {
  Spanish: [
    { prompt: "What does 'hola' mean?", options: ["goodbye", "hello", "please", "tomorrow"], correct_index: 1, explanation: "'Hola' is the standard way to say hello." },
    { prompt: "Choose the best translation for 'gracias'.", options: ["thank you", "good night", "how are you", "see you"], correct_index: 0, explanation: "'Gracias' means thank you." },
    { prompt: "Which option means 'good morning'?", options: ["buenas noches", "buenos dias", "hasta luego", "por favor"], correct_index: 1, explanation: "'Buenos dias' is used in the morning." },
    { prompt: "What is the meaning of 'por favor'?", options: ["sorry", "please", "friend", "street"], correct_index: 1, explanation: "'Por favor' means please." },
    { prompt: "Which word means 'later' in 'hasta luego'?", options: ["hasta", "luego", "hola", "adios"], correct_index: 1, explanation: "'Luego' means later, so the whole phrase means see you later." },
  ],
  French: [
    { prompt: "What does 'bonjour' mean?", options: ["good day", "goodbye", "thank you", "friend"], correct_index: 0, explanation: "'Bonjour' is a daytime greeting." },
    { prompt: "Choose the meaning of 'merci'.", options: ["sorry", "thank you", "please", "later"], correct_index: 1, explanation: "'Merci' means thank you." },
    { prompt: "What is 'l'addition' in a cafe?", options: ["the menu", "the bill", "a chair", "the kitchen"], correct_index: 1, explanation: "'L'addition' is the bill or check." },
    { prompt: "Which option means 'to go'?", options: ["sur place", "a emporter", "maintenant", "dehors"], correct_index: 1, explanation: "'A emporter' means to take away or to go." },
    { prompt: "What does 'une table' mean?", options: ["a plate", "a table", "a ticket", "a napkin"], correct_index: 1, explanation: "'Une table' means a table." },
  ],
  German: [
    { prompt: "What does 'links' mean?", options: ["right", "left", "behind", "inside"], correct_index: 1, explanation: "'Links' means left." },
    { prompt: "Choose the meaning of 'geradeaus'.", options: ["straight ahead", "turn back", "stop here", "next week"], correct_index: 0, explanation: "'Geradeaus' means straight ahead." },
    { prompt: "What is 'die Haltestelle'?", options: ["the street", "the stop", "the map", "the station clock"], correct_index: 1, explanation: "'Die Haltestelle' is the stop." },
    { prompt: "Which phrase means 'around the corner'?", options: ["im Zug", "am Bahnhof", "um die Ecke", "nach Hause"], correct_index: 2, explanation: "'Um die Ecke' means around the corner." },
    { prompt: "What does 'dort' usually mean?", options: ["here", "there", "soon", "yesterday"], correct_index: 1, explanation: "'Dort' means there." },
  ],
  Japanese: [
    { prompt: "What does 'arigato' mean?", options: ["hello", "thank you", "excuse me", "teacher"], correct_index: 1, explanation: "'Arigato' means thank you." },
    { prompt: "Choose the meaning of 'hajimemashite'.", options: ["good morning", "nice to meet you", "good luck", "goodbye"], correct_index: 1, explanation: "'Hajimemashite' is used when meeting someone for the first time." },
    { prompt: "What does 'watashi wa' introduce?", options: ["a location", "a question", "the speaker", "a date"], correct_index: 2, explanation: "'Watashi wa' introduces the speaker, meaning I am or as for me." },
    { prompt: "What is the meaning of 'nihon'?", options: ["language", "Japan", "school", "music"], correct_index: 1, explanation: "'Nihon' means Japan." },
    { prompt: "Choose the closest meaning of 'yoroshiku'.", options: ["please treat me well", "let's eat", "see you soon", "well done"], correct_index: 0, explanation: "'Yoroshiku' is part of a polite first-meeting phrase." },
  ],
  Italian: [
    { prompt: "What does 'mi sveglio' mean?", options: ["I wake up", "I go home", "I study", "I buy"], correct_index: 0, explanation: "'Mi sveglio' means I wake up." },
    { prompt: "Choose the meaning of 'la sera'.", options: ["in the morning", "at noon", "in the evening", "every day"], correct_index: 2, explanation: "'La sera' means in the evening." },
    { prompt: "What is 'faccio colazione'?", options: ["I have breakfast", "I run", "I cook", "I work"], correct_index: 0, explanation: "'Faccio colazione' means I have breakfast." },
    { prompt: "What does 'vado al lavoro' mean?", options: ["I go to work", "I go to school", "I go by bus", "I go to sleep"], correct_index: 0, explanation: "'Vado al lavoro' means I go to work." },
    { prompt: "Which option is related to time of day?", options: ["treno", "sera", "casa", "giornale"], correct_index: 1, explanation: "'Sera' refers to the evening." },
  ],
};

const tutorReplies = {
  Spanish: "Muy bien. Tu idea se entiende. Puedes ampliar la frase con un detalle mas para sonar mas natural.\n\n**Correction:** _tu frase_ -> _tu frase corregida_: adjust the article and verb ending for a smoother sentence.",
  French: "Tres bien. Le message est clair. Ajoute un petit detail pour rendre la reponse plus naturelle.\n\n**Correction:** _ta phrase_ -> _ta phrase corrigee_: agreement and article were adjusted.",
  German: "Sehr gut. Die Aussage ist klar. Fuge noch ein kleines Detail hinzu, damit es naturlicher klingt.\n\n**Correction:** _dein Satz_ -> _dein verbesserter Satz_: article and word order were improved.",
  Japanese: "Ii desu ne. Imi wa tsutawatte imasu. Mou sukoshi kuwashiku iuto motto shizen desu.\n\n**Correction:** _anata no bun_ -> _naottta bun_: word order was adjusted for clarity.",
  Italian: "Molto bene. Il messaggio e chiaro. Aggiungi un piccolo dettaglio per renderlo piu naturale.\n\n**Correction:** _la tua frase_ -> _la frase corretta_: article and verb form were improved.",
  default: "Good start. Your meaning is clear. Add one more detail so the response feels more natural.\n\n**Correction:** _your sentence_ -> _a smoother version_: article and word order were adjusted.",
};

const buildVocabularyAutofill = (prompt) => {
  const wordMatch = prompt.match(/word \"([^\"]+)\"/i);
  const languageMatch = prompt.match(/\bin ([A-Za-z]+)\b/i);
  const word = wordMatch?.[1]?.trim() || "word";
  const language = languageMatch?.[1]?.trim() || "English";
  const key = word.toLowerCase();
  const known = vocabularyLookup[key];

  if (known) {
    return known;
  }

  return {
    definition: `${word} is a useful ${language} word for everyday conversation.`,
    translation: word,
    phonetic: word.toUpperCase(),
    example_sentence: `I want to practice the word "${word}" in a short ${language} sentence every day.`,
  };
};

const buildQuiz = (prompt) => {
  const languageMatch = prompt.match(/Generate a [A-Za-z0-9]+ level ([A-Za-z]+) vocabulary quiz/i);
  const language = languageMatch?.[1] || "Spanish";
  return {
    questions: quizBank[language] || quizBank.Spanish,
  };
};

const buildTutorReply = (prompt) => {
  const languageMatch = prompt.match(/You are a ([A-Za-z]+) conversation tutor/i);
  const language = languageMatch?.[1] || "default";
  return tutorReplies[language] || tutorReplies.default;
};

export const appClient = {
  auth: {
    async me() {
      const store = readStore();
      const session = store.session;
      if (!session) {
        return null;
      }

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        store.session = null;
        writeStore(store);
        notifyAuthChange();
        return null;
      }

      const user = store.users.find((item) => item.id === session.userId);
      if (!user) {
        store.session = null;
        writeStore(store);
        notifyAuthChange();
        return null;
      }

      if (store.currentUser?.id !== user.id) {
        store.currentUser = cloneUser(user);
        writeStore(store);
      }

      return clone(cloneUser(user));
    },

    async signIn({ email, password }) {
      const store = readStore();
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const passwordHash = typeof btoa === "function" ? btoa(password) : DEFAULT_DEMO_PASSWORD_HASH;
      const user = store.users.find(
        (candidate) =>
          candidate?.email?.toLowerCase() === normalizedEmail &&
          (candidate?.passwordHash || DEFAULT_DEMO_PASSWORD_HASH) === passwordHash
      );

      if (!user) {
        return null;
      }

      store.currentUser = cloneUser(user);
      store.session = makeSession(user.id);
      writeStore(store);
      notifyAuthChange();
      return clone(store.currentUser);
    },

    async updateMe(data) {
      const store = readStore();
      updateCurrentUserRecord(store, data);
      writeStore(store);
      notifyAuthChange();
      return clone(store.currentUser);
    },

    logout(redirectUrl) {
      const store = readStore();
      store.session = null;
      writeStore(store);
      notifyAuthChange();
      if (typeof window !== "undefined") {
        window.location.assign(redirectUrl || "/");
      }
    },

    redirectToLogin(redirectUrl) {
      if (typeof window !== "undefined") {
        window.location.assign(redirectUrl || "/auth/signin");
      }
    },
  },

  entities: {
    Lesson: entityApi("Lesson"),
    Flashcard: entityApi("Flashcard"),
    VocabularyEntry: entityApi("VocabularyEntry"),
    ForumThread: entityApi("ForumThread"),
    ForumReply: entityApi("ForumReply"),
    UserProgress: entityApi("UserProgress"),
    User: entityApi("User"),
  },

  integrations: {
    Core: {
      async InvokeLLM({ prompt, response_json_schema: schema }) {
        if (schema?.properties?.questions) {
          return buildQuiz(prompt);
        }

        if (schema?.properties?.definition) {
          return buildVocabularyAutofill(prompt);
        }

        return buildTutorReply(prompt);
      },
    },
  },

  system: {
    async resetDemoData() {
      const seeded = normalizeStore(clone(initialAppData));
      writeStore(seeded);
      notifyAuthChange();
      return seeded;
    },
  },
};

export { AUTH_CHANGE_EVENT };
