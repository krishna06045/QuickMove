import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export function useValidationWorkflow(id: string = "default") {
  // Initialize from localStorage if available
  const [approvedFields, setApprovedFields] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`approvedFields_${id}`);
    return saved ? JSON.parse(saved) : {};
  });
  
  const [rejectedFields, setRejectedFields] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`rejectedFields_${id}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`approvedFields_${id}`, JSON.stringify(approvedFields));
  }, [approvedFields, id]);

  useEffect(() => {
    localStorage.setItem(`rejectedFields_${id}`, JSON.stringify(rejectedFields));
  }, [rejectedFields, id]);

  const approveField = useCallback((key: string, label: string) => {
    setApprovedFields(prev => ({ ...prev, [key]: true }));
    setRejectedFields(prev => ({ ...prev, [key]: false }));
    toast.success(`${label} approved and locked.`);
  }, []);

  const rejectField = useCallback((key: string, label: string) => {
    setRejectedFields(prev => ({ ...prev, [key]: true }));
    setApprovedFields(prev => ({ ...prev, [key]: false }));
    toast.error(`${label} rejected. Needs manual review.`);
  }, []);

  const resetField = useCallback((key: string) => {
    setApprovedFields(prev => ({ ...prev, [key]: false }));
    setRejectedFields(prev => ({ ...prev, [key]: false }));
  }, []);

  return {
    approvedFields,
    rejectedFields,
    approveField,
    rejectField,
    resetField,
  };
}
