
import { User, ExerciseLog, Tip, Recipe } from '../types';

const DB_PREFIX = 'donatto_fitpro_';
const USERS_KEY = `${DB_PREFIX}users`;
const LOGS_KEY = `${DB_PREFIX}logs`;
const TIPS_KEY = `${DB_PREFIX}tips`;
const RECIPES_KEY = `${DB_PREFIX}recipes`;
const CURRENT_USER_ID_KEY = `${DB_PREFIX}current_user_id`;

const INITIAL_TIPS: Tip[] = [
  {
    id: '1',
    content: 'La hidratación es tan importante como el peso que levantas. Bebe al menos 3L diarios.',
    category: 'Hidratación',
    isAiGenerated: false,
    dateAdded: Date.now()
  },
  {
    id: '2',
    content: 'No entrenes el ego, entrena el músculo. Controla la fase excéntrica (bajada) del movimiento.',
    category: 'Fuerza',
    isAiGenerated: false,
    dateAdded: Date.now() - 100000
  },
  {
    id: '3',
    content: 'El músculo crece durante el descanso, no en el gimnasio. Prioriza dormir 7-8 horas.',
    category: 'Motivación',
    isAiGenerated: false,
    dateAdded: Date.now() - 200000
  },
  {
    id: '4',
    content: 'La proteína es el ladrillo de tus músculos. Asegúrate de ingerir algo de proteína en cada comida.',
    category: 'Nutrición',
    isAiGenerated: false,
    dateAdded: Date.now() - 300000
  },
  {
    id: '5',
    content: 'La consistencia vence a la intensidad. Es mejor entrenar 4 días bien que 1 día perfecto y abandonar.',
    category: 'Motivación',
    isAiGenerated: false,
    dateAdded: Date.now() - 400000
  },
  {
    id: '6',
    content: 'La creatina funciona por acumulación, no por timing. Tómala todos los días, entrenes o no.',
    category: 'Suplementación',
    isAiGenerated: false,
    dateAdded: Date.now() - 500000
  },
  {
    id: '7',
    content: 'Antes de buscar suplementos mágicos, revisa si comes suficiente comida real.',
    category: 'Nutrición',
    isAiGenerated: false,
    dateAdded: Date.now() - 600000
  },
  {
    id: '8',
    content: 'El calentamiento no es opcional. 5-10 minutos de movilidad previenen meses de lesiones.',
    category: 'Fuerza',
    isAiGenerated: false,
    dateAdded: Date.now() - 700000
  }
];

export const dbService = {
  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  createUser: (user: User): void => {
    const users = dbService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  loginUser: (email: string): User | null => {
    const users = dbService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
      return user;
    }
    return null;
  },

  getCurrentUser: (): User | null => {
    const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!userId) return null;
    const users = dbService.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  },

  updateUser: (updatedUser: User): void => {
    const users = dbService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },
  
  // Admin Function: Delete User
  deleteUser: (userId: string): void => {
      let users = dbService.getUsers();
      users = users.filter(u => u.id !== userId);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      // Optionally clean up logs for that user
      // But keeping them for data integrity in simple local storage isn't harmful
  },

  getUserLogs: (userId: string): ExerciseLog[] => {
    const allLogs = localStorage.getItem(LOGS_KEY);
    const userLogsMap = allLogs ? JSON.parse(allLogs) : {};
    return userLogsMap[userId] || [];
  },

  saveLog: (userId: string, log: ExerciseLog): void => {
    const allLogsStr = localStorage.getItem(LOGS_KEY);
    const userLogsMap = allLogsStr ? JSON.parse(allLogsStr) : {};
    
    if (!userLogsMap[userId]) {
      userLogsMap[userId] = [];
    }
    
    userLogsMap[userId].push(log);
    localStorage.setItem(LOGS_KEY, JSON.stringify(userLogsMap));
  },

  getTips: (): Tip[] => {
    const tips = localStorage.getItem(TIPS_KEY);
    if (!tips) {
        localStorage.setItem(TIPS_KEY, JSON.stringify(INITIAL_TIPS));
        return INITIAL_TIPS;
    }
    return JSON.parse(tips);
  },

  saveTips: (tips: Tip[]): void => {
    localStorage.setItem(TIPS_KEY, JSON.stringify(tips));
  },

  addTip: (tip: Tip): void => {
    const tips = dbService.getTips();
    tips.unshift(tip);
    dbService.saveTips(tips);
  },

  getRecipes: (): Recipe[] => {
    const recipes = localStorage.getItem(RECIPES_KEY);
    return recipes ? JSON.parse(recipes) : [];
  },

  addRecipe: (recipe: Recipe): void => {
    const recipes = dbService.getRecipes();
    recipes.unshift(recipe);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  },

  // --- BACKUP & RESTORE SYSTEM ---
  getFullBackup: (): string => {
      const backup = {
          users: dbService.getUsers(),
          logs: JSON.parse(localStorage.getItem(LOGS_KEY) || '{}'),
          tips: dbService.getTips(),
          recipes: dbService.getRecipes(),
          timestamp: Date.now()
      };
      return JSON.stringify(backup);
  },

  restoreBackup: (jsonString: string): boolean => {
      try {
          const backup = JSON.parse(jsonString);
          if (backup.users) localStorage.setItem(USERS_KEY, JSON.stringify(backup.users));
          if (backup.logs) localStorage.setItem(LOGS_KEY, JSON.stringify(backup.logs));
          if (backup.tips) localStorage.setItem(TIPS_KEY, JSON.stringify(backup.tips));
          if (backup.recipes) localStorage.setItem(RECIPES_KEY, JSON.stringify(backup.recipes));
          return true;
      } catch (e) {
          console.error("Restore failed", e);
          return false;
      }
  }
};
