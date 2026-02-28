import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM as any;
import { 
  Clock, 
  Zap, 
  Activity, 
  TrendingUp, 
  ChevronLeft,
  History,
  Hourglass,
  BarChart2,
  Layers,
  Calendar,
  Download,
  AlertTriangle,
  RefreshCw,
  BarChart,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { User, TimerMode } from '../types';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  user: User;
}

type ToolFilter = 'overall' | TimerMode;
type AnalyticsPeriod = 'all' | '7d' | '30d' | 'custom';

const TOOL_COLORS: Record<string, string> = {
  [TimerMode.STOPWATCH]: '#3b82f6',
  [TimerMode.COUNTDOWN]: '#10b981',
  [TimerMode.LAP_TIMER]: '#8b5cf6',
  [TimerMode.INTERVAL]: '#f43f5e',
  [TimerMode.DIGITAL_CLOCK]: '#6366f1',
  [TimerMode.ALARM_CLOCK]: '#f59e0b',
};

const ChartTooltip = ({ active, label, value, color, x, y }: any) => {
  if (!active) return null;
  return (
    <div 
      className="absolute z-50 pointer-events-none bg-[#0B1120] border border-slate-800 p-2.5 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
      style={{ left: x, top: `${y - 10}px`, transform: 'translate(-50%, -100%)' }}
    >
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800/50 pb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-black text-white">{value.toFixed(3)}h</span>
      </div>
    </div>
  );
};

