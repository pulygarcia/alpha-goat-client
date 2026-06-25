import { describe, it, expect } from 'vitest';
import { feedItemToVM, reviewToVM } from './reviewCardVM';
import type { FeedItem } from '@/features/feed/types/feed.types';
import type { Review } from '../types/reviews.types';

const feedItem: FeedItem = {
  id: 'r1',
  author: { id: 'u1', username: 'pepe', avatarUrl: 'a.png', isFollowing: true },
  alfajor: { id: 'al1', nombre: 'Águila', tipo: 'CHOCOLATE', imagenUrl: null },
  marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' },
  quote: 'rico',
  photoUrl: 'p.png',
  overall: 8.5,
  axes: {
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 6,
    textura: 8,
  },
  likes: 12,
  isLiked: true,
  commentsCount: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const review: Review = {
  id: 'r2',
  userId: 'u2',
  author: { id: 'u2', username: 'ana', avatarUrl: null },
  alfajorId: 'al9',
  ratingGeneral: 7.2,
  dulzor: 5,
  cantidadDDL: 6,
  calidadBano: 7,
  ratioTapaRelleno: 8,
  textura: 9,
  comentario: 'meh',
  fotoUrl: null,
  createdAt: '2026-02-02T00:00:00.000Z',
  updatedAt: '2026-02-02T00:00:00.000Z',
};

describe('feedItemToVM', () => {
  it('maps a feed item to the card view-model with its alfajor and marca', () => {
    const vm = feedItemToVM(feedItem);
    expect(vm).toEqual({
      id: 'r1',
      author: {
        id: 'u1',
        username: 'pepe',
        avatarUrl: 'a.png',
        isFollowing: true,
      },
      alfajor: { id: 'al1', nombre: 'Águila', tipo: 'CHOCOLATE' },
      marca: { nombre: 'Águila', provincia: 'Córdoba' },
      quote: 'rico',
      photoUrl: 'p.png',
      overall: 8.5,
      axes: feedItem.axes,
      likes: 12,
      isLiked: true,
      commentsCount: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
});

describe('reviewToVM', () => {
  it('maps the nested alfajor and marca when present (e.g. profile feed)', () => {
    const vm = reviewToVM({
      ...review,
      alfajor: { id: 'al9', nombre: 'Jorgito', tipo: 'CHOCOLATE' },
      marca: { nombre: 'Jorgito', provincia: 'Córdoba' },
    });
    expect(vm.alfajor).toEqual({
      id: 'al9',
      nombre: 'Jorgito',
      tipo: 'CHOCOLATE',
    });
    expect(vm.marca).toEqual({ nombre: 'Jorgito', provincia: 'Córdoba' });
  });

  it('leaves alfajor/marca null when not loaded (redundant in alfajor detail)', () => {
    const vm = reviewToVM(review);
    expect(vm.alfajor).toBeNull();
    expect(vm.marca).toBeNull();
    expect(vm.id).toBe('r2');
    expect(vm.author).toEqual({
      id: 'u2',
      username: 'ana',
      avatarUrl: null,
      isFollowing: false,
    });
    expect(vm.quote).toBe('meh');
    expect(vm.photoUrl).toBeNull();
    expect(vm.overall).toBe(7.2);
    expect(vm.axes).toEqual({
      dulzor: 5,
      cantidadDDL: 6,
      calidadBano: 7,
      ratioTapaRelleno: 8,
      textura: 9,
    });
  });

  it('defaults missing counters and flags to zero/false', () => {
    const vm = reviewToVM(review);
    expect(vm.likes).toBe(0);
    expect(vm.commentsCount).toBe(0);
    expect(vm.isLiked).toBe(false);
  });

  it('passes through counters and flags when present', () => {
    const vm = reviewToVM({
      ...review,
      likesCount: 4,
      commentsCount: 2,
      isLiked: true,
      author: { ...review.author!, isFollowing: true },
    });
    expect(vm.likes).toBe(4);
    expect(vm.commentsCount).toBe(2);
    expect(vm.isLiked).toBe(true);
    expect(vm.author.isFollowing).toBe(true);
  });

  it('falls back to an Anónimo author when the relation is null', () => {
    const vm = reviewToVM({ ...review, author: null });
    expect(vm.author.username).toBe('Anónimo');
    expect(vm.author.id).toBe('');
  });
});
