import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type TicketCategory = "billing" | "technical" | "account" | "service_quality" | "app_bug" | "feedback" | "other";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface TicketSubmission {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
}

export interface TicketReply {
  id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  author_role?: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  status: string;
  category?: string;
  priority?: string;
  subject?: string;
  description?: string;
  created_at?: string;
  resolved_at?: string;
}

export interface TicketDetails extends Ticket {
  replies: TicketReply[];
}

function getAnonymousId(userId: string) {
  return `User#U${userId.slice(-5)}`;
}

async function submitTicket(payload: TicketSubmission) {
  const { data, error } = await supabase.functions.invoke("bridge-proxy", {
    body: {
      endpoint: "bridge-tickets",
      method: "POST",
      payload: { ...payload },
    },
  });
  if (error) throw new Error(error.message || "Failed to submit ticket");
  return data;
}

async function fetchTickets(userId: string) {
  const anonymousId = getAnonymousId(userId);
  const { data, error } = await supabase.functions.invoke("bridge-proxy", {
    body: {
      endpoint: "bridge-tickets",
      method: "GET",
      params: { app_type: "user_app", anonymous_id: anonymousId },
    },
  });
  if (error) throw new Error(error.message || "Failed to fetch tickets");
  return data;
}

async function fetchTicketStatus(ticketNumber: string) {
  const { data, error } = await supabase.functions.invoke("bridge-proxy", {
    body: {
      endpoint: "bridge-tickets/status",
      method: "GET",
      params: { ticket_number: ticketNumber },
    },
  });
  if (error) throw new Error(error.message || "Failed to fetch ticket status");
  return data;
}

async function fetchTicketDetails(ticketId: string) {
  const { data, error } = await supabase.functions.invoke("bridge-proxy", {
    body: {
      endpoint: "bridge-tickets/details",
      method: "GET",
      params: { ticket_id: ticketId },
    },
  });
  if (error) throw new Error(error.message || "Failed to fetch ticket details");
  return data;
}

export function useSubmitTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bridge-tickets"] });
    },
  });
}

export function useMyTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bridge-tickets", user?.id],
    queryFn: () => fetchTickets(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });
}

export function useTicketStatus(ticketNumber: string | null) {
  return useQuery({
    queryKey: ["bridge-ticket-status", ticketNumber],
    queryFn: () => fetchTicketStatus(ticketNumber!),
    enabled: !!ticketNumber,
  });
}

export function useTicketDetails(ticketId: string | null) {
  return useQuery({
    queryKey: ["bridge-ticket-details", ticketId],
    queryFn: () => fetchTicketDetails(ticketId!),
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
}
