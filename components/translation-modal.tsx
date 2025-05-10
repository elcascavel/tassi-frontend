'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

interface Translation {
  id: number;
  lang: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

interface TranslationModalProps {
  entityId: number;
  entityType: string;
  entityKey?: string;
  open: boolean;
  onClose: () => void;
}

export function TranslationModal({
  entityId,
  entityType,
  entityKey,
  open,
  onClose,
}: TranslationModalProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editing, setEditing] = useState<Translation | null>(null);
  const [fields, setFields] = useState({
    lang: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!open) return;

    fetch(`/api/${entityType}/translations/${entityId}`)
      .then((res) => res.json())
      .then((json) => setTranslations(json?.data?.translations || []))
      .catch(() => toast.error('Failed to load translations.'));
  }, [open, entityType, entityId]);

  const saveTranslation = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/${entityType}/translations/update/${editing.id}`
      : `/api/${entityType}/translations/create`;

    const key = entityKey ?? `${entityType.split('/').pop()?.replace(/s$/, '')}_id`;


const payload = {
  ...fields,
  [key]: entityId,
};


    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      setTranslations((prev) =>
        editing
          ? prev.map((t) => (t.id === editing.id ? json.data.translation : t))
          : [...prev, json.data.translation]
      );
      reset();
      toast.success('Translation saved.');
    } else {
      toast.error('Failed to save translation.');
    }
  };

  const deleteTranslation = async (id: number) => {
    const res = await fetch(`/api/${entityType}/translations/delete/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setTranslations((prev) => prev.filter((t) => t.id !== id));
      toast.success('Translation deleted.');
    } else {
      toast.error('Failed to delete translation.');
    }
  };

  const reset = () => {
    setEditing(null);
    setFields({ lang: '', name: '', description: '' });
  };

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      editing?.lang === lang.code ||
      !translations.some((t) => t.lang === lang.code)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Translations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {translations.map((t) => (
            <div key={t.id} className="flex justify-between items-center border p-2 rounded">
              <div className="flex flex-col gap-2">
                <p className="font-medium">{SUPPORTED_LANGUAGES.find((l) => l.code === t.lang)?.label ?? t.lang}: <span className="font-semibold">{t.name}</span></p>
                {t.description && (
                  <p className="text-sm text-neutral-500">{t.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditing(t);
                    setFields({
                      lang: t.lang,
                      name: t.name,
                      description: t.description ?? '',
                    });
                  }}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTranslation(t.id)}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          <div className="grid gap-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Language</Label>
              <select
                value={fields.lang}
                disabled={!!editing}
                onChange={(e) => setFields((f) => ({ ...f, lang: e.target.value }))}
                className="col-span-3 border rounded px-3 py-2"
              >
                <option value="">Select language</option>
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                value={fields.name}
                onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Description</Label>
              <Input
                value={fields.description}
                onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={reset}>Close</Button>
          </DialogClose>
          <Button onClick={saveTranslation}>
            {editing ? 'Update' : 'Add'} Translation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
