import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserCog, ArrowLeft, Trash2, Loader2, MapPin } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function AssegnaAdminSede() {
  const queryClient = useQueryClient();
  const { user, isLoadingAuth } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedLuogoId, setSelectedLuogoId] = useState('');
  const [assegnazioneToRemove, setAssegnazioneToRemove] = useState(null);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (user?.role !== 'super_admin') {
    return <Navigate to={createPageUrl('Home')} replace />;
  }

  const { data: assegnazioni = [], isLoading } = useQuery({
    queryKey: ['admin-luoghi'],
    queryFn: () => base44.adminLuoghi.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-luoghi-users'],
    queryFn: () => base44.adminLuoghi.listUsers(),
  });

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list(),
  });

  const assignMutation = useMutation({
    mutationFn: ({ email, luogo_id }) => base44.adminLuoghi.assign(email, luogo_id),
    onSuccess: (_, variables) => {
      const user = users.find((u) => u.id === selectedUserId);
      const wasPromoted = user && user.role === 'user';
      queryClient.invalidateQueries(['admin-luoghi']);
      queryClient.invalidateQueries(['admin-luoghi-users']);
      setSelectedUserId('');
      setSelectedLuogoId('');
      toast.success(
        wasPromoted
          ? `${user.full_name} è stato promosso ad admin e assegnato al luogo`
          : 'Luogo assegnato con successo'
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'assegnazione');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.adminLuoghi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-luoghi']);
      setAssegnazioneToRemove(null);
      toast.success('Assegnazione rimossa');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nella rimozione');
    },
  });

  const handleAssign = () => {
    const user = users.find((u) => u.id === selectedUserId);
    if (!user || !selectedLuogoId) return;
    assignMutation.mutate({ email: user.email, luogo_id: selectedLuogoId });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assegna Admin↔Luogo</h1>
            <p className="text-gray-500 text-sm">Collega un utente a un luogo come admin</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="w-5 h-5 text-purple-500" />
              Nuova Assegnazione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Utente</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un utente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} — {u.email} — attualmente: {u.role === 'admin' ? 'admin' : 'utente'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Luogo</Label>
              <Select value={selectedLuogoId} onValueChange={setSelectedLuogoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un luogo" />
                </SelectTrigger>
                <SelectContent>
                  {luoghi.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedUserId || !selectedLuogoId || assignMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {assignMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Assegna'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assegnazioni Esistenti</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : assegnazioni.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessuna assegnazione ancora creata</p>
            ) : (
              <div className="space-y-2">
                {assegnazioni.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{a.User?.full_name}</p>
                      <p className="text-sm text-gray-500">{a.User?.email}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {a.Luogo?.nome}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => setAssegnazioneToRemove(a)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!assegnazioneToRemove} onOpenChange={() => setAssegnazioneToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rimuovere questa assegnazione?</AlertDialogTitle>
            <AlertDialogDescription>
              {assegnazioneToRemove?.User?.full_name} non gestirà più il luogo {assegnazioneToRemove?.Luogo?.nome}.
              Il ruolo admin resterà invariato, l'assegnazione può essere ricreata in seguito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMutation.mutate(assegnazioneToRemove.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sì, rimuovi assegnazione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
