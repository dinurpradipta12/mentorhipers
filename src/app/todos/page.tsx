'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Todo {
  id: string;
  name?: string;
  title?: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTodos() {
      if (!supabase) {
        console.error('Supabase client is not initialized.');
        setLoading(false);
        return;
      }
      try {
        const { data: fetchedTodos, error } = await supabase.from('todos').select();

        if (error) {
           console.error('Error fetching todos:', error);
        } else if (fetchedTodos) {
          setTodos(fetchedTodos);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    getTodos();
  }, []);

  if (loading) return <div className="p-8 font-sans font-extrabold">Loading your items from Supabase...</div>;

  return (
    <div className="p-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-sans font-extrabold mb-8 text-accent">Supabase Todos Inventory</h1>
      <ul className="space-y-4">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-between">
              <span className="font-bold text-slate-700">{todo.name || todo.title || 'Untitled Todo'}</span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full">Active</span>
            </li>
          ))
        ) : (
          <li className="text-muted-foreground italic font-medium p-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
            No items found in the &apos;todos&apos; table.
          </li>
        )}
      </ul>
      <div className="mt-12 p-6 rounded-3xl bg-amber-50 border border-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest text-center">
        Demo Page using @supabase/supabase-js
      </div>
    </div>
  );
}
