import type {Metadata} from 'next';
import {getLocale, getTranslations} from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('Home');
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: {en: 'https://example.com/en', hr: 'https://example.com/hr'}
    }
  };
}

export default async function HomePage() {
  const t = await getTranslations('Home');
  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <p>{t('documents', {count: 22})}</p>
    </main>
  );
}
