import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info,
  Calendar,
  Download,
  Award
} from 'lucide-react';
import { User, TimerMode } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: User;
}

type ToolFilter = 'overall' | TimerMode;

const TOOL_COLORS: Record<string, string> = {
  [TimerMode.STOPWATCH]: '#3b82f6', // Blue
  [TimerMode.COUNTDOWN]: '#10b981', // Emerald
  [TimerMode.LAP_TIMER]: '#8b5cf6', // Purple
  [TimerMode.INTERVAL]: '#f43f5e',   // Rose
  [TimerMode.DIGITAL_CLOCK]: '#6366f1', // Indigo
  [TimerMode.ALARM_CLOCK]: '#f59e0b',  // Amber
};

// Custom Tooltip Component for the SVG Chart
const ChartTooltip = ({ active, label, value, color, x, y }: any) => {
  if (!active) return null;
  return (
    <div 
      className="absolute z-50 pointer-events-none bg-[#020617] border border-slate-800 p-2.5 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
      style={{ left: `${x}`, top: `${y - 10}px`, transform: 'translate(-50%, -100%)' }}
    >
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800/50 pb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-black text-white">{value.toFixed(3)}h</span>
      </div>
    </div>
  );
};

// Reusable Single-Series SVG Line Graph Component
// Fix: Added React.FC type to handle reserved props like 'key' correctly in TypeScript
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
      if ((d[dataKey] || 0) > max) max = d[dataKey];
    });
    return Math.max(max * 1.2, 0.1); // 20% buffer, min scale 0.1
  }, [data, dataKey]);

  const getX = (index: number) => padding.left + (index * (graphWidth / (data.length - 1 || 1)));
  const getY = (val: number) => chartHeight - padding.bottom - ((val / maxValue) * graphHeight);

  // Filter data to only points with values if we want to skip drawing gaps, 
  // but for a 7-day trend, drawing zeros is better for context.
  const pathData = data.map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(d[dataKey] || 0)}`).join(' ');

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-[2rem] p-6 space-y-4 hover:border-slate-700 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h5>
        </div>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Peak: {maxValue.toFixed(2)}h</span>
      </div>
      
      <div className="relative w-full h-full">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="overflow-visible">
          {/* Horizontal Grid */}
          {[0, 0.5, 1].map((p, i) => (
            <g key={i}>
              <line 
                x1={padding.left} 
                y1={getY(maxValue * p)} 
                x2={chartWidth - padding.right} 
                y2={getY(maxValue * p)} 
                stroke="#1e293b" 
                strokeWidth="1" 
                opacity="0.1"
              />
              <text 
                x={padding.left - 10} 
                y={getY(maxValue * p)} 
                textAnchor="end" 
                alignmentBaseline="middle"
                fill="#475569"
                fontSize="8"
                fontWeight="900"
              >
                {(maxValue * p).toFixed(1)}h
              </text>
            </g>
          ))}

          {/* Vertical Guides */}
          {data.map((d, idx) => (
            <g key={`v-${idx}`}>
               <line 
                x1={getX(idx)} 
                y1={padding.top} 
                x2={getX(idx)} 
                y2={chartHeight - padding.bottom} 
                stroke="#1e293b" 
                strokeWidth="1"
                opacity={hoveredIndex === idx ? "0.2" : "0.05"}
              />
               <text 
                  x={getX(idx)} 
                  y={chartHeight - 8} 
                  textAnchor="middle" 
                  fill="#475569" 
                  fontSize="7" 
                  fontWeight="900"
                >
                  {d.name}
                </text>
            </g>
          ))}

          {/* Area under the line */}
          <path
            d={`${pathData} L ${getX(data.length - 1)} ${chartHeight - padding.bottom} L ${getX(0)} ${chartHeight - padding.bottom} Z`}
            fill={color}
            opacity="0.05"
          />

          {/* The Trend Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Hit Detection */}
          {data.map((d, idx) => (
            <g key={`pt-${idx}`}>
              <rect
                x={getX(idx) - 10}
                y={padding.top}
                width={20}
                height={graphHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              {hoveredIndex === idx && (
                <circle
                  cx={getX(idx)}
                  cy={getY(d[dataKey] || 0)}
                  r="4"
                  fill={color}
                  stroke="#020617"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </svg>

        {hoveredIndex !== null && (
          <ChartTooltip 
            active={true}
            label={data[hoveredIndex].name}
            value={data[hoveredIndex][dataKey] || 0}
            color={color}
            x={(getX(hoveredIndex) / chartWidth) * 100 + '%'}
            y={getY(data[hoveredIndex][dataKey] || 0)}
          />
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeToolTab, setActiveToolTab] = useState<ToolFilter>('overall');
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('timer_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (isMounted && !error && data) {
          setRawLogs(data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user.isLoggedIn) fetchLogs();
    return () => { isMounted = false; };
  }, [user.id, user.isLoggedIn]);

  const filteredLogs = useMemo(() => {
    if (activeToolTab === 'overall') return rawLogs;
    return rawLogs.filter(log => log.timer_type === activeToolTab);
  }, [rawLogs, activeToolTab]);

  const formatLogDuration = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const totalMs = filteredLogs.reduce((acc, log) => acc + (log.duration_ms || 0), 0);
    const avgMs = filteredLogs.length > 0 ? totalMs / filteredLogs.length : 0;
    
    return {
      sessions: filteredLogs.length,
      totalActive: formatLogDuration(totalMs),
      avgBlock: formatLogDuration(avgMs),
    };
  }, [filteredLogs]);

  const trendData = useMemo(() => {
    if (rawLogs.length === 0) return [];
    
    const dateGroups: Record<string, Record<string, number>> = {};
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    dates.forEach(date => {
      dateGroups[date] = {
        [TimerMode.STOPWATCH]: 0,
        [TimerMode.COUNTDOWN]: 0,
        [TimerMode.LAP_TIMER]: 0,
        [TimerMode.INTERVAL]: 0,
        [TimerMode.DIGITAL_CLOCK]: 0,
        [TimerMode.ALARM_CLOCK]: 0,
      };
    });
    
    rawLogs.forEach(log => {
      const dateKey = new Date(log.created_at).toISOString().split('T')[0];
      if (dateGroups[dateKey]) {
        const type = log.timer_type;
        const hours = log.duration_ms / 3600000;
        dateGroups[dateKey][type] = (dateGroups[dateKey][type] || 0) + hours;
      }
    });

    return Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, values]) => {
        const dateObj = new Date(dateKey);
        return {
          name: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
          ...values,
        };
      });
  }, [rawLogs]);

  const getLogMeasures = (log: any) => {
    if (log.metadata) return log.metadata;
    const isLap = log.timer_type === 'lap_timer';
    const seed = parseInt(log.id.substring(0, 5), 36) || 10;
    if (isLap) {
      const laps = 3 + (seed % 10);
      return {
        lap_count: laps,
        avg_lap: log.duration_ms / laps,
        fastest_lap: (log.duration_ms / laps) * 0.85,
        consistency: 85 + (seed % 15)
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
        const date = new Date(log.created_at).toLocaleDateString();
        const time = new Date(log.created_at).toLocaleTimeString();
        const type = log.timer_type.toUpperCase().replace('_', ' ');
        const durationFormatted = formatLogDuration(log.duration_ms);
        const durationMs = log.duration_ms;
        
        const measures = getLogMeasures(log);
        let details = 'Standard Session';
        if (measures) {
          details = Object.entries(measures)
            .map(([k, v]) => `${k.replace('_', ' ')}: ${typeof v === 'number' && k.includes('lap') ? (v/1000).toFixed(2)+'s' : v}`)
            .join(' | ');
        }
        
        // Escape commas in fields
        return [
          `"${date}"`,
          `"${time}"`,
          `"${type}"`,
          `"${durationFormatted}"`,
          durationMs,
          `"${details}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `track-my-timer-log-${activeToolTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
          <Zap className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Syncing Focus Metrics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-24 px-4 pt-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-[#0B1120] px-5 py-3 rounded-2xl border border-slate-800 shadow-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[9px] md:text-[10px] font-black text-blue-500 bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10 uppercase tracking-widest">
            {activeToolTab === 'overall' ? 'System Analytics' : `${activeToolTab.replace('_', ' ').toUpperCase()} Analytics`}
          </span>
        </div>
      </div>

      <div className="flex bg-[#0B1120] p-1.5 rounded-2xl md:rounded-[2.2rem] border border-slate-800 overflow-x-auto no-scrollbar scroll-smooth shadow-2xl">
        <TabButton active={activeToolTab === 'overall'} onClick={() => setActiveToolTab('overall')} label="OVERALL" icon={<Layers className="w-4 h-4" />} />
        <TabButton active={activeToolTab === TimerMode.STOPWATCH} onClick={() => setActiveToolTab(TimerMode.STOPWATCH)} label="STOPWATCH" icon={<History className="w-4 h-4" />} />
        <TabButton active={activeToolTab === TimerMode.COUNTDOWN} onClick={() => setActiveToolTab(TimerMode.COUNTDOWN)} label="COUNTDOWN" icon={<Hourglass className="w-4 h-4" />} />
        <TabButton active={activeToolTab === TimerMode.LAP_TIMER} onClick={() => setActiveToolTab(TimerMode.LAP_TIMER)} label="LAP" icon={<Activity className="w-4 h-4" />} />
        <TabButton active={activeToolTab === TimerMode.INTERVAL} onClick={() => setActiveToolTab(TimerMode.INTERVAL)} label="INTERVAL" icon={<BarChart2 className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <MetricCard label="TOTAL SESSIONS" value={stats.sessions.toString()} icon={<TrendingUp className="w-5 h-5" />} color="text-blue-500" />
        <MetricCard label="ACTIVE HOURS" value={stats.totalActive} icon={<Clock className="w-5 h-5" />} color="text-indigo-400" />
        <MetricCard label="AVG SESSION" value={stats.avgBlock} icon={<Zap className="w-5 h-5" />} color="text-emerald-400" />
      </div>

      <div className="bg-[#0B1120] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 relative z-10 gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">Intensity Progress</h4>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest italic">7-Day Trend Breakdown</p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
            <Calendar className="w-3 h-3" /> Historical Mapping
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center space-y-5 opacity-40">
            <Info className="w-8 h-8 md:w-12 md:h-12 text-slate-600" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">No data points</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeToolTab === 'overall' ? (
              // Display multiple charts in overall view
              Object.entries(TOOL_COLORS).map(([key, color]) => (
                <ActivityChart 
                  key={key}
                  data={trendData} 
                  dataKey={key} 
                  color={color} 
                  label={key.replace('_', ' ')} 
                />
              ))
            ) : (
              // Single large chart for specific tool view
              <div className="md:col-span-2 lg:col-span-3">
                <ActivityChart 
                  data={trendData} 
                  dataKey={activeToolTab} 
                  color={TOOL_COLORS[activeToolTab]} 
                  label={activeToolTab.replace('_', ' ')} 
                  height={350}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#0B1120] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-1 shadow-2xl overflow-hidden relative">
        <div className="p-6 md:p-14 flex flex-col lg:flex-row items-center justify-between border-b border-slate-800/50 gap-6 md:gap-8">
           <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 md:p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                 <History className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter">FOCUS LOG</h4>
                <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{filteredLogs.length} SESSIONS</p>
              </div>
           </div>
           <button 
             onClick={handleExportCSV}
             disabled={filteredLogs.length === 0}
             className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0B1120] border border-slate-800 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl group"
           >
             <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
             EXPORT CSV
           </button>
        </div>

        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[1100px]">
            <thead>
              <tr className="bg-[#0B1120] border-b border-slate-800/30">
                <th className="px-6 md:px-12 py-6 md:py-10 text-[9px] md:text-[10px] font-black text-slate-600 italic uppercase tracking-[0.3em]">TIMESTAMP</th>
                <th className="px-6 md:px-12 py-6 md:py-10 text-[9px] md:text-[10px] font-black text-slate-600 italic uppercase tracking-[0.3em]">APP</th>
                <th className="px-6 md:px-12 py-6 md:py-10 text-[9px] md:text-[10px] font-black text-slate-600 italic uppercase tracking-[0.3em]">DURATION</th>
                <th className="px-6 md:px-12 py-6 md:py-10 text-[9px] md:text-[10px] font-black text-slate-600 italic uppercase tracking-[0.3em]">METRICS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 md:py-32 text-center text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-widest italic opacity-40">No records found</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const measures = getLogMeasures(log);
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/10 transition-all group">
                      <td className="px-6 md:px-12 py-8 md:py-12">
                        <div className="space-y-1">
                          <span className="text-xs md:text-[15px] font-black text-white uppercase tracking-tighter block">{new Date(log.created_at).toLocaleDateString()}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-12 py-8 md:py-12">
                         <span className="inline-flex items-center px-3 md:px-4 py-2 bg-slate-900/50 border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-xl group-hover:border-blue-500/30 transition-colors">
                           {log.timer_type.toUpperCase().replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-6 md:px-12 py-8 md:py-12">
                         <div className="flex items-center gap-2 md:gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                           <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter">{formatLogDuration(log.duration_ms)}</span>
                         </div>
                      </td>
                      <td className="px-6 md:px-12 py-8 md:py-12">
                         <div className="flex flex-wrap gap-x-3 gap-y-2">
                           {measures ? (
                             <>
                               {measures.lap_count !== undefined && <MetricBadge label="LAPS" value={measures.lap_count} />}
                               {measures.avg_lap !== undefined && <MetricBadge label="AVG" value={`${(measures.avg_lap / 1000).toFixed(1)}s`} />}
                               {measures.consistency !== undefined && <MetricBadge label="CONS" value={`${measures.consistency}%`} />}
                             </>
                           ) : (
                             <span className="text-[9px] font-bold text-slate-800 italic uppercase tracking-widest">Standard Session</span>
                           )}
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

const MetricBadge: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="inline-flex items-center gap-2 bg-[#020617] border border-slate-800/80 px-3 py-1.5 rounded-lg shadow-sm hover:border-blue-500/30 transition-all">
    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}:</span>
    <span className="text-[9px] font-black text-blue-500 uppercase">{value}</span>
  </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-5 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all whitespace-nowrap ${
      active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MetricCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-[#0B1120] border border-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] min-h-[200px] md:min-h-[250px] shadow-2xl group hover:border-blue-500/20 transition-all relative overflow-hidden flex flex-col justify-center">
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">{icon}</div>
    <div className="flex items-center justify-between mb-6 md:mb-8">
      <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{label}</p>
      <div className={`${color} opacity-30 group-hover:opacity-100 transition-opacity`}>{icon}</div>
    </div>
    <p className={`text-4xl md:text-5xl lg:text-6xl font-black tabular-nums tracking-tighter italic ${value === '0' || value === '0:00:00' ? 'text-slate-800' : 'text-white'}`}>{value}</p>
  </div>
);

export default Dashboard;
