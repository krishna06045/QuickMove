import { BrainCircuit, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const mockQueueItems = [
  { id: "q1", customer: "Priya Desai", field: "Dietary Requirements", extractedValue: "Pure Veg (Vegan)", confidence: 78, originalMessage: "my sister is strictly vegan", status: "pending" },
  { id: "q2", customer: "Priya Desai", field: "Inventory", extractedValue: "Added Dining Table", confidence: 92, originalMessage: "we've decided to bring the dining table after all", status: "pending", flag: "Budget Risk" },
  { id: "q3", customer: "Amit Patel", field: "Pets", extractedValue: "Beagle", confidence: 65, originalMessage: "Also, we have a pet Beagle.", status: "pending" },
  { id: "q4", customer: "Rohan Sharma", field: "Inventory", extractedValue: "Royal Enfield", confidence: 98, originalMessage: "move my Royal Enfield bike", status: "pending" },
];

export function AIReviewQueue() {
  const [items, setItems] = useState(mockQueueItems);

  const handleAction = (id: string, action: "approve" | "reject") => {
    setItems(items.filter(item => item.id !== id));
    toast.success(action === "approve" ? "Data Approved" : "Data Rejected", {
      description: "Master database has been updated."
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Review Queue</h1>
            <p className="text-sm text-muted-foreground mt-1">Fields extracted by AI that require manual validation.</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Extracted Field</th>
                <th className="px-6 py-4 font-semibold">Value & Evidence</th>
                <th className="px-6 py-4 font-semibold">Confidence</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Queue is empty. Great job!
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.customer}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.field}
                        {item.flag && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-sm">
                            <AlertTriangle className="w-3 h-3" /> {item.flag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary mb-1">{item.extractedValue}</div>
                      <div className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-2">
                        "{item.originalMessage}"
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden w-16">
                          <div 
                            className={`h-full rounded-full ${item.confidence >= 90 ? 'bg-green-500' : item.confidence >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(item.id, "reject")} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(item.id, "approve")} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
