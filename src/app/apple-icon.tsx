import { ImageResponse } from 'next/og';
import Image from 'next/image';

import TelegramIcon from '@/assets/icons/apple-icon.png';

// Image metadata
export const size = {
  width: 32,
  height: 32
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <Image
        alt="Telegram Icon"
        src={TelegramIcon.src}
        className="rounded-full"
        width={size.width}
        height={size.height}
        priority
      />
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size
    }
  );
}