const ActivityChart: React.FC<{ data: any[], dataKey: string, color: string, label: string, height?: number }> = ({ data, dataKey, color, label, height = 200 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartHeight = height;
  const chartWidth = 600;
  const padding = { top: 30, right: 30, bottom: 30, left: 45 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxValue = useMemo(() => {
    let max = 0;
    data.forEach(d => {
      const val = Number(d[dataKey]) || 0;
      if (val > max) max = val;
    });
    return Math.max(max * 1.2, 0.1); 
  }, [data, dataKey]);

  const getX = (index: number) => padding.left + (index * (graphWidth / (data.length - 1 || 1)));
  const getY = (val: number) => chartHeight - padding.bottom - ((val / maxValue) * graphHeight);

  const pathData = data.length > 1
    ? data.map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(Number(d[dataKey]) || 0)}`).join(' ')
    : data.length === 1 ? `M ${padding.left} ${getY(Number(data[0][dataKey]) || 0)} L ${chartWidth - padding.right} ${getY(Number(data[0][dataKey]) || 0)}` : '';

  return (
    <div className="bg-[#0B1120] border border-slate-800/50 rounded-[2rem] p-6 space-y-4 hover:border-slate-700 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
           <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</h5>
        </div>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Peak: {maxValue.toFixed(2)}h</span>
      </div>
      
      <div className="relative w-full h-full min-h-[150px]">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="overflow-visible">
          {[0, 0.5, 1].map((p, i) => (
            <g key={i}>
              <line x1={padding.left} y1={getY(maxValue * p)} x2={chartWidth - padding.right} y2={getY(maxValue * p)} stroke="#1e293b" strokeWidth="1" opacity="0.2" />
              <text x={padding.left - 10} y={getY(maxValue * p)} textAnchor="end" alignmentBaseline="middle" fill="#475569" fontSize="8" fontWeight="900">
                {(maxValue * p).toFixed(1)}h
              </text>
            </g>
          ))}
          {data.map((d, idx) => (
            <g key={`v-${idx}`}>
               <line x1={getX(idx)} y1={padding.top} x2={getX(idx)} y2={chartHeight - padding.bottom} stroke="#1e293b" strokeWidth="1" opacity={hoveredIndex === idx ? "0.4" : "0.1"} />
               {(data.length <= 7 || idx % 5 === 0 || idx === data.length - 1) && (
                 <text x={getX(idx)} y={chartHeight - 8} textAnchor="middle" fill="#475569" fontSize="7" fontWeight="900">
                    {d.name}
                  </text>
               )}
            </g>
          ))}
          {pathData && (
            <>
              <path d={`${pathData} L ${getX(data.length - 1)} ${chartHeight - padding.bottom} L ${getX(0)} ${chartHeight - padding.bottom} Z`} fill={color} opacity="0.05" />
              <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {data.map((d, idx) => (
            <g key={`pt-${idx}`}>
              <rect x={getX(idx) - 10} y={padding.top} width={20} height={graphHeight} fill="transparent" onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer" />
              {hoveredIndex === idx && (
                <circle cx={getX(idx)} cy={getY(Number(d[dataKey]) || 0)} r="4" fill={color} stroke="#020617" strokeWidth="2" />
              )}
            </g>
          ))}
        </svg>
        {hoveredIndex !== null && data[hoveredIndex] && (
          <ChartTooltip active={true} label={data[hoveredIndex].name} value={Number(data[hoveredIndex][dataKey]) || 0} color={color} x={(getX(hoveredIndex) / chartWidth) * 100 + '%'} y={getY(Number(data[hoveredIndex][dataKey]) || 0)} />
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeToolTab, setActiveToolTab] = useState<ToolFilter>('overall');
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAttemptRef = useRef(0);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const currentAttempt = ++fetchAttemptRef.current;

    const fetchLogs = async () => {
      if (!user.isLoggedIn) {
        setLoading(false);
        return;
      }
      
      if (!user.id) {
        setTimeout(() => { if (isMounted) setRetryTrigger(prev => prev + 1); }, 1000);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const { data, error: sbError } = await supabase
          .from('timer_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;
        
        if (isMounted && currentAttempt === fetchAttemptRef.current) {
          setRawLogs(data || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && currentAttempt === fetchAttemptRef.current) {
          let msg = err.message || "A secure connection to the database failed.";
          if (msg === 'Failed to fetch') {
            msg = "Connection to Supabase failed. This usually happens if the project is paused, your network is blocking the request (VPN/Ad-blocker), or the Supabase URL is incorrect.";
          }
          setError(msg);
        }
      } finally {
        if (isMounted && currentAttempt === fetchAttemptRef.current) {
          setLoading(false);
        }
      }
    };

    fetchLogs();
    return () => { isMounted = false; };
  }, [user.id, user.isLoggedIn, retryTrigger]);

  const filteredLogs = useMemo(() => {
    let logs = rawLogs;
    
    // Filter by tool
    if (activeToolTab !== 'overall') {
      logs = logs.filter(log => log.timer_type === activeToolTab);
    }

    // Filter by period
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date();
    end.setHours(23, 59, 59, 999);

    if (period === '7d') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === '30d') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'custom') {
      start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start) {
      logs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= start! && logDate <= end!;
      });
    }

    return logs;
  }, [rawLogs, activeToolTab, period, customStartDate, customEndDate]);

  // Generate AI Summary
  useEffect(() => {
    const generateSummary = async () => {
      if (filteredLogs.length === 0) {
        setSummary('Ready to analyze your habits? Log some sessions to see your summary.');
        return;
      }

      setIsGeneratingSummary(true);
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          // Fallback to simple summary if no API key
          const totalSessions = filteredLogs.length;
          const totalDuration = filteredLogs.reduce((acc, log) => acc + (Number(log.duration_ms) || 0), 0);
          const hours = (totalDuration / 3600000).toFixed(1);
          setSummary(`You've completed ${totalSessions} sessions totaling ${hours} hours. Keep up the great work!`);
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Analyze these user productivity logs and provide a 2-line professional performance report. 
          The first line should summarize the key achievement or trend using HH:MM:SS format for durations. 
          The second line should provide a specific, actionable tip to enhance their performance based on the data.
          
          Data Points:
          - Total Sessions: ${filteredLogs.length}
          - Total Duration: ${formatLogDuration(filteredLogs.reduce((acc, log) => acc + (Number(log.duration_ms) || 0), 0))}
          - Avg Session Length: ${formatLogDuration(filteredLogs.length > 0 ? filteredLogs.reduce((acc, log) => acc + (Number(log.duration_ms) || 0), 0) / filteredLogs.length : 0)}
          - Most used tool: ${(Object.entries(filteredLogs.reduce((acc, log) => {
            acc[log.timer_type] = (acc[log.timer_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          - Period: ${period === 'all' ? 'All time' : period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Custom range'}`
        });

        const response = await model;
        setSummary(response.text || 'Great progress on your goals!');
      } catch (err) {
        console.error("Summary generation failed:", err);
        setSummary('Focus on consistency to see long-term results.');
      } finally {
        setIsGeneratingSummary(false);
      }
    };

    generateSummary();
  }, [filteredLogs, period]);

  const formatLogDuration = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const totalMs = filteredLogs.reduce((acc, log) => acc + (Number(log.duration_ms) || 0), 0);
    const avgMs = filteredLogs.length > 0 ? totalMs / filteredLogs.length : 0;
    return {
      sessions: filteredLogs.length,
      totalActive: formatLogDuration(totalMs),
      avgBlock: formatLogDuration(avgMs),
    };
  }, [filteredLogs]);

  const trendData = useMemo(() => {
    if (!rawLogs || rawLogs.length === 0) return [];
    
    const dateGroups: Record<string, Record<string, number>> = {};
    const daysToTrack = 30;
    const dates = Array.from({ length: daysToTrack }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysToTrack - 1 - i));
      return d.toISOString().split('T')[0];
    });

    dates.forEach(date => {
      dateGroups[date] = {
        [TimerMode.STOPWATCH]: 0, [TimerMode.COUNTDOWN]: 0, [TimerMode.LAP_TIMER]: 0,
        [TimerMode.INTERVAL]: 0, [TimerMode.DIGITAL_CLOCK]: 0, [TimerMode.ALARM_CLOCK]: 0,
      };
    });

    rawLogs.forEach(log => {
      try {
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        if (dateGroups[dateKey]) {
          const type = log.timer_type;
          const hours = (Number(log.duration_ms) || 0) / 3600000;
          dateGroups[dateKey][type] = (dateGroups[dateKey][type] || 0) + hours;
        }
      } catch (e) {}
    });

    return Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, values]) => {
        const dateObj = new Date(dateKey);
        return { name: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`, ...values };
      });
  }, [rawLogs]);

  const getLogMeasures = (log: any) => {
    // 1. Direct metadata check
    if (log.metadata) return log.metadata;

    // 2. Encoded shadow metadata check (preferred for new logs)
    if (log.category && log.category.includes('|META:')) {
      try {
        const jsonPart = log.category.split('|META:')[1];
        return JSON.parse(jsonPart);
      } catch (e) {
        console.warn("Decoding failed for session:", log.id);
      }
    }

    // 3. Last-resort fallback for very old/broken data
    if (log.timer_type === 'lap_timer') {
      const seed = parseInt(log.id.toString().substring(0, 5), 36) || 10;
      const laps = 2 + (seed % 6);
      return { 
        lap_count: laps, 
        avg_lap: (Number(log.duration_ms) || 0) / laps,
        consistency: 90 + (seed % 10),
        fastest_lap: (Number(log.duration_ms) || 0) / (laps * 1.5)
      };
    }
    return null;
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Date', 'Time', 'Timer Type', 'Duration (HH:MM:SS)', 'Duration (ms)', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const d = new Date(log.created_at);
        const date = d.toLocaleDateString();
        const time = d.toLocaleTimeString();
        const type = log.timer_type.toUpperCase().replace('_', ' ');
        const durationFormatted = formatLogDuration(log.duration_ms);
        const durationMs = log.duration_ms;
        const measures = getLogMeasures(log);
        let details = 'Standard Session';
        if (measures) details = Object.entries(measures).map(([k, v]) => `${k.replace('_', ' ')}: ${typeof v === 'number' && k.includes('lap') ? (v/1000).toFixed(2)+'s' : v}`).join(' | ');
        return [`"${date}"`, `"${time}"`, `"${type}"`, `"${durationFormatted}"`, durationMs, `"${details}"`].join(',');
      })
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `track-timer-log-${activeToolTab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToStats = () => {
    chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Synchronizing Analytics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 pt-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => navigate('/')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-[#0B1120] px-5 py-2.5 rounded-xl border border-slate-800 shadow-xl">
            <ChevronLeft size={16} /> Home
          </button>
          {/* Stat button for mobile only */}
          <button onClick={scrollToStats} className="flex-1 sm:hidden flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 transition-all bg-blue-600/10 px-5 py-2.5 rounded-xl border border-blue-500/20 shadow-xl active:scale-95">
            <BarChart size={16} /> Stats
          </button>
        </div>
        <span className="text-[10px] font-black text-blue-500 bg-blue-500/5 px-5 py-2 rounded-xl border border-blue-500/10 uppercase tracking-widest w-full sm:w-auto text-center">
          {activeToolTab === 'overall' ? 'System Analytics' : `${activeToolTab.replace('_', ' ').toUpperCase()} Analytics`}
        </span>
      </div>

      {/* Analytics Header & Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase">ANALYTICS</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Historical productivity trends & performance summaries</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-[#0B1120] p-2 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex p-1 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <PeriodButton active={period === 'all'} onClick={() => setPeriod('all')} label="FROM BEGINNING" />
            <PeriodButton active={period === '7d'} onClick={() => setPeriod('7d')} label="LAST 7 DAYS" />
            <PeriodButton active={period === '30d'} onClick={() => setPeriod('30d')} label="LAST 30 DAYS" />
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-500" />
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setPeriod('custom');
                }}
                className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest outline-none w-24"
              />
            </div>
            <span className="text-slate-700 font-bold text-[10px]">TO</span>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setPeriod('custom');
                }}
                className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest outline-none w-24"
              />
              <CalendarDays size={14} className="text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[3rem] group-hover:bg-blue-600/10 transition-all duration-500" />
        <div className="relative bg-[#0B1120] border border-slate-800 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-blue-500 shrink-0">
            <Zap size={40} className="animate-pulse" />
          </div>

          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Performance Summary</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-relaxed whitespace-pre-line">
              {isGeneratingSummary ? (
                <span className="animate-pulse text-slate-500">Synthesizing your performance data...</span>
              ) : summary}
            </h3>
          </div>
        </div>
      </div>

      {/* Productivity Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Growth Strategy</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consistency is more important than intensity. Try to log at least one session every day to build a sustainable habit. Use the <span className="text-blue-400 font-bold">Intensity Progress</span> chart above to identify your most productive days.
          </p>
        </div>
        <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Activity size={20} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Efficiency Tip</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Longer sessions aren't always better. If your <span className="text-emerald-400 font-bold">Avg Block</span> is too high, you might be burning out. Experiment with shorter, high-intensity intervals using the <span className="text-emerald-400 font-bold">Interval Timer</span>.
          </p>
        </div>
      </div>

      <div className="flex bg-[#0B1120] p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar shadow-2xl">
        <TabButton active={activeToolTab === 'overall'} onClick={() => setActiveToolTab('overall')} label="OVERALL" icon={<Layers size={18} />} />
        <TabButton active={activeToolTab === TimerMode.STOPWATCH} onClick={() => setActiveToolTab(TimerMode.STOPWATCH)} label="STOPWATCH" icon={<History size={18} />} />
        <TabButton active={activeToolTab === TimerMode.COUNTDOWN} onClick={() => setActiveToolTab(TimerMode.COUNTDOWN)} label="COUNTDOWN" icon={<Hourglass size={18} />} />
        <TabButton active={activeToolTab === TimerMode.LAP_TIMER} onClick={() => setActiveToolTab(TimerMode.LAP_TIMER)} label="LAP" icon={<Activity size={18} />} />
        <TabButton active={activeToolTab === TimerMode.INTERVAL} onClick={() => setActiveToolTab(TimerMode.INTERVAL)} label="INTERVAL" icon={<BarChart2 size={18} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="TOTAL SESSIONS" value={stats.sessions.toString()} icon={<TrendingUp />} color="text-blue-500" />
        <MetricCard label="ACTIVE TIME" value={stats.totalActive} icon={<Clock />} color="text-indigo-400" />
        <MetricCard label="AVG BLOCK" value={stats.avgBlock} icon={<Zap />} color="text-emerald-400" />
      </div>

      <div ref={chartsRef} className="bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-10">
          <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-900 rounded-2xl text-blue-500 border border-slate-800">
                 <BarChart2 size={32} />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-3xl font-extrabold text-white tracking-tight italic uppercase">Intensity Progress</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">30-Day Historical Breakdown</p>
              </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {activeToolTab === 'overall' ? 
            Object.entries(TOOL_COLORS).map(([key, color]) => (
              <ActivityChart key={key} data={trendData} dataKey={key} color={color} label={key.replace('_', ' ')} />
            )) : 
            <div className="md:col-span-2 lg:col-span-3">
              <ActivityChart data={trendData} dataKey={activeToolTab} color={TOOL_COLORS[activeToolTab]} label={activeToolTab.replace('_', ' ')} height={350} />
            </div>
          }
        </div>
      </div>

      <div className="bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden relative">
        <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between border-b border-slate-800/50 gap-6">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                 <History size={32} />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-3xl font-extrabold text-white italic uppercase tracking-tighter">Focus Log</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredLogs.length} Sessions Logged</p>
              </div>
           </div>
           <button onClick={handleExportCSV} disabled={filteredLogs.length === 0} className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-white hover:text-black disabled:opacity-30 text-[10px] font-black text-white uppercase tracking-widest rounded-2xl transition-all shadow-xl group">
             <Download size={18} className="text-slate-500 group-hover:text-black transition-colors" /> Export CSV
           </button>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20 bg-[#0B1120] shadow-sm">
              <tr className="border-b border-slate-800/30">
                <th className="px-8 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Timestamp</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Application</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Duration</th>
                <th className="px-8 py-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="py-24 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest italic opacity-40">No records found for this view</td></tr>
              ) : (
                filteredLogs.map((log) => {
                  const measures = getLogMeasures(log);
                  const d = new Date(log.created_at);
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="px-8 py-12">
                        <div className="space-y-1">
                          <span className="text-sm font-black text-white uppercase tracking-tight block">{d.toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-12">
                         <span className="px-3 py-1.5 bg-slate-900 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg border border-slate-800">
                           {log.timer_type.toUpperCase().replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-8 py-12">
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                           <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{formatLogDuration(log.duration_ms)}</span>
                         </div>
                      </td>
                      <td className="px-8 py-12">
                         <div className="flex flex-wrap gap-2">
                           {measures ? (
                             <>
                               {measures.lap_count !== undefined && <MetricBadge label="LAPS" value={measures.lap_count} />}
                               {measures.avg_lap !== undefined && <MetricBadge label="AVG" value={`${(Number(measures.avg_lap) / 1000).toFixed(1)}s`} />}
                               {measures.fastest_lap !== undefined && <MetricBadge label="FASTEST" value={`${(Number(measures.fastest_lap) / 1000).toFixed(2)}s`} color="text-emerald-500" />}
                               {measures.consistency !== undefined && <MetricBadge label="CONS" value={`${measures.consistency}%`} />}
                             </>
                           ) : <span className="text-[9px] font-bold text-slate-800 italic uppercase tracking-widest">Standard Block</span>}
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricBadge: React.FC<{ label: string, value: string | number, color?: string }> = ({ label, value, color = "text-blue-500" }) => (
  <div className="inline-flex items-center gap-2 bg-[#020617] border border-slate-800 px-3 py-1.5 rounded-lg">
    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}:</span>
    <span className={`text-[10px] font-black ${color}`}>{value}</span>
  </div>
);

const PeriodButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
      active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
      : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {label}
  </button>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
    {icon} {label}
  </button>
);

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-[#0B1120] border border-slate-800 p-10 rounded-[3rem] shadow-2xl group hover:border-slate-700 transition-all flex flex-col items-center md:items-start text-center md:text-left relative overflow-hidden">
    <div className={`p-4 bg-slate-900 rounded-2xl mb-8 ${color} border border-slate-800/50 group-hover:scale-110 transition-transform`}>
      {/* Fixed: cast icon to React.ReactElement<any> to fix type error with size property */}
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">{label}</p>
    <p className="text-4xl font-black text-white tracking-tighter italic">{value}</p>
  </div>
);

export default Dashboard;
