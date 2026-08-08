
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Target, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Trash2,
  ChevronRight,
  Sun,
  LayoutDashboard,
  Heart,
  Quote
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { DailyLogEntry, Habit, Manifestation, Message, DailyInsight } from './types';
import * as aiService from './services/gemini';

// --- Shared Components ---

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-4xl font-heading font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 text-lg font-light">{subtitle}</p>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 ${className}`}>
    {children}
  </div>
);

// --- Content Components ---

const DailyLog: React.FC<{
  logs: DailyLogEntry[];
  onAdd: (type: 'good' | 'bad', text: string) => void;
  onRemove: (id: string) => void;
}> = ({ logs, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = (type: 'good' | 'bad') => {
    if (!input.trim()) return;
    onAdd(type, input);
    setInput('');
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <SectionHeader title="Daily Reflections" subtitle="Be radically honest with yourself. Log the highs and the lows." />
      
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Reflect on a moment today..."
          className="w-full text-xl md:text-2xl font-light bg-white py-8 px-10 rounded-[3rem] shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 border-none transition-all pr-40"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
          <button 
            onClick={() => handleAdd('good')}
            className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Good habit/moment"
          >
            <CheckCircle size={28} />
          </button>
          <button 
            onClick={() => handleAdd('bad')}
            className="p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Area for growth"
          >
            <XCircle size={28} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-heading font-semibold text-emerald-800 flex items-center gap-3 ml-4">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle size={18} /></span>
            The Wins
          </h3>
          <div className="space-y-4">
            {logs.filter(l => l.type === 'good').map(log => (
              <div key={log.id} className="group flex justify-between items-center p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] hover:bg-emerald-50 transition-colors">
                <span className="text-emerald-900 font-medium text-lg leading-relaxed">{log.text}</span>
                <button onClick={() => onRemove(log.id)} className="opacity-0 group-hover:opacity-100 text-emerald-300 hover:text-rose-500 transition-all p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-heading font-semibold text-rose-800 flex items-center gap-3 ml-4">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><XCircle size={18} /></span>
            The Lessons
          </h3>
          <div className="space-y-4">
            {logs.filter(l => l.type === 'bad').map(log => (
              <div key={log.id} className="group flex justify-between items-center p-6 bg-rose-50/50 border border-rose-100 rounded-[2rem] hover:bg-rose-50 transition-colors">
                <span className="text-rose-900 font-medium text-lg leading-relaxed">{log.text}</span>
                <button onClick={() => onRemove(log.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MonthlyTracker: React.FC<{
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
}> = ({ habits, onToggle, onAddHabit, onDeleteHabit }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName);
    setNewHabitName('');
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Monthly Rituals" subtitle="Build lasting change through daily micro-commitments." />
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-slate-900">
                {today.toLocaleString('default', { month: 'long' })} {currentYear}
              </h3>
              <p className="text-slate-400 font-medium">Tracking {habits.length} habits</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter habit name..."
              className="flex-1 md:w-64 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={handleAdd} 
              className="px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold"
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-6 -mx-4 px-4">
          <div className="min-w-[900px]">
            <div className="flex border-b border-slate-50 mb-6 pb-2">
              <div className="w-56 flex-shrink-0 font-bold text-slate-400 text-xs uppercase tracking-[0.2em]">Habit Ritual</div>
              <div className="flex flex-1 justify-around">
                {days.map(d => (
                  <div key={d} className={`w-8 text-center text-xs font-bold ${d === today.getDate() ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center group">
                  <div className="w-56 flex-shrink-0 flex items-center justify-between pr-8">
                    <span className="text-lg font-semibold text-slate-700 truncate">{habit.name}</span>
                    <button onClick={() => onDeleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex flex-1 justify-around">
                    {days.map(day => {
                      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                      const completed = habit.completions.includes(dateStr);
                      return (
                        <button
                          key={day}
                          onClick={() => onToggle(habit.id, dateStr)}
                          className={`w-6 h-6 rounded-[0.5rem] transition-all duration-300 flex items-center justify-center ${
                            completed 
                            ? 'bg-indigo-600 shadow-lg shadow-indigo-200 text-white scale-110' 
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-100/50'
                          }`}
                        >
                           {completed && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] text-slate-400 font-medium">
                  No habits tracked yet. Start your first ritual above.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ManifestationPage: React.FC<{
  manifestation: Manifestation;
  onUpdateGoal: (goal: string) => void;
  onAddAction: (action: string) => void;
  onRemoveAction: (index: number) => void;
}> = ({ manifestation, onUpdateGoal, onAddAction, onRemoveAction }) => {
  const [goalInput, setGoalInput] = useState(manifestation.mainGoal);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSuggest = async () => {
    if (!manifestation.mainGoal) return;
    setAiLoading(true);
    try {
      const ideas = await aiService.getManifestationIdeas(manifestation.mainGoal);
      ideas.forEach(idea => onAddAction(idea));
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <SectionHeader title="The Manifestation Room" subtitle="Set your intention and take the aligned steps to make it real." />
      
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl overflow-hidden">
              <Sparkles className="mb-6 text-indigo-500" size={40} />
              <h3 className="text-2xl font-heading font-bold text-slate-800 mb-6">Your North Star Goal</h3>
              <textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onBlur={() => onUpdateGoal(goalInput)}
                placeholder="I am living my dream life as..."
                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-xl md:text-2xl font-light text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300 transition-all min-h-[160px] resize-none"
              />
              <div className="mt-6 flex items-center gap-3 text-indigo-500/70 italic text-sm font-medium">
                <Heart size={16} /> Write in the present tense as if it is already yours.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-heading font-bold text-slate-800">Aligned Actions</h3>
              <button 
                onClick={handleSuggest}
                disabled={aiLoading || !manifestation.mainGoal}
                className="group flex items-center gap-2 text-sm font-bold text-white bg-slate-900 px-6 py-3 rounded-full hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
              >
                <Sparkles size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                {aiLoading ? 'Manifesting Ideas...' : 'AI Guidance'}
              </button>
            </div>
            <div className="grid gap-4">
              {manifestation.dailyActions.map((action, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100/50 group hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    <span className="text-slate-700 text-lg font-medium">{action}</span>
                  </div>
                  <button onClick={() => onRemoveAction(i)} className="text-slate-200 hover:text-rose-500 transition-all p-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {manifestation.dailyActions.length === 0 && (
                <div className="text-center py-16 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-50 rounded-full"><Plus size={32} /></div>
                  <p className="font-bold text-lg">Define your first micro-step</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8">
                <Target className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-6">Alignment over Hustle</h3>
              <p className="text-indigo-100/70 leading-relaxed text-lg font-light mb-8">
                The secret to manifestation is consistent energy. It's not about doing 100 things once; it's about doing one thing 100 times.
              </p>
              <div className="space-y-4">
                {['Morning Intentions', 'Emotional Resonance', 'Daily Micro-Steps'].map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-bold text-indigo-300">
                    <CheckCircle size={16} /> {tip}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-amber-50 border-amber-100">
            <h4 className="font-heading font-bold text-amber-900 mb-2">Did you know?</h4>
            <p className="text-amber-800/80 text-sm italic">
              "Action is the final step of the manifestation process. By showing up, you prove to the universe you're ready to receive."
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InspirationPage: React.FC = () => {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await aiService.getDailyInsights();
        setInsight(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
      <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-heading font-medium tracking-widest uppercase text-xs">Summoning Wisdom</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">
      <div className="text-center space-y-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-10 text-indigo-500/10">
          <Quote size={200} />
        </div>
        <div className="relative inline-block p-6 bg-white rounded-full shadow-xl mb-6">
           <Sun className="text-amber-500" size={48} />
        </div>
        <blockquote className="space-y-6 relative">
          <p className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-[1.2] italic">
            "{insight?.quote}"
          </p>
          <cite className="block text-slate-400 font-bold tracking-[0.3em] uppercase text-sm mt-8">— Divine Guidance</cite>
        </blockquote>
      </div>

      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-indigo-500 rounded-[3rem] blur-2xl opacity-10"></div>
        <Card className="bg-white border-slate-100 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute -bottom-10 -right-10 text-slate-50/50 -rotate-12 group-hover:text-indigo-50 transition-colors">
            <Sparkles size={240} />
          </div>
          <div className="relative z-10 text-center px-4 py-8">
            <span className="inline-block px-6 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-[0.2em] mb-8">
              Heavenly Reminder
            </span>
            <p className="text-2xl text-slate-700 leading-relaxed font-light italic">
              {insight?.reminder}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const MentalHealthBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Welcome to your safe space. I'm here to listen, support, and help you navigate your thoughts today. How are you feeling, truly?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await aiService.getMentalHealthResponse([...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[750px] flex flex-col bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-800">Your AI Friend</h2>
            <p className="text-sm text-slate-400 font-medium flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Present and Listening
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-6 rounded-[2rem] shadow-sm text-lg leading-relaxed ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-50">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share your thoughts..."
            className="flex-1 bg-slate-50 border-none rounded-[1.5rem] px-8 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

const GrowthChart: React.FC<{ habits: Habit[] }> = ({ habits }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const count = habits.reduce((acc, h) => acc + (h.completions.includes(dateStr) ? 1 : 0), 0);
    return { day, count };
  });

  return (
    <div className="space-y-12">
      <SectionHeader title="Your Evolution" subtitle="Watch your growth take shape. Every small action creates a ripple." />
      
      <Card className="p-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-3xl font-heading font-bold text-slate-800 mb-2">Momentum Matrix</h3>
            <p className="text-slate-400 font-medium">Daily consistency volume for {today.toLocaleString('default', { month: 'long' })}</p>
          </div>
          <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl">
            <TrendingUp size={32} />
          </div>
        </div>
        
        <div className="h-[500px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={15}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                  padding: '20px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Rituals Completed"
                stroke="#6366f1" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { label: 'Total Rituals', value: habits.reduce((acc, h) => acc + h.completions.length, 0), color: 'indigo' },
            { label: 'Active Habits', value: habits.length, color: 'emerald' },
            { label: 'Current Streak', value: '7 Days', color: 'amber' },
            { label: 'Completion Rate', value: '84%', color: 'rose' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-center`}>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
              <p className={`text-3xl font-heading font-bold text-slate-800`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Main Layout ---

type View = 'daily' | 'monthly' | 'manifest' | 'inspire' | 'chat' | 'growth' | 'dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [manifestation, setManifestation] = useState<Manifestation>({ mainGoal: '', dailyActions: [] });

  useEffect(() => {
    const savedLogs = localStorage.getItem('tt_logs');
    const savedHabits = localStorage.getItem('tt_habits');
    const savedManifest = localStorage.getItem('tt_manifest');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedManifest) setManifestation(JSON.parse(savedManifest));
  }, []);

  useEffect(() => {
    localStorage.setItem('tt_logs', JSON.stringify(logs));
    localStorage.setItem('tt_habits', JSON.stringify(habits));
    localStorage.setItem('tt_manifest', JSON.stringify(manifestation));
  }, [logs, habits, manifestation]);

  const addLog = (type: 'good' | 'bad', text: string) => {
    setLogs(prev => [{ id: Date.now().toString(), type, text, timestamp: Date.now() }, ...prev]);
  };

  const removeLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const addHabit = (name: string) => {
    setHabits(prev => [...prev, { id: Date.now().toString(), name, color: '#6366f1', completions: [] }]);
  };

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const completions = h.completions.includes(date)
          ? h.completions.filter(d => d !== date)
          : [...h.completions, date];
        return { ...h, completions };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const updateManifestGoal = (goal: string) => {
    setManifestation(prev => ({ ...prev, mainGoal: goal }));
  };

  const addManifestAction = (action: string) => {
    setManifestation(prev => ({ ...prev, dailyActions: [...prev.dailyActions, action] }));
  };

  const removeManifestAction = (index: number) => {
    setManifestation(prev => ({ ...prev, dailyActions: prev.dailyActions.filter((_, i) => i !== index) }));
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`group flex items-center gap-4 w-full p-4 transition-all rounded-[1.5rem] ${
        activeView === view 
        ? 'text-white bg-slate-900 shadow-2xl shadow-slate-200' 
        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <Icon size={22} className={activeView === view ? 'text-indigo-400' : 'group-hover:scale-110 transition-transform'} />
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );

  const Dashboard = () => (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading font-black text-slate-900 mb-4 tracking-tighter">
            Welcome back.
          </h1>
          <p className="text-2xl text-slate-400 font-light max-w-2xl leading-relaxed">
            Your self-evolution is a marathon, not a sprint. Today is another opportunity to align.
          </p>
        </div>
        <div className="flex -space-x-4">
          {[1,2,3].map(i => (
            <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-slate-400">
               <Heart size={20} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Log Reflections', desc: 'Be honest with yourself today.', view: 'daily' as View, icon: CheckCircle, color: 'emerald' },
          { title: 'Track Rituals', desc: 'Consistency is your superpower.', view: 'monthly' as View, icon: Calendar, color: 'indigo' },
          { title: 'Manifestation', desc: 'Your North Star is waiting.', view: 'manifest' as View, icon: Target, color: 'purple' }
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveView(item.view)}
            className="group relative bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 text-left hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-slate-100/50 transition-colors">
              <item.icon size={120} />
            </div>
            <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-600 rounded-[1.25rem] flex items-center justify-center mb-8 relative z-10`}>
              <item.icon size={28} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-slate-800 mb-3 relative z-10">{item.title}</h3>
            <p className="text-slate-400 text-lg relative z-10">{item.desc}</p>
          </button>
        ))}
      </div>
      
      <div className="mt-12">
        <GrowthChart habits={habits} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-[280px]">
      {/* Sidebar - Desktop */}
      <nav className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-100 hidden lg:flex flex-col p-10 gap-12 z-50">
        <div className="flex items-center gap-3 text-slate-900 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <span className="text-2xl font-heading font-black tracking-tighter">TrueTrack</span>
        </div>
        
        <div className="space-y-4 flex-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Workspace</p>
          <NavItem view="dashboard" icon={LayoutDashboard} label="Home" />
          <NavItem view="daily" icon={CheckCircle} label="Reflections" />
          <NavItem view="monthly" icon={Calendar} label="Rituals" />
          <NavItem view="manifest" icon={Target} label="Manifestation" />
          <NavItem view="inspire" icon={Sun} label="Divine Word" />
          <NavItem view="chat" icon={MessageSquare} label="AI Friend" />
          <NavItem view="growth" icon={TrendingUp} label="Evolution" />
        </div>

        <div className="mt-auto p-6 bg-slate-50 rounded-[2rem] text-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Progress</p>
           <div className="text-2xl font-heading font-black text-slate-900">{habits.reduce((acc, h) => acc + h.completions.length, 0)}</div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around py-4 lg:hidden z-50 px-4">
        {[
          { view: 'dashboard' as View, icon: LayoutDashboard },
          { view: 'daily' as View, icon: CheckCircle },
          { view: 'monthly' as View, icon: Calendar },
          { view: 'manifest' as View, icon: Target },
          { view: 'chat' as View, icon: MessageSquare }
        ].map(item => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`p-4 rounded-2xl transition-all ${activeView === item.view ? 'bg-slate-900 text-indigo-400 shadow-xl' : 'text-slate-400'}`}
          >
            <item.icon size={24} />
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto p-8 md:p-16 lg:p-24 min-h-screen">
        <header className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          {activeView !== 'dashboard' && (
             <button 
              onClick={() => setActiveView('dashboard')}
              className="text-indigo-600 font-bold text-sm hover:underline"
             >
               ← Back to Home
             </button>
          )}
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'daily' && (
            <DailyLog logs={logs} onAdd={addLog} onRemove={removeLog} />
          )}
          {activeView === 'monthly' && (
            <MonthlyTracker 
              habits={habits} 
              onToggle={toggleHabit} 
              onAddHabit={addHabit} 
              onDeleteHabit={deleteHabit} 
            />
          )}
          {activeView === 'manifest' && (
            <ManifestationPage 
              manifestation={manifestation} 
              onUpdateGoal={updateManifestGoal} 
              onAddAction={addManifestAction} 
              onRemoveAction={removeManifestAction}
            />
          )}
          {activeView === 'inspire' && (
            <InspirationPage />
          )}
          {activeView === 'chat' && (
            <MentalHealthBot />
          )}
          {activeView === 'growth' && (
            <GrowthChart habits={habits} />
          )}
        </div>

        <footer className="mt-32 pt-16 border-t border-slate-100 text-center pb-12">
           <div className="flex items-center justify-center gap-2 text-slate-300 font-black tracking-tighter text-2xl mb-4">
              <Sparkles size={24} className="text-indigo-600" /> TrueTrack
           </div>
           <p className="text-slate-400 text-sm font-medium">Your journey to a better self starts every morning.</p>
        </footer>
      </main>
    </div>
  );
}
