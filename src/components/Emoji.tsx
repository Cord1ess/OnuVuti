import twemoji from 'twemoji';
import { useMemo } from 'react';

interface EmojiProps {
  char: string;
  className?: string;
}

const Emoji = ({ char, className = "" }: EmojiProps) => {
  const html = useMemo(() => {
    return twemoji.parse(char, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });
  }, [char]);

  return (
    <span 
      className={`inline-flex items-center justify-center leading-none align-middle pointer-events-none emoji-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
};

export default Emoji;
