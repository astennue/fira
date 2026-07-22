'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-1.5 text-xs font-semibold uppercase"
    >
      <Globe className="h-3.5 w-3.5" />
      {locale === 'en' ? 'TL' : 'EN'}
    </Button>
  );
}