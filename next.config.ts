import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true
};

export default createNextIntlPlugin()(config);
