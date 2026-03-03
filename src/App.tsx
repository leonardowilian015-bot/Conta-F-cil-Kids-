
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Minus, X, Divide, 
  Settings, Play, BookOpen, 
  Gamepad2, ChevronLeft, Star, 
  Flag, Timer, Zap,
  HelpCircle, Trophy, Sparkles,
  Cloud, Heart, Music, Music2,
  Users, UserPlus, LogOut, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mascot } from './components/Mascot';
import { getMathExplanation } from './services/geminiService';
import { AppMode, Operation, Question, UserProgress, LeaderboardEntry, UserProfile } from './types';
import { PETS, HELP_CONTENT } from './constants';

const AVATARS = [
  { id: 'bear', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100' },
  { id: 'star', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { id: 'zap', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'sparkle', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

const DEFAULT_PROGRESS: UserProgress = {
  stars: 0,
  gincanaPoints: 0,
  collectedPets: ['nilo'],
  selectedMascotId: 'nilo',
  medals: { soma: 0, subtracao: 0, multiplicacao: 0, divisao: 0 },
  completedGincanas: [],
  history: []
};

const OPERATIONS: { id: Operation; icon: any; color: string; label: string }[] = [
  { id: 'soma', icon: Plus, color: 'bg-emerald-400', label: 'Soma' },
  { id: 'subtracao', icon: Minus, color: 'bg-rose-400', label: 'Subtração' },
  { id: 'multiplicacao', icon: X, color: 'bg-amber-400', label: 'Multiplicação' },
  { id: 'divisao', icon: Divide, color: 'bg-sky-400', label: 'Divisão' },
];

export default function App() {
  const [mode, setMode] = useState<AppMode>('user-select');
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [mascotMsg, setMascotMsg] = useState('Vamos brincar com os números?');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrating' | 'neutral'>('neutral');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [gincanaTimer, setGincanaTimer] = useState<number | null>(null);
  const [gincanaScore, setGincanaScore] = useState(0);
  const [activeGincana, setActiveGincana] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentMascot = PETS.find(p => p.id === progress.selectedMascotId) || PETS[0];

  // Background Music Logic
  useEffect(() => {
    if (!audioRef.current) {
      // Using a calmer, more relaxing track
      const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
      audio.loop = true;
      audio.volume = 0.15;
      audio.preload = "auto";
      
      audio.addEventListener('error', (e) => {
        console.error("Erro no áudio:", e);
        setIsMusicPlaying(false);
      });

      audioRef.current = audio;
    }

    if (isMusicPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Erro ao dar play:", err);
        setIsMusicPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  // Welcome message
  useEffect(() => {
    if (currentUser) {
      const welcome = `Eu sou o ${currentMascot.name}! Vamos brincar com os números?`;
      setMascotMsg(welcome);
    }
  }, [currentUser, progress.selectedMascotId]);

  // Gincana Timer Logic
  useEffect(() => {
    let interval: any;
    if (gincanaTimer !== null && gincanaTimer > 0) {
      interval = setInterval(() => {
        setGincanaTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (gincanaTimer === 0) {
      // Gincana Finished
      setMascotMood('celebrating');
      setMascotMsg(`Fim da Gincana! Você fez ${gincanaScore} pontos!`);
      
      // Update Leaderboard
      const newEntry: LeaderboardEntry = {
        id: Math.random().toString(36).substr(2, 9),
        score: gincanaScore,
        date: new Date().toLocaleDateString('pt-BR'),
        playerName: currentUser?.name || 'Visitante'
      };
      
      setLeaderboard(prev => {
        const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
        localStorage.setItem('math_leaderboard', JSON.stringify(updated));
        return updated;
      });

      setProgress(prev => {
        const newStars = prev.stars + Math.floor(gincanaScore / 2);
        const newProgress = {
          ...prev,
          gincanaPoints: prev.gincanaPoints + gincanaScore,
          stars: newStars
        };

        // Check for new pet unlock
        const nextPet = PETS.find(p => p.cost <= newStars && !prev.collectedPets.includes(p.id));
        if (nextPet) {
          newProgress.collectedPets = [...prev.collectedPets, nextPet.id];
        }

        return newProgress;
      });
      setGincanaTimer(null);
      setTimeout(() => {
        setMode('menu');
        setActiveGincana(null);
        setGincanaScore(0);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [gincanaTimer, gincanaScore]);

  // Load progress
  useEffect(() => {
    const savedUsers = localStorage.getItem('math_users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      // Don't auto-select user, let them choose
    }
    
    const savedLeaderboard = localStorage.getItem('math_leaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
  }, []);

  // Save users whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('math_users', JSON.stringify(users));
    }
  }, [users]);

  // Sync progress to current user
  useEffect(() => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, progress } : u));
    }
  }, [progress]);

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserName,
      avatar: selectedAvatar.id,
      progress: DEFAULT_PROGRESS
    };
    setUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setCurrentUser(newUser);
    setProgress(DEFAULT_PROGRESS);
    setMode('menu');
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setProgress(user.progress);
    setMode('menu');
  };

  const handleDeleteUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
      setMode('user-select');
    }
  };

  const generateQuestion = useCallback((op: Operation, diff: number) => {
    let n1 = 0, n2 = 0, ans = 0;
    const max = diff * 10;

    switch (op) {
      case 'soma':
        n1 = Math.floor(Math.random() * max) + 1;
        n2 = Math.floor(Math.random() * max) + 1;
        ans = n1 + n2;
        break;
      case 'subtracao':
        n1 = Math.floor(Math.random() * max) + 5;
        n2 = Math.floor(Math.random() * n1);
        ans = n1 - n2;
        break;
      case 'multiplicacao':
        n1 = Math.floor(Math.random() * (diff + 2)) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        ans = n1 * n2;
        break;
      case 'divisao':
        n2 = Math.floor(Math.random() * (diff + 2)) + 1;
        ans = Math.floor(Math.random() * 10) + 1;
        n1 = n2 * ans;
        break;
    }

    const options = [ans];
    while (options.length < 4) {
      const wrong = ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      if (wrong >= 0 && !options.includes(wrong)) options.push(wrong);
    }

    return {
      id: Math.random().toString(),
      num1: n1,
      num2: n2,
      operation: op,
      answer: ans,
      options: options.sort(() => Math.random() - 0.5)
    };
  }, []);

  const getOpSymbol = useCallback((op: Operation) => {
    if (op === 'soma') return '+';
    if (op === 'subtracao') return '-';
    if (op === 'multiplicacao') return 'x';
    return '÷';
  }, []);

  const startPractice = (op: Operation) => {
    setSelectedOp(op);
    setMode('praticar');
    const q = generateQuestion(op, difficulty);
    setCurrentQuestion(q);
    setMascotMsg(`Quanto é ${q.num1} ${getOpSymbol(op)} ${q.num2}?`);
  };

  const startLearning = (op: Operation) => {
    setSelectedOp(op);
    setMode('aprender');
    const q = generateQuestion(op, 1);
    setCurrentQuestion(q);
  };

  // Explanation Logic for Learning Mode
  useEffect(() => {
    if (mode === 'aprender' && currentQuestion) {
      const fetchExplanation = async () => {
        setExplanation(null); // Clear old explanation while loading
        setMascotMood('thinking');
        setMascotMsg("Deixa eu te explicar...");
        const expl = await getMathExplanation(
          currentQuestion.num1, 
          currentQuestion.num2, 
          getOpSymbol(currentQuestion.operation)
        );
        setExplanation(expl || null);
        setMascotMood('neutral');
        setMascotMsg(`Quanto é ${currentQuestion.num1} ${getOpSymbol(currentQuestion.operation)} ${currentQuestion.num2}?`);
      };
      fetchExplanation();
    }
  }, [currentQuestion?.id, mode, getOpSymbol]);

  const handleAnswer = (choice: number) => {
    if (!currentQuestion || feedback) return;

    if (choice === currentQuestion.answer) {
      setFeedback('correct');
      setMascotMood('celebrating');
      
      if (activeGincana) {
        setGincanaScore(prev => prev + 1);
      }

      setMascotMsg("Incrível! Você acertou!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setProgress(prev => {
        const newStars = prev.stars + 1;
        const newProgress = {
          ...prev,
          stars: newStars,
          medals: {
            ...prev.medals,
            [currentQuestion.operation]: prev.medals[currentQuestion.operation] + 1
          }
        };

        // Check for new pet unlock
        const nextPet = PETS.find(p => p.cost <= newStars && !prev.collectedPets.includes(p.id));
        if (nextPet) {
          newProgress.collectedPets = [...prev.collectedPets, nextPet.id];
        }

        return newProgress;
      });

      // Adaptive difficulty
      if (difficulty < 5) setDifficulty(d => d + 0.2);

      setTimeout(() => {
        setFeedback(null);
        const nextQ = generateQuestion(currentQuestion.operation, Math.floor(difficulty));
        setCurrentQuestion(nextQ);
        setMascotMood('neutral');
        setMascotMsg(`Próxima: Quanto é ${nextQ.num1} ${getOpSymbol(nextQ.operation)} ${nextQ.num2}?`);
      }, 2000);
    } else {
      setFeedback('wrong');
      setMascotMood('thinking');
      setMascotMsg("Quase lá! Tente de novo.");
      
      // Adaptive difficulty
      if (difficulty > 1) setDifficulty(d => d - 0.5);

      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const startGincana = (type: string) => {
    setActiveGincana(type);
    setGincanaScore(0);
    setGincanaTimer(30); // 30 seconds
    setMode('praticar');
    const op = type === 'maratona-soma' ? 'soma' : 'subtracao';
    const q = generateQuestion(op as Operation, 1);
    setCurrentQuestion(q);
    setMascotMsg(`Gincana Começou! Quanto é ${q.num1} + ${q.num2}?`);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-4xl mx-auto relative overflow-y-auto">
      {/* Decorative Elements */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-opacity ${isMusicPlaying ? 'text-brand-blue opacity-100' : 'text-slate-400 opacity-50'}`}>
          {isMusicPlaying ? 'Música Ligada' : 'Música Desligada'}
        </span>
        <button
          onClick={() => setIsMusicPlaying(!isMusicPlaying)}
          className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 ${isMusicPlaying ? 'bg-brand-blue text-white' : 'bg-white text-slate-400'}`}
          title={isMusicPlaying ? "Pausar Música" : "Tocar Música"}
        >
          {isMusicPlaying ? <Music className="w-6 h-6 animate-pulse" /> : <Music2 className="w-6 h-6" />}
        </button>
      </div>

      <div className="fixed top-10 left-10 text-blue-200 animate-float pointer-events-none">
        <Cloud size={80} fill="currentColor" />
      </div>
      <div className="fixed top-40 right-20 text-yellow-200 animate-float-delayed pointer-events-none">
        <Star size={60} fill="currentColor" />
      </div>
      <div className="fixed bottom-20 left-20 text-pink-200 animate-float-delayed pointer-events-none">
        <Heart size={50} fill="currentColor" />
      </div>
      <div className="fixed bottom-40 right-10 text-emerald-200 animate-float pointer-events-none">
        <Sparkles size={70} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-6 sticky top-0 bg-brand-blue/80 backdrop-blur-sm z-20 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
            <span className="text-lg font-bold text-slate-700">{progress.stars}</span>
          </div>
          
          {currentUser && (
            <button 
              onClick={() => setMode('user-select')}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Users className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-bold text-slate-600">{currentUser.name}</span>
            </button>
          )}
        </div>
        
        <h1 className="text-2xl md:text-4xl font-black text-accent-blue tracking-tight text-center">
          CONTA FÁCIL KIDS
        </h1>

        <button 
          onClick={() => setMode('pais')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Settings className="text-slate-500 w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 pb-20">
        <AnimatePresence mode="wait">
          {mode === 'user-select' && (
            <motion.div 
              key="user-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl border-8 border-accent-blue"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2">QUEM VAI BRINCAR?</h2>
                <p className="text-slate-500 font-bold">Escolha seu perfil ou crie um novo!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <Users className="text-accent-blue" /> PERFIS SALVOS
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                    {users.map(user => {
                      const avatar = AVATARS.find(a => a.id === user.avatar) || AVATARS[0];
                      return (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-4 cursor-pointer transition-all ${
                            currentUser?.id === user.id ? 'border-accent-blue bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${avatar.bg} flex items-center justify-center`}>
                              <avatar.icon className={`w-6 h-6 ${avatar.color}`} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-500 font-bold">{user.progress.stars} Estrelas</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteUser(user.id, e)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      );
                    })}
                    {users.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border-4 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Nenhum perfil ainda...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create User */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <UserPlus className="text-emerald-500" /> NOVO PERFIL
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nome do Pequeno</label>
                      <input 
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ex: Joãozinho"
                        className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl focus:border-accent-blue outline-none font-bold text-slate-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Escolha um Ícone</label>
                      <div className="flex gap-3">
                        {AVATARS.map(avatar => (
                          <button
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                              selectedAvatar.id === avatar.id ? `ring-4 ring-offset-2 ring-accent-blue ${avatar.bg}` : 'bg-slate-100'
                            }`}
                          >
                            <avatar.icon className={`w-6 h-6 ${avatar.color}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleCreateUser}
                      disabled={!newUserName.trim()}
                      className="w-full py-4 bg-emerald-400 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl shadow-lg transform transition-all active:scale-95"
                    >
                      CRIAR E BRINCAR!
                    </button>
                  </div>
                </div>
              </div>
              
              {currentUser && (
                <div className="mt-8 pt-6 border-t-4 border-slate-50 flex justify-center">
                  <button 
                    onClick={() => setMode('menu')}
                    className="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar ao Menu
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full gap-8"
            >
              <div className="text-center">
                <Mascot 
                  mood={mascotMood} 
                  message={mascotMsg} 
                  icon={currentMascot.icon}
                  color={currentMascot.color}
                  bg={currentMascot.bg}
                />
                <p className="mt-4 text-xl font-medium text-accent-blue italic">
                  "Matemática fácil, aprender feliz."
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                <button 
                  onClick={() => setMode('aprender')}
                  className="btn-bubbly bg-accent-blue text-white p-4 flex flex-col items-center gap-2"
                >
                  <BookOpen className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Aprender</span>
                </button>
                
                <button 
                  onClick={() => setMode('praticar')}
                  className="btn-bubbly bg-accent-mint text-white p-4 flex flex-col items-center gap-2"
                >
                  <Play className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Praticar</span>
                </button>

                <button 
                  onClick={() => setMode('jogar')}
                  className="btn-bubbly bg-accent-yellow text-white p-4 flex flex-col items-center gap-2"
                >
                  <Gamepad2 className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Jogar</span>
                </button>

                <button 
                  onClick={() => setMode('gincanas')}
                  className="btn-bubbly bg-rose-500 text-white p-4 flex flex-col items-center gap-2"
                >
                  <Flag className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Gincanas</span>
                </button>

                <button 
                  onClick={() => setMode('ajuda')}
                  className="btn-bubbly bg-indigo-500 text-white p-4 flex flex-col items-center gap-2"
                >
                  <HelpCircle className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Dicas</span>
                </button>

                <button 
                  onClick={() => setMode('colecao')}
                  className="btn-bubbly bg-purple-500 text-white p-4 flex flex-col items-center gap-2"
                >
                  <Trophy className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Coleção</span>
                </button>

                <button 
                  onClick={() => setMode('ranking')}
                  className="btn-bubbly bg-amber-500 text-white p-4 flex flex-col items-center gap-2"
                >
                  <Trophy className="w-8 h-8" />
                  <span className="text-lg font-bold uppercase">Ranking</span>
                </button>
              </div>
            </motion.div>
          )}

          {(mode === 'aprender' || mode === 'praticar') && !selectedOp && (
            <motion.div 
              key="op-select"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-6 w-full"
            >
              <button onClick={() => setMode('menu')} className="col-span-2 flex items-center gap-2 text-slate-500 font-bold mb-4">
                <ChevronLeft /> Voltar ao Menu
              </button>
              {OPERATIONS.map(op => (
                <button
                  key={op.id}
                  onClick={() => mode === 'aprender' ? startLearning(op.id) : startPractice(op.id)}
                  className={`btn-bubbly ${op.color} text-white p-10 flex flex-col items-center gap-4`}
                >
                  <op.icon className="w-12 h-12" />
                  <span className="text-xl font-bold uppercase">{op.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {(mode === 'praticar' || mode === 'aprender') && selectedOp && currentQuestion && (
            <motion.div 
              key="gameplay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-8"
            >
              <div className="w-full flex justify-between items-center mb-2">
                <button 
                  onClick={() => { setSelectedOp(null); setExplanation(null); setActiveGincana(null); setGincanaTimer(null); }}
                  className="flex items-center gap-2 text-slate-500 font-bold text-sm md:text-base"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                
                {activeGincana && gincanaTimer !== null && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-bold">
                      <Timer className="w-4 h-4" /> {gincanaTimer}s
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-3 py-1 rounded-full font-bold">
                      <Zap className="w-4 h-4" /> {gincanaScore}
                    </div>
                  </div>
                )}

                <div className="flex gap-1 md:gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${i < Math.floor(difficulty) ? 'bg-accent-yellow' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="scale-90 md:scale-100">
                <Mascot 
                  mood={mascotMood} 
                  message={mascotMsg} 
                  icon={currentMascot.icon}
                  color={currentMascot.color}
                  bg={currentMascot.bg}
                />
              </div>

              {mode === 'aprender' && explanation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 md:p-6 rounded-3xl border-4 border-brand-blue shadow-inner text-center italic text-slate-600 text-sm md:text-base"
                >
                  "{explanation}"
                </motion.div>
              )}

              <div className="card-math w-full max-w-md flex flex-col items-center gap-4 md:gap-8 p-4 md:p-8">
                <div className="text-4xl md:text-6xl font-black text-slate-800 flex items-center gap-2 md:gap-4">
                  <span>{currentQuestion.num1}</span>
                  <span className="text-accent-blue">{getOpSymbol(currentQuestion.operation)}</span>
                  <span>{currentQuestion.num2}</span>
                  <span className="text-accent-blue">=</span>
                  <span className="text-slate-300">?</span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!feedback}
                      className={`
                        p-4 md:p-6 text-2xl md:text-3xl font-bold rounded-2xl border-b-4 md:border-b-8 transition-all active:border-b-0 active:translate-y-1 md:active:translate-y-2
                        ${feedback === 'correct' && opt === currentQuestion.answer ? 'bg-emerald-400 border-emerald-600 text-white' : 
                          feedback === 'wrong' && opt !== currentQuestion.answer ? 'bg-rose-400 border-rose-600 text-white' :
                          'bg-slate-100 border-slate-300 text-slate-700 hover:bg-white'}
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Aid for Learning */}
              {mode === 'aprender' && (
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {Array.from({ length: currentQuestion.num1 }).map((_, i) => (
                    <motion.div 
                      key={`n1-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-rose-400 rounded-full shadow-sm"
                    />
                  ))}
                  <div className="w-full h-1 bg-slate-200 my-2" />
                  {Array.from({ length: currentQuestion.num2 }).map((_, i) => (
                    <motion.div 
                      key={`n2-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-sky-400 rounded-full shadow-sm"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {mode === 'jogar' && (
            <motion.div 
              key="jogar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-accent-yellow mb-2 uppercase">DESAFIO DO {currentMascot.name}</h2>
                <p className="text-slate-600">Acerte o máximo que conseguir!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {OPERATIONS.map(op => (
                  <button
                    key={op.id}
                    onClick={() => startPractice(op.id)}
                    className={`btn-bubbly ${op.color} text-white p-6 flex items-center justify-center gap-3`}
                  >
                    <op.icon className="w-6 h-6" />
                    <span className="font-bold uppercase">{op.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setMode('menu')}
                className="mt-4 text-slate-500 font-bold underline"
              >
                Voltar ao Menu
              </button>
            </motion.div>
          )}
          {mode === 'gincanas' && (
            <motion.div 
              key="gincanas"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-rose-500 mb-2 uppercase">GINCANAS DO {currentMascot.name}</h2>
                <p className="text-slate-600">Desafios especiais para ganhar muitos pontos!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <button 
                  onClick={() => startGincana('maratona-soma')}
                  className="bg-white p-6 rounded-3xl shadow-md border-2 border-emerald-100 flex items-center gap-4 hover:bg-emerald-50 transition-colors text-left"
                >
                  <div className="bg-emerald-500 p-4 rounded-2xl text-white">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Maratona de Soma</h3>
                    <p className="text-sm text-slate-500">Acerte o máximo em 30 segundos!</p>
                  </div>
                </button>

                <button 
                  onClick={() => startGincana('mestre-subtracao')}
                  className="bg-white p-6 rounded-3xl shadow-md border-2 border-rose-100 flex items-center gap-4 hover:bg-rose-50 transition-colors text-left"
                >
                  <div className="bg-rose-500 p-4 rounded-2xl text-white">
                    <Timer className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Mestre da Subtração</h3>
                    <p className="text-sm text-slate-500">Desafio rápido de tirar!</p>
                  </div>
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-slate-700">Pontos de Gincana: {progress.gincanaPoints}</span>
              </div>

              <button 
                onClick={() => setMode('menu')}
                className="mt-4 text-slate-500 font-bold underline"
              >
                Voltar ao Menu
              </button>
            </motion.div>
          )}

          {mode === 'ajuda' && (
            <motion.div 
              key="ajuda"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-slate-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                  <ChevronLeft /> Voltar
                </button>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                  <Sparkles className="text-indigo-400 w-5 h-5" />
                  <span className="font-bold text-slate-700 uppercase">Dicas do {currentMascot.name}</span>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-4xl font-black text-indigo-600 drop-shadow-sm uppercase">DICAS DO {currentMascot.name}</h2>
                <p className="text-slate-600 font-bold">Aprenda matemática brincando!</p>
              </div>

              <div className="grid gap-6 overflow-y-auto max-h-[70vh] p-4 custom-scrollbar rounded-3xl bg-white/30 backdrop-blur-sm border-4 border-white/50 shadow-inner">
                {HELP_CONTENT.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[40px] shadow-md border-4 border-white hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-5xl shadow-inner">
                        {item.icon}
                      </div>
                      <h3 className={`text-3xl font-black ${item.color}`}>{item.title}</h3>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">{item.description}</p>
                  </motion.div>
                ))}
                <div className="h-10" /> {/* Spacer for bottom scrolling */}
              </div>
            </motion.div>
          )}

          {mode === 'colecao' && (
            <motion.div 
              key="colecao"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setMode('menu')} className="flex items-center gap-2 text-slate-500 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                  <ChevronLeft /> Voltar
                </button>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                  <span className="font-bold text-slate-700">{progress.stars} Estrelas</span>
                </div>
              </div>

              {/* Book Container */}
              <div className="relative bg-[#fdf6e3] rounded-[40px] shadow-2xl border-8 border-[#8b4513] p-4 md:p-8 min-h-[600px] flex flex-col">
                {/* Book Spine Effect */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/10 -translate-x-1/2 hidden md:block" />
                
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-black text-[#5d4037] drop-shadow-sm">ÁLBUM DE AMIGOS 📖</h2>
                  <p className="text-[#8d6e63] font-bold">Complete seu livro com estrelas!</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 overflow-y-auto max-h-[500px] p-2 custom-scrollbar">
                  {PETS.map((pet, index) => {
                    const isUnlocked = progress.collectedPets.includes(pet.id);
                    const isSuperRare = index === PETS.length - 1;
                    
                    return (
                      <motion.div 
                        key={pet.id}
                        whileHover={isUnlocked ? { scale: 1.05, rotate: 2 } : {}}
                        className={`
                          relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all
                          ${isUnlocked 
                            ? `${pet.bg} border-white shadow-lg` 
                            : 'bg-white/50 border-dashed border-slate-300 opacity-40'}
                        `}
                      >
                        {isSuperRare && (
                          <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-amber-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                            SUPER RARO!
                          </div>
                        )}

                        {isUnlocked ? (
                          <>
                            <pet.icon className={`w-12 h-12 ${pet.color}`} />
                            <span className="text-[10px] font-black text-slate-700 text-center px-1 leading-tight">
                              {pet.name}
                            </span>
                            <button 
                              onClick={() => setProgress(prev => ({ ...prev, selectedMascotId: pet.id }))}
                              className={`
                                mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase transition-all
                                ${progress.selectedMascotId === pet.id 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-white/50 text-indigo-600 hover:bg-white'}
                              `}
                            >
                              {progress.selectedMascotId === pet.id ? 'Selecionado' : 'Selecionar'}
                            </button>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-10 h-10 text-slate-300" />
                            <div className="flex items-center gap-1 bg-slate-200 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-bold text-slate-500">{pet.cost}</span>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 text-center text-[#8d6e63] font-bold italic">
                  "Cada estrela é um passo para um novo amigo!"
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'ranking' && (
            <motion.div 
              key="ranking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl border-8 border-amber-400"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <Trophy className="text-amber-500 w-10 h-10" />
                  RANKING
                </h2>
                <button 
                  onClick={() => setMode('menu')}
                  className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <Plus className="rotate-45 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-4 ${
                        index === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-black ${
                          index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-black text-slate-800">{entry.playerName}</p>
                          <p className="text-xs text-slate-400 font-bold">{entry.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-slate-100">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xl font-black text-slate-800">{entry.score}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic">Ainda não há recordes. Vamos jogar uma Gincana?</p>
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-3xl border-4 border-amber-100 text-center">
                <p className="text-amber-800 font-bold italic">"O segredo do campeão é nunca parar de praticar!"</p>
              </div>
            </motion.div>
          )}

          {mode === 'pais' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full bg-white rounded-3xl p-8 shadow-xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Relatório de Progresso</h2>
                <button onClick={() => setMode('menu')} className="p-2 bg-slate-100 rounded-full"><Plus className="rotate-45" /></button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {OPERATIONS.map(op => (
                  <div key={op.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className={`${op.color} p-3 rounded-xl text-white`}>
                      <op.icon />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-bold uppercase">{op.label}</p>
                      <p className="text-2xl font-black text-slate-800">{progress.medals[op.id]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                <p className="text-indigo-800 font-bold mb-2">Dica Pedagógica:</p>
                <p className="text-indigo-600 text-sm">
                  {progress.stars < 10 
                    ? "Incentive o uso do Modo Aprender para construir a base concreta." 
                    : "Ótimo progresso! Tente desafiar a criança com a Multiplicação."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Accessibility */}
      <footer className="mt-8 flex justify-center gap-4">
      </footer>
    </div>
  );
}
