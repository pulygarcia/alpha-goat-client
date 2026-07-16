/** Dueño del álbum (subset del perfil, lo que el header necesita). */
export interface AlbumOwner {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/** Progreso: cuántas figuritas de un total están conseguidas, y el %. */
export interface AlbumStats {
  collected: number;
  total: number;
  pct: number;
}

/** Una figurita del álbum: un alfajor del catálogo, con overlay del dueño. */
export interface AlbumFigurita {
  id: string;
  nombre: string;
  tipo: string;
  imagenUrl: string | null;
  /** Rating promedio del alfajor en la comunidad (null sin reseñas). */
  avgRating: number | null;
  /** Si el dueño del álbum ya lo reseñó. */
  collected: boolean;
  /** Nota que el dueño le puso (null si no la consiguió). */
  myRating: number | null;
  /** Id de la reseña del dueño, para linkear (null si no la consiguió). */
  reviewId: string | null;
}

/** Una hoja de marca: header de marca + sus figuritas ordenadas por avgRating. */
export interface AlbumHoja {
  marca: {
    id: string;
    nombre: string;
    provincia: string | null;
  };
  stats: AlbumStats;
  alfajores: AlbumFigurita[];
}

/** Response completo de `GET /users/by-username/:username/album`. */
export interface AlbumResponse {
  owner: AlbumOwner;
  stats: AlbumStats;
  hojas: AlbumHoja[];
}
