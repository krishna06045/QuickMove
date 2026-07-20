import { mockCustomers } from "@/data/mockCustomers";
import { Search, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  { id: "New", title: "New Leads", color: "border-blue-500", bg: "bg-blue-500/10" },
  { id: "In Progress", title: "Property Sourcing", color: "border-amber-500", bg: "bg-amber-500/10" },
  { id: "Pending Review", title: "AI Review Required", color: "border-purple-500", bg: "bg-purple-500/10" },
  { id: "Completed", title: "Logistics Scheduled", color: "border-green-500", bg: "bg-green-500/10" },
];

export function ActiveLeads() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all ongoing relocations.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-64 h-10 pl-10 pr-4 text-sm bg-secondary/50 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full gap-6 min-w-max">
          {columns.map(column => (
            <div key={column.id} className="w-[320px] flex flex-col h-full bg-secondary/20 rounded-xl overflow-hidden border">
              <div className={cn("p-4 border-b-2 flex items-center justify-between bg-card", column.color)}>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {column.title}
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", column.bg)}>
                    {mockCustomers.filter(c => c.status === column.id).length}
                  </span>
                </h3>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {mockCustomers
                  .filter(c => c.status === column.id)
                  .map(customer => (
                    <div key={customer.id} className="bg-card p-4 rounded-lg shadow-sm border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-foreground">{customer.name}</h4>
                        <span className="text-xs text-muted-foreground">{customer.moveDate}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1 font-medium">
                        {customer.origin} <span className="text-[10px]">→</span> {customer.destination}
                      </div>
                      <div className="text-[11px] px-2 py-1 bg-secondary rounded text-secondary-foreground line-clamp-1 mb-3">
                        {customer.recentActivity}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">{customer.budget}</span>
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
