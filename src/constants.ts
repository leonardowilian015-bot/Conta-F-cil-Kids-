import { 
  Heart, Star, Sparkles, Cloud, Sun, Moon, Ghost, Cat, Dog, Rabbit, Bird, Fish, 
  Bug, Squirrel, Turtle, Mouse, Flower, Leaf, Rocket, Anchor, Bike, Car, 
  Plane, Train, Music, Camera, Palette, Gift, Coffee, Trophy, Crown, Gem,
  Gamepad2
} from 'lucide-react';

export const PETS = [
  { id: 'nilo', name: 'Nilo', icon: Gamepad2, color: 'text-indigo-600', bg: 'bg-indigo-100', cost: 0 },
  { id: '1', name: 'Gatinho Miau', icon: Cat, color: 'text-orange-400', bg: 'bg-orange-100', cost: 5 },
  { id: '2', name: 'Cachorrinho Totó', icon: Dog, color: 'text-stone-500', bg: 'bg-stone-100', cost: 10 },
  { id: '3', name: 'Coelhinho Pula', icon: Rabbit, color: 'text-pink-400', bg: 'bg-pink-50', cost: 15 },
  { id: '4', name: 'Passarinho Piui', icon: Bird, color: 'text-blue-400', bg: 'bg-blue-50', cost: 20 },
  { id: '5', name: 'Peixinho Glub', icon: Fish, color: 'text-cyan-400', bg: 'bg-cyan-50', cost: 25 },
  { id: '6', name: 'Fantasminha Bu', icon: Ghost, color: 'text-slate-400', bg: 'bg-slate-100', cost: 30 },
  { id: '7', name: 'Estrela Brilha', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-50', cost: 40 },
  { id: '8', name: 'Coração Amigo', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-50', cost: 50 },
  { id: '9', name: 'Joaninha Pintada', icon: Bug, color: 'text-red-500', bg: 'bg-red-50', cost: 60 },
  { id: '10', name: 'Esquilo Ligeiro', icon: Squirrel, color: 'text-amber-600', bg: 'bg-amber-50', cost: 70 },
  { id: '11', name: 'Tartaruga Lenta', icon: Turtle, color: 'text-emerald-500', bg: 'bg-emerald-50', cost: 80 },
  { id: '12', name: 'Ratinho Queijo', icon: Mouse, color: 'text-zinc-400', bg: 'bg-zinc-100', cost: 90 },
  { id: '13', name: 'Florzinha Linda', icon: Flower, color: 'text-fuchsia-400', bg: 'bg-fuchsia-50', cost: 100 },
  { id: '14', name: 'Folhinha Verde', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50', cost: 110 },
  { id: '15', name: 'Foguete Espacial', icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-50', cost: 125 },
  { id: '16', name: 'Âncora Forte', icon: Anchor, color: 'text-blue-700', bg: 'bg-blue-100', cost: 140 },
  { id: '17', name: 'Bicicleta Rápida', icon: Bike, color: 'text-sky-500', bg: 'bg-sky-50', cost: 160 },
  { id: '18', name: 'Carrinho Veloz', icon: Car, color: 'text-red-600', bg: 'bg-red-100', cost: 180 },
  { id: '19', name: 'Aviãozinho Alto', icon: Plane, color: 'text-slate-500', bg: 'bg-slate-100', cost: 200 },
  { id: '20', name: 'Trenzinho Piui', icon: Train, color: 'text-orange-600', bg: 'bg-orange-100', cost: 220 },
  { id: '21', name: 'Nota Musical', icon: Music, color: 'text-purple-500', bg: 'bg-purple-50', cost: 250 },
  { id: '22', name: 'Câmera Click', icon: Camera, color: 'text-zinc-600', bg: 'bg-zinc-200', cost: 280 },
  { id: '23', name: 'Pintura Mágica', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-100', cost: 310 },
  { id: '24', name: 'Presente Surpresa', icon: Gift, color: 'text-rose-500', bg: 'bg-rose-100', cost: 350 },
  { id: '25', name: 'Café Quentinho', icon: Coffee, color: 'text-amber-800', bg: 'bg-amber-100', cost: 400 },
  { id: '26', name: 'Troféu Campeão', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100', cost: 450 },
  { id: '27', name: 'Nuvem Fofinha', icon: Cloud, color: 'text-sky-300', bg: 'bg-sky-50', cost: 500 },
  { id: '28', name: 'Sol Radiante', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50', cost: 600 },
  { id: '29', name: 'Lua Serena', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-100', cost: 750 },
  { id: '30', name: 'O REI NILO DOURADO', icon: Crown, color: 'text-yellow-600', bg: 'bg-gradient-to-br from-yellow-200 to-amber-400', cost: 2000 },
];

export const HELP_CONTENT = [
  {
    title: 'A Soma (+)',
    description: 'Somar é como juntar brinquedos! Se você tem 2 carrinhos e ganha mais 1, agora você tem um grupo maior com 3 carrinhos. É só contar todos juntos!',
    icon: '➕',
    color: 'text-emerald-500'
  },
  {
    title: 'A Subtração (-)',
    description: 'Subtrair é como comer biscoitos! Se você tem 5 biscoitos e come 2, agora sobraram menos. É só tirar a parte que você "comeu" ou deu para alguém.',
    icon: '➖',
    color: 'text-rose-500'
  },
  {
    title: 'A Multiplicação (x)',
    description: 'Multiplicar é somar várias vezes a mesma coisa! Se você tem 3 caixas e cada uma tem 2 doces, é como fazer 2 + 2 + 2. É um jeito rápido de contar grupos iguais!',
    icon: '✖️',
    color: 'text-amber-500'
  },
  {
    title: 'A Divisão (÷)',
    description: 'Dividir é repartir com os amigos! Se você tem 4 balas e quer dar para 2 amigos, cada um ganha a mesma quantidade para ninguém ficar triste. É ser justo!',
    icon: '➗',
    color: 'text-sky-500'
  }
];
