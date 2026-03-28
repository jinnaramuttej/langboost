import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/src/lib/app-client';
import { Search, Plus, Volume2, Check, Trash2, BookMarked, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { speakText } from '@/src/lib/speech';

export default function Vocabulary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [filling, setFilling] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', language: '', definition: '', translation: '', example_sentence: '', phonetic: '' });

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => appClient.entities.VocabularyEntry.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.VocabularyEntry.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vocabulary'] }); setShowAdd(false); setNewWord({ word: '', language: '', definition: '', translation: '', example_sentence: '', phonetic: '' }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.VocabularyEntry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.VocabularyEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const aiAutofill = async () => {
    if (!newWord.word) return;
    setFilling(true);
    const result = await appClient.integrations.Core.InvokeLLM({
      prompt: `Give me details for the word "${newWord.word}" in ${newWord.language || 'English'}. Include: definition, translation to English (if not English), phonetic pronunciation, and an example sentence.`,
      response_json_schema: {
        type: 'object',
        properties: {
          definition: { type: 'string' },
          translation: { type: 'string' },
          phonetic: { type: 'string' },
          example_sentence: { type: 'string' },
        },
      },
    });
    setNewWord(prev => ({ ...prev, ...result }));
    setFilling(false);
  };

  const speak = (text, lang) => {
    void speakText(text, lang || 'English');
  };

  const filtered = words.filter(w =>
    !search || w.word?.toLowerCase().includes(search.toLowerCase()) || w.definition?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-2xl text-foreground">Vocabulary</h1>
          <p className="text-sm text-muted-foreground mt-1">{words.length} words saved</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add word</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add vocabulary word</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Input placeholder="Word" value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} className="flex-1" />
                <Input placeholder="Language" value={newWord.language} onChange={e => setNewWord({ ...newWord, language: e.target.value })} className="w-28" />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={aiAutofill} disabled={!newWord.word || filling}>
                {filling ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                AI autofill
              </Button>
              <Input placeholder="Definition" value={newWord.definition} onChange={e => setNewWord({ ...newWord, definition: e.target.value })} />
              <Input placeholder="Translation" value={newWord.translation} onChange={e => setNewWord({ ...newWord, translation: e.target.value })} />
              <Input placeholder="Phonetic" value={newWord.phonetic} onChange={e => setNewWord({ ...newWord, phonetic: e.target.value })} />
              <Textarea placeholder="Example sentence" value={newWord.example_sentence} onChange={e => setNewWord({ ...newWord, example_sentence: e.target.value })} className="h-20" />
              <Button className="w-full" onClick={() => createMutation.mutate(newWord)} disabled={!newWord.word}>
                Save word
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mt-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search words..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11 bg-card" />
      </div>

      {/* Word grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <BookMarked className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">{words.length === 0 ? 'No words saved yet. Add your first word!' : 'No words match your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {filtered.map(word => (
            <div key={word.id} className={`rounded-lg border bg-card p-4 group transition-colors ${word.is_mastered ? 'border-border/50 opacity-60' : 'border-border hover:border-foreground/20'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-medium text-foreground">{word.word}</p>
                  {word.phonetic && <p className="text-xs text-muted-foreground">{word.phonetic}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => speak(word.word, word.language)} className="p-1 text-muted-foreground hover:text-primary">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => updateMutation.mutate({ id: word.id, data: { is_mastered: !word.is_mastered } })} className="p-1 text-muted-foreground hover:text-primary">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(word.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{word.definition || word.translation}</p>
              <div className="flex items-center gap-2 mt-2">
                {word.language && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{word.language}</span>}
                {word.is_mastered && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Mastered</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Brain(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}
