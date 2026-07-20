import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, BrainCircuit, CheckCircle2, Clock } from 'lucide-react';

const extractionData = [
  { name: 'Mon', accuracy: 92 },
  { name: 'Tue', accuracy: 94 },
  { name: 'Wed', accuracy: 91 },
  { name: 'Thu', accuracy: 96 },
  { name: 'Fri', accuracy: 95 },
  { name: 'Sat', accuracy: 98 },
  { name: 'Sun', accuracy: 97 },
];

const automationData = [
  { name: 'Week 1', manual: 120, automated: 40 },
  { name: 'Week 2', manual: 90, automated: 80 },
  { name: 'Week 3', manual: 50, automated: 130 },
  { name: 'Week 4', manual: 20, automated: 180 },
];

export function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Operations Dashboard</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-sm hover:opacity-90">
            Download Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">AI Extraction Accuracy</h3>
            </div>
            <div className="text-3xl font-bold">95.4%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">+2.1% from last week</p>
          </div>
          
          <div className="p-5 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Manual Override Rate</h3>
            </div>
            <div className="text-3xl font-bold">12.8%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">-4.3% from last week</p>
          </div>

          <div className="p-5 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Avg Human Review Time</h3>
            </div>
            <div className="text-3xl font-bold">42s</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">-18s from last week</p>
          </div>

          <div className="p-5 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Automation Adoption</h3>
            </div>
            <div className="text-3xl font-bold">78%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">+15% from last week</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-sm font-semibold mb-6">AI Extraction Accuracy (Trailing 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={extractionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <h3 className="text-sm font-semibold mb-6">Manual vs Automated Processing</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={automationData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    cursor={{ fill: 'var(--secondary)' }}
                  />
                  <Bar dataKey="manual" name="Manual Triage" stackId="a" fill="#94a3b8" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="automated" name="AI Processed" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
