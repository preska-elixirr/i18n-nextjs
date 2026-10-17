'use client';

import {useId, useState} from 'react';
import {NextIntlClientProvider, useTranslations} from 'next-intl';
import en from '../messages/en.json';
import hr from '../messages/hr.json';
import type {AppLocale} from '@/i18n/routing';

const catalogs = {en: {ClientDemo: en.ClientDemo}, hr: {ClientDemo: hr.ClientDemo}};

export default function ClientLanguageDemo({initialLocale}: {initialLocale: AppLocale}) {
  const [locale, setLocale] = useState(initialLocale);
  return (
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Europe/Zagreb">
      <section lang={locale} dir="ltr">
        <DemoContent locale={locale} onChange={setLocale} />
      </section>
    </NextIntlClientProvider>
  );
}

function DemoContent({locale, onChange}: {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
}) {
  const id = useId();
  const t = useTranslations('ClientDemo');
  const [count, setCount] = useState(0);
  return (
    <>
      <h2>{t('title')}</h2>
      <label htmlFor={id}>{t('label')}</label>
      <select id={id} value={locale} onChange={(event) => {
        const value = event.target.value;
        if (value === 'en' || value === 'hr') onChange(value);
      }}>
        <option value="en" lang="en">English</option>
        <option value="hr" lang="hr">Hrvatski</option>
      </select>
      <button type="button" onClick={() => setCount((value) => value + 1)}>{t('add')}</button>
      <p>{t('count', {count})}</p>
    </>
  );
}
