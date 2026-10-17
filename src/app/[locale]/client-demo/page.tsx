import {hasLocale} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import ClientLanguageDemo from '@/components/ClientLanguageDemo';
import {routing} from '@/i18n/routing';

export default async function ClientDemoPage() {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return <main><ClientLanguageDemo initialLocale={locale} /></main>;
}
