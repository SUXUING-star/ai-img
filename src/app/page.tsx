'use client';

import AIImageGenerator from '@/components/ai-image-generator';
import { PageLayout } from '../components/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <AIImageGenerator />
    </PageLayout>
  );
}