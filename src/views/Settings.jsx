import React, { useState, useEffect } from 'react';
import { appClient } from '@/src/lib/app-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon, LogOut, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    native_language: 'English',
    target_languages: '',
    daily_goal_minutes: 15,
  });

  useEffect(() => {
    appClient.auth.me().then(u => {
      setUser(u);
      setForm({
        display_name: u?.full_name || '',
        bio: u?.bio || '',
        native_language: u?.native_language || 'English',
        target_languages: u?.target_languages || '',
        daily_goal_minutes: u?.daily_goal_minutes || 15,
      });
    }).catch(() => {});
  }, []);

  const joinedOn = user?.created_date
    ? new Date(user.created_date).toLocaleDateString()
    : 'Recently';

  const handleSave = async () => {
    setSaving(true);
    await appClient.auth.updateMe({
      bio: form.bio,
      native_language: form.native_language,
      target_languages: form.target_languages,
      daily_goal_minutes: form.daily_goal_minutes,
    });
    setSaving(false);
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="max-w-2xl">
      <h1 className="font-syne font-bold text-2xl text-foreground">Settings</h1>

      {/* Profile */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-foreground mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Display name</Label>
            <Input value={form.display_name} disabled className="mt-1 opacity-60" />
            <p className="text-[10px] text-muted-foreground mt-1">Display name cannot be changed here</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={user?.email || ''} disabled className="mt-1 opacity-60" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Member since</Label>
            <Input value={joinedOn} disabled className="mt-1 opacity-60" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="mt-1 h-20" placeholder="Tell us about yourself..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Native language</Label>
            <Input value={form.native_language} onChange={e => setForm({ ...form, native_language: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Target languages (comma separated)</Label>
            <Input value={form.target_languages} onChange={e => setForm({ ...form, target_languages: e.target.value })} className="mt-1" placeholder="Spanish, French, Japanese" />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="mt-8 pt-8 border-t border-border">
        <h2 className="text-sm font-medium text-foreground mb-4">Preferences</h2>
        <div className="space-y-6">
          <div>
            <Label className="text-xs text-muted-foreground mb-3 block">Theme</Label>
            <div className="flex gap-2">
              {[
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'light', icon: Sun, label: 'Light' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                    theme === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/20'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-3 block">Daily goal: {form.daily_goal_minutes} minutes</Label>
            <Slider
              value={[form.daily_goal_minutes]}
              onValueChange={([v]) => setForm({ ...form, daily_goal_minutes: v })}
              min={5}
              max={120}
              step={5}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mt-8 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save changes
          </Button>
          <Button variant="outline" onClick={() => appClient.auth.logout("/")}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </section>
    </motion.div>
  );
}
