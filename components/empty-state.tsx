'use client';

import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { AddGroupModal } from './add-group-modal';

export function EmptyState() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
      <Card className="w-full p-10 flex flex-col items-center border-dashed">
        <div className="rounded-full bg-muted p-3 mb-4">
          <PlusCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Nenhum grupo adicionado</h3>
        
        <p className="text-muted-foreground mb-6">
          Adicione seu primeiro grupo do WhatsApp para começar a obter insights sobre as conversas.
        </p>
        
        <Button size="lg" onClick={() => setIsAddModalOpen(true)}>
          Adicionar Grupo
        </Button>
      </Card>

      {isAddModalOpen && (
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
} 