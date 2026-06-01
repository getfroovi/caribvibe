import { Metadata } from 'next';
import { TimelineComponent } from '@/components/blog/TimelineComponent';

// In a real app, generateMetadata would fetch the post from Supabase
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Post: ${resolvedParams.slug} | theGriot.io`,
    description: 'A dynamic blog post with an interactive timeline.',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="max-w-4xl mx-auto p-8 pt-24 text-white bg-black min-h-screen">
      <article className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 capitalize">{resolvedParams.slug.replace(/-/g, ' ')}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 leading-relaxed">
            Welcome to the detailed view of the trip. Below you will find the full story, accompanied by an interactive timeline of the key milestones. Clicking on a milestone will seamlessly load the related media or jump to the linked premium video snippet!
          </p>
        </div>
      </article>

      <div className="border-t border-white/10 pt-12">
        <h2 className="text-3xl font-bold mb-8">Journey Timeline</h2>
        <TimelineComponent />
      </div>
    </div>
  );
}
