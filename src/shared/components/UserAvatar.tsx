/** Imagen de fallback cuando un usuario no tiene avatar propio (el gato gamer). */
export const DEFAULT_AVATAR_SRC = '/gamer-cat-avatar.jfif';

/**
 * Avatar de usuario compartido: muestra `avatarUrl` si existe; si no, cae a la
 * imagen del gato (`DEFAULT_AVATAR_SRC`) en lugar de las iniciales. Lo usan el
 * header, las cards/modales de reseña, los comentarios y el perfil — por eso vive
 * en `shared`. El `className` controla tamaño/forma en cada lugar.
 */
export function UserAvatar({
  avatarUrl,
  username,
  className,
}: {
  avatarUrl: string | null;
  username: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl || DEFAULT_AVATAR_SRC}
      alt={username}
      className={className}
    />
  );
}
