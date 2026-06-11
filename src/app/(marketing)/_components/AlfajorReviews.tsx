'use client';

import { TestimonialMarquee } from '@/shared/components/ui/testimonial-marquee';

const REVIEWS = [
  {
    name: 'Rodrigo M.',
    username: 'rodrialf',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=rodri',
    text: 'El águila de coco me pareció muy seco, es una cagada esto, me quedo con el block',
  },
  {
    name: 'Caro V.',
    username: 'carov',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=caro',
    text: 'El havanna de maracuyá no es un alfajor, es un insulto con packaging bonito',
  },
  {
    name: 'Nacho P.',
    username: 'nachop',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=nacho',
    text: 'El jorgito es el único con ratio tapa/relleno decente. El resto le ponen DDL con gotero',
  },
  {
    name: 'Male G.',
    username: 'malegabriel',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=male',
    text: 'Probé el terrabusi con chocolate blanco y me arrepentí de todo. Todo.',
  },
  {
    name: 'Fede Z.',
    username: 'fedez',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=fede',
    text: 'El block de chocolate con la galletita gruesa merece un 10. Discutible solo si no tenés paladar',
  },
  {
    name: 'Juli S.',
    username: 'julisanti',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=juli',
    text: 'El santísimo es marketing puro. El baño se pela al tercer mordisco. No me banco.',
  },
  {
    name: 'Tomás R.',
    username: 'tomasr',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=tomas',
    text: 'Nunca entendí por qué el cachafaz es caro. La masa es buena pero el DDL no llega a los bordes. Básico.',
  },
  {
    name: 'Flor D.',
    username: 'flord',
    avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=flor',
    text: 'El suchard tiene demasiado dulzor, mi abuela lo adoraba, yo no soy mi abuela',
  },
];

export function AlfajorReviews() {
  return (
    <div className="alfajor-reviews mt-12 w-full">
      <style>{`
        .alfajor-reviews .text-muted-foreground { color: rgba(246,201,119,0.8) !important; }
        .alfajor-reviews .text-foreground { color: #fdf6e8 !important; }
        .alfajor-reviews .border-border { border-color: rgba(244,160,43,0.16) !important; }
        .alfajor-reviews .bg-black\\/5 { background: rgba(0,0,0,0.55) !important; }
        .alfajor-reviews .hover\\:bg-black\\/10:hover { background: rgba(0,0,0,0.70) !important; }
      `}</style>
      <TestimonialMarquee
        items={REVIEWS}
        variant="default"
        speed={35}
        containerClassName="py-4"
      />
    </div>
  );
}
