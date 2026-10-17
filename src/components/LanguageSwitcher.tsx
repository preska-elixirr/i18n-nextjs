'use client';

import {useId, useTransition} from 'react';
import {hasLocale, useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const id = useId();
  const locale = useLocale();
  const t = useTranslations('Language');
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label htmlFor={id}>{t('label')}</label>
      <select id={id} value={locale} disabled={pending} onChange={(event) => {
        const nextLocale = event.target.value;
        if (!hasLocale(routing.locales, nextLocale)) return;
        const href = pathname + window.location.search + window.location.hash;
        startTransition(() => {
          router.replace(href, {locale: nextLocale, scroll: false});
        });
      }}>
        <option value="en" lang="en">English</option>
        <option value="hr" lang="hr">Hrvatski</option>
      </select>
    </div>
  );
}
